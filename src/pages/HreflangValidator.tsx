import { useState, useEffect } from "react"
import Seo from "../components/Seo"
import { isValidUrl } from "../utils/url"
import RelatedTools from "../components/RelatedTools"
import { copyToClipboard } from "../utils"

export default function HreflangValidator(): JSX.Element {
  const [input, setInput] = useState<string>("")
  const [baseUrl, setBaseUrl] = useState<string>("")
  
  const [generated, setGenerated] = useState<string[]>([])
  const [pairs, setPairs] = useState<{ code: string; href: string }[]>([{ code: "en", href: "" }])
  const [parsed, setParsed] = useState<{ hreflang: string; href: string }[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [selfUrl, setSelfUrl] = useState<string>("")
  const [xDefaultEnabled, setXDefaultEnabled] = useState<boolean>(true)
  const [xDefaultUrl, setXDefaultUrl] = useState<string>("")
  const [fetchUrlInput, setFetchUrlInput] = useState<string>("")
  const [fetchLoading, setFetchLoading] = useState<boolean>(false)
  const [fetchMessage, setFetchMessage] = useState<string>("")

  // Reusable helpers moved out so both UI and generator can use them
  const codeIsValid = (c: string) => {
    if (!c) return false
    if (c === "x-default") return true
    return /^([a-z]{2})(-[A-Z]{2})?$/.test(c)
  }

  const normalizeHref = (h: string) => {
    try {
      const u = new URL(h)
      if (!u.pathname.endsWith("/")) u.pathname = u.pathname + "/"
      u.search = ""
      u.hash = ""
      return u.toString()
    } catch {
      return h.trim()
    }
  }

  const deriveSelfCodeFromBase = (urlStr: string) => {
    try {
      const u = new URL(urlStr)
      const segs = u.pathname.split("/").filter(Boolean)
      if (!segs.length) return null
      const first = segs[0]
      const m = /^([a-z]{2})(?:[-_]?([a-z]{2}))?$/i.exec(first)
      if (!m) return null
      const lang = m[1].toLowerCase()
      const region = m[2] ? m[2].toUpperCase() : null
      return region ? `${lang}-${region}` : lang
    } catch {
      return null
    }
  }

  const deriveRootFromBase = (urlStr: string, maybeLang?: string) => {
    try {
      const u = new URL(urlStr)
      const segs = u.pathname.split("/").filter(Boolean)
      if (maybeLang && segs[0] && new RegExp(`^${maybeLang.split("-")[0]}`, "i").test(segs[0])) {
        segs.shift()
      }
      u.pathname = "/" + segs.join("/")
      if (!u.pathname.endsWith("/")) u.pathname = u.pathname === "/" ? "/" : u.pathname + "/"
      u.search = ""
      u.hash = ""
      return u.toString()
    } catch {
      return urlStr
    }
  }

  const parseTagsFromText = (text: string) => {
    // simple parser: look for <link rel="alternate" hreflang="xx" href="..." />
    const results: { hreflang: string; href: string }[] = []
    const re = /<link[^>]*rel=["']?alternate["']?[^>]*>/gi
    const matches = text.match(re)
    if (!matches) return results
    const attrRe = /([a-zA-Z-]+)\s*=\s*(["'])(.*?)\2/g
    for (const m of matches) {
      const attrs: Record<string, string> = {}
      let a: RegExpExecArray | null
      // eslint-disable-next-line no-cond-assign
      while ((a = attrRe.exec(m))) {
        attrs[a[1].toLowerCase()] = a[3]
      }
      if (attrs.hreflang && attrs.href) results.push({ hreflang: attrs.hreflang, href: attrs.href })
    }
    return results
  }

  const normalizeCodeDisplay = (c: string) => {
    if (!c) return c
    if (c.toLowerCase() === "x-default") return "x-default"
    const parts = c.split(/[-_]/)
    const lang = parts[0].toLowerCase()
    if (parts[1]) return `${lang}-${parts[1].toUpperCase()}`
    return lang
  }

  const handleParse = () => {
    setErrors([])
    const p = parseTagsFromText(input)
    if (!p.length) setErrors(["No hreflang alternate link tags found in input."])
    setParsed(p)
  }

  const handleGenerate = () => {
    setErrors([])
    const b = baseUrl.trim()
    if (!b || !isValidUrl(b)) {
      setErrors(["Please provide a valid Base URL (including https://)"])
      return
    }

    // Validate pairs
    if (!pairs.length) {
      setErrors(["Please provide at least one locale + URL pair."])
      return
    }

    for (const p of pairs) {
      if (!codeIsValid(p.code)) {
        setErrors([`Invalid hreflang code: ${p.code}. Use 'en' or 'en-US' or 'x-default'.`])
        return
      }
      if (!p.href || !isValidUrl(p.href)) {
        setErrors([`Invalid absolute URL for ${p.code}: ${p.href}`])
        return
      }
    }

    // Use explicit selfUrl if provided, otherwise fall back to base URL
    const normalizedBase = normalizeHref(selfUrl || b)

    // Normalize pairs
    const normPairs = pairs.map((p) => ({ code: p.code, href: normalizeHref(p.href) }))

    // Find/ensure self
    let selfIndex = normPairs.findIndex((p) => p.href === normalizedBase)
    if (selfIndex === -1) {
      const derived = deriveSelfCodeFromBase(normalizedBase)
      if (derived) {
        const byCode = normPairs.findIndex((p) => p.code === derived)
        if (byCode !== -1) {
          selfIndex = byCode
        } else {
          normPairs.unshift({ code: derived, href: normalizedBase })
          selfIndex = 0
        }
      } else {
        setErrors(["Base URL is not present in the pairs and no language code could be derived from it. Add a self-referencing pair or edit the Self URL field."])
        return
      }
    }

    const self = normPairs.splice(selfIndex, 1)[0]
    const ordered = [self, ...normPairs.filter((p) => p.code !== self.code)]

    // x-default handling
    const hasXDefault = ordered.some((p) => p.code === "x-default")
    if (!hasXDefault && xDefaultEnabled) {
      const root = xDefaultUrl || deriveRootFromBase(normalizedBase, self.code)
      if (isValidUrl(root)) ordered.push({ code: "x-default", href: normalizeHref(root) })
    }

    // Final dedupe
    const seen = new Set<string>()
    const finalList: { code: string; href: string }[] = []
    for (const p of ordered) {
      if (seen.has(p.code)) continue
      seen.add(p.code)
      finalList.push(p)
    }

    const out = finalList.map((p) => `<link rel="alternate" hreflang="${p.code}" href="${p.href}" />`)
    setGenerated(out)
  }

  const handleCopyGenerated = async () => {
    if (!generated.length) return
    await copyToClipboard(generated.join("\n"))
  }

  // Fetch & Parse a live URL (server-first, fallback to public proxy)
  const handleFetchAndParse = async (pageUrl?: string) => {
    const urlToFetch = (pageUrl || fetchUrlInput || baseUrl || selfUrl || "").trim()
    if (!urlToFetch || !isValidUrl(urlToFetch)) {
      setFetchMessage("Please enter a valid absolute URL to fetch.")
      return
    }
    setFetchLoading(true)
    setFetchMessage("Fetching...")
    try {
      // Try server-side fetch first
      try {
        const srv = await fetch("http://localhost:3001/fetch-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: urlToFetch, method: "GET", timeoutMs: 10000 }),
        })
        if (srv.ok) {
          const json = await srv.json()
          const html = String(json.text || "")
          const tags = parseTagsFromText(html)
          if (tags.length) {
            setParsed(tags)
            setPairs(tags.map((t) => ({ code: normalizeCodeDisplay(t.hreflang), href: normalizeHref(t.href) })))
            setFetchMessage(`Parsed ${tags.length} hreflang tags (server).`)
            setFetchLoading(false)
            setBaseUrl((prev) => prev || urlToFetch)
            return
          }
        }
      } catch (e) {
        // server fetch failed; fall back below
      }

      // Client-side proxy fallback (best-effort)
      const proxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(urlToFetch)}`
      const res = await fetch(proxy)
      if (!res.ok) throw new Error(`Proxy fetch failed: ${res.status}`)
      const html = await res.text()
      const tags = parseTagsFromText(html)
      if (tags.length) {
        setParsed(tags)
        setPairs(tags.map((t) => ({ code: normalizeCodeDisplay(t.hreflang), href: normalizeHref(t.href) })))
        setFetchMessage(`Parsed ${tags.length} hreflang tags (proxy).`)
        setBaseUrl((prev) => prev || urlToFetch)
      } else {
        setFetchMessage("No hreflang tags found on that page.")
      }
    } catch (err) {
      setFetchMessage(String(err instanceof Error ? err.message : err))
    } finally {
      setFetchLoading(false)
    }
  }

  const updatePair = (i: number, field: "code" | "href", value: string) => {
    setPairs((prev) => {
      const copy = prev.slice()
      copy[i] = { ...copy[i], [field]: value }
      return copy
    })
  }

  const addPair = () => setPairs((p) => [...p, { code: "", href: "" }])
  const removePair = (i: number) => setPairs((p) => p.filter((_, idx) => idx !== i))

 

  // derive defaults when baseUrl changes
  // do not overwrite user-edited selfUrl/xDefaultUrl if they differ from previous derived values
  useEffect(() => {
    if (!baseUrl || !isValidUrl(baseUrl)) return
    const nb = normalizeHref(baseUrl)
    // initialize selfUrl if empty
    setSelfUrl((prev) => prev && isValidUrl(prev) ? prev : nb)
    const derivedCode = deriveSelfCodeFromBase(nb)
    const root = deriveRootFromBase(nb, derivedCode || undefined)
    setXDefaultUrl((prev) => prev && isValidUrl(prev) ? prev : root)
  }, [baseUrl])

  // Per-row validation and duplicate detection
  const pairValidation = (() => {
    const counts: Record<string, number> = {}
    pairs.forEach((p) => {
      const key = (p.code || "").toLowerCase()
      counts[key] = (counts[key] || 0) + 1
    })
    const results = pairs.map((p) => {
      const code = p.code || ""
      const href = p.href || ""
      const codeValid = codeIsValid(code)
      const hrefValid = isValidUrl(href)
      const dup = counts[(code || "").toLowerCase()] > 1
      return { codeError: !codeValid ? `Invalid code: ${code}` : "", hrefError: !hrefValid ? `Invalid URL` : "", duplicate: dup }
    })
    const hasAny = results.some((r) => r.codeError || r.hrefError || r.duplicate)
    return { results, hasAny }
  })()

  return (
    <>
      <Seo title="Hreflang Tag Validator & Generator" description="Validate and generate hreflang link alternate tags for multilingual pages." keywords="hreflang, international SEO, alternate links" url="https://cralite.com/tools/hreflang-validator" />

      <section className="tool-section">
        <div className="tool-grid">
          <div className="tool-form">
            <h2 className="tool-h2">Hreflang Tag Validator & Generator</h2>
            <p className="text-sm text-gray-600 mb-4">Paste your page HTML containing &lt;link rel="alternate" hreflang="..." href="..." /&gt; tags to validate, or generate tags from a base URL and locale list.</p>

            <div className="tool-field">
              <label className="tool-label">Paste HTML (or tags)</label>
              <textarea className="tool-textarea" rows={8} value={input} onChange={(e) => setInput(e.target.value)} placeholder={`<link rel="alternate" hreflang="en" href="https://example.com/en/" />`} />
              <div className="flex gap-2 mt-3">
                <button className="action-btn" onClick={handleParse}>Parse & Validate</button>
                <button className="clear-btn" onClick={() => { setInput(''); setParsed([]); setErrors([]) }}>Clear</button>
              </div>
              <div className="mt-3">
                <label className="tool-label">Fetch page by URL</label>
                <div className="flex gap-2 mt-2">
                  <input className="tool-input flex-1" placeholder="https://example.com/en/" value={fetchUrlInput} onChange={(e) => setFetchUrlInput(e.target.value)} />
                  <button className="action-btn" onClick={() => handleFetchAndParse()} disabled={fetchLoading}>{fetchLoading ? "Fetching..." : "Fetch & Parse"}</button>
                </div>
                {fetchMessage && <div className="text-sm mt-2 text-gray-600">{fetchMessage}</div>}
              </div>
            </div>

            <div className="tool-field mt-4">
              <h3 className="tool-section-title">Parsed Tags</h3>
              {errors.length > 0 && errors.map((e, i) => <div key={i} className="text-sm text-red-600">{e}</div>)}
              {parsed.length === 0 ? <div className="text-sm text-gray-500">No tags parsed.</div> : (
                <ul className="text-sm">
                  {parsed.map((p, i) => (
                    <li key={i} className="py-1 flex items-center gap-3">
                      <div className="font-mono text-xs text-gray-700 mr-2">{p.hreflang}</div>
                      <div className="truncate">{p.href}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="tool-preview">
            <h3 className="tool-h2">Generator</h3>
            <div className="tool-field">
              <label className="tool-label">Base URL</label>
              <input className="tool-input" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="https://example.com" />
            </div>
            <div className="tool-field mt-3">
              <label className="tool-label">Locale / URL Pairs</label>
              <p className="text-xs text-gray-500">Add each hreflang code and its absolute URL (one pair per row).</p>
              <div className="space-y-2 mt-2">
                {pairs.map((p, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <div className="flex gap-2 items-center">
                      <input
                        className="tool-input w-28"
                        placeholder="en or en-US"
                        value={p.code}
                        onChange={(e) => updatePair(i, "code", normalizeCodeDisplay(e.target.value))}
                      />
                      <input
                        className="tool-input flex-1"
                        placeholder="https://example.com/en/"
                        value={p.href}
                        onChange={(e) => updatePair(i, "href", e.target.value)}
                      />
                      <button className="clear-btn" onClick={() => removePair(i)} aria-label="Remove pair">Remove</button>
                    </div>
                    <div>
                      {pairValidation.results[i]?.codeError && <div className="text-xs text-red-600">{pairValidation.results[i].codeError}</div>}
                      {pairValidation.results[i]?.hrefError && <div className="text-xs text-red-600">{pairValidation.results[i].hrefError}</div>}
                      {pairValidation.results[i]?.duplicate && <div className="text-xs text-yellow-600">Duplicate code detected</div>}
                    </div>
                  </div>
                ))}
                <div>
                  <button className="action-btn" onClick={addPair}>Add Pair</button>
                </div>
              </div>
            </div>

            <div className="tool-field mt-3">
              <label className="tool-label">Self URL (auto-filled from Base URL)</label>
              <input className="tool-input" value={selfUrl} onChange={(e) => setSelfUrl(e.target.value)} placeholder="https://example.com/en/" />
              <p className="text-xs text-gray-500 mt-1">This URL will be used as the self-referencing hreflang tag. Edit if needed.</p>
            </div>

            <div className="tool-field mt-2 flex items-center gap-3">
              <label className="tool-label mr-2">x-default</label>
              <input type="checkbox" checked={xDefaultEnabled} onChange={(e) => setXDefaultEnabled(e.target.checked)} />
              <input className="tool-input flex-1 ml-2" value={xDefaultUrl} onChange={(e) => setXDefaultUrl(e.target.value)} placeholder="https://example.com/" />
            </div>

            <div className="flex gap-2 mt-3">
              <button className="action-btn" onClick={handleGenerate} disabled={pairValidation.hasAny || pairs.length === 0}>Generate Tags</button>
              <button className="clear-btn" onClick={() => { setGenerated([]); setBaseUrl(''); setPairs([{ code: 'en', href: '' }]); setErrors([]) }}>Clear</button>
              <button className="clear-btn" onClick={handleCopyGenerated} disabled={generated.length === 0}>Copy</button>
            </div>

            <div className="tool-field mt-4">
              <h3 className="tool-section-title">Generated Tags</h3>
              {generated.length === 0 ? <div className="text-sm text-gray-500">No tags generated yet.</div> : (
                <div>
                  <pre className="tool-code"><code>{generated.join('\n')}</code></pre>
                  <div className="text-sm mt-2">
                    <button className="action-btn" onClick={handleCopyGenerated}>Copy All</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <RelatedTools exclude="/hreflang-validator" />
    </>
  )
}


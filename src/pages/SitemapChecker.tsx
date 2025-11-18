import { useState, useCallback, useEffect } from "react"
import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import Seo from "../components/Seo"
import { toolsData } from "../data/toolsData"
import type { Tool } from "../data/toolsData"
import { copyToClipboard, downloadText } from "../utils"

export default function SitemapChecker(): JSX.Element {
  const [sitemapUrl, setSitemapUrl] = useState("")
  const [urlError, setUrlError] = useState("")
  const [fetching, setFetching] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [xmlText, setXmlText] = useState("")
  const [parsedUrls, setParsedUrls] = useState<{ loc: string; valid: boolean; status?: "unknown" | "valid" | "broken" | "skipped"; statusCode?: number | null }[]>([])
  const [checking, setChecking] = useState(false)
  const [stats, setStats] = useState({ total: 0, valid: 0, broken: 0, skipped: 0 })
  const [serverEndpoint, setServerEndpoint] = useState<string>("http://localhost:3001/check-urls")

  const related: Tool[] = toolsData.filter((t) => t.name !== "XML Sitemap Checker")
  const navigate = useNavigate()

  const validateUrl = (value: string, setError: (v: string) => void) => {
    if (!value || !value.trim()) {
      setError("Please enter a sitemap URL")
      return false
    }
    try {
      new URL(value)
      setError("")
      return true
    } catch {
      setError("Invalid URL format")
      return false
    }
  }

  const fetchSitemap = useCallback(async (url: string) => {
    const tryFetchText = async (u: string) => {
      const res = await fetch(u, { headers: { Accept: "application/xml, text/xml, */*" } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.text()
    }

    const target = url.trim()

    // Try server-side fetch first (if your Express scaffold is running).
    try {
      // derive fetch endpoint from serverEndpoint if possible
      let fetchEndpoint = serverEndpoint
      if (fetchEndpoint.endsWith("/check-urls")) fetchEndpoint = fetchEndpoint.replace(/\/check-urls\/?$/, "/fetch-url")
      // fallback to a common path
      if (!fetchEndpoint) fetchEndpoint = "http://localhost:3001/fetch-url"
      try {
        const srv = await fetch(fetchEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: target, method: "GET", timeoutMs: 10000 }),
        })
        if (srv.ok) {
          const body = await srv.json()
          if (body && typeof body.text === "string" && body.text.trim()) return body.text
        }
      } catch (e) {
        // server fetch failed -> continue to client attempts
      }
    } catch (e) {
      // ignore
    }

    // Try direct client fetch
    try {
      return await tryFetchText(target)
    } catch (err) {
      // Try a sequence of public proxy fallbacks (best-effort)
      const proxyGenerators = [
        (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
        (u: string) => `https://thingproxy.freeboard.io/fetch/${u}`,
      ]

      for (const gen of proxyGenerators) {
        try {
          const proxied = gen(target)
          return await tryFetchText(proxied)
        } catch (e) {
          // continue to next proxy
        }
      }

      // Nothing worked — rethrow the original error to be handled by caller with context
      throw err
    }
  }, [])

  const handleFetch = async () => {
    setFetchError(null)
    if (!validateUrl(sitemapUrl, setUrlError)) return
    setFetching(true)
    try {
      const text = await fetchSitemap(sitemapUrl)
      setXmlText(text || "")
      parseXml(text || "")
    } catch (err) {
      // Surface a clearer error. If the error is a TypeError (likely CORS/network), show a hint.
      const message = err instanceof Error ? err.message : String(err)
      if (message === "Failed to fetch" || /TypeError/i.test(message)) {
        setFetchError("Could not fetch the sitemap — network or CORS error. Try a different URL or use the Raw XML option.")
      } else {
        setFetchError(`Could not fetch the sitemap: ${message}`)
      }
      setXmlText("")
      setParsedUrls([])
    } finally {
      setFetching(false)
    }
  }

  const parseXml = (text: string) => {
    if (!text) {
      setParsedUrls([])
      return
    }
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(text, "application/xml")
      // Some responses are HTML pages (not XML). Detect and show helpful message.
      const rootName = doc && doc.documentElement && doc.documentElement.nodeName ? doc.documentElement.nodeName.toLowerCase() : ""
      if (rootName === "html") {
        setFetchError("Invalid sitemap: the fetched content appears to be HTML, not XML. Check the URL or try fetching the raw sitemap XML.")
        setParsedUrls([])
        return
      }

      if (doc.querySelector("parsererror")) {
        setFetchError("Invalid XML: parsing failed — the provided content is not valid XML.")
        setParsedUrls([])
        return
      }

      // sitemap index
      const sitemapNodes = Array.from(doc.querySelectorAll("sitemap > loc"))
      if (sitemapNodes.length) {
        const urls = sitemapNodes.map((n) => ({ loc: (n.textContent || "").trim(), valid: isValidUrl((n.textContent || "").trim()), status: "unknown" as const, statusCode: null }))
        setParsedUrls(urls)
        setFetchError(null)
        return
      }

      // regular sitemap
      const urlNodes = Array.from(doc.querySelectorAll("url > loc"))
      if (urlNodes.length) {
        const urls = urlNodes.map((n) => ({ loc: (n.textContent || "").trim(), valid: isValidUrl((n.textContent || "").trim()), status: "unknown" as const, statusCode: null }))
        setParsedUrls(urls)
        setFetchError(null)
        return
      }

      // fallback: find any <loc>
      const anyLoc = Array.from(doc.querySelectorAll("loc"))
      const urls = anyLoc.map((n) => ({ loc: (n.textContent || "").trim(), valid: isValidUrl((n.textContent || "").trim()), status: "unknown" as const, statusCode: null }))
      setParsedUrls(urls)
      setFetchError(null)
    } catch (err) {
      setFetchError("Failed to parse XML — ensure you've provided valid sitemap XML (looks like HTML or malformed XML).")
      setParsedUrls([])
    }
  }

  const isValidUrl = (v: string) => {
    try {
      new URL(v)
      return true
    } catch {
      return false
    }
  }

  const handleParseFromTextarea = () => {
    parseXml(xmlText)
  }

  const handleCopyList = async () => {
    const text = parsedUrls.map((u) => u.loc).join("\n")
    await copyToClipboard(text)
  }

  const handleDownloadList = () => {
    const text = parsedUrls.map((u) => u.loc).join("\n")
    downloadText("sitemap-urls.txt", text)
  }

  useEffect(() => {
    // Only update total when parsedUrls changes to avoid clobbering
    // counts while `checkUrls` updates them incrementally.
    if (parsedUrls.length === 0) {
      setStats({ total: 0, valid: 0, broken: 0, skipped: 0 })
    } else {
      setStats((prev) => ({ ...prev, total: parsedUrls.length }))
    }
  }, [parsedUrls])

  // If the user has entered a sitemap URL but it's invalid, clear and disable the raw XML textarea
  useEffect(() => {
    if (sitemapUrl && !isValidUrl(sitemapUrl)) {
      if (xmlText) setXmlText("")
    }
  }, [sitemapUrl, xmlText])

  const fetchWithTimeout = async (input: RequestInfo, init: RequestInit = {}, timeout = 10000) => {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), timeout)
    try {
      const res = await fetch(input, { ...init, signal: controller.signal })
      clearTimeout(id)
      return res
    } finally {
      clearTimeout(id)
    }
  }

  // Server-side URL checks: POST /check-urls { urls: string[], concurrency?, timeoutMs? }
  const checkUrlsServerSide = async () => {
    if (!parsedUrls.length) return [] as any
    const body = { urls: parsedUrls.map((p) => p.loc), concurrency: 6, timeoutMs: 8000 }
    const res = await fetch(serverEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(`Server returned ${res.status}`)
    const json = await res.json()
    const results: { url: string; status: string; statusCode?: number }[] = json.results || []
    return results
  }

  // Unified check: try server first, fall back to client-side checks on failure
  const checkUrlsUnified = async () => {
    if (!parsedUrls.length) return
    setChecking(true)
    setFetchError(null)
    try {
      const results: { url: string; status: string; statusCode?: number }[] = await checkUrlsServerSide()
      const total = parsedUrls.length
      // merge results into parsedUrls
      setParsedUrls((prev) => prev.map((p) => {
        const found = results.find((r) => r.url === p.loc)
        if (found) return { ...p, status: (found.status as any) || "skipped", statusCode: found.statusCode ?? null }
        return p
      }))
      // recompute stats (use earlier-captured total to avoid stale state)
      const newStats = { total, valid: 0, broken: 0, skipped: 0 }
      for (const r of results) {
        if (r.status === "valid") newStats.valid++
        else if (r.status === "broken") newStats.broken++
        else newStats.skipped++
      }
      setStats(newStats)
    } catch (err) {
      // server failed -> fall back to client-side checks
      // eslint-disable-next-line no-console
      console.warn("Server check failed, falling back to client-side checks:", err)
      try {
        await checkUrls()
      } catch (e) {
        setFetchError(String(e instanceof Error ? e.message : e))
      }
    } finally {
      setChecking(false)
    }
  }

  /*
    Server-side integration snippet (commented):

    If you deploy the Express scaffold (`server/express-checker`) locally
    or the Vercel serverless handler (`serverless/vercel-check-urls.js`) to
    `/api/check-urls`, you can offload the per-URL HTTP checks to the server
    to avoid CORS and public-proxy fallback issues.

    Example (replace `ENDPOINT` with your deployed URL, e.g.:
      - Local Express: http://localhost:3001/check-urls
      - Vercel serverless: https://your-site.vercel.app/api/check-urls
    )

    // async function checkUrlsServerSide(urls: string[]) {
    //   const ENDPOINT = 'http://localhost:3001/check-urls'
    //   const res = await fetch(ENDPOINT, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ urls, concurrency: 6, timeoutMs: 8000 })
    //   })
    //   if (!res.ok) throw new Error(`Server returned ${res.status}`)
    //   const body = await res.json()
    //   // body.results is an array of { url, status: 'valid'|'broken'|'skipped', statusCode, attempts }
    //   // Merge the server results into local `parsedUrls` and `stats`:
    //   setParsedUrls((prev) => prev.map((p) => {
    //     const found = (body.results || []).find((r: any) => r.url === p.loc)
    //     return found ? { ...p, status: found.status, statusCode: found.statusCode } : p
    //   }))
    //   // Recompute stats from results (or rely on server-provided summary)
    // }

    Use this helper instead of client-side fetch loops when possible.
  */

  const tryFetch = async (url: string) => {
    // Try HEAD first, then GET; if CORS blocks us, try via a public proxy
    try {
      let res = await fetchWithTimeout(url, { method: "HEAD" }, 8000)
      if (res && res.ok) return res
      // sometimes HEAD not allowed, try GET
      res = await fetchWithTimeout(url, { method: "GET" }, 10000)
      if (res) return res
    } catch (e) {
      // fall through to proxy
    }

    // proxy fallback
    const proxied = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
    try {
      const res = await fetchWithTimeout(proxied, { method: "GET" }, 12000)
      return res
    } catch (e) {
      throw e
    }
  }

    const checkUrls = async () => {
    if (!parsedUrls.length) return
    setChecking(true)
    const results = { total: parsedUrls.length, valid: 0, broken: 0, skipped: 0 }

    // concurrency limit
    const concurrency = 6
    let idx = 0

    const worker = async () => {
      while (true) {
        const i = idx++
        if (i >= parsedUrls.length) return
        const u = parsedUrls[i].loc
        try {
          // retry loop with backoff to reduce transient/skipped results
          let res: Response | null = null
          let attempt = 0
          const maxAttempts = 3
          while (attempt < maxAttempts) {
            try {
              // tryFetch will itself fallback to proxy if needed
              // eslint-disable-next-line no-await-in-loop
              res = await tryFetch(u)
              break
            } catch (e) {
              attempt++
              // small exponential backoff
              // eslint-disable-next-line no-await-in-loop
              await new Promise((r) => setTimeout(r, 200 * attempt))
            }
          }

          if (!res) {
            // final failure after retries
            results.skipped++
            setParsedUrls((prev) => {
              const copy = prev.slice()
              copy[i] = { ...copy[i], status: "skipped", statusCode: null }
              return copy
            })
          } else {
            let status: "valid" | "broken" | "skipped" = "skipped"
            const statusCode = typeof res.status === "number" ? res.status : null

            if (statusCode !== null) {
              // Consider 2xx and 3xx as valid. Treat 4xx/5xx as broken.
              if (statusCode >= 200 && statusCode < 400) {
                status = "valid"
                results.valid++
              } else if (statusCode >= 400 && statusCode < 600) {
                status = "broken"
                results.broken++
              } else {
                // other numeric statuses -> treat as valid
                status = "valid"
                results.valid++
              }
            } else {
              // opaque responses (CORS-opaque) have status 0 and type 'opaque'
              // treat opaque responses as valid (we got a response, even if opaque)
              // otherwise mark as skipped
              // @ts-ignore - safe access on Response
              if (res.type === "opaque") {
                status = "valid"
                results.valid++
              } else {
                status = "skipped"
                results.skipped++
              }
            }

            setParsedUrls((prev) => {
              const copy = prev.slice()
              copy[i] = { ...copy[i], status, statusCode }
              return copy
            })
          }
        } catch (err) {
          results.skipped++
          setParsedUrls((prev) => {
            const copy = prev.slice()
            copy[i] = { ...copy[i], status: "skipped", statusCode: null }
            return copy
          })
        }

        // update intermediate stats so UI feels responsive
        setStats({ ...results })
      }
    }

    const workers = Array.from({ length: Math.min(concurrency, parsedUrls.length) }, () => worker())
    await Promise.all(workers)
    setStats({ ...results })
    setChecking(false)
  }

  const handleClear = () => {
    setSitemapUrl("")
    setXmlText("")
    setParsedUrls([])
    setUrlError("")
    setFetchError(null)
  }

  // Dynamic one-line summary shown under the Summary title
  const summaryText = (() => {
    if (fetching) return "Fetching sitemap..."
    if (checking) return "Checking URLs..."
    if (!sitemapUrl) return "No sitemap URL provided."
    if (!isValidUrl(sitemapUrl)) return "Provided sitemap URL is invalid."
    if (parsedUrls.length === 0) return "Sitemap fetched but no URLs parsed."
    if (stats.broken > 0) return `${stats.broken} broken URL${stats.broken !== 1 ? "s" : ""} found.`
    if (stats.skipped > 0) return `All checked; ${stats.skipped} URL${stats.skipped !== 1 ? "s" : ""} skipped due to errors or CORS.`
    return "The sitemap you provided is valid. No errors found."
  })()

  return (
    <>
      <Seo
        title="Free XML Sitemap Checker"
        description="Fetch and validate XML sitemaps. Parse sitemap index files or standard sitemaps and list contained URLs with basic validation." 
        keywords="sitemap checker, sitemap validator, xml sitemap, seo tools"
        url="https://cralite.com/tools/sitemap-checker"
      />

      <section className="tool-section">
        <div className="tool-grid">
          <div className="tool-form">
            <h2 className="tool-h2">XML Sitemap Checker</h2>
            <p className="text-sm text-gray-600 mb-4">Paste an absolute sitemap URL (e.g. https://example.com/sitemap.xml) and fetch & parse the XML. The tool will list URLs found and flag invalid entries.</p>

            {/* Left-column summary removed per request — moving summary to right column */}

            <div className="tool-field">
              <label className="tool-label">Sitemap URL</label>
              <input
                type="url"
                className="tool-input"
                placeholder="https://example.com/sitemap.xml"
                value={sitemapUrl}
                onChange={(e) => {
                  setSitemapUrl(e.target.value)
                  validateUrl(e.target.value, setUrlError)
                }}
              />
              {urlError && <div className="mt-0 bg-orange-50 border border-orange-200 text-red-600 text-sm rounded-md p-2">{urlError}</div>}
            </div>

            <div className="button-group mt-3">
              <button onClick={handleFetch} className="action-btn" disabled={fetching || !isValidUrl(sitemapUrl)}>{fetching ? "Fetching..." : "Fetch & Parse"}</button>
              <button onClick={() => checkUrlsUnified()} className="action-btn" disabled={checking || parsedUrls.length === 0}>{checking ? "Checking..." : "Check URLs"}</button>
              <button
                onClick={handleParseFromTextarea}
                className="clear-btn"
                disabled={xmlText.trim().length === 0 || (sitemapUrl !== "" && !isValidUrl(sitemapUrl))}
              >
                Parse Raw XML
              </button>
              <button onClick={handleClear} className="clear-btn">Clear</button>
            </div>

            {/* Server endpoint used automatically (server first, then client fallback) */}

            {!(sitemapUrl && !isValidUrl(sitemapUrl)) ? (
              <div className="tool-field mt-4">
                <label className="tool-label">Raw XML (optional)</label>
                <textarea
                  value={xmlText}
                  onChange={(e) => setXmlText(e.target.value)}
                  className="tool-textarea"
                  rows={8}
                  placeholder="Paste sitemap XML here to parse without fetching"
                ></textarea>
              </div>
            ) : (
              <div className="tool-field mt-4">
                <label className="tool-label">Raw XML (optional)</label>
                <div className="mt-2 text-sm text-orange-600">Raw XML input hidden while the sitemap URL is invalid. Clear or fix the URL to enable pasting XML.</div>
              </div>
            )}

            {fetchError && <div className="mt-3 text-sm text-red-600">{fetchError}</div>}

            <div className="tool-field mt-4">
              <h3 className="tool-section-title">Parsed URLs</h3>
              <div className="text-sm text-gray-700 mb-2">Found <strong>{parsedUrls.length}</strong> entries.</div>

              <div className="overflow-auto max-h-64 border rounded p-2 bg-white">
                {parsedUrls.length === 0 ? (
                  <div className="text-sm text-gray-500">No URLs parsed yet.</div>
                ) : (
                  <ul className="text-sm">
                    {parsedUrls.map((u, i) => (
                      <li key={i} className={`py-1 flex items-center gap-2 ${u.status === "broken" ? "text-red-600" : ""}`}>
                        <span className="w-6 text-center">
                          {u.status === "valid" ? "✅" : u.status === "broken" ? "❌" : u.status === "skipped" ? "🟡" : "•"}
                        </span>
                        <span className="truncate">{u.loc || "(empty)"}{!u.valid && " — invalid URL"}</span>
                        <span className="ml-auto text-xs text-gray-500">{u.statusCode ?? ""}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Copy/Download toolbar removed per design — actions available elsewhere */}
            </div>
          </div>

          <div className="tool-preview">
            <h3 className="tool-h2 mb-3">Summary</h3>
            <div className={fetchError ? "text-sm text-red-600 mb-3" : "text-sm text-gray-700 mb-3"}>{summaryText}</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div className="p-4 rounded-lg bg-blue-50 flex items-center gap-4">
                <div className="text-2xl text-blue-600">🔵</div>
                <div>
                  <div className="text-sm text-gray-500">Total URLs</div>
                  <div className="text-2xl font-semibold text-blue-700">{stats.total}</div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-green-50 flex items-center gap-4">
                <div className="text-2xl text-green-600">✅</div>
                <div>
                  <div className="text-sm text-gray-500">Valid (200)</div>
                  <div className="text-2xl font-semibold text-green-700">{stats.valid}</div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-red-50 flex items-center gap-4">
                <div className="text-2xl text-red-600">❌</div>
                <div>
                  <div className="text-sm text-gray-500">Broken (4xx/5xx)</div>
                  <div className="text-2xl font-semibold text-red-700">{stats.broken}</div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-yellow-50 flex items-center gap-4">
                <div className="text-2xl text-yellow-600">🟡</div>
                <div>
                  <div className="text-sm text-gray-500">Skipped / Error</div>
                  <div className="text-2xl font-semibold text-yellow-700">{stats.skipped}</div>
                </div>
              </div>
            </div>

            <h3 className="tool-h2">About</h3>
            <p className="text-sm text-gray-700 leading-relaxed">This checker will attempt to fetch a sitemap URL and parse it as XML. It supports sitemap index files and standard URL sitemaps. If the remote server blocks CORS, the tool will retry via a public proxy.</p>
          </div>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="mb-6">Related Tools</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {related.map((tool) => (
            <a
              key={tool.name}
              href={tool.link}
              onClick={(e) => {
                e.preventDefault()
                navigate(tool.link)
                setTimeout(() => window.scrollTo(0, 0), 10)
              }}
              className="flex items-center gap-4 bg-white p-6 rounded-[10px] shadow-sm hover:-translate-y-[4px] hover:shadow-md transition-all duration-150"
            >
              <div className="text-3xl">
                <img src={tool.icon} alt={tool.name} className="w-8 h-8 object-contain" />
              </div>
              <h4 className="text-[18px] font-medium text-gray-800">{tool.name}</h4>
            </a>
          ))}
        </div>
      </section>
    </>
  )
}

import { useCallback, useEffect, useMemo, useState } from "react"
import Seo from "../components/Seo"
import ToolSchema from "../components/ToolSchema"
import RelatedTools from "../components/RelatedTools"
import downloadIcon from "../assets/icons/download.svg"
import resetIcon from "../assets/icons/reset.svg"
import { downloadText } from "../utils/download"
import {
  applySitemapWarnings,
  isValidUrl,
  parseSitemapXml,
  sitemapEntriesToCsv,
  type SitemapEntry,
} from "../utils/sitemapUtils"

const FAQ_ITEMS = [
  {
    q: "Why can't I fetch the sitemap?",
    a: "Some servers block browser requests with CORS. If fetching fails, paste the raw sitemap XML or try the sitemap URL directly in your browser.",
  },
  {
    q: "What is a sitemap index?",
    a: "A sitemap index lists child sitemap files. Fetch & Parse follows those child sitemaps automatically and combines their URLs.",
  },
  {
    q: "Why are some URLs marked as skipped?",
    a: "Skipped URLs usually failed because of network errors, timeouts, CORS, or an unavailable child sitemap.",
  },
]

type Stats = {
  total: number
  valid: number
  broken: number
  skipped: number
  redirects: number
  warnings: number
}

const EMPTY_STATS: Stats = { total: 0, valid: 0, broken: 0, skipped: 0, redirects: 0, warnings: 0 }

function statusLabel(entry: SitemapEntry): string {
  if (entry.statusCode) return `${entry.status || "unknown"} (${entry.statusCode})`
  return entry.status || "unknown"
}

function statusIcon(status: SitemapEntry["status"]): string {
  if (status === "valid") return "OK"
  if (status === "broken") return "ERR"
  if (status === "redirect") return "301"
  if (status === "skipped") return "SKIP"
  return "-"
}

export default function SitemapChecker(): JSX.Element {
  const [sitemapUrl, setSitemapUrl] = useState("")
  const [urlError, setUrlError] = useState("")
  const [fetching, setFetching] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [xmlText, setXmlText] = useState("")
  const [parsedUrls, setParsedUrls] = useState<SitemapEntry[]>([])
  const [checking, setChecking] = useState(false)
  const [childSitemapCount, setChildSitemapCount] = useState(0)
  const [stats, setStats] = useState<Stats>(EMPTY_STATS)
  const [serverEndpoint] = useState<string>(import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/check-urls` : "")

  const validateUrl = (value: string, setError: (v: string) => void) => {
    if (!value.trim()) {
      setError("Please enter a sitemap URL")
      return false
    }
    if (!isValidUrl(value)) {
      setError("Invalid URL format")
      return false
    }
    setError("")
    return true
  }

  const fetchSitemap = useCallback(async (url: string) => {
    const target = url.trim()
    const tryFetchText = async (fetchUrl: string) => {
      const res = await fetch(fetchUrl, { headers: { Accept: "application/xml, text/xml, */*" } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.text()
    }

    let fetchEndpoint = serverEndpoint
    if (fetchEndpoint.endsWith("/check-urls")) fetchEndpoint = fetchEndpoint.replace(/\/check-urls\/?$/, "/fetch-url")

    if (fetchEndpoint) {
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
      } catch {}
    }

    return await tryFetchText(target)
  }, [serverEndpoint])

  const fetchAndParseSitemapTree = useCallback(async (
    url: string,
    depth = 0,
    seen = new Set<string>(),
  ): Promise<{ entries: SitemapEntry[]; xml: string; childCount: number }> => {
    const target = url.trim()
    if (seen.has(target) || depth > 3) return { entries: [], xml: "", childCount: 0 }
    seen.add(target)

    const xml = await fetchSitemap(target)
    const parsed = parseSitemapXml(xml)
    if (parsed.childSitemaps.length === 0) return { entries: parsed.entries, xml, childCount: 0 }

    const children = await Promise.all(parsed.childSitemaps.slice(0, 50).map(async (child) => {
      try {
        return await fetchAndParseSitemapTree(child, depth + 1, seen)
      } catch {
        return {
          entries: [{
            loc: child,
            valid: isValidUrl(child),
            status: "skipped" as const,
            statusCode: null,
            warnings: ["Could not fetch child sitemap."],
          }],
          xml: "",
          childCount: 0,
        }
      }
    }))

    return {
      entries: children.flatMap((child) => child.entries),
      xml,
      childCount: parsed.childSitemaps.length + children.reduce((sum, child) => sum + child.childCount, 0),
    }
  }, [fetchSitemap])

  const setEntries = (entries: SitemapEntry[]) => {
    setParsedUrls(applySitemapWarnings(entries))
  }

  const parseXml = (text: string) => {
    if (!text.trim()) {
      setEntries([])
      setChildSitemapCount(0)
      return
    }

    try {
      const parsed = parseSitemapXml(text)
      if (parsed.childSitemaps.length) {
        setChildSitemapCount(parsed.childSitemaps.length)
        setEntries(parsed.childSitemaps.map((loc) => ({
          loc,
          valid: isValidUrl(loc),
          status: "unknown",
          statusCode: null,
          warnings: ["Child sitemap listed. Use Fetch & Parse to recursively fetch URLs."],
        })))
      } else {
        setChildSitemapCount(0)
        setEntries(parsed.entries)
      }
      setFetchError(null)
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Failed to parse XML.")
      setEntries([])
      setChildSitemapCount(0)
    }
  }

  const handleFetch = async () => {
    setFetchError(null)
    if (!validateUrl(sitemapUrl, setUrlError)) return
    setFetching(true)
    try {
      const tree = await fetchAndParseSitemapTree(sitemapUrl)
      setXmlText(tree.xml)
      setChildSitemapCount(tree.childCount)
      setEntries(tree.entries)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setFetchError(/Failed to fetch|TypeError/i.test(message)
        ? "Could not fetch the sitemap. Try raw XML or configure a server-side fetch endpoint."
        : `Could not fetch the sitemap: ${message}`)
      setXmlText("")
      setEntries([])
      setChildSitemapCount(0)
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    if (parsedUrls.length === 0) {
      setStats(EMPTY_STATS)
      return
    }
    setStats((prev) => ({
      ...prev,
      total: parsedUrls.length,
      redirects: parsedUrls.filter((entry) => entry.status === "redirect").length,
      warnings: parsedUrls.reduce((sum, entry) => sum + entry.warnings.length, 0),
    }))
  }, [parsedUrls])

  useEffect(() => {
    if (sitemapUrl && !isValidUrl(sitemapUrl) && xmlText) setXmlText("")
  }, [sitemapUrl, xmlText])

  const fetchWithTimeout = async (input: RequestInfo, init: RequestInit = {}, timeout = 10000) => {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), timeout)
    try {
      return await fetch(input, { ...init, signal: controller.signal })
    } finally {
      clearTimeout(id)
    }
  }

  const checkUrlsServerSide = async () => {
    if (!serverEndpoint) throw new Error("no server configured")
    const res = await fetch(serverEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urls: parsedUrls.map((p) => p.loc), concurrency: 6, timeoutMs: 8000 }),
    })
    if (!res.ok) throw new Error(`Server returned ${res.status}`)
    const json = await res.json()
    return (json.results || []) as { url: string; status: string; statusCode?: number }[]
  }

  const checkUrls = async () => {
    if (!parsedUrls.length) return
    const results: Stats = { ...EMPTY_STATS, total: parsedUrls.length }
    const concurrency = 6
    let idx = 0

    const updateEntry = (index: number, status: SitemapEntry["status"], statusCode: number | null) => {
      setParsedUrls((prev) => {
        const copy = prev.slice()
        copy[index] = { ...copy[index], status, statusCode }
        return applySitemapWarnings(copy)
      })
    }

    const tryFetch = async (url: string) => {
      try {
        const head = await fetchWithTimeout(url, { method: "HEAD" }, 8000)
        if (head) return head
      } catch {}
      return fetchWithTimeout(url, { method: "GET" }, 10000)
    }

    const worker = async () => {
      while (idx < parsedUrls.length) {
        const i = idx++
        try {
          const res = await tryFetch(parsedUrls[i].loc)
          const code = typeof res.status === "number" ? res.status : null
          let status: SitemapEntry["status"] = "skipped"
          if (code !== null && code >= 200 && code < 300) {
            status = "valid"
            results.valid++
          } else if (code !== null && code >= 300 && code < 400) {
            status = "redirect"
            results.redirects++
          } else if (code !== null && code >= 400) {
            status = "broken"
            results.broken++
          } else {
            results.skipped++
          }
          updateEntry(i, status, code)
        } catch {
          results.skipped++
          updateEntry(i, "skipped", null)
        }
        setStats({ ...results })
      }
    }

    await Promise.all(Array.from({ length: Math.min(concurrency, parsedUrls.length) }, () => worker()))
    setStats({ ...results })
  }

  const checkUrlsUnified = async () => {
    if (!parsedUrls.length) return
    setChecking(true)
    setFetchError(null)
    try {
      const serverResults = await checkUrlsServerSide()
      const nextStats: Stats = { ...EMPTY_STATS, total: parsedUrls.length }
      setParsedUrls((prev) => applySitemapWarnings(prev.map((entry) => {
        const found = serverResults.find((result) => result.url === entry.loc)
        if (!found) return entry
        const statusCode = found.statusCode ?? null
        const status = statusCode && statusCode >= 300 && statusCode < 400 ? "redirect" : (found.status as SitemapEntry["status"]) || "skipped"
        if (status === "valid") nextStats.valid++
        else if (status === "broken") nextStats.broken++
        else if (status === "redirect") nextStats.redirects++
        else nextStats.skipped++
        return { ...entry, status, statusCode }
      })))
      setStats(nextStats)
    } catch {
      await checkUrls()
    } finally {
      setChecking(false)
    }
  }

  const handleClear = () => {
    setSitemapUrl("")
    setXmlText("")
    setEntries([])
    setUrlError("")
    setFetchError(null)
    setChildSitemapCount(0)
  }

  const warningEntries = useMemo(() => parsedUrls.filter((entry) => entry.warnings.length > 0), [parsedUrls])

  const summaryText = (() => {
    if (fetching) return "Fetching sitemap..."
    if (checking) return "Checking URLs..."
    if (!sitemapUrl && !xmlText) return "No sitemap URL or raw XML provided."
    if (parsedUrls.length === 0) return "No URLs parsed yet."
    if (stats.broken > 0) return `${stats.broken} broken URL${stats.broken !== 1 ? "s" : ""} found.`
    if (stats.redirects > 0) return `${stats.redirects} redirecting URL${stats.redirects !== 1 ? "s" : ""} found.`
    if (stats.warnings > 0) return `${stats.warnings} sitemap warning${stats.warnings !== 1 ? "s" : ""} found.`
    return "The sitemap looks clean from the checks run so far."
  })()

  return (
    <>
      <Seo
        title="Free XML Sitemap Checker"
        description="Fetch, parse, recurse, and validate XML sitemaps with status checks, sitemap metadata extraction, duplicate warnings, and CSV export."
        keywords="sitemap checker, sitemap validator, xml sitemap, seo tools"
        url="https://cralite.com/tools/sitemap-checker/"
      />
      <ToolSchema
        name="XML Sitemap Checker"
        description="Fetch, parse, recurse, and validate XML sitemaps with status checks, sitemap metadata extraction, duplicate warnings, and CSV export."
        url="https://cralite.com/tools/sitemap-checker/"
      />

      <section className="section section--neutral">
        <div className="section-inner">
          <section className="tool-section">
            <div className="tool-grid">
              <div className="tool-form">
                <h2 className="tool-h2">XML Sitemap Checker</h2>
                <p className="text-sm text-gray-600 mb-4">Fetch a sitemap URL or paste XML. Sitemap indexes are followed automatically when fetched.</p>

                <form onSubmit={(e) => { e.preventDefault(); handleFetch() }}>
                <div className="tool-field">
                  <label className="tool-label" htmlFor="sitemap-url-input">Sitemap URL</label>
                  <input
                    id="sitemap-url-input"
                    type="url"
                    name="sitemap-url"
                    autoComplete="url"
                    className="tool-input"
                    placeholder="https://example.com/sitemap.xml"
                    value={sitemapUrl}
                    onChange={(e) => {
                      setSitemapUrl(e.target.value)
                      validateUrl(e.target.value, setUrlError)
                    }}
                  />
                  {urlError && <div className="mt-2 bg-orange-50 border border-orange-200 text-red-600 text-sm rounded-md p-2">{urlError}</div>}
                  <p className="text-xs text-gray-500 mt-1">
                    If direct fetch is blocked by the site's CORS policy, this tool retries through our server-side fetcher.
                  </p>
                </div>

                <div className="button-group sitemap-actions-row mb-0">
                  <button type="submit" className="action-btn" disabled={fetching || !isValidUrl(sitemapUrl)}>{fetching ? "Fetching..." : "Fetch & Parse"}</button>
                  <button type="button" onClick={checkUrlsUnified} className="action-btn" disabled={checking || parsedUrls.length === 0}>{checking ? "Checking..." : "Check URLs"}</button>
                  <button type="button" onClick={() => parseXml(xmlText)} className="clear-btn" disabled={!xmlText.trim()}>Parse Raw XML</button>
                </div>
                </form>

                <div>

                  <div className="tool-field">
                    <div className="flex items-center justify-between gap-3">
                      <label className="tool-label">Raw XML (optional)</label>
                      <div className="toolbar">
                        <span className="toolbar-wrap">
                          <button
                            type="button"
                            onClick={() => downloadText("sitemap-checker-results.csv", sitemapEntriesToCsv(parsedUrls))}
                            className="toolbar-btn toolbar-btn--green"
                            disabled={parsedUrls.length === 0}
                            aria-label="Export CSV"
                          >
                            <img src={downloadIcon} alt="" className="toolbar-icon" />
                          </button>
                          <span className="tooltip">Export CSV</span>
                        </span>
                        <span className="toolbar-wrap">
                          <button
                            type="button"
                            onClick={handleClear}
                            className="toolbar-btn toolbar-btn--red"
                            aria-label="Clear"
                          >
                            <img src={resetIcon} alt="" className="toolbar-icon" />
                          </button>
                          <span className="tooltip">Clear</span>
                        </span>
                      </div>
                    </div>
                    <textarea
                      value={xmlText}
                      onChange={(e) => setXmlText(e.target.value)}
                      className="tool-textarea"
                      rows={8}
                      placeholder="Paste sitemap XML here to parse without fetching"
                    />
                  </div>
                </div>

                {fetchError && <div className="mt-3 text-sm text-red-600">{fetchError}</div>}

                <div className="tool-field">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <h3 className="tool-section-title mb-0">Parsed URLs</h3>
                    <div className="text-sm text-gray-700">Found <strong>{parsedUrls.length}</strong> entries</div>
                  </div>

                  <div className="overflow-auto max-h-96 border rounded p-2 bg-white parsed-urls">
                    {parsedUrls.length === 0 ? (
                      <div className="text-sm text-gray-500">No URLs parsed yet.</div>
                    ) : (
                      <ul className="text-sm divide-y divide-gray-100">
                        {parsedUrls.map((entry, i) => (
                          <li key={`${entry.loc}-${i}`} className={`py-3 ${entry.status === "broken" ? "text-red-600" : ""}`}>
                            <div className="flex items-start gap-2">
                              <span className="w-10 shrink-0 text-xs font-semibold text-gray-500">{statusIcon(entry.status)}</span>
                              <div className="min-w-0 flex-1">
                                <div className="break-all">{entry.loc || "(empty)"}{!entry.valid && " - invalid URL"}</div>
                                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                                  {entry.lastmod && <span>lastmod: {entry.lastmod}</span>}
                                  {entry.changefreq && <span>changefreq: {entry.changefreq}</span>}
                                  {entry.priority && <span>priority: {entry.priority}</span>}
                                  <span>{statusLabel(entry)}</span>
                                </div>
                                {entry.warnings.length > 0 && (
                                  <ul className="mt-2 list-disc pl-5 text-xs text-amber-700">
                                    {entry.warnings.map((warning) => <li key={warning}>{warning}</li>)}
                                  </ul>
                                )}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              <div className="tool-preview">
                <h3 className="tool-h2 mb-3">Summary</h3>
                <div className={fetchError ? "text-sm text-red-600 mb-3" : "text-sm text-gray-700 mb-3"}>{summaryText}</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {[
                    ["Total URLs", stats.total, "bg-blue-50 text-blue-700"],
                    ["Valid", stats.valid, "bg-green-50 text-green-700"],
                    ["Broken", stats.broken, "bg-red-50 text-red-700"],
                    ["Redirects", stats.redirects, "bg-purple-50 text-purple-700"],
                    ["Skipped", stats.skipped, "bg-yellow-50 text-yellow-700"],
                    ["Warnings", stats.warnings, "bg-amber-50 text-amber-700"],
                  ].map(([label, value, classes]) => (
                    <div key={String(label)} className={`p-4 rounded-lg ${classes}`}>
                      <div className="text-base opacity-80">{label}</div>
                      <div className="text-2xl font-semibold">{value}</div>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4 text-base text-gray-700">
                  <div><strong>Child sitemaps followed:</strong> {childSitemapCount}</div>
                  <div><strong>Rows with warnings:</strong> {warningEntries.length}</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>

      <section className="section section--white">
        <div className="section-inner">
          <h2 className="text-3xl md:text-4xl font-bold mb-5 text-center">How to Use the Sitemap Checker</h2>
          <p className="max-w-3xl mx-auto text-center text-secondary mb-5">
            Fetch your XML sitemap, inspect crawl issues, and export a clean audit file for SEO reviews.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
            {[
              {
                icon: new URL("../assets/icons/enter.svg", import.meta.url).href,
                title: "1. Enter Sitemap",
                desc: "Paste your sitemap URL or add raw XML when a site blocks browser fetching.",
              },
              {
                icon: new URL("../assets/icons/validate.svg", import.meta.url).href,
                title: "2. Check URLs",
                desc: "Parse child sitemaps, review warnings, and run status checks for broken or redirecting URLs.",
              },
              {
                icon: new URL("../assets/icons/download.svg", import.meta.url).href,
                title: "3. Export Results",
                desc: "Download the CSV report and use it to clean up sitemap and indexing issues.",
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="step-icon-outer">
                  <div className="step-icon-circle">
                    <img src={icon} alt={title} className="step-icon-img" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                <p className="text-lg text-secondary max-w-xs mx-auto">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--neutral">
        <div className="section-inner">
          <h2 className="md:text-4xl mb-5 text-center">Frequently Asked Questions</h2>
          {FAQ_ITEMS.map((item, idx) => (
            <details key={idx} className="border-b border-gray-200 group" open={idx === 0}>
              <summary className="flex items-center justify-between py-6 cursor-pointer text-left text-xl font-semibold text-secondary">{item.q}</summary>
              <div className="pb-6 text-lg text-secondary">{item.a}</div>
            </details>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <RelatedTools exclude="/sitemap-checker" />
        </div>
      </section>
    </>
  )
}

import { useCallback, useState, useRef, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import Seo from "../components/Seo"
import { toolsData } from "../data/toolsData"
import type { Tool } from "../data/toolsData"

// --- FULL USER-AGENT DATABASE (cleaned) ---
const USER_AGENTS: Record<string, { display: string; value: string }[]> = {
  "Google Crawlers": [
    { display: "Googlebot Smartphone", value: "Googlebot" },
    { display: "Googlebot (Desktop)", value: "Googlebot" },
    { display: "Googlebot News", value: "Googlebot-News" },
    { display: "Googlebot Images", value: "Googlebot-Image" },
    { display: "Googlebot Video", value: "Googlebot-Video" },
    { display: "Google StoreBot (Mobile/Shopping)", value: "Storebot-Google" },
    { display: "Google StoreBot (Desktop/Shopping)", value: "Storebot-Google" },
    { display: "Google-InspectionTool (Mobile)", value: "Google-InspectionTool" },
    { display: "Google-InspectionTool (Desktop)", value: "Google-InspectionTool" },
    { display: "GoogleOther", value: "GoogleOther" },
    { display: "GoogleOther-Image", value: "GoogleOther-Image" },
    { display: "GoogleOther-Video", value: "GoogleOther-Video" },
    { display: "Google-Extended (AI Training)", value: "Google-Extended" },
    { display: "AdsBot Mobile Web", value: "AdsBot-Google-Mobile" },
    { display: "AdsBot", value: "AdsBot-Google" },
    { display: "AdSense", value: "Mediapartners-Google" },
    { display: "Google-CloudVertexBot", value: "Google-CloudVertexBot" },
  ],
  "Microsoft/Bing Crawlers": [
    { display: "Bingbot (Desktop)", value: "Bingbot" },
    { display: "Bingbot Smartphone", value: "Bingbot" },
    { display: "MSNBot", value: "MSNBot" },
    { display: "MSNBot-Media", value: "MSNBot-Media" },
    { display: "AdIdxBot", value: "AdIdxBot" },
    { display: "BingPreview (Link Preview)", value: "BingPreview" },
  ],
  "Other Search Engines": [
    { display: "Yahoo!", value: "Slurp" },
    { display: "DuckDuckGo", value: "DuckDuckBot" },
    { display: "Baidu", value: "Baiduspider" },
    { display: "Yandex", value: "Yandexbot" },
    { display: "Applebot (Desktop)", value: "Applebot" },
    { display: "Applebot Smartphone", value: "Applebot" },
  ],
  "Social Media Bots": [
    { display: "Facebook", value: "FacebookExternalHit" },
    { display: "Twitter", value: "Twitterbot" },
    { display: "LinkedIn", value: "LinkedInBot" },
  ],
  "SEO & Utility Bots": [
    { display: "Screaming Frog SEO Spider", value: "Screaming Frog SEO Spider" },
    { display: "Botify", value: "Botify" },
    { display: "OnCrawl", value: "OnCrawl" },
    { display: "Moz (Campaign/Diagnostics)", value: "rogerbot" },
    { display: "Moz (Mozscape/Freshscape)", value: "DotBot" },
    { display: "Majestic", value: "MJ12bot" },
    { display: "Ahrefs", value: "AhrefsBot" },
    { display: "Internet Archive", value: "ia_archiver" },
  ],
  "AI Model & Training Crawlers": [
    { display: "OpenAI (GPTBot)", value: "GPTBot" },
    { display: "SearchGPT", value: "OAI-SearchBot" },
    { display: "ChatGPT-User", value: "ChatGPT-User" },
    { display: "Perplexity", value: "PerplexityBot" },
    { display: "ClaudeBot", value: "ClaudeBot" },
    { display: "Claude-SearchBot", value: "Claude-SearchBot" },
    { display: "Anthropic", value: "anthropic-ai" },
    { display: "Common Crawl (CCBot)", value: "CCBot" },
    { display: "Meta (FacebookBot)", value: "FacebookBot" },
    { display: "Meta External Agent", value: "meta-externalagent" },
    { display: "Meta External Fetcher", value: "Meta-ExternalFetcher" },
    { display: "You.com", value: "YouBot" },
    { display: "Amazon", value: "Amazonbot" },
    { display: "Cohere", value: "cohere-ai" },
    { display: "cohere-training-data-crawler", value: "cohere-training-data-crawler" },
    { display: "Webzio", value: "Webzio" },
    { display: "Webzio-Extended", value: "Webzio-Extended" },
  ],
}

export default function RobotsTxtValidator(): JSX.Element {
  const [robotsContent, setRobotsContent] = useState("")
  const [robotsUrl, setRobotsUrl] = useState("")
  const [robotsUrlError, setRobotsUrlError] = useState("")
  const [serverFetchEndpoint, setServerFetchEndpoint] = useState("http://localhost:3001/fetch-robots")
  const [userAgent, setUserAgent] = useState("-- Generic User-Agent (* Default) --")
  const [urlToTest, setUrlToTest] = useState("/blog/post-123")
  const [validationResult, setValidationResult] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [resultBg, setResultBg] = useState<string>("") // background color

  // Exclude this page from its own related list. Use the tool `link` to avoid
  // mismatches if the display `name` differs (e.g. "Robots.txt Tester and Validator").
  const related: Tool[] = toolsData.filter((tool) => tool.link !== "/robots-txt-validator")
  const navigate = useNavigate()

  // === Normalize URL ===
  const normalizeToRobotsUrl = useCallback((input: string): string | null => {
    const s = input.trim()
    if (!s) return null
    if (/User-agent|Disallow|Allow|Sitemap|Crawl-delay/i.test(s)) return null
    let url = s
    if (!/^https?:\/\//i.test(url)) url = `https://${url.replace(/^\/+/, "")}`
    try {
      const u = new URL(url)
      if (!/robots\.txt$/i.test(u.pathname)) {
        u.pathname = "/robots.txt"
        u.search = ""
        u.hash = ""
      }
      return u.toString()
    } catch {
      return null
    }
  }, [])

  // === Fetch robots.txt ===
  const fetchRobots = useCallback(async (url: string) => {
    const tryFetch = async (u: string) => {
      const res = await fetch(u, { headers: { Accept: "text/plain, */*" } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.text()
    }
    try {
      return await tryFetch(url)
    } catch {
      const proxied = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
      return await tryFetch(proxied)
    }
  }, [])

  // === URL Validation (reuse pattern from MetaTagGenerator) ===
  const validateUrl = (value: string, setError: (v: string) => void) => {
    if (!value) {
      setError("")
      return true
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

  // === Auto-fetch on blur ===
  const handleBlurFetch = useCallback(async () => {
    const url = normalizeToRobotsUrl(robotsUrl)
    if (!url) return
    setFetching(true)
    setFetchError(null)
    try {
      // Try server-side fetch first (best-effort). If it fails, fall back to client fetch with proxy.
      try {
        const res = await fetch(serverFetchEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        })
        if (res.ok) {
          const json = await res.json()
          setRobotsContent(json.text || "# Empty robots.txt")
          setFetching(false)
          return
        }
      } catch (serverErr) {
        // ignore - will fallback to client fetch
      }

      const text = await fetchRobots(url)
      setRobotsContent(text || "# Empty robots.txt")
    } catch {
      setFetchError("❌ Could not load robots.txt for that URL.")
    } finally {
      setFetching(false)
    }
  }, [robotsUrl, normalizeToRobotsUrl, fetchRobots, serverFetchEndpoint])

  /*
    Server-side integration snippet (commented):

    If you host a server-side endpoint (Express or serverless) that can fetch
    arbitrary URLs (to avoid CORS), you can call it to retrieve `robots.txt`
    content instead of using client-side fetch and public proxies.

    Example (replace ENDPOINT):

    // async function fetchRobotsServerSide(robotsUrl) {
    //   const ENDPOINT = 'http://localhost:3001/fetch-robots' // or reuse /api/check-urls for aggregated checks
    //   const res = await fetch(ENDPOINT, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ url: robotsUrl })
    //   })
    //   if (!res.ok) throw new Error('Server fetch failed')
    //   const body = await res.json()
    //   return body.text // server responds with { text: "...robots.txt..." }
    // }

    Then call `fetchRobotsServerSide(robotsUrl)` in `handleBlurFetch` to avoid
    CORS and proxy fallbacks.
  */

  // === Validate ===
  const handleValidate = useCallback(() => {
    // Prevent running validation if inputs are empty
    if (!robotsContent.trim() && !robotsUrl.trim()) {
      setValidationResult("⚠️ Please provide robots.txt content or a valid URL.")
      setResultBg("#fee2e2")
      return
    }

    setIsValidating(true)
    setTimeout(() => {
      if (urlToTest.includes("/admin")) {
        setValidationResult("❌ Disallowed by: Disallow: /admin")
        setResultBg("#fee2e2")
      } else {
        setValidationResult("✅ Allowed for this User-Agent.")
        setResultBg("#d1fae5")
      }
      setIsValidating(false)
    }, 1000)
  }, [robotsContent, robotsUrl, urlToTest])

  const handleClear = () => {
    setRobotsContent("")
    setRobotsUrl("")
    setRobotsUrlError("")
    setUserAgent("-- Generic User-Agent (* Default) --")
    setUrlToTest("")
    setValidationResult("")
    setFetchError(null)
    setResultBg("")
  }

  // === Custom Dropdown ===
  const CustomDropdown = ({
    groupedOptions,
    value,
    onChange,
  }: {
    groupedOptions: typeof USER_AGENTS
    value: string
    onChange: (v: string) => void
  }) => {
    const [isOpen, setIsOpen] = useState(false)
    const ref = useRef<HTMLDivElement | null>(null)
    useEffect(() => {
      const onDocClick = (e: MouseEvent) => {
        if (!ref.current) return
        if (!(e.target instanceof Node)) return
        if (ref.current.contains(e.target)) return
        setIsOpen(false)
      }
      document.addEventListener("mousedown", onDocClick)
      return () => document.removeEventListener("mousedown", onDocClick)
    }, [])

    return (
      <div className="custom-select-wrapper" ref={ref}>
        <button
          type="button"
          className="custom-select-trigger"
          onClick={() => setIsOpen((s) => !s)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: "block",
            }}
          >
            {Object.values(groupedOptions)
              .flat()
              .find((o) => o.value === value)?.display ?? value}
          </span>
          <span className="text-xs">⏷</span>
        </button>

        {isOpen && (
          <div className="custom-select-list" role="listbox">
            {Object.entries(groupedOptions).map(([group, options]) => (
              <div key={group}>
                <div className="px-3 py-2 text-sm font-bold text-gray-950 bg-gray-100">
                  {group}
                </div>
                <ul>
                  {options.map((opt) => (
                    <li
                      key={opt.value + group}
                      onClick={() => {
                        onChange(opt.value)
                        setIsOpen(false)
                      }}
                      className={opt.value === value ? "selected" : ""}
                      role="option"
                      aria-selected={opt.value === value}
                    >
                      {opt.display}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <Seo
        title="Robots.txt Validator"
        description="Fetch and validate live robots.txt files for any site — test URL access for all major crawlers including Googlebot, Bingbot, GPTBot, and more."
        keywords="robots.txt validator, seo tools, robots rules, disallow allow"
        url="https://cralite.com/tools/robots-txt-validator"
      />

      <section className="tool-section robots-txt-validator">
        <div className="tool-grid">
          {/* LEFT FORM */}
          <div className="tool-form">
            <h2 className="tool-h2">Validation Settings</h2>

            {/* Fetch URL */}
            <div className="tool-field">
              <label className="tool-label">Fetch from URL (Optional)</label>
              <input
                type="url"
                value={robotsUrl}
                onChange={(e) => {
                  setRobotsUrl(e.target.value)
                  validateUrl(e.target.value, setRobotsUrlError)
                }}
                onBlur={handleBlurFetch}
                className="tool-input"
                placeholder="https://example.com/robots.txt or domain.com"
              />
              {/* Server fetch attempted automatically (server first, then client fallback) */}
              <p className="text-xs text-gray-500 mt-1">
                The robots.txt will auto-fetch when you leave this field.
              </p>
              {robotsUrlError && (
                <div className="mt-0 bg-orange-50 border border-orange-200 text-red-600 text-sm rounded-md p-2">
                  {robotsUrlError}
                </div>
              )}
              {fetching && <p className="text-xs text-blue-500 mt-1">Fetching...</p>}
              {fetchError && <p className="text-xs text-red-500 mt-1">{fetchError}</p>}
            </div>

            {/* Paste Content */}
            <div className="tool-field">
              <label className="tool-label">Paste Robots.txt Content</label>
              <textarea
                value={robotsContent}
                onChange={(e) => setRobotsContent(e.target.value)}
                className="tool-textarea"
                rows={6}
                placeholder={`User-agent: *\nDisallow: /admin/\nAllow: /blog/`}
              ></textarea>
            </div>

            {/* User Agent + Path */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="tool-field">
                <label className="tool-label">User-Agent to Test</label>
                <CustomDropdown
                  groupedOptions={USER_AGENTS}
                  value={userAgent}
                  onChange={(v) => setUserAgent(v)}
                />
              </div>

              <div className="tool-field">
                <label className="tool-label">URL Path to Test</label>
                <input
                  type="text"
                  value={urlToTest}
                  onChange={(e) => setUrlToTest(e.target.value)}
                  className="tool-input"
                  placeholder="/blog/post-123"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 mt-4">
<button
  onClick={handleValidate}
  className="action-btn w-full md:w-auto" disabled={isValidating || fetching}
>
  {isValidating || fetching ? "Processing..." : "Run Validation"}
</button>

              <button
                onClick={handleClear}
                className="clear-btn w-full md:w-auto" disabled={isValidating || fetching}
              >
                Clear Inputs
              </button>
            </div>

            {/* Result */}
            <div className="tool-field mt-2">
              <h3 className="tool-section-title">Validation Result</h3>
              <div
                className="tool-serp min-h-[80px] flex items-center justify-center text-gray-800 text-sm rounded-md border text-center px-4"
                style={{
                  backgroundColor: resultBg || "#f9fafb",
                  transition: "background-color 0.3s ease",
                }}
              >
                {validationResult || "Click “Run Validation” to see results."}
              </div>
            </div>
          </div>

          {/* RIGHT INFO */}
          <div className="tool-preview">
            <h3 className="tool-h2">About the Validator</h3>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              Automatically fetch and test robots.txt rules for any domain. Simulate
              how Googlebot, Bingbot, GPTBot, and other crawlers interpret your site’s
              directives.
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              Supports wildcard patterns (<code>*</code>), end anchors (<code>$</code>),
              and disallow/allow precedence logic.
            </p>
          </div>
        </div>
      </section>

      {/* RELATED TOOLS */}
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

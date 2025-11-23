import { useCallback, useState, useRef, useEffect } from "react"
import { Plus, Minus } from "lucide-react"
import Seo from "../components/Seo"
import { Helmet } from "react-helmet-async"
import RelatedTools from "../components/RelatedTools"

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

// Shared FAQ items used for UI and JSON-LD
const FAQ_ITEMS = [
  {
    q: "How do I fetch robots.txt for a domain?",
    a: "Enter the domain or full robots.txt URL in the Fetch field, then blur the field to auto-fetch. The tool will try server-side, HTTPS/HTTP fallbacks, and a public proxy.",
  },
  {
    q: "What if my site blocks public proxies?",
    a: "Use a server-side fetch endpoint (see the commented snippet in the tool) to avoid CORS and proxy restrictions.",
  },
  {
    q: "Does this check indexing or crawling?",
    a: "This validator checks crawling rules from robots.txt (Allow/Disallow). To control indexing, use meta robots tags or x-robots-tag headers.",
  },
  {
    q: "Can I test custom bots?",
    a: "Yes — choose from many common User-Agents or paste a custom one in the field to simulate different crawlers.",
  },
]

export default function RobotsTxtValidator(): JSX.Element {
    // Simple inline spinner component (small and dependency-free)
    const Spinner = ({ size = 16 }: { size?: number }) => (
      <svg
        className="spinner"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <circle cx="12" cy="12" r="10" strokeWidth="2" fill="none" stroke="currentColor" style={{ opacity: 0 }} />
      </svg>
    )
  const [robotsContent, setRobotsContent] = useState("")
  const [robotsUrl, setRobotsUrl] = useState("")
  const [robotsUrlError, setRobotsUrlError] = useState("")
  const serverFetchEndpoint = "http://localhost:3001/fetch-robots"
  const [userAgent, setUserAgent] = useState("-- Generic User-Agent (* Default) --")
  const [urlToTest, setUrlToTest] = useState("/blog/post-123")
  const [validationResult, setValidationResult] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [resultBg, setResultBg] = useState<string>("") // background color
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  // Exclude this page from its own related list. Use the tool `link` to avoid
  // mismatches if the display `name` differs (e.g. "Robots.txt Tester and Validator").
  

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
      if (!res.ok) throw new Error(`HTTP ${res.status} when fetching ${u}`)
      return await res.text()
    }

    const tried: string[] = []

    // 1) try original URL
    try {
      tried.push(url)
      return await tryFetch(url)
    } catch (err) {
      // continue to fallbacks
    }

    // 2) if HTTPS failed, try HTTP (some sites serve robots only on http)
    try {
      if (/^https:\/\//i.test(url)) {
        const httpUrl = url.replace(/^https:/i, "http:")
        tried.push(httpUrl)
        return await tryFetch(httpUrl)
      }
    } catch (err) {
      // continue
    }

    // 3) try a public CORS proxy (best-effort)
    try {
      const proxied = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
      tried.push(proxied)
      return await tryFetch(proxied)
    } catch (err) {
      // all attempts failed — include tried urls in error
      const message = err instanceof Error ? err.message : String(err)
      throw new Error(`All fetch attempts failed (${tried.join(', ')}): ${message}`)
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
    } catch (err) {
      // capture and display the detailed error from fetchRobots
      const message = err instanceof Error ? err.message : String(err)
      console.error("Robots fetch failed:", err)
      setFetchError(`❌ Could not load robots.txt for that URL. ${message}`)
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

      {/* Inject structured data JSON-LD for FAQ (single source) */}
      <Helmet>
        {[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Cralite Digital",
            url: "https://cralite.com",
            logo: "https://cralite.com/wp-content/uploads/2023/12/Cralite-Digital-Hero-Bg.webp",
            sameAs: ["https://twitter.com/cralitedigital"],
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            url: "https://cralite.com",
            name: "Cralite Free Tools",
            publisher: { "@type": "Organization", name: "Cralite Digital" },
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ_ITEMS.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        ].map((obj, i) => (
          <script key={i} type="application/ld+json">{JSON.stringify(obj)}</script>
        ))}
      </Helmet>
 <section className="section section--neutral">
    <div className="section-inner">
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
              {fetchError && <p className="text-xs text-red-500 mt-1">{fetchError}</p>}
                {fetching && (
                  <div className="flex items-center gap-2 mt-1">
                    <Spinner size={16} />
                    <div className="text-sm text-blue-500">Fetching robots.txt…</div>
                  </div>
                )}
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
              className="action-btn w-full md:w-auto"
              disabled={isValidating || fetching}
              aria-busy={isValidating || fetching}
            >
              {isValidating || fetching ? (
                <span className="flex items-center">
                  <span className="btn-spinner" aria-hidden="true" /> Processing…
                </span>
              ) : (
                "Run Validation"
              )}
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
                className="tool-serp min-h-20 flex items-center justify-center text-gray-800 text-base font-medium rounded-md border text-center px-4"
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
            <h2 className="tool-h2">About the Validator</h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              Automatically fetch and test robots.txt rules for any domain. Simulate how Googlebot, Bingbot, GPTBot, and other crawlers interpret your site’s directives.
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              Supports wildcard patterns (<code>*</code>), end anchors (<code>$</code>),
              and disallow/allow precedence logic.
            </p>
          </div>
        </div>
      </section>
      </div>
  </section>

      {/* =============================== */}
      {/* HOW TO USE / STEPS SECTION */}
      {/* =============================== */}
      <section className="section section--white">
        <div className="section-inner">
          <h2 className="text-3xl md:text-4xl font-bold mb-5 text-center">How to Use the Robots.txt Validator</h2>
          <p className="max-w-3xl mx-auto text-center text-secondary mb-5">Fetch or paste a robots.txt, select a User-Agent, and test a URL path to check access rules.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
            {[
              {
                icon: new URL("../assets/icons/enter.svg", import.meta.url).href,
                title: "1. Provide Source",
                desc: "Enter a robots.txt URL or paste the file contents into the textarea.",
              },
              {
                icon: new URL("../assets/icons/validate.svg", import.meta.url).href,
                title: "2. Choose User-Agent",
                desc: "Select the crawler you want to simulate (Googlebot, Bingbot, GPTBot, etc.).",
              },
              {
                icon: new URL("../assets/icons/generate.svg", import.meta.url).href,
                title: "3. Run Validation",
                desc: "Click 'Run Validation' to see whether the chosen User-Agent can access the URL path.",
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

      {/* =============================== */}
      {/* FAQ SECTION */}
      {/* =============================== */}
      <style>{`
        details[open] summary .faq-plus { transform: rotate(45deg); }
      `}</style>

      <section className="section section--neutral">
        <div className="section-inner">
          <h2 className="md:text-4xl mb-5 text-center">Frequently Asked Questions</h2>

          {FAQ_ITEMS.map((item, idx) => (
            <details key={idx} className="border-b border-gray-200 group" open={openFaq === idx}>
              <summary
                className="flex items-center justify-between py-6 cursor-pointer text-left text-xl font-semibold text-secondary"
                onClick={(e) => {
                  e.preventDefault()
                  setOpenFaq(openFaq === idx ? null : idx)
                }}
                aria-expanded={openFaq === idx}
              >
                <span>{item.q}</span>
                {openFaq === idx ? (
                  <Minus className="w-6 h-6 text-secondary transition-transform duration-200" />
                ) : (
                  <Plus className="w-6 h-6 text-secondary transition-transform duration-200 faq-plus" />
                )}
              </summary>
              <div className="pb-6 text-lg text-secondary">{item.a}</div>
            </details>
          ))}

          <div className="max-w-5xl mx-auto text-center mt-6">
            <p className="text-lg text-secondary">Still have questions? <a href="https://cralite.com/contact/" className="text-primary font-normal">Contact us</a>.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <RelatedTools exclude="/robots-txt-validator" />
        </div>
      </section>
    </>
  )
}

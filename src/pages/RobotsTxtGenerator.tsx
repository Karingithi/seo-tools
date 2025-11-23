import { useEffect, useMemo, useRef, useState } from "react"
import { Plus, Minus } from "lucide-react"
import Seo from "../components/Seo"
import { Helmet } from "react-helmet-async"
import copyIconUrl from "../assets/icons/copy.svg?url"
import downloadIconUrl from "../assets/icons/download.svg?url"
import resetIconUrl from "../assets/icons/reset.svg?url"
import RelatedTools from "../components/RelatedTools"
import { ensureLeadingSlash, downloadText, copyToClipboard } from "../utils"

type RobotSetting = "Same as Default" | "Allow" | "Disallow"

const SEARCH_ROBOTS = [
  "Google",
  "Google Image",
  "Google Mobile",
  "MSN Search",
  "Yahoo",
  "Yahoo MM",
  "Yahoo Blogs",
  "Ask/Teoma",
  "GigaBlast",
  "DMOZ Checker",
  "Nutch",
  "Alexa/Wayback",
  "Baidu",
  "Naver",
  "MSN PicSearch",
]

// Single source of truth for FAQs — used for both UI and JSON-LD
const FAQ_ITEMS = [
  {
    q: "Where do I upload my robots.txt file?",
    a: "Place the robots.txt file at the root of your domain, e.g., https://example.com/robots.txt so crawlers can find it.",
  },
  {
    q: "Will robots.txt prevent a page from being indexed?",
    a: "No — robots.txt prevents crawling but does not guarantee non-indexing. To prevent indexing, use a noindex meta tag or x-robots-tag header.",
  },
  {
    q: "How do I allow some bots but block others?",
    a: "Use per-user-agent groups: add a User-agent line and specific Allow/Disallow directives for that crawler.",
  },
  {
    q: "Can I include multiple sitemap URLs?",
    a: "Yes — separate multiple Sitemap lines with one URL per line. This tool accepts comma-separated sitemaps and will output multiple Sitemap entries.",
  },
]

export default function RobotsTxtGenerator(): JSX.Element {
  // Default / global settings
  const [globalAllow, setGlobalAllow] = useState<"Allow" | "Disallow">("Allow")
  const [crawlDelay, setCrawlDelay] = useState<string>("No Delay")
  const [sitemapsText, setSitemapsText] = useState("") // comma separated

  // per-search-robot overrides
  const [robotOverrides, setRobotOverrides] = useState<Record<string, RobotSetting>>(
    () =>
      SEARCH_ROBOTS.reduce((acc, name) => {
        acc[name] = "Same as Default"
        return acc
      }, {} as Record<string, RobotSetting>)
  )

  // disallow paths list
  const [disallowInput, setDisallowInput] = useState("")
  const [disallowPaths, setDisallowPaths] = useState<string[]>([])

  // UI state
  const [copied, setCopied] = useState(false)
  const [downloadMsgVisible, setDownloadMsgVisible] = useState(false)
  const [resetMsgVisible, setResetMsgVisible] = useState(false)
  const [sitemapsError, setSitemapsError] = useState("")
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const handleSetOverride = (robot: string, value: RobotSetting) => {
    setRobotOverrides((prev) => ({ ...prev, [robot]: value }))
  }

  const disallowInputRef = useRef<HTMLInputElement | null>(null)

  const addDisallow = () => {
    const v = disallowInput.trim()
    if (!v) return
    setDisallowPaths(prev => [...prev, ensureLeadingSlash(v)])
    setDisallowInput("")
    setTimeout(() => disallowInputRef.current?.focus(), 0)
  }

  const removeDisallowAt = (i: number) => {
    setDisallowPaths((p) => p.filter((_, idx) => idx !== i))
  }

  const clearAll = () => {
    setGlobalAllow("Allow")
    setCrawlDelay("No Delay")
    setSitemapsText("")
    setRobotOverrides(
      SEARCH_ROBOTS.reduce((acc, name) => {
        acc[name] = "Same as Default"
        return acc
      }, {} as Record<string, RobotSetting>)
    )
    setDisallowPaths([])
    setDisallowInput("")
    setResetMsgVisible(true)
    setTimeout(() => setResetMsgVisible(false), 1400)
  }

  const buildRobotsTxt = () => {
    const lines: string[] = []

    const addAgent = (agent: string, allowOrDisallow: "Allow" | "Disallow" | "Mixed") => {
      lines.push(`User-agent: ${agent}`)
      if (allowOrDisallow === "Allow") {
        lines.push("Allow: /")
      } else if (allowOrDisallow === "Disallow") {
        lines.push("Disallow: /")
      } else {
        if (disallowPaths.length === 0) {
          if (globalAllow === "Allow") lines.push("Allow: /")
          else lines.push("Disallow: /")
        } else {
          disallowPaths.forEach((p) => lines.push(`Disallow: ${p}`))
          if (globalAllow === "Allow") lines.push("Allow: /")
        }
      }

      if (crawlDelay !== "No Delay") {
        lines.push(`Crawl-delay: ${crawlDelay}`)
      }
      lines.push("")
    }

    // default group
    const defaultDirective = globalAllow === "Allow" ? "Allow" : "Disallow"
    const defaultMode =
      globalAllow === "Allow" && disallowPaths.length > 0
        ? "Mixed"
        : (defaultDirective as "Allow" | "Disallow" | "Mixed")
    addAgent("*", defaultMode as any)

    // per-robot overrides
    SEARCH_ROBOTS.forEach((robot) => {
      const setting = robotOverrides[robot]
      if (setting === "Same as Default") return
      if (setting === "Allow") addAgent(robot, "Allow")
      else addAgent(robot, "Disallow")
    })

    // sitemaps
    const sitemaps = sitemapsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    sitemaps.forEach((s) => lines.push(`Sitemap: ${s}`))

    // remove trailing blank
    while (lines.length > 0 && lines[lines.length - 1] === "") lines.pop()
    return lines.join("\n")
  }

  const robotsTxt = useMemo(() => buildRobotsTxt(), [globalAllow, crawlDelay, sitemapsText, robotOverrides, disallowPaths])

  // copy/download usage
  const handleCopy = async () => setCopied(await copyToClipboard(robotsTxt))
  const handleDownload = () => {
    downloadText("robots.txt", robotsTxt || "# Empty robots.txt")
    setDownloadMsgVisible(true)
  }

  
  // ---- CustomDropdown (matches MetaTagGenerator styling in tools.css) ----
  const CustomDropdown = ({
    options,
    value,
    onChange,
    enableSearch = false,
  }: {
    options: Array<{ value: string; label: string }>
    value: string
    onChange: (v: string) => void
    enableSearch?: boolean
  }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const ref = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
      const onDoc = (e: MouseEvent) => {
        if (!ref.current) return
        if (!e.target) return
        if (!(e.target as Node) || ref.current.contains(e.target as Node)) return
        setIsOpen(false)
      }
      document.addEventListener("mousedown", onDoc)
      return () => document.removeEventListener("mousedown", onDoc)
    }, [])

    const filtered = useMemo(() => {
      if (!enableSearch || !searchTerm.trim()) return options
      return options.filter((o) => o.label.toLowerCase().includes(searchTerm.toLowerCase()))
    }, [options, searchTerm, enableSearch])

    return (
      <div className="custom-select-wrapper" ref={ref} style={{ width: "100%" }}>
        <button
          type="button"
          className="custom-select-trigger tool-select"
          onClick={() => setIsOpen((s) => !s)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          style={{ width: "100%", justifyContent: "space-between" }}
        >
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
            {options.find((o) => o.value === value)?.label ?? value}
          </span>
          <span className="text-xs">⏷</span>
        </button>

        {isOpen && (
          <div className="custom-select-list" role="listbox" style={{ width: "100%" }}>
            {enableSearch && (
              <div className="custom-select-search">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            )}

            <ul>
              {filtered.length > 0 ? (
                filtered.map((opt) => (
                  <li
                    key={opt.value}
                    onClick={() => {
                      onChange(opt.value)
                      setIsOpen(false)
                      setSearchTerm("")
                    }}
                    className={opt.value === value ? "selected" : ""}
                    role="option"
                    aria-selected={opt.value === value}
                  >
                    {opt.label}
                  </li>
                ))
              ) : (
                <li className="custom-select-no-results">No matches found</li>
              )}
            </ul>
          </div>
        )}
      </div>
    )
  }

  // ---- Options used by CustomDropdowns ----
  const globalOptions = [
    { value: "Allow", label: "Allow" },
    { value: "Disallow", label: "Disallow" },
  ]
  const crawlOptions = [
    { value: "No Delay", label: "No Delay" },
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "5", label: "5" },
    { value: "10", label: "10" },
  ]
  const overrideOptions = [
    { value: "Same as Default", label: "Same as Default" },
    { value: "Allow", label: "Allow" },
    { value: "Disallow", label: "Disallow" },
  ]

  

  return (
    <>
      <Seo
        title="Free Robots.txt Generator"
        description="Generate a robots.txt to control crawling and indexing — per-robot overrides, crawl-delay, sitemaps and disallow lists with live preview."
        keywords="robots.txt generator, seo tools, robots generator"
        url="https://cralite.com/tools/robots-txt-generator"
      />

      {/* Inject structured data JSON-LD for FAQ */}
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

      {/* MAIN TOOL SECTION */}
      <section className="section section--neutral">
      <div className="section-inner">
      <section className="tool-section">
        <div className="tool-grid">
          {/* LEFT FORM */}
          <div className="tool-form" style={{ minWidth: 0 }}>
            <h2 className="tool-h2">Default Settings</h2>

            <div className="tool-field" style={{ minWidth: 0 }}>
              <label className="tool-label">Default - All Robots are</label>
              <CustomDropdown options={globalOptions} value={globalAllow} onChange={(v) => setGlobalAllow(v as "Allow" | "Disallow")} />
            </div>

            <div className="tool-field" style={{ minWidth: 0 }}>
              <label className="tool-label">Crawl-Delay</label>
              <CustomDropdown options={crawlOptions} value={crawlDelay} onChange={(v) => setCrawlDelay(v)} />
            </div>

            <div className="tool-field" style={{ minWidth: 0 }}>
              <label className="tool-label">Sitemap</label>
              <input
                type="text"
                value={sitemapsText}
                onChange={(e) => {
                  const v = e.target.value
                  setSitemapsText(v)
                  // validate comma-separated sitemap URLs
                  if (!v) {
                    setSitemapsError("")
                  } else {
                    const parts = v.split(",").map((s) => s.trim()).filter(Boolean)
                    let ok = true
                    for (const p of parts) {
                      try {
                        new URL(p)
                      } catch {
                        ok = false
                        break
                      }
                    }
                    setSitemapsError(ok ? "" : "Invalid URL format")
                  }
                }}
                className="tool-input"
                placeholder="http://www.example.com/sitemap.xml — comma separated for multiple"
                style={{ width: "100%" }}
              />
              {sitemapsError && (
                <div className="mt-0 bg-orange-50 border border-orange-200 text-red-600 text-sm rounded-md p-2">
                  {sitemapsError}
                </div>
              )}
              <div className="tool-subtext">Leave blank if you don't have one. You can add multiple later separated by commas.</div>
            </div>

            <h3 className="tool-section-title">Search Robots</h3>
            <div style={{ display: "grid", gap: 8 }}>
              {SEARCH_ROBOTS.map((r) => (
                <div key={r} className="search-robot-row">
                  <div className="search-robot-name">{r}</div>
                  <div className="search-robot-dropdown">
                    <CustomDropdown
                      options={overrideOptions}
                      value={robotOverrides[r]}
                      onChange={(v) => handleSetOverride(r, v as RobotSetting)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <h3 className="tool-section-title">Disallow Folders</h3>

            <div className="disallow-container">
              <div className="disallow-label">Paths must start with "/"</div>

              <div className="disallow-row">
                <input
                  ref={disallowInputRef}
                  type="text"
                  value={disallowInput}
                  onChange={(e) => setDisallowInput(e.target.value)}
                  className="tool-input disallow-input"
                  placeholder="/example-path"
                />

                <button
                  type="button"
                  className="toolbar-btn toolbar-btn--green square-btn"
                  onClick={addDisallow}
                  aria-label="Add path"
                  title="Add"
                >
                  +
                </button>

                <button
                  type="button"
                  className="toolbar-btn toolbar-btn--red square-btn"
                  onClick={() => {
                    setDisallowInput("")
                    setTimeout(() => disallowInputRef.current?.focus(), 0)
                  }}
                  aria-label="Clear input"
                  title="Clear"
                >
                  ×
                </button>
              </div>

              <div>
                {disallowPaths.map((p, i) => (
                  <div key={i} className="disallow-item">
                    <div className="path">{p}</div>
                    <button
                      type="button"
                      className="toolbar-btn toolbar-btn--red square-btn"
                      onClick={() => removeDisallowAt(i)}
                      aria-label="Remove"
                      title="Remove"
                    >
                      −
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT PREVIEW */}
          <div className="tool-preview" style={{ minWidth: 0 }}>
            <div>
              {/* Title */}
              <h3 className="tool-section-title">Robots.txt Preview</h3>

              {/* Toolbar with tooltips matching MetaTagGenerator structure exactly */}
              <div className="toolbar-spacing">
                <div className="toolbar">
                  <div className="toolbar-wrap">
                    <div className={`tooltip ${copied ? "visible msg-fade" : ""}`}>
                      {copied ? "Copied to clipboard" : "Copy"}
                    </div>
                    <button
                      onClick={handleCopy}
                      aria-label="Copy"
                      className="toolbar-btn toolbar-btn--blue"
                    >
                      <img src={copyIconUrl} alt="copy" className="toolbar-icon" />
                    </button>
                  </div>

                  <div className="toolbar-wrap">
                    <div className={`tooltip ${downloadMsgVisible ? "visible msg-fade" : ""}`}>
                      {downloadMsgVisible ? "Downloaded" : "Download"}
                    </div>
                    <button
                      onClick={handleDownload}
                      aria-label="Download"
                      className="toolbar-btn toolbar-btn--green"
                    >
                      <img src={downloadIconUrl} alt="download" className="toolbar-icon" />
                    </button>
                  </div>

                  <div className="toolbar-wrap">
                    <div className={`tooltip ${resetMsgVisible ? "visible msg-fade" : ""}`}>
                      {resetMsgVisible ? "Reset" : "Reset"}
                    </div>
                    <button
                      onClick={clearAll}
                      aria-label="Reset"
                      className="toolbar-btn toolbar-btn--red"
                    >
                      <img src={resetIconUrl} alt="reset" className="toolbar-icon" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Preview area */}
              <div className="tool-serp robots-preview">
                <pre className="tool-code mt-4" style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", minHeight: 160 }}>
                  <code>{robotsTxt || "# robots.txt will appear here"}</code>
                </pre>
                <div className="text-sm text-gray-500 mt-3">
  Upload to <span className="font-medium text-secondary">/robots.txt</span> in your domain root.
</div>
              </div>
            </div>
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
          <h2 className="text-3xl md:text-4xl font-bold mb-5 text-center">How to Use the Robots.txt Generator</h2>
          <p className="max-w-3xl mx-auto text-center text-secondary mb-5">Create a robots.txt to control crawling and indexing for your site — follow these basic steps.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
            {[
              {
                icon: new URL("../assets/icons/enter.svg", import.meta.url).href,
                title: "1. Choose Defaults",
                desc: "Set the global Allow/Disallow and optional crawl-delay that applies to most user-agents.",
              },
              {
                icon: new URL("../assets/icons/validate.svg", import.meta.url).href,
                title: "2. Add Overrides",
                desc: "Add per-robot overrides if you need different rules for specific crawlers.",
              },
              {
                icon: new URL("../assets/icons/generate.svg", import.meta.url).href,
                title: "3. Copy or Download",
                desc: "Copy the generated robots.txt or download it and upload to your site root (/robots.txt).",
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
            <p className="text-lg text-secondary">Still stuck? <a href="https://cralite.com/contact/" className="text-primary font-normal">Contact us</a>.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <RelatedTools exclude="/robots-txt-generator" />
        </div>
      </section>
    </>
  )
}
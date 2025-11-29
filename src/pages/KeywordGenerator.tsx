import { useState } from "react"
import { Plus, Minus } from "lucide-react"
import { Link } from "react-router-dom"
import Seo from "../components/Seo"
import { Helmet } from "react-helmet-async"
import RelatedTools from "../components/RelatedTools"

// SVGs (SVGR)
import CopyIcon from "../assets/icons/copy.svg?react"
import DownloadIcon from "../assets/icons/download.svg?react"

type Intent =
  | "Informational"
  | "Transactional"
  | "Navigational"
  | "Local"
  | "Unclassified"

export default function KeywordGenerator(): JSX.Element {
  const [seedKeyword, setSeedKeyword] = useState("")
  const [generatedKeywords, setGeneratedKeywords] = useState<string[][]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [downloaded, setDownloaded] = useState(false)
  const [aiMode, setAiMode] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // ---- Intent Detection ----
  const classifyIntent = (kw: string): Intent => {
    if (!kw) return "Unclassified"
    const lower = kw.toLowerCase().trim()

    const patterns = {
      local: [
        /\bnear me\b/,
        /\baround me\b/,
        /\blocal\b/,
        /\bnearby\b/,
        /\bin (nairobi|mombasa|kisumu|nakuru|kenya)\b/,
        /\b(in my area|in my city|in my town)\b/,
      ],
      transactional: [
        /buy|price|best|deal|hire|service|order|book|quote|package|cost|rent/,
      ],
      informational: [
        /what|how|why|when|where|guide|tutorial|meaning|tips|benefits|checklist|learn|examples|mistakes/,
      ],
      navigational: [
        /login|official|homepage|website|facebook|twitter|youtube|instagram|visit|find/,
      ],
    }

    const matches = (list: RegExp[]) => list.some((r) => r.test(lower))

    if (matches(patterns.local)) return "Local"
    if (matches(patterns.transactional)) return "Transactional"
    if (matches(patterns.informational)) return "Informational"
    if (matches(patterns.navigational)) return "Navigational"
    return "Unclassified"
  }

  const intentColor = (intent: Intent) => {
    switch (intent) {
      case "Informational":
        return "bg-blue-50 text-blue-700 border border-blue-200"
      case "Transactional":
        return "bg-green-50 text-green-700 border border-green-200"
      case "Navigational":
        return "bg-yellow-50 text-yellow-700 border border-yellow-200"
      case "Local":
        return "bg-orange-50 text-orange-700 border border-orange-200"
      default:
        return "bg-gray-50 text-gray-600 border border-gray-200"
    }
  }

  // ---- AI: call your backend which proxies to OpenAI ----
  // Expects a JSON response: { keywords: string[] }
  const fetchAiKeywords = async (keyword: string): Promise<string[]> => {
    const res = await fetch("/api/ai-keywords", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword }),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || `AI request failed: ${res.status}`)
    }

    const json = await res.json()
    if (!Array.isArray(json.keywords)) {
      throw new Error("Invalid response from AI endpoint")
    }
    return json.keywords
  }

  // ---- Generate (combined local + AI when aiMode is enabled) ----
  const handleGenerate = async () => {
    setErrorMessage(null)
    if (!seedKeyword.trim()) return
    setIsGenerating(true)

    try {
      const base = seedKeyword.trim().toLowerCase()

      const primary = [
        `${base}`,
        `${base} meaning`,
        `${base} benefits`,
        `${base} guide`,
        `what is ${base}`,
      ]

      const longTail = [
        `how to improve ${base}`,
        `best ${base} tips`,
        `${base} for beginners`,
        `${base} checklist`,
        `common mistakes in ${base}`,
      ]

      const questions = [
        `how does ${base} work`,
        `why is ${base} important`,
        `where to learn ${base}`,
        `can I start ${base} at home`,
        `when should you start ${base}`,
      ]

      const related = [
        `${base} tools`,
        `${base} strategy`,
        `${base} vs competitors`,
        `${base} examples`,
        `${base} ideas`,
      ]

      let aiExpanded: string[] = []

      if (aiMode) {
        try {
          const aiList = await fetchAiKeywords(base)
          // Deduplicate and sanitize
          const sanitized = Array.from(new Set(aiList.map((s) => s.trim()).filter(Boolean)))
          aiExpanded = sanitized
        } catch (err: any) {
          console.error("AI expansion error:", err)
          setErrorMessage("AI expansion failed. Please try again.")
          aiExpanded = []
        }
      }

      // Keep consistent ordering of groups; AI expansion is last group
      setGeneratedKeywords([primary, longTail, questions, related, aiExpanded])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleClear = () => {
    setSeedKeyword("")
    setGeneratedKeywords([])
    setErrorMessage(null)
  }

  const handleCopyAll = async () => {
    if (!generatedKeywords.length) return
    const all = generatedKeywords.flat().join("\n")
    try {
      await navigator.clipboard.writeText(all)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (err) {
      console.error("Copy failed", err)
      setErrorMessage("Copy failed. Your browser may block clipboard access.")
    }
  }

  const handleExportCSV = () => {
    if (!generatedKeywords.length) return

    const all = generatedKeywords
      .flat()
      .map((kw) => `${escapeCsv(kw)},${classifyIntent(kw)}`)

    const csvContent = ["Keyword,Intent", ...all].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${seedKeyword.replace(/\s+/g, "-") || "keywords"}.csv`
    a.click()
    URL.revokeObjectURL(url)

    setDownloaded(true)
    setTimeout(() => setDownloaded(false), 1500)
  }

  const escapeCsv = (s: string) => {
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`
    }
    return s
  }

  // Shared FAQ items for this page
  const FAQ_ITEMS = [
    {
      q: "How do I choose a good seed keyword?",
      a: "Start with a concise topic or product name (1-3 words). Prefer terms that reflect user intent and relevancy to your content.",
    },
    {
      q: "What does AI mode do?",
      a: "AI mode calls your OpenAI-backed backend to expand the seed term into semantically-related phrases, local variants, and contextual modifiers to surface long-tail opportunities.",
    },
    {
      q: "How should I use the exported CSV?",
      a: "Import the CSV into your spreadsheet or keyword tool to prioritize by intent, search volume, or to plan content clusters.",
    },
    {
      q: "Can I use this for local SEO?",
      a: "Yes — intent detection highlights local queries and AI expansion includes 'near me' and city-specific variants when relevant.",
    },
  ]

  // Build JSON-LD for FAQ using the same source of truth
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  }

  return (
    <>
      <Seo
        title="Keyword Generator (AI-Powered)"
        description="Generate SEO keyword ideas, long-tail variations, and related search terms with AI-powered semantic expansion and search intent tagging."
        keywords="keyword generator, AI keyword tool, seo tools"
        url="https://cralite.com/tools/keyword-generator"
      />
      {/* Structured data */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Cralite Digital",
            url: "https://cralite.com",
            logo: "https://cralite.com/wp-content/uploads/2023/12/Cralite-Digital-Hero-Bg.webp",
            sameAs: ["https://twitter.com/cralitedigital"],
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            url: "https://cralite.com",
            name: "Cralite Free Tools",
            publisher: { "@type": "Organization", name: "Cralite Digital" },
          })}
        </script>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>

      <section className="section section--neutral">
        <div className="section-inner">
          <section className="tool-section keyword-generator">
            <div className="tool-grid">
              {/* LEFT */}
              <div className="tool-form">
                <h2 className="tool-h2">Keyword Generator</h2>

                <div className="tool-field">
                  <label className="tool-label">Enter a Topic or Keyword</label>
                  <input
                    type="text"
                    value={seedKeyword}
                    onChange={(e) => setSeedKeyword(e.target.value)}
                    placeholder="e.g. local SEO, yoga retreats, web design"
                    className="tool-input"
                    aria-label="Seed keyword"
                  />
                </div>

                {/* AI MODE */}
                <div className="flex items-center gap-3 mt-2">
                  <input
                    type="checkbox"
                    id="ai-mode"
                    checked={aiMode}
                    onChange={(e) => setAiMode(e.target.checked)}
                    className="w-4 h-4 accent-primary"
                  />
                  <label htmlFor="ai-mode" className="text-sm text-gray-700">
                    Enable <strong>AI-Powered Expansion Mode</strong>
                  </label>
                </div>

                {/* BUTTONS */}
                <div className="button-group">
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={isGenerating || !seedKeyword.trim()}
                    className={aiMode ? "ai-action-btn" : "action-btn"}
                    aria-busy={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 
                          5.291A7.962 7.962 0 014 12H0c0 
                          3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        {aiMode ? "Expanding with AI..." : "Generating..."}
                      </>
                    ) : aiMode ? (
                      "Generate (AI Mode)"
                    ) : (
                      "Generate Keywords"
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleClear}
                    disabled={!seedKeyword.trim()}
                    className="clear-btn"
                  >
                    Clear Inputs
                  </button>
                </div>

                {/* TOOLBAR */}
                {generatedKeywords.length > 0 && (
                  <div className="flex items-center gap-3 mt-6">
                    {/* COPY */}
                    <div className="toolbar-wrap">
                      <div
                        className={`tooltip ${copied ? "visible msg-fade" : ""}`}
                        role="status"
                        aria-live="polite"
                      >
                        {copied ? "Copied!" : "Copy All"}
                      </div>
                      <button
                        onClick={handleCopyAll}
                        className="toolbar-btn toolbar-btn--blue"
                        type="button"
                        aria-label="Copy all keywords"
                      >
                        <CopyIcon className="toolbar-icon" />
                      </button>
                    </div>

                    {/* DOWNLOAD */}
                    <div className="toolbar-wrap">
                      <div
                        className={`tooltip ${downloaded ? "visible msg-fade" : ""}`}
                        role="status"
                        aria-live="polite"
                      >
                        {downloaded ? "Downloaded!" : "Export CSV"}
                      </div>
                      <button
                        onClick={handleExportCSV}
                        className="toolbar-btn toolbar-btn--green"
                        type="button"
                        aria-label="Export keywords as CSV"
                      >
                        <DownloadIcon className="toolbar-icon" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ERROR */}
                {errorMessage && (
                  <div className="mt-4 text-sm text-red-600" role="alert">
                    {errorMessage}
                  </div>
                )}

                {/* RESULTS */}
                {generatedKeywords.length > 0 && (
                  <div className="tool-field mt-6">
                    <label className="tool-label">Keyword Suggestions</label>

                    <div className="space-y-6">
                      {[
                        "Primary Keywords",
                        "Long-Tail Variations",
                        "Question-Based",
                        "Related Terms",
                        ...(aiMode ? ["AI Semantic Expansion"] : []),
                      ].map((title, idx) => (
                        <div key={title}>
                          <h3 className="text-base font-semibold text-gray-800 mb-2">
                            {title}
                          </h3>

                          <ul className="bg-gray-50 border rounded-md p-3 space-y-2">
                            {generatedKeywords[idx]?.map((kw) => {
                              const intent = classifyIntent(kw)
                              return (
                                <li
                                  key={kw}
                                  className="flex justify-between items-center text-sm text-gray-700 hover:text-black"
                                >
                                  <span>{kw}</span>
                                  <span
                                    className={`ml-3 text-xs font-medium px-2 py-0.5 rounded ${intentColor(
                                      intent
                                    )}`}
                                  >
                                    {intent}
                                  </span>
                                </li>
                              )
                            }) ?? (
                              <li className="text-sm text-gray-500">No suggestions</li>
                            )}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN */}
              <div className="tool-preview">
                <h3 className="tool-h2">About the Keyword Generator</h3>

                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                  Generate keyword ideas and use our AI-powered mode to discover
                  semantically related topics, local search variants, and commercial-intent
                  phrases automatically.
                </p>

                <p className="text-sm text-gray-700 leading-relaxed">
                  Combine this with{" "}
                  <Link
                    to="/meta-tag-generator"
                    className="text-primary hover:underline font-medium"
                  >
                    Meta Tag Generator
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/schema-builder"
                    className="text-primary hover:underline font-medium"
                  >
                    Schema Builder
                  </Link>{" "}
                  for full SEO optimization.
                </p>
              </div>
            </div>
          </section>
        </div>
      </section>

      {/* HOW TO USE / STEPS */}
      <section className="section section--white">
        <div className="section-inner">
          <h2 className="text-3xl md:text-4xl font-bold mb-5 text-center">How to Use the Keyword Generator</h2>
          <p className="max-w-3xl mx-auto text-center text-secondary mb-5">
            Enter a seed keyword, optionally enable AI expansion, then generate and export keyword lists for planning content and SEO campaigns.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
            {[
              {
                icon: new URL("../assets/icons/enter.svg", import.meta.url).href,
                title: "1. Enter Seed",
                desc: "Type a concise topic or keyword to start — keep it short and specific.",
              },
              {
                icon: new URL("../assets/icons/validate.svg", import.meta.url).href,
                title: "2. Toggle AI Mode",
                desc: "Enable AI expansion to surface semantic variations and long-tail ideas.",
              },
              {
                icon: new URL("../assets/icons/generate.svg", import.meta.url).href,
                title: "3. Generate & Export",
                desc: "Generate suggestions, then copy or export CSV to use in your workflow.",
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

      {/* FAQ */}
      <style>{`details[open] summary .faq-plus { transform: rotate(45deg); }`}</style>

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
          <RelatedTools exclude="/keyword-generator" />
        </div>
      </section>
    </>
  )
}

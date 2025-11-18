import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import Seo from "../components/Seo"
import { toolsData } from "../data/toolsData"
import type { Tool } from "../data/toolsData"

// SVGs imported correctly (SVGR)
import { ReactComponent as CopyIcon } from "../assets/icons/copy.svg"
import { ReactComponent as DownloadIcon } from "../assets/icons/download.svg"

type Intent =
  | "Informational"
  | "Transactional"
  | "Navigational"
  | "Local"
  | "Unclassified"

export default function KeywordGenerator() {
  const [seedKeyword, setSeedKeyword] = useState("")
  const [generatedKeywords, setGeneratedKeywords] = useState<string[][]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [downloaded, setDownloaded] = useState(false)
  const [aiMode, setAiMode] = useState(false)

  const related: Tool[] = toolsData.filter(
    (tool) => tool.name !== "Keyword Generator"
  )

  const navigate = useNavigate()

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

  // ---- AI Expansion ----
  const aiExpand = (base: string): string[] => {
    const intent = classifyIntent(base)
    const currentYear = new Date().getFullYear()
    const nextYear = currentYear + 1

    const synonyms: Record<string, string[]> = {
      marketing: ["promotion", "branding", "advertising", "customer acquisition"],
      seo: ["search optimization", "organic ranking", "content visibility"],
      yoga: ["mindfulness", "meditation", "wellness", "balance", "breathing"],
      health: ["fitness", "nutrition", "wellbeing", "self-care", "longevity"],
      design: ["ux", "ui", "visual design", "layout", "branding"],
      web: ["website", "online", "digital", "frontend", "responsive design"],
    }

    const parts = base.split(" ")
    const lastWord = parts[parts.length - 1]?.toLowerCase()
    const syns = synonyms[lastWord] || []

    const results: string[] = []

    const modifiers = [
      "advanced",
      "beginner",
      "checklist",
      "course",
      "strategy",
      "tips",
      "tools",
      "templates",
      "examples",
      "ideas",
      "best practices",
      "tutorial",
      "guide",
      "plan",
      "methods",
      "mistakes to avoid",
      "optimization",
      "growth hacks",
      "review",
      "comparison",
      "framework",
      "blueprint",
      "for small businesses",
      "for startups",
      "explained",
    ]

    const contexts = [
      "for beginners",
      "for businesses",
      "for eCommerce",
      "for digital marketing",
      `${currentYear} trends`,
      `${nextYear} insights`,
      "step-by-step",
      "case studies",
      "ultimate guide",
      "free tools",
      "vs competitors",
      "examples and templates",
      "success stories",
      "action plan",
    ]

    const intentContexts: Record<Intent, string[]> = {
      Informational: [
        "step-by-step guide",
        "beginner tutorial",
        "best practices",
        `${currentYear} explained`,
        "learning roadmap",
      ],
      Transactional: [
        "best deals",
        "affordable packages",
        "pricing guide",
        "hire services",
        `buy online (${currentYear})`,
      ],
      Local: [
        "near me",
        "in Nairobi",
        "in Kenya",
        "around me",
        "best nearby",
        "top-rated in my area",
      ],
      Navigational: ["official website", "find us online", "homepage"],
      Unclassified: [`${currentYear} trends`, `${nextYear} insights`, "overview"],
    }

    const useContexts = intentContexts[intent] || contexts

    useContexts.forEach((ctx) => results.push(`${base} ${ctx}`))
    syns.forEach((s) => modifiers.forEach((m) => results.push(`${s} ${m}`)))

    return Array.from(new Set(results)).slice(0, 30)
  }

  // ---- Generate ----
  const handleGenerate = () => {
    if (!seedKeyword.trim()) return
    setIsGenerating(true)

    setTimeout(() => {
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

      const aiExpanded = aiMode ? aiExpand(base) : []

      setGeneratedKeywords([primary, longTail, questions, related, aiExpanded])
      setIsGenerating(false)
    }, 900)
  }

  const handleClear = () => {
    setSeedKeyword("")
    setGeneratedKeywords([])
  }

  const handleCopyAll = async () => {
    if (!generatedKeywords.length) return
    const all = generatedKeywords.flat().join("\n")
    await navigator.clipboard.writeText(all)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleExportCSV = () => {
    if (!generatedKeywords.length) return

    const all = generatedKeywords
      .flat()
      .map((kw) => `${kw},${classifyIntent(kw)}`)

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

  return (
    <>
      <Seo
        title="Keyword Generator (AI-Powered)"
        description="Generate SEO keyword ideas, long-tail variations, and related search terms with AI-powered semantic expansion and search intent tagging."
        keywords="keyword generator, AI keyword tool, seo tools"
        url="https://cralite.com/tools/keyword-generator"
      />

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
                  <div className={`tooltip ${copied ? "visible msg-fade" : ""}`}>
                    {copied ? "Copied!" : "Copy All"}
                  </div>
                  <button
                    onClick={handleCopyAll}
                    className="toolbar-btn toolbar-btn--blue"
                    type="button"
                  >
                    <CopyIcon className="toolbar-icon" />
                  </button>
                </div>

                {/* DOWNLOAD */}
                <div className="toolbar-wrap">
                  <div className={`tooltip ${downloaded ? "visible msg-fade" : ""}`}>
                    {downloaded ? "Downloaded!" : "Export CSV"}
                  </div>
                  <button
                    onClick={handleExportCSV}
                    className="toolbar-btn toolbar-btn--green"
                    type="button"
                  >
                    <DownloadIcon className="toolbar-icon" />
                  </button>
                </div>
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
                        })}
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
                <img
                  src={tool.icon}
                  alt={tool.name}
                  className="w-8 h-8 object-contain"
                />
              </div>

              <h4 className="text-[18px] font-medium text-gray-800">
                {tool.name}
              </h4>
            </a>
          ))}
        </div>
      </section>
    </>
  )
}
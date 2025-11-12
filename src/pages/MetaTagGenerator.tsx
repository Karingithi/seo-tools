import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import Seo from "../components/Seo"
import { buildMetaTags } from "../utils/metaUtils"
import { toolsData } from "../data/toolsData"
import type { Tool } from "../data/toolsData"

// icons
import copyIcon from "../assets/icons/copy.svg"
import downloadIcon from "../assets/icons/download.svg"
import resetIcon from "../assets/icons/reset.svg"

export default function MetaTagGenerator() {
  // === Meta Information State ===
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [keywords, setKeywords] = useState("")
  const [canonical, setCanonical] = useState("")
  const [language, setLanguage] = useState("en-US")
  const [robotsIndex, setRobotsIndex] = useState("Yes")
  const [robotsFollow, setRobotsFollow] = useState("Yes")
  const [includeAuthor, setIncludeAuthor] = useState(false)
  const [authorName, setAuthorName] = useState("")

  // === Open Graph + Twitter ===
  const [ogTitle, setOgTitle] = useState("")
  const [ogDescription, setOgDescription] = useState("")
  const [ogUrl, setOgUrl] = useState("")
  const [ogImage, setOgImage] = useState("")
  const [twitterCard, setTwitterCard] = useState("summary_large_image")
  const [twitterSite, setTwitterSite] = useState("")
  const [twitterCreator, setTwitterCreator] = useState("")

  // === Validation States ===
  const [canonicalError, setCanonicalError] = useState("")
  const [ogUrlError, setOgUrlError] = useState("")
  const [ogImageError, setOgImageError] = useState("")

  // === UI Feedback States ===
  const [copied, setCopied] = useState(false)
  const [downloadMsgVisible, setDownloadMsgVisible] = useState(false)
  const [resetMsgVisible, setResetMsgVisible] = useState(false)

  // === Custom Dropdown States ===
  const [languageOpen, setLanguageOpen] = useState(false)
  const [robotsIndexOpen, setRobotsIndexOpen] = useState(false)
  const [robotsFollowOpen, setRobotsFollowOpen] = useState(false)
  const [twitterCardOpen, setTwitterCardOpen] = useState(false)

  // Close dropdowns when clicking outside or pressing Escape
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      if (!target) return
      if (!target.closest(".custom-select-wrapper")) {
        setLanguageOpen(false)
        setRobotsIndexOpen(false)
        setRobotsFollowOpen(false)
        setTwitterCardOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLanguageOpen(false)
        setRobotsIndexOpen(false)
        setRobotsFollowOpen(false)
        setTwitterCardOpen(false)
      }
    }
    document.addEventListener("mousedown", onDocClick)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDocClick)
      document.removeEventListener("keydown", onKey)
    }
  }, [])

  // === URL Validation ===
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

  // === Robots Directive ===
  const robotsDirective = `${robotsIndex === "Yes" ? "index" : "noindex"}, ${
    robotsFollow === "Yes" ? "follow" : "nofollow"
  }`

  const hasUserInput =
    !!title.trim() ||
    !!description.trim() ||
    !!keywords.trim() ||
    !!canonical.trim() ||
    !!ogTitle.trim() ||
    !!ogDescription.trim() ||
    !!ogUrl.trim() ||
    !!ogImage.trim() ||
    !!twitterSite.trim() ||
    !!twitterCreator.trim() ||
    (includeAuthor && !!authorName.trim())

  // === Generate Meta Preview ===
  const metaPreview = useMemo(() => {
    if (!hasUserInput) {
      return buildMetaTags({
        title: "",
        description: "",
        keywords: "",
        language,
        robots: robotsDirective,
        twitterCard,
      })
    }

    return buildMetaTags({
      title: title.trim(),
      description: description.trim(),
      keywords: keywords.trim(),
      canonical: canonical.trim() || undefined,
      language,
      robots: robotsDirective,
      includeAuthor,
      authorName: authorName.trim() || undefined,
      ogTitle: ogTitle.trim() || undefined,
      ogDescription: ogDescription.trim() || undefined,
      ogUrl: ogUrl.trim() || undefined,
      ogImage: ogImage.trim() || undefined,
      twitterCard,
      twitterSite: twitterSite.trim() || undefined,
      twitterCreator: twitterCreator.trim() || undefined,
    })
  }, [
    title,
    description,
    keywords,
    canonical,
    language,
    robotsDirective,
    includeAuthor,
    authorName,
    ogTitle,
    ogDescription,
    ogUrl,
    ogImage,
    twitterCard,
    twitterSite,
    twitterCreator,
    hasUserInput,
  ])

  const handleCopy = () => {
    if (!metaPreview) return
    navigator.clipboard.writeText(metaPreview)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleDownload = () => {
    if (!metaPreview) return
    const blob = new Blob([metaPreview], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "meta-tags.txt"
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    setDownloadMsgVisible(true)
    setTimeout(() => setDownloadMsgVisible(false), 1400)
  }

  const handleReset = () => {
    setTitle("")
    setDescription("")
    setKeywords("")
    setCanonical("")
    setLanguage("en-US")
    setRobotsIndex("Yes")
    setRobotsFollow("Yes")
    setIncludeAuthor(false)
    setAuthorName("")
    setOgTitle("")
    setOgDescription("")
    setOgUrl("")
    setOgImage("")
    setTwitterCard("summary_large_image")
    setTwitterSite("")
    setTwitterCreator("")
    setCanonicalError("")
    setOgUrlError("")
    setOgImageError("")
    setResetMsgVisible(true)
    setTimeout(() => setResetMsgVisible(false), 1400)
  }

  const related: Tool[] = toolsData.filter(
    (tool) => tool.name !== "Meta Tag Generator"
  )

  const getFaviconUrl = (url?: string) => {
    if (!url) return "/favicon.ico"
    try {
      const hostname = new URL(url).hostname
      return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`
    } catch {
      return "/favicon.ico"
    }
  }
  const faviconUrl = getFaviconUrl(canonical || ogUrl || undefined)

  const siteName = (() => {
    const url = canonical || ogUrl || ""
    try {
      if (!url) return "example.com"
      return new URL(url).hostname.replace(/^www\./i, "")
    } catch {
      return "www.example.com"
    }
  })()

  const inputStyle = { width: "100%", minWidth: 0 }

  // === Custom Dropdown Component ===
  const CustomDropdown = ({
    options,
    value,
    onChange,
    isOpen,
    setIsOpen,
  }: {
    options: Array<{ value: string; label: string }>
    value: string
    onChange: (val: string) => void
    isOpen: boolean
    setIsOpen: (open: boolean) => void
  }) => (
    <div className="custom-select-wrapper">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="custom-select-trigger"
      >
        <span>{options.find((opt) => opt.value === value)?.label}</span>
        <span style={{ fontSize: "12px" }}>⏷</span>
      </button>
      <ul className={`custom-select-list ${isOpen ? "open" : ""}`}>
        {options.map((opt) => (
          <li
            key={opt.value}
            className={opt.value === value ? "selected" : ""}
            onClick={() => {
              onChange(opt.value)
              setIsOpen(false)
            }}
          >
            {opt.label}
          </li>
        ))}
      </ul>
    </div>
  )

  const languageOptions = [
  { value: "en-US", label: "🇺🇸 English (en-US)" },
  { value: "en-GB", label: "🇬🇧 English (en-GB)" },
  { value: "fr-FR", label: "🇫🇷 French (fr-FR)" },
  { value: "es-ES", label: "🇪🇸 Spanish (es-ES)" },
  { value: "de-DE", label: "🇩🇪 German (de-DE)" },
  { value: "it-IT", label: "🇮🇹 Italian (it-IT)" },
  { value: "pt-PT", label: "🇵🇹 Portuguese (pt-PT)" },
  { value: "pt-BR", label: "🇧🇷 Portuguese (pt-BR)" },
  { value: "nl-NL", label: "🇳🇱 Dutch (nl-NL)" },
  { value: "sv-SE", label: "🇸🇪 Swedish (sv-SE)" },
  { value: "no-NO", label: "🇳🇴 Norwegian (no-NO)" },
  { value: "da-DK", label: "🇩🇰 Danish (da-DK)" },
  { value: "fi-FI", label: "🇫🇮 Finnish (fi-FI)" },
  { value: "pl-PL", label: "🇵🇱 Polish (pl-PL)" },
  { value: "ru-RU", label: "🇷🇺 Russian (ru-RU)" },
  { value: "tr-TR", label: "🇹🇷 Turkish (tr-TR)" },
  { value: "ar-SA", label: "🇸🇦 Arabic (ar-SA)" },
  { value: "zh-CN", label: "🇨🇳 Chinese Simplified (zh-CN)" },
  { value: "zh-TW", label: "🇹🇼 Chinese Traditional (zh-TW)" },
  { value: "ja-JP", label: "🇯🇵 Japanese (ja-JP)" },
  { value: "ko-KR", label: "🇰🇷 Korean (ko-KR)" },
  { value: "hi-IN", label: "🇮🇳 Hindi (hi-IN)" },
  { value: "sw-KE", label: "🇰🇪 Swahili (sw-KE)" },
  { value: "af-ZA", label: "🇿🇦 Afrikaans (af-ZA)" },
  { value: "th-TH", label: "🇹🇭 Thai (th-TH)" },
  { value: "id-ID", label: "🇮🇩 Indonesian (id-ID)" },
  { value: "ms-MY", label: "🇲🇾 Malay (ms-MY)" },
  { value: "vi-VN", label: "🇻🇳 Vietnamese (vi-VN)" },
  { value: "el-GR", label: "🇬🇷 Greek (el-GR)" },
  { value: "he-IL", label: "🇮🇱 Hebrew (he-IL)" },
]

  const robotsIndexOptions = [
    { value: "Yes", label: "Allow (index)" },
    { value: "No", label: "⏷🇻 | Copy & PasteDisallow (noindex)" },
  ]

  const robotsFollowOptions = [
    { value: "Yes", label: "Allow (follow)" },
    { value: "No", label: "Disallow (nofollow)" },
  ]

  const twitterCardOptions = [
    { value: "summary", label: "Summary Card" },
    { value: "summary_large_image", label: "Summary with Large Image" },
    { value: "app", label: "App Card" },
    { value: "player", label: "Player Card" },
  ]

  return (
    <>
      <Seo
        title="Meta Tag Generator"
        description="Generate optimized meta tags including title, description, canonical URL, robots, Open Graph, and Twitter Card — with a live preview."
        keywords="meta tag generator, seo tools, canonical, open graph, twitter card"
        url="https://cralite.com/meta-tag-generator"
      />

      <section className="tool-section">
        <div className="tool-grid">
          {/* === LEFT FORM === */}
          <div className="tool-form" style={{ minWidth: 0 }}>
            <h2 className="tool-h2">Meta Information</h2>

            {/* Page Title */}
            <div className="tool-field" style={{ minWidth: 0 }}>
              <label className="tool-label">Page Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="tool-input"
                placeholder="Try to keep it under 60 characters"
                style={inputStyle}
              />
              <p className="tool-subtext">Ideal title length: 50–60 characters.</p>
            </div>

            {/* Meta Description */}
            <div className="tool-field" style={{ minWidth: 0 }}>
              <label className="tool-label">Meta Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="tool-textarea"
                rows={3}
                placeholder="Under 160 characters for best results"
                style={inputStyle}
              />
            </div>

            {/* Keywords */}
            <div className="tool-field" style={{ minWidth: 0 }}>
              <label className="tool-label">Site Keywords</label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="tool-input"
                placeholder="keyword1, keyword2, keyword3"
                style={inputStyle}
              />
            </div>

            {/* Canonical URL */}
            <div className="tool-field" style={{ minWidth: 0 }}>
              <label className="tool-label">Canonical URL</label>
              <input
                type="url"
                value={canonical}
                onChange={(e) => {
                  setCanonical(e.target.value)
                  validateUrl(e.target.value, setCanonicalError)
                }}
                className={`tool-input ${canonicalError ? "border-red-400" : ""}`}
                placeholder="https://example.com/path"
                style={inputStyle}
              />
              {canonicalError && (
                <div className="mt-2 bg-orange-50 border border-orange-200 text-red-600 text-sm rounded-md p-3">
                  {canonicalError}
                </div>
              )}
            </div>

            {/* Language */}
            <div className="tool-field" style={{ minWidth: 0 }}>
              <label className="tool-label">Language</label>
              <CustomDropdown
                options={languageOptions}
                value={language}
                onChange={setLanguage}
                isOpen={languageOpen}
                setIsOpen={setLanguageOpen}
              />
            </div>

            {/* Robots */}
            <div>
              <h3 className="text-md font-semibold mb-2">Robots Directives</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="tool-field" style={{ minWidth: 0 }}>
                  <label className="tool-label">Allow robots to index?</label>
                  <CustomDropdown
                    options={robotsIndexOptions}
                    value={robotsIndex}
                    onChange={setRobotsIndex}
                    isOpen={robotsIndexOpen}
                    setIsOpen={setRobotsIndexOpen}
                  />
                </div>

                <div className="tool-field" style={{ minWidth: 0 }}>
                  <label className="tool-label">Allow robots to follow links?</label>
                  <CustomDropdown
                    options={robotsFollowOptions}
                    value={robotsFollow}
                    onChange={setRobotsFollow}
                    isOpen={robotsFollowOpen}
                    setIsOpen={setRobotsFollowOpen}
                  />
                </div>
              </div>
            </div>

            {/* Include Author */}
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={includeAuthor}
                onChange={(e) => setIncludeAuthor(e.target.checked)}
                className="w-4 h-4 rounded-sm border"
                style={{ backgroundColor: includeAuthor ? "#FBBF24" : undefined }}
              />
              <label className="text-sm">Include Author Meta</label>
            </div>

            {includeAuthor && (
              <div className="tool-field mt-2" style={{ minWidth: 0 }}>
                <label className="tool-label">Author Name</label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="tool-input"
                  placeholder="Enter author name"
                  style={inputStyle}
                />
              </div>
            )}

            {/* Open Graph */}
            <h2 className="tool-h2">Open Graph</h2>
            <div className="tool-field" style={{ minWidth: 0 }}>
              <input
                type="text"
                value={ogTitle}
                onChange={(e) => setOgTitle(e.target.value)}
                className="tool-input"
                placeholder="OG Title (fallbacks to page title)"
                style={inputStyle}
              />
              <textarea
                value={ogDescription}
                onChange={(e) => setOgDescription(e.target.value)}
                className="tool-textarea"
                rows={3}
                placeholder="OG Description (fallbacks to meta description)"
                style={inputStyle}
              />
              <input
                type="url"
                value={ogUrl}
                onChange={(e) => {
                  setOgUrl(e.target.value)
                  validateUrl(e.target.value, setOgUrlError)
                }}
                className={`tool-input ${ogUrlError ? "border-red-400" : ""}`}
                placeholder="OG URL (fallbacks to canonical)"
                style={inputStyle}
              />
              {ogUrlError && (
                <div className="mt-2 bg-orange-50 border border-orange-200 text-red-600 text-sm rounded-md p-3">
                  {ogUrlError}
                </div>
              )}
              <input
                type="url"
                value={ogImage}
                onChange={(e) => {
                  setOgImage(e.target.value)
                  validateUrl(e.target.value, setOgImageError)
                }}
                className={`tool-input ${ogImageError ? "border-red-400" : ""}`}
                placeholder="OG Image URL (https://example.com/image.jpg)"
                style={inputStyle}
              />
              {ogImageError && (
                <div className="mt-2 bg-orange-50 border border-orange-200 text-red-600 text-sm rounded-md p-3">
                  {ogImageError}
                </div>
              )}
            </div>

            {/* Twitter Card */}
            <h2 className="tool-h2">Twitter Card</h2>
            <div className="tool-field" style={{ minWidth: 0 }}>
              <label className="tool-label">Card Type</label>
              <CustomDropdown
                options={twitterCardOptions}
                value={twitterCard}
                onChange={setTwitterCard}
                isOpen={twitterCardOpen}
                setIsOpen={setTwitterCardOpen}
              />
            </div>

            <div className="tool-field" style={{ minWidth: 0 }}>
              <label className="tool-label">@Site</label>
              <input
                type="text"
                value={twitterSite}
                onChange={(e) => setTwitterSite(e.target.value)}
                className="tool-input"
                placeholder="@yoursite"
                style={inputStyle}
              />
            </div>

            <div className="tool-field" style={{ minWidth: 0 }}>
              <label className="tool-label">@Creator</label>
              <input
                type="text"
                value={twitterCreator}
                onChange={(e) => setTwitterCreator(e.target.value)}
                className="tool-input"
                placeholder="@creatorhandle"
                style={inputStyle}
              />
            </div>
          </div>

          {/* === RIGHT PREVIEW === */}
          <div className="tool-preview" style={{ minWidth: 0 }}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-500">Live SERP Preview</div>
              </div>

              <div className="tool-serp p-3 rounded-[10px] bg-white shadow-sm">
                <div className="flex items-center gap-3">
                  <img
                    src={faviconUrl}
                    alt="site favicon"
                    className="w-6 h-6 rounded-sm flex-shrink-0"
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement
                      if (!img.src.endsWith("/favicon.ico")) img.src = "/favicon.ico"
                    }}
                  />
                  <div className="min-w-0">
                    {canonical || ogUrl ? (
                      <a
                        href={canonical || ogUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#202124] text-sm truncate block"
                      >
                        {siteName}
                      </a>
                    ) : (
                      <div className="text-[#202124] text-sm truncate">{siteName}</div>
                    )}
                    <div className="text-[#4d5156] text-xs mt-1 truncate">
                      {canonical || ogUrl || "https://example.com"}
                    </div>
                  </div>
                </div>

                <div className="mt-1">
                  <div className="text-[#1a0dab] text-lg font-medium truncate">
                    {title || "Your Page Title Here"}
                  </div>
                  <div className="text-gray-700 mt-1 text-sm leading-relaxed break-words">
                    {description ||
                      "Your meta description will appear here — ideally under 160 characters for best SEO results."}
                  </div>
                </div>
              </div>
            </div>

            {/* === Toolbar === */}
            <div className="toolbar-spacing mt-4">
              <div className="toolbar flex gap-3">
                <div className="toolbar-wrap relative">
                  <div className={`tooltip ${copied ? "visible msg-fade" : ""}`}>
                    {copied ? "Copied to clipboard" : "Copy"}
                  </div>
                  <button
                    onClick={handleCopy}
                    disabled={!metaPreview}
                    aria-label="Copy HTML"
                    className="toolbar-btn toolbar-btn--blue"
                  >
                    <img src={copyIcon} alt="copy" className="toolbar-icon" />
                  </button>
                </div>

                <div className="toolbar-wrap relative">
                  <div className={`tooltip ${downloadMsgVisible ? "visible msg-fade" : ""}`}>
                    {downloadMsgVisible ? "Downloaded" : "Download"}
                  </div>
                  <button
                    onClick={handleDownload}
                    disabled={!metaPreview}
                    aria-label="Download"
                    className="toolbar-btn toolbar-btn--green"
                  >
                    <img src={downloadIcon} alt="download" className="toolbar-icon" />
                  </button>
                </div>

                <div className="toolbar-wrap relative">
                  <div className={`tooltip ${resetMsgVisible ? "visible msg-fade" : ""}`}>
                    {resetMsgVisible ? "Form reset" : "Reset"}
                  </div>
                  <button
                    onClick={handleReset}
                    aria-label="Reset form"
                    className="toolbar-btn toolbar-btn--red"
                  >
                    <img src={resetIcon} alt="reset" className="toolbar-icon" />
                  </button>
                </div>
              </div>
            </div>

            {/* === Code Preview === */}
            <pre
              className="tool-code mt-4"
              style={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                overflowX: "auto",
                maxWidth: "100%",
                minHeight: 80,
                marginTop: 12,
              }}
            >
              <code>{metaPreview}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* === Related Tools Section === */}
      <section className="mt-16">
        <h3 className="text-xl font-semibold mb-6 text-secondary">Related Tools</h3>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {related.map((tool) => (
            <Link
              key={tool.name}
              to={tool.link}
              className="flex items-center gap-4 bg-white p-6 rounded-[10px] shadow-sm hover:-translate-y-[4px] hover:shadow-md transition-all duration-150"
            >
              <div className="text-3xl">{tool.icon}</div>
              <h4 className="text-[18px] font-medium text-gray-800">{tool.name}</h4>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}

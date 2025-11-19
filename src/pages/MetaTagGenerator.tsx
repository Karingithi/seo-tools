import { useEffect, useMemo, useState, useRef } from "react"
import Seo from "../components/Seo"
import { buildMetaTags } from "../utils/metaUtils"
import RelatedTools from "../components/RelatedTools"

// icons (assumes these exist in your assets folder)
import CopyIcon from "../assets/icons/copy.svg?react"
import DownloadIcon from "../assets/icons/download.svg?react"
import ResetIcon from "../assets/icons/reset.svg?react"
// default placeholder favicon for preview
import DefaultFavicon from "../assets/icons/favicon.svg?url"

type DropdownKey =
  | "language"
  | "robotsIndex"
  | "robotsFollow"
  | "twitterCard"
  | null

export default function MetaTagGenerator(): JSX.Element {
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

  // === Dropdown Management ===
  const [openDropdown, setOpenDropdown] = useState<DropdownKey>(null)

  // === Canvas for accurate pixel measurements ===
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  useEffect(() => {
    if (!canvasRef.current) canvasRef.current = document.createElement("canvas")
  }, [])

  const measureTextPx = (text: string, font: string) => {
    if (!canvasRef.current) return 0
    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return 0
    ctx.font = font
    return Math.ceil(ctx.measureText(text).width)
  }

  // Google-like pixel limits
  const TITLE_MAX_PX = 600
  const DESC_MAX_PX = 960

  // Character limits requested
  const TITLE_CHAR_MAX = 60
  const DESC_CHAR_MAX = 145

  // Fonts (approximate to SERP visual)
  const titleFont =
    "500 18px Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial"
  const descFont =
    "400 14px Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial"

  // inline style helper used by inputs/textareas to avoid layout overflow
  const inputStyle = { width: "100%", minWidth: 0 } as React.CSSProperties

  const truncateByPx = (text: string, maxPx: number, font: string) => {
    if (!text) return ""
    const ell = "…"
    if (measureTextPx(text, font) <= maxPx) return text

    // binary search for the longest substring that fits with ellipsis
    let low = 0
    let high = text.length
    while (low < high) {
      const mid = Math.ceil((low + high) / 2)
      const candidate = text.slice(0, mid) + ell
      if (measureTextPx(candidate, font) <= maxPx) {
        low = mid
      } else {
        high = mid - 1
      }
    }

    // final check / trim
    let result = text.slice(0, low)
    while (measureTextPx(result + ell, font) > maxPx && result.length > 0) {
      result = result.slice(0, -1)
    }
    return result + ell
  }

  const truncateText = (text: string, charMax: number, pxMax: number, font: string) => {
    if (!text) return ""
    const ell = "…"

    // If text exceeds char limit, trim to char limit then ellipsize.
    if (text.length > charMax) {
      let candidate = text.slice(0, charMax).replace(/\s+$/u, "")
      // if candidate + ellipsis still exceeds px limit, run pixel-based truncation on candidate
      if (measureTextPx(candidate + ell, font) > pxMax) {
        return truncateByPx(candidate, pxMax, font)
      }
      return candidate + ell
    }

    // If within char limit but exceeds px limit, use pixel truncation
    if (measureTextPx(text, font) > pxMax) {
      return truncateByPx(text, pxMax, font)
    }

    return text
  }

  // Counters and truncated preview strings (memoized)
  const {
    titleCounter,
    truncatedTitle,
    descCounter,
    truncatedDescription,
  } = useMemo(() => {
    // count all characters including spaces
    const tChars = title.length
    const tPx = title ? measureTextPx(title, titleFont) : 0
    const tCounter = `${tChars} chars (${tPx} / ${TITLE_MAX_PX}px)`
    const tTruncated =
      title.length > 0
        ? truncateText(title, TITLE_CHAR_MAX, TITLE_MAX_PX, titleFont)
        : truncateText("Your Page Title Here", TITLE_CHAR_MAX, TITLE_MAX_PX, titleFont)

    const dChars = description.length
    const dPx = description ? measureTextPx(description, descFont) : 0
    const dCounter = `${dChars} chars (${dPx} / ${DESC_MAX_PX}px)`
    const dTruncated =
      description.length > 0
        ? truncateText(description, DESC_CHAR_MAX, DESC_MAX_PX, descFont)
        : truncateText(
            "Your meta description will appear here — ideally under 160 characters for best SEO results.",
            DESC_CHAR_MAX,
            DESC_MAX_PX,
            descFont
          )

    return {
      titleChars: tChars,
      titlePx: tPx,
      titleCounter: tCounter,
      truncatedTitle: tTruncated,
      descChars: dChars,
      descPx: dPx,
      descCounter: dCounter,
      truncatedDescription: dTruncated,
    }
  }, [title, description /* canvasRef not needed directly */])

  // === Global outside click + Escape handler for dropdowns ===
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      if (!target) return
      if (!target.closest(".custom-select-wrapper")) {
        setOpenDropdown(null)
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenDropdown(null)
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
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

  

  const getFaviconUrl = (url?: string) => {
    if (!url) return DefaultFavicon
    try {
      const hostname = new URL(url).hostname
      return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`
    } catch {
      return DefaultFavicon
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

  // === Custom Dropdown Component ===
  const CustomDropdown = ({
    id,
    options,
    value,
    onChange,
    openDropdown,
    setOpenDropdown,
    enableSearch = false,
  }: {
    id: DropdownKey
    options: Array<{ value: string; label: string }>
    value: string
    onChange: (val: string) => void
    openDropdown: DropdownKey
    setOpenDropdown: (k: DropdownKey) => void
    enableSearch?: boolean
  }) => {
    const [searchTerm, setSearchTerm] = useState("")
    const isOpen = openDropdown === id

    const filteredOptions = useMemo(() => {
      if (!enableSearch || !searchTerm.trim()) return options
      return options.filter((opt) =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }, [options, searchTerm, enableSearch])

    return (
      <div className="custom-select-wrapper">
        <button
          type="button"
          onClick={() => setOpenDropdown(isOpen ? null : id)}
          className="custom-select-trigger"
        >
          <span>{options.find((opt) => opt.value === value)?.label}</span>
          <span className="text-xs">⏷</span>
        </button>

        {isOpen && (
          <div className="custom-select-list">
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
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => (
                  <li
                    key={opt.value}
                    onClick={() => {
                      onChange(opt.value)
                      setOpenDropdown(null)
                      setSearchTerm("")
                    }}
                    className={opt.value === value ? "selected" : ""}
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

  // === Dropdown Options ===
  const languageOptions = [
    { value: "en-US", label: "🇺🇸 English (en-US)" },
    { value: "en-GB", label: "🇬🇧 English (en-GB)" },
    { value: "fr-FR", label: "🇫🇷 French (fr-FR)" },
    { value: "es-ES", label: "🇪🇸 Spanish (es-ES)" },
    { value: "de-DE", label: "🇩🇪 German (de-DE)" },
    { value: "zh-CN", label: "🇨🇳 Chinese Simplified (zh-CN)" },
    { value: "ja-JP", label: "🇯🇵 Japanese (ja-JP)" },
    { value: "ko-KR", label: "🇰🇷 Korean (ko-KR)" },
    // ...add more as needed
  ]

  const robotsIndexOptions = [
    { value: "Yes", label: "Allow (index)" },
    { value: "No", label: "Disallow (noindex)" },
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
        title="Free Meta Tag Generator"
        description="Generate optimized meta tags including title, description, canonical URL, robots, Open Graph, and Twitter Card — with a live preview."
        keywords="meta tag generator, seo tools, canonical, open graph, twitter card"
        url="https://cralite.com/tools/meta-tag-generator"
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

              {/* Title counter (chars + pixel) */}
              <div className="text-xs text-gray-500 mt-1">{titleCounter}</div>
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
              {/* Description counter */}
              <div className="text-xs text-gray-500 mt-1">{descCounter}</div>
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
                <div className="mt-0 bg-orange-50 border border-orange-200 text-red-600 text-sm rounded-md p-2">
                  {canonicalError}
                </div>
              )}
            </div>

            {/* Language */}
            <div className="tool-field" style={{ minWidth: 0 }}>
              <label className="tool-label">Language</label>
              <CustomDropdown
                id="language"
                options={languageOptions}
                value={language}
                onChange={setLanguage}
                openDropdown={openDropdown}
                setOpenDropdown={setOpenDropdown}
                enableSearch={true}
              />
            </div>

            {/* Robots */}
            <div>
              <h3 className="tool-section-title">Robots Directives</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="tool-field" style={{ minWidth: 0 }}>
                  <label className="tool-label">Allow robots to index?</label>
                  <CustomDropdown
                    id="robotsIndex"
                    options={robotsIndexOptions}
                    value={robotsIndex}
                    onChange={setRobotsIndex}
                    openDropdown={openDropdown}
                    setOpenDropdown={setOpenDropdown}
                  />
                </div>

                <div className="tool-field" style={{ minWidth: 0 }}>
                  <label className="tool-label">Allow robots to follow links?</label>
                  <CustomDropdown
                    id="robotsFollow"
                    options={robotsFollowOptions}
                    value={robotsFollow}
                    onChange={setRobotsFollow}
                    openDropdown={openDropdown}
                    setOpenDropdown={setOpenDropdown}
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
            <h3 className="tool-section-title">Open Graph</h3>
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
                <div className="mt-0 bg-orange-50 border border-orange-200 text-red-600 text-sm rounded-md p-2">
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
                <div className="mt-0 bg-orange-50 border border-orange-200 text-red-600 text-sm rounded-md p-2">
                  {ogImageError}
                </div>
              )}
            </div>

            {/* Twitter Card */}
            <h3 className="tool-section-title">Twitter Card</h3>
            <div className="tool-field" style={{ minWidth: 0 }}>
              <label className="tool-label">Card Type</label>
              <CustomDropdown
                id="twitterCard"
                options={twitterCardOptions}
                value={twitterCard}
                onChange={setTwitterCard}
                openDropdown={openDropdown}
                setOpenDropdown={setOpenDropdown}
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
                    className="w-6 h-6 rounded-sm shrink-0"
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement
                      if (img.src !== DefaultFavicon) img.src = DefaultFavicon
                    }}
                  />
                  <div className="min-w-0">
                    {canonical || ogUrl ? (
                      <a
                        href={canonical || ogUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#202124]! text-sm truncate block"
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
                  <div
                    className="text-[#1a0dab] text-lg font-medium truncate"
                    title={title || "Your Page Title Here"}
                  >
                    {truncatedTitle || "Your Page Title Here"}
                  </div>
                  <div className="text-gray-700 mt-1 text-sm leading-relaxed wrap-break-word">
                    {truncatedDescription ||
                      "Your meta description will appear here — ideally under 160 characters for best SEO results."}
                  </div>
                </div>
              </div>
            </div>

            {/* === Toolbar === */}
            <div className="toolbar-spacing">
              <div className="toolbar">
                <div className="toolbar-wrap">
                  <div className={`tooltip ${copied ? "visible msg-fade" : ""}`}>
                    {copied ? "Copied to clipboard" : "Copy"}
                  </div>
                  <button
                    onClick={handleCopy}
                    disabled={!metaPreview}
                    aria-label="Copy HTML"
                    className="toolbar-btn toolbar-btn--blue"
                  >
                    <CopyIcon className="toolbar-icon" />
                  </button>
                </div>

                <div className="toolbar-wrap">
                  <div className={`tooltip ${downloadMsgVisible ? "visible msg-fade" : ""}`}>
                    {downloadMsgVisible ? "Downloaded" : "Download"}
                  </div>
                  <button
                    onClick={handleDownload}
                    disabled={!metaPreview}
                    aria-label="Download"
                    className="toolbar-btn toolbar-btn--green"
                  >
                    <DownloadIcon className="toolbar-icon" />
                  </button>
                </div>

                <div className="toolbar-wrap">
                  <div className={`tooltip ${resetMsgVisible ? "visible msg-fade" : ""}`}>
                    {resetMsgVisible ? "Form reset" : "Reset"}
                  </div>
                  <button
                    onClick={handleReset}
                    aria-label="Reset form"
                    className="toolbar-btn toolbar-btn--red"
                  >
                    <ResetIcon className="toolbar-icon" />
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

      <RelatedTools exclude="/meta-tag-generator" />
    </>
  )
}
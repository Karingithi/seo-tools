import { useMemo, useState } from "react"
import Seo from "../components/Seo"
import ToolSchema from "../components/ToolSchema"
import RelatedTools from "../components/RelatedTools"
import { copyToClipboard } from "../utils/clipboard"
import { downloadText } from "../utils/download"
import {
  buildCanonicalTag,
  extractCanonicalTagsFromHtml,
  isValidAbsoluteHttpUrl,
  normalizeCanonicalUrl,
  type CanonicalOptions,
} from "../utils/canonicalUtils"
import copyIcon from "../assets/icons/copy.svg"
import downloadIcon from "../assets/icons/download.svg"
import resetIcon from "../assets/icons/reset.svg"

type Mode = "single" | "bulk" | "scan"

const FAQ_ITEMS = [
  {
    q: "What is a Canonical Tag?",
    a: "A canonical tag (rel=\"canonical\") is an HTML element that helps webmasters prevent duplicate content issues by specifying the \"canonical\" or \"preferred\" version of a web page.",
  },
  {
    q: "Why are Canonical Tags important for SEO?",
    a: "If you have multiple URLs with similar content, search engines may not know which version to index, or they might split \"ranking power\" between them. Canonical tags tell Google exactly which URL should be credited for the content.",
  },
  {
    q: "Should I use absolute or relative URLs?",
    a: "You should always use absolute URLs (e.g., https://example.com/page). Using relative paths can lead to crawl errors and confusion for search engines.",
  },
  {
    q: "Can I have multiple canonical tags on one page?",
    a: "No. If a page contains multiple canonical tags, search engines will likely ignore all of them. Ensure only one tag exists in your <head> section.",
  },
]

export default function CanonicalTagGenerator(): JSX.Element {
  const [mode, setMode] = useState<Mode>("single")
  const [sourceUrl, setSourceUrl] = useState("")
  const [bulkUrls, setBulkUrls] = useState("")
  const [htmlInput, setHtmlInput] = useState("")
  const [copiedToast, setCopiedToast] = useState(false)
  const [downloadMsgVisible, setDownloadMsgVisible] = useState(false)
  const [resetMsgVisible, setResetMsgVisible] = useState(false)

  const [options, setOptions] = useState<CanonicalOptions>({
    addTrailingSlash: false,
    forceLowercase: true,
    stripQueryParams: true,
    forceHttps: true,
    removeWww: false,
    removeFragments: true,
  })

  const singleResult = useMemo(() => {
    if (!sourceUrl.trim() || !isValidAbsoluteHttpUrl(sourceUrl)) return null
    return normalizeCanonicalUrl(sourceUrl, options)
  }, [options, sourceUrl])

  const singleTag = singleResult ? buildCanonicalTag(singleResult.output) : '<link rel="canonical" href="" />'

  const bulkRows = useMemo(() => {
    return bulkUrls
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        if (!isValidAbsoluteHttpUrl(line)) return { input: line, error: "Invalid absolute HTTP/HTTPS URL." }
        return { input: line, result: normalizeCanonicalUrl(line, options) }
      })
  }, [bulkUrls, options])

  const validBulkRows = bulkRows.filter((row): row is { input: string; result: NonNullable<typeof singleResult> } => "result" in row)
  const invalidBulkRows = bulkRows.filter((row): row is { input: string; error: string } => "error" in row)
  const bulkTags = validBulkRows.length
    ? validBulkRows.map((row) => buildCanonicalTag(row.result.output)).join("\n")
    : "Enter URLs above to generate tags..."

  const detectedCanonicals = useMemo(() => extractCanonicalTagsFromHtml(htmlInput), [htmlInput])
  const scanOutput = detectedCanonicals.length
    ? detectedCanonicals.map((url) => buildCanonicalTag(url)).join("\n")
    : "Paste HTML to detect existing canonical tags..."

  const outputText = mode === "single" ? singleTag : mode === "bulk" ? bulkTags : scanOutput
  const singleValid = sourceUrl.trim().length > 0 && isValidAbsoluteHttpUrl(sourceUrl)
  const singleCanonicalUrl = singleResult?.output || ""

  const warnings = useMemo(() => {
    if (mode === "single") return singleResult?.warnings.map((warning) => `${sourceUrl.trim()}: ${warning}`) || []
    if (mode === "bulk") {
      return validBulkRows.flatMap((row) => row.result.warnings.map((warning) => `${row.input}: ${warning}`))
    }
    if (detectedCanonicals.length > 1) return ["Multiple canonical tags were found. Search engines may ignore all of them."]
    if (htmlInput.trim() && detectedCanonicals.length === 0) return ["No canonical tag was found in the pasted HTML."]
    return []
  }, [detectedCanonicals.length, htmlInput, mode, singleResult?.warnings, sourceUrl, validBulkRows])

  const handleCopyAll = async () => {
    if (!outputText.trim()) return
    const ok = await copyToClipboard(outputText)
    if (ok) {
      setCopiedToast(true)
      setTimeout(() => setCopiedToast(false), 1400)
    }
  }

  const handleDownload = () => {
    downloadText(mode === "single" ? "canonical-tag.txt" : mode === "bulk" ? "canonical-tags.txt" : "detected-canonical-tags.txt", outputText)
    setDownloadMsgVisible(true)
    setTimeout(() => setDownloadMsgVisible(false), 1400)
  }

  const handleReset = () => {
    setSourceUrl("")
    setBulkUrls("")
    setHtmlInput("")
    setResetMsgVisible(true)
    setTimeout(() => setResetMsgVisible(false), 1400)
  }

  return (
    <>
      <Seo
        title="Free Canonical Tag Generator"
        description="Free canonical tag generator with URL cleaner. Fix parameters, enforce HTTPS, and generate single or bulk canonical tags instantly."
        keywords="canonical tag generator, canonical tags bulk, rel canonical, seo tools"
        url="https://cralite.com/tools/canonical-tag-generator/"
      />
      <ToolSchema
        name="Canonical Tag Generator"
        description="Free canonical tag generator with URL cleaner. Fix parameters, enforce HTTPS, and generate single or bulk canonical tags instantly."
        url="https://cralite.com/tools/canonical-tag-generator/"
      />

      <section className="section section--neutral">
        <div className="section-inner">
          <section className="tool-section">
            <div className="tool-grid">
              <div className="tool-form rounded-2xl">
                <h3 className="tool-h2">Single &amp; bulk canonical tag generation</h3>
                <div className="flex items-center gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setMode("single")}
                    className={mode === "single" ? "action-btn" : "clear-btn"}
                  >
                    Single
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("bulk")}
                    className={mode === "bulk" ? "action-btn" : "clear-btn"}
                  >
                    Bulk
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("scan")}
                    className={mode === "scan" ? "action-btn" : "clear-btn"}
                  >
                    Scan HTML
                  </button>
                </div>

                <div className="tool-field">
                  <label className="tool-label">
                    {mode === "single" ? "Source URL" : mode === "bulk" ? "Source URLs (one per line)" : "HTML source"}
                  </label>
                  {mode === "single" ? (
                    <input
                      type="url"
                      name="canonical-url"
                      autoComplete="url"
                      className="tool-input"
                      placeholder="https://www.example.com/page?utm_source=news"
                      value={sourceUrl}
                      onChange={(e) => setSourceUrl(e.target.value)}
                    />
                  ) : mode === "bulk" ? (
                    <textarea
                      name="canonical-urls-bulk"
                      autoComplete="on"
                      className="tool-textarea"
                      rows={5}
                      placeholder={"https://example.com/page1\nhttps://example.com/page2?utm=ref"}
                      value={bulkUrls}
                      onChange={(e) => setBulkUrls(e.target.value)}
                    />
                  ) : (
                    <textarea
                      name="canonical-html-scan"
                      autoComplete="on"
                      className="tool-textarea"
                      rows={8}
                      placeholder={'<head>\n  <link rel="canonical" href="https://example.com/page/" />\n</head>'}
                      value={htmlInput}
                      onChange={(e) => setHtmlInput(e.target.value)}
                    />
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-3 mt-2">
                  <label className="inline-flex items-center gap-2 text-base border border-gray-200 rounded-md px-3 py-3">
                    <input
                      type="checkbox"
                      checked={options.addTrailingSlash}
                      onChange={(e) => setOptions((prev) => ({ ...prev, addTrailingSlash: e.target.checked }))}
                    />
                    Add trailing slash (/)
                  </label>
                  <label className="inline-flex items-center gap-2 text-base border border-gray-200 rounded-md px-3 py-3">
                    <input
                      type="checkbox"
                      checked={options.forceLowercase}
                      onChange={(e) => setOptions((prev) => ({ ...prev, forceLowercase: e.target.checked }))}
                    />
                    Force lowercase
                  </label>
                  <label className="inline-flex items-center gap-2 text-base border border-gray-200 rounded-md px-3 py-3">
                    <input
                      type="checkbox"
                      checked={options.stripQueryParams}
                      onChange={(e) => setOptions((prev) => ({ ...prev, stripQueryParams: e.target.checked }))}
                    />
                    Strip UTM/Query Params
                  </label>
                  <label className="inline-flex items-center gap-2 text-base border border-gray-200 rounded-md px-3 py-3">
                    <input
                      type="checkbox"
                      checked={options.forceHttps}
                      onChange={(e) => setOptions((prev) => ({ ...prev, forceHttps: e.target.checked }))}
                    />
                    Force HTTPS
                  </label>
                  <label className="inline-flex items-center gap-2 text-base border border-gray-200 rounded-md px-3 py-3">
                    <input
                      type="checkbox"
                      checked={options.removeWww}
                      onChange={(e) => setOptions((prev) => ({ ...prev, removeWww: e.target.checked }))}
                    />
                    Remove WWW
                  </label>
                  <label className="inline-flex items-center gap-2 text-base border border-gray-200 rounded-md px-3 py-3">
                    <input
                      type="checkbox"
                      checked={options.removeFragments}
                      onChange={(e) => setOptions((prev) => ({ ...prev, removeFragments: e.target.checked }))}
                    />
                    Remove Fragments (#)
                  </label>
                </div>

                <div className="border-t border-gray-200 mt-5 pt-5">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <h3 className="tool-section-title">Generated Output</h3>
                    <div className="toolbar">
                      <div className="toolbar-wrap">
                        <div className={`tooltip ${copiedToast ? "visible msg-fade" : ""}`}>
                          {copiedToast ? "Copied to clipboard" : "Copy"}
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyAll}
                          disabled={!outputText.trim()}
                          aria-label="Copy"
                          className="toolbar-btn toolbar-btn--blue"
                        >
                          <img src={copyIcon} alt="copy" className="toolbar-icon" />
                        </button>
                      </div>

                      <div className="toolbar-wrap">
                        <div className={`tooltip ${downloadMsgVisible ? "visible msg-fade" : ""}`}>
                          {downloadMsgVisible ? "Downloaded" : "Download"}
                        </div>
                        <button
                          type="button"
                          onClick={handleDownload}
                          disabled={!outputText.trim()}
                          aria-label="Download"
                          className="toolbar-btn toolbar-btn--green"
                        >
                          <img src={downloadIcon} alt="download" className="toolbar-icon" />
                        </button>
                      </div>

                      <div className="toolbar-wrap">
                        <div className={`tooltip ${resetMsgVisible ? "visible msg-fade" : ""}`}>
                          {resetMsgVisible ? "Form reset" : "Reset"}
                        </div>
                        <button
                          type="button"
                          onClick={handleReset}
                          disabled={!sourceUrl && !bulkUrls && !htmlInput}
                          aria-label="Reset"
                          className="toolbar-btn toolbar-btn--red"
                        >
                          <img src={resetIcon} alt="reset" className="toolbar-icon" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {mode === "single" && singleValid && (
                    <div className="mb-4 bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-gray-800 flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-gray-600 text-xs">✓</span>
                      <span className="break-all">{singleCanonicalUrl}</span>
                    </div>
                  )}
                  {mode === "scan" && detectedCanonicals.length > 0 && (
                    <div className="mb-4 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-gray-800">
                      <div className="text-sm font-semibold text-blue-700 mb-2">Detected canonical URL{detectedCanonicals.length === 1 ? "" : "s"}</div>
                      <ul className="space-y-1 text-sm">
                        {detectedCanonicals.map((url) => (
                          <li key={url} className="break-all">{url}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {(warnings.length > 0 || invalidBulkRows.length > 0) && (
                    <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                      {warnings.length > 0 && (
                        <ul className="list-disc pl-5 space-y-1">
                          {warnings.map((warning, idx) => <li key={`${warning}-${idx}`}>{warning}</li>)}
                        </ul>
                      )}
                      {invalidBulkRows.length > 0 && (
                        <div className={warnings.length > 0 ? "mt-3" : ""}>
                          <div className="font-semibold mb-1">Invalid bulk URLs</div>
                          <ul className="list-disc pl-5 space-y-1">
                            {invalidBulkRows.map((row) => <li key={row.input} className="break-all">{row.input}: {row.error}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                  <p className="text-sm text-gray-600 mb-3">
                    {mode === "scan" ? "Review detected canonical tags and keep exactly one preferred URL." : "Copy this canonical tag and place it inside your page's <head> section."}
                  </p>

                  <div className="relative">
                    <pre className="rounded-xl bg-black text-sky-300 p-4 overflow-auto text-sm border border-gray-800">
                      <code>{outputText}</code>
                    </pre>
                  </div>
                </div>
              </div>

              <aside className="tool-preview">
                <div className="space-y-6">
                  <div>
                    <h4 className="tool-section-title">When to use?</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Use this when multiple URLs have the same content (e.g., product filters, sorting, or print versions).
                    </p>
                  </div>
                  <div>
                    <h4 className="tool-section-title">The "WWW" Trap</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Search engines treat www.site.com and site.com as different pages. Pick one and be consistent.
                    </p>
                  </div>
                  <div>
                    <h4 className="tool-section-title">Parameters</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      UTM tags are great for tracking but bad for SEO if indexed. Always strip them for your canonical.
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          </section>
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <h2 className="md:text-4xl mb-5 text-center">Frequently Asked Questions</h2>
          {FAQ_ITEMS.map((item, idx) => (
            <details key={idx} className="border-b border-gray-200 group" open={idx === 0}>
              <summary className="flex items-center justify-between py-6 cursor-pointer text-left text-xl font-semibold text-secondary">
                {item.q}
              </summary>
              <div className="pb-6 text-lg text-secondary">{item.a}</div>
            </details>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <RelatedTools exclude="/canonical-tag-generator" />
        </div>
      </section>

      {copiedToast && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-8 z-50 bg-slate-900 text-white px-6 py-3 rounded-full shadow-lg text-sm font-semibold">
          Copied to clipboard!
        </div>
      )}
    </>
  )
}

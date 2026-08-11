import { useMemo, useState } from "react"
import { Helmet } from "react-helmet-async"
import Seo from "../components/Seo"
import ToolSchema from "../components/ToolSchema"
import RelatedTools from "../components/RelatedTools"
import ISO6391 from "iso-639-1"
import { copyToClipboard } from "../utils/clipboard"
import { downloadText } from "../utils/download"
import {
  buildHreflangSitemapXml,
  buildHreflangTags,
  createHreflangEntry,
  extractHreflangTagsFromHtml,
  validateHreflangEntries,
  type HreflangEntry,
} from "../utils/hreflangUtils"
import copyIcon from "../assets/icons/copy.svg"
import downloadIcon from "../assets/icons/download.svg"
import resetIcon from "../assets/icons/reset.svg"

type Mode = "build" | "scan"
type OutputFormat = "html" | "sitemap"

const LANGUAGE_OPTIONS: { code: string; name: string }[] = ISO6391.getAllCodes()
  .map((code) => ({ code, name: ISO6391.getName(code) || code }))
  .sort((a, b) => a.name.localeCompare(b.name))

const FAQ_ITEMS = [
  {
    q: "What is a hreflang tag?",
    a: "Hreflang is an HTML attribute (rel=\"alternate\" hreflang=\"...\") that tells search engines which language and, optionally, which region a page is written for. It helps Google serve the correct language/country version of your site to each searcher.",
  },
  {
    q: "What format should the hreflang value be in?",
    a: "Use a two-letter ISO 639-1 language code (e.g. en, fr, es), optionally followed by a hyphen and a two-letter ISO 3166-1 region code (e.g. en-US, en-GB, pt-BR). Use x-default for the fallback version shown when no other language/region matches.",
  },
  {
    q: "Do hreflang tags need to be reciprocal?",
    a: "Yes. If page A links to page B via hreflang, page B must also link back to page A (and to every other language/region version). This tool automatically includes every entry on every page when you copy the tags, so reciprocity is handled for you.",
  },
  {
    q: "Should I add an x-default entry?",
    a: "It's recommended. x-default tells search engines which version to show visitors whose language or region doesn't match any of your listed alternates — typically your main or most global page.",
  },
  {
    q: "Can hreflang go in a sitemap instead of the page <head>?",
    a: "Yes. Large sites often prefer sitemap-based hreflang (using <xhtml:link> inside each <url> block) since it avoids bloating every page's <head>. Use the \"Sitemap XML\" output format to generate that version.",
  },
  {
    q: "Why isn't my hreflang tag working in Google Search Console?",
    a: "The most common causes are: missing reciprocal links back from the other language pages, invalid language/region codes, relative instead of absolute URLs, or duplicate hreflang values pointing to different URLs. This tool's validator flags each of these.",
  },
]

const structuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
}

export default function HreflangGenerator(): JSX.Element {
  const [mode, setMode] = useState<Mode>("build")
  const [format, setFormat] = useState<OutputFormat>("html")
  const [entries, setEntries] = useState<HreflangEntry[]>([
    createHreflangEntry("", "x-default"),
    createHreflangEntry("", "en"),
  ])
  const [htmlInput, setHtmlInput] = useState("")
  const [copiedToast, setCopiedToast] = useState(false)
  const [downloadMsgVisible, setDownloadMsgVisible] = useState(false)
  const [resetMsgVisible, setResetMsgVisible] = useState(false)

  const updateEntry = (id: string, patch: Partial<HreflangEntry>) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)))
  }

  const addEntry = () => setEntries((prev) => [...prev, createHreflangEntry()])
  const removeEntry = (id: string) => setEntries((prev) => prev.filter((e) => e.id !== id))

  const scannedEntries = useMemo(() => extractHreflangTagsFromHtml(htmlInput), [htmlInput])
  const activeEntries = mode === "build" ? entries : scannedEntries

  const issues = useMemo(() => validateHreflangEntries(activeEntries), [activeEntries])
  const errorCount = issues.filter((i) => i.level === "error").length
  const warningCount = issues.filter((i) => i.level === "warning").length

  const outputText = useMemo(() => {
    const built = format === "html" ? buildHreflangTags(activeEntries) : buildHreflangSitemapXml(activeEntries)
    if (built) return built
    return mode === "scan"
      ? "Paste HTML containing hreflang <link> tags to detect them..."
      : "Add at least one URL and language/region to generate tags..."
  }, [activeEntries, format, mode])

  const handleCopy = async () => {
    if (!outputText.trim()) return
    const ok = await copyToClipboard(outputText)
    if (ok) {
      setCopiedToast(true)
      setTimeout(() => setCopiedToast(false), 1400)
    }
  }

  const handleDownload = () => {
    const filename = format === "html" ? "hreflang-tags.txt" : "hreflang-sitemap.xml"
    downloadText(filename, outputText)
    setDownloadMsgVisible(true)
    setTimeout(() => setDownloadMsgVisible(false), 1400)
  }

  const handleReset = () => {
    setEntries([createHreflangEntry("", "x-default"), createHreflangEntry("", "en")])
    setHtmlInput("")
    setResetMsgVisible(true)
    setTimeout(() => setResetMsgVisible(false), 1400)
  }

  return (
    <>
      <Seo
        title="Free Hreflang Tag Generator"
        description="Generate valid, reciprocal hreflang tags for multilingual and multi-region websites. Build HTML link tags or sitemap XML, with built-in validation for common hreflang errors."
        url="https://cralite.com/tools/hreflang-generator/"
      />
      <ToolSchema
        name="Hreflang Tag Generator"
        description="Generate valid, reciprocal hreflang tags for multilingual and multi-region websites. Build HTML link tags or sitemap XML, with built-in validation for common hreflang errors."
        url="https://cralite.com/tools/hreflang-generator/"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>
      <style>{`details[open] summary .faq-plus { transform: rotate(45deg); }`}</style>

      <section className="section section--neutral">
        <div className="section-inner">
          <section className="tool-section">
            <div className="tool-grid">
              <div className="tool-form rounded-2xl">
                <h3 className="tool-h2">International URL &amp; language pairs</h3>
                <div className="flex items-center gap-2 mb-4">
                  <button type="button" onClick={() => setMode("build")} className={mode === "build" ? "action-btn" : "clear-btn"}>
                    Build
                  </button>
                  <button type="button" onClick={() => setMode("scan")} className={mode === "scan" ? "action-btn" : "clear-btn"}>
                    Scan HTML
                  </button>
                </div>

                {mode === "build" ? (
                  <div className="space-y-3">
                    {entries.map((entry, idx) => (
                      <div key={entry.id} className="grid grid-cols-1 md:grid-cols-[1fr_180px_auto] gap-2 items-start border border-gray-200 rounded-md p-3">
                        <div className="tool-field mb-0">
                          <label className="tool-label">{idx === 0 ? "Page URL" : ""}</label>
                          <input
                            type="url"
                            className="tool-input"
                            placeholder="https://example.com/en/page"
                            value={entry.url}
                            onChange={(e) => updateEntry(entry.id, { url: e.target.value })}
                          />
                        </div>
                        <div className="tool-field mb-0">
                          <label className="tool-label">{idx === 0 ? "Hreflang" : ""}</label>
                          <input
                            type="text"
                            list="hreflang-lang-options"
                            className="tool-input"
                            placeholder="en-US, es, x-default"
                            value={entry.hreflang}
                            onChange={(e) => updateEntry(entry.id, { hreflang: e.target.value })}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeEntry(entry.id)}
                          disabled={entries.length <= 1}
                          className="clear-btn self-end mb-0"
                          aria-label="Remove entry"
                          title="Remove entry"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <datalist id="hreflang-lang-options">
                      <option value="x-default" />
                      {LANGUAGE_OPTIONS.map((lang) => (
                        <option key={lang.code} value={lang.code}>{lang.name}</option>
                      ))}
                    </datalist>
                    <button type="button" onClick={addEntry} className="clear-btn">
                      + Add language/region
                    </button>
                  </div>
                ) : (
                  <div className="tool-field">
                    <label className="tool-label">HTML source</label>
                    <textarea
                      className="tool-textarea"
                      rows={8}
                      placeholder={'<head>\n  <link rel="alternate" hreflang="en" href="https://example.com/en/" />\n  <link rel="alternate" hreflang="es" href="https://example.com/es/" />\n</head>'}
                      value={htmlInput}
                      onChange={(e) => setHtmlInput(e.target.value)}
                    />
                  </div>
                )}

                <div className="border-t border-gray-200 mt-5 pt-5">
                  <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                    <h3 className="tool-section-title">Generated Output</h3>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setFormat("html")} className={format === "html" ? "action-btn" : "clear-btn"}>
                        HTML
                      </button>
                      <button type="button" onClick={() => setFormat("sitemap")} className={format === "sitemap" ? "action-btn" : "clear-btn"}>
                        Sitemap XML
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 mb-3">
                    <div className="toolbar">
                      <div className="toolbar-wrap">
                        <div className={`tooltip ${copiedToast ? "visible msg-fade" : ""}`}>
                          {copiedToast ? "Copied to clipboard" : "Copy"}
                        </div>
                        <button type="button" onClick={handleCopy} disabled={!outputText.trim()} aria-label="Copy" className="toolbar-btn toolbar-btn--blue">
                          <img src={copyIcon} alt="copy" className="toolbar-icon" width={16} height={16} />
                        </button>
                      </div>
                      <div className="toolbar-wrap">
                        <div className={`tooltip ${downloadMsgVisible ? "visible msg-fade" : ""}`}>
                          {downloadMsgVisible ? "Downloaded" : "Download"}
                        </div>
                        <button type="button" onClick={handleDownload} disabled={!outputText.trim()} aria-label="Download" className="toolbar-btn toolbar-btn--green">
                          <img src={downloadIcon} alt="download" className="toolbar-icon" width={16} height={16} />
                        </button>
                      </div>
                      <div className="toolbar-wrap">
                        <div className={`tooltip ${resetMsgVisible ? "visible msg-fade" : ""}`}>
                          {resetMsgVisible ? "Form reset" : "Reset"}
                        </div>
                        <button type="button" onClick={handleReset} aria-label="Reset" className="toolbar-btn toolbar-btn--red">
                          <img src={resetIcon} alt="reset" className="toolbar-icon" width={16} height={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {issues.length > 0 && (
                    <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                      <ul className="list-disc pl-5 space-y-1">
                        {issues.map((issue, idx) => (
                          <li key={`${issue.message}-${idx}`} className={issue.level === "error" ? "text-red-700" : ""}>
                            {issue.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {issues.length === 0 && activeEntries.some((e) => e.url.trim()) && (
                    <div className="mb-4 bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-gray-800 flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-gray-600 text-xs">✓</span>
                      <span>No issues found.</span>
                    </div>
                  )}

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
                    <h4 className="tool-section-title">Reciprocity</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Every URL you add gets hreflang links to every other URL, including itself — the reciprocal pattern Google requires.
                    </p>
                  </div>
                  <div>
                    <h4 className="tool-section-title">x-default</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Use x-default for the version shown to visitors whose language/region doesn't match any listed alternate.
                    </p>
                  </div>
                  <div>
                    <h4 className="tool-section-title">Where to put it</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Add HTML tags to each page's &lt;head&gt;, or use the sitemap XML format to declare all alternates in one file instead.
                    </p>
                  </div>
                  {errorCount > 0 && (
                    <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                      {errorCount} error{errorCount === 1 ? "" : "s"} found — fix before publishing.
                    </div>
                  )}
                  {errorCount === 0 && warningCount > 0 && (
                    <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                      {warningCount} warning{warningCount === 1 ? "" : "s"} to review.
                    </div>
                  )}
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
          <RelatedTools exclude="/hreflang-generator" />
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

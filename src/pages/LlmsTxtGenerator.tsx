import { useState } from "react"
import Seo from "../components/Seo"
import RelatedTools from "../components/RelatedTools"
import { copyToClipboard } from "../utils/clipboard"
import { downloadText } from "../utils/download"
import {
  generateLlmsTxtData,
  buildLlmsTxt,
  isValidAbsoluteUrl,
  type LlmsTxtData,
  type PageEntry,
  type SiteInfo,
} from "../utils/llmsTxtUtils"
import copyIcon from "../assets/icons/copy.svg"
import downloadIcon from "../assets/icons/download.svg"
import resetIcon from "../assets/icons/reset.svg"

type Phase = "input" | "loading" | "results"

const FAQ_ITEMS = [
  {
    q: "What is an llms.txt file?",
    a: "llms.txt is a Markdown file placed at your website root, for example https://example.com/llms.txt. It tells AI language models what your site is, what it does, and where to find key pages.",
  },
  {
    q: "How does the generator work?",
    a: "Enter your domain and click Generate. The tool fetches your sitemap, follows sitemap indexes, reads page metadata where possible, and builds a ready-to-deploy llms.txt file.",
  },
  {
    q: "Why should I add llms.txt to my site?",
    a: "AI-powered search and assistants crawl web content to generate answers. An llms.txt file gives them a concise, curated guide to your brand and key content.",
  },
  {
    q: "Where do I upload the file?",
    a: "Place llms.txt at the root of your domain so it is accessible at https://yourdomain.com/llms.txt. Treat it like robots.txt.",
  },
  {
    q: "What if my sitemap is not found automatically?",
    a: "Use the Sitemap URL field to provide your sitemap URL directly, for example https://example.com/sitemap.xml. This bypasses auto-discovery.",
  },
]

export default function LlmsTxtGenerator(): JSX.Element {
  const [phase, setPhase] = useState<Phase>("input")
  const [domainUrl, setDomainUrl] = useState("")
  const [urlError, setUrlError] = useState("")
  const [loadingMsg, setLoadingMsg] = useState("")
  const [generateError, setGenerateError] = useState("")
  const [siteInfo, setSiteInfo] = useState<SiteInfo>({ name: "", summary: "" })
  const [pages, setPages] = useState<PageEntry[]>([])
  const [copiedToast, setCopiedToast] = useState(false)
  const [downloadMsg, setDownloadMsg] = useState(false)

  const output = buildLlmsTxt(siteInfo, pages)

  const handleGenerate = async () => {
    const url = domainUrl.trim()
    if (!isValidAbsoluteUrl(url)) {
      setUrlError("Enter a valid URL starting with https://")
      return
    }

    setUrlError("")
    setGenerateError("")
    setPhase("loading")
    setLoadingMsg("Starting...")

    try {
      const data: LlmsTxtData = await generateLlmsTxtData(url, "", setLoadingMsg)
      setSiteInfo(data.siteInfo)
      setPages(data.pages)
      setPhase("results")
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : "Something went wrong. Try again.")
      setPhase("input")
    }
  }

  const handleReset = () => {
    setPhase("input")
    setDomainUrl("")
    setUrlError("")
    setGenerateError("")
    setSiteInfo({ name: "", summary: "" })
    setPages([])
    setCopiedToast(false)
    setDownloadMsg(false)
  }

  const handleCopy = async () => {
    const ok = await copyToClipboard(output)
    if (ok) {
      setCopiedToast(true)
      setTimeout(() => setCopiedToast(false), 1400)
    }
  }

  const handleDownload = () => {
    downloadText("llms.txt", output)
    setDownloadMsg(true)
    setTimeout(() => setDownloadMsg(false), 1400)
  }

  return (
    <>
      <Seo
        title="Free LLMs.txt Generator | No Credit Card Required"
        description="Enter your domain and instantly generate an llms.txt file. Crawls your sitemap, extracts page info, and builds a clean AI-readable site map. No signup required."
        keywords="llms.txt generator, llms txt, ai seo, llm crawl, ai site map, ai search"
        url="https://cralite.com/tools/llms-txt-generator/"
      />

      <section className="section section--neutral">
        <div className="section-inner">
          <div className="tool-section">
            <div className="tool-grid">
              <div className="tool-form rounded-2xl gap-4">
                <h3 className="tool-h2">Enter your website URL</h3>
                <p className="text-sm text-gray-500 mb-2 leading-relaxed">
                  Free, no signup, no credit card. Enter your website URL and generate a clean{" "}
                  <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">llms.txt</code>{" "}
                  preview from your public sitemap.
                </p>
                <p className="text-xs text-gray-500 mb-2">
                  If direct fetch is blocked by CORS, this tool retries through a public proxy (allorigins.win, corsproxy.io, or thingproxy.freeboard.io).
                </p>

                <form
                  className="tool-field mb-0!"
                  onSubmit={(e) => { e.preventDefault(); handleGenerate() }}
                  autoComplete="on"
                >
                  <label className="tool-label" htmlFor="llms-site-url">Website URL</label>
                  <div className="llms-url-control">
                    <input
                      id="llms-site-url"
                      type="url"
                      name="url"
                      autoComplete="url"
                      className={`llms-url-input ${urlError ? "border-red-400" : ""}`}
                      placeholder="https://example.com"
                      value={domainUrl}
                      disabled={phase === "loading"}
                      onChange={(e) => { setDomainUrl(e.target.value); setUrlError("") }}
                    />
                    <button
                      type="submit"
                      disabled={phase === "loading"}
                      className="llms-url-button"
                    >
                      {phase === "loading" ? "Scanning..." : "Generate"}
                    </button>
                  </div>
                  {urlError && <p className="mt-1 text-sm text-red-600">{urlError}</p>}
                  {generateError && (
                    <p className="mt-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      {generateError}
                    </p>
                  )}
                </form>

                {phase === "loading" && (
                  <div className="mt-6 flex flex-col items-center gap-4 py-6">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-sm text-gray-500 animate-pulse">{loadingMsg}</p>
                  </div>
                )}

              </div>

              <aside className="tool-preview">
                <h3 className="tool-h2">Implementation Roadmap</h3>

                <ol className="space-y-3 text-base text-gray-700 leading-relaxed list-decimal pl-5">
                  <li>Generate a clean llms.txt file from your public sitemap.</li>
                  <li>Upload it to your website root at <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">/llms.txt</code>.</li>
                  <li>Open the file in your browser to confirm it is publicly accessible.</li>
                  <li>Review AI search and assistant referrals over time for signs of recognition.</li>
                </ol>
              </aside>
            </div>

            <div className="mt-6 overflow-hidden" style={{ minWidth: 0 }}>
              <div className="flex items-center justify-between gap-3 mb-3">
                <h3 className="tool-h2 mb-0">Generated llms.txt</h3>
                <div className="toolbar" aria-hidden={phase !== "results"}>
                  <div className="toolbar-wrap">
                    <div className={`tooltip ${copiedToast ? "visible msg-fade" : ""}`}>
                      {copiedToast ? "Copied!" : "Copy"}
                    </div>
                    <button
                      type="button"
                      onClick={handleCopy}
                      aria-label="Copy"
                      className="toolbar-btn toolbar-btn--blue"
                      disabled={phase !== "results"}
                    >
                      <img src={copyIcon} alt="copy" className="toolbar-icon" />
                    </button>
                  </div>
                  <div className="toolbar-wrap">
                    <div className={`tooltip ${downloadMsg ? "visible msg-fade" : ""}`}>
                      {downloadMsg ? "Downloaded" : "Download"}
                    </div>
                    <button
                      type="button"
                      onClick={handleDownload}
                      aria-label="Download"
                      className="toolbar-btn toolbar-btn--green"
                      disabled={phase !== "results"}
                    >
                      <img src={downloadIcon} alt="download" className="toolbar-icon" />
                    </button>
                  </div>
                  <div className="toolbar-wrap">
                    <div className="tooltip">Reset</div>
                    <button
                      type="button"
                      onClick={handleReset}
                      aria-label="Reset"
                      className="toolbar-btn toolbar-btn--red"
                      disabled={phase === "loading"}
                    >
                      <img src={resetIcon} alt="reset" className="toolbar-icon" />
                    </button>
                  </div>
                </div>
              </div>

              <pre
                className="tool-code llms-preview-pane"
                style={{
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  overflowX: "auto",
                  overflowY: "auto",
                  maxWidth: "100%",
                  height: 360,
                  minHeight: 360,
                  maxHeight: 360,
                  marginTop: 0,
                }}
              >
                <code>
                  {phase === "results" && output
                    ? output
                    : "Enter a website URL and generate an llms.txt file.\n\nThe result will appear here, ready to copy or download."}
                </code>
              </pre>
            </div>
          </div>
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
          <RelatedTools exclude="/llms-txt-generator" />
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

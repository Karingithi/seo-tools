import { useState } from "react"
import Seo from "../components/Seo"
import RelatedTools from "../components/RelatedTools"

// LLMs.txt Generator Tool
// This component lets users configure basic LLMs.txt rules
// and generates a downloadable text file they can place at /llms.txt.

const DEFAULT_HOST = "https://www.example.com"

const defaultContent = `# Example llms.txt
# Place this file at: /llms.txt on your main domain

# Block all LLM agents by default
User-Agent: *
Disallow: /

# Allow a specific LLM agent to crawl
# User-Agent: gptbot
# Allow: /
# Crawl-Delay: 10
`

export default function LlmsTxtGenerator(): JSX.Element {
  const [siteUrl, setSiteUrl] = useState(DEFAULT_HOST)
  const [blockAll, setBlockAll] = useState(true)
  const [allowGptbot] = useState(false)
  const [allowOther] = useState(false)
  const [otherAgentName] = useState("claudebot")
  const [crawlDelay, setCrawlDelay] = useState("10")
  const [customNotes, setCustomNotes] = useState("")

  const generateLlmsTxt = () => {
    const lines: string[] = []

    lines.push(`# LLMs.txt for ${siteUrl || "your site"}`)
    lines.push(`# Place this file at: ${siteUrl || "https://www.example.com"}/llms.txt`)
    lines.push("# Learn more about controlling AI crawlers in your content policies.")
    lines.push("")

    if (blockAll) {
      lines.push("# Block all LLM user agents by default")
      lines.push("User-Agent: *")
      lines.push("Disallow: /")
      lines.push("")
    } else {
      lines.push("# Allow all LLM user agents by default")
      lines.push("User-Agent: *")
      lines.push("Allow: /")
      if (crawlDelay.trim()) {
        lines.push(`Crawl-Delay: ${crawlDelay.trim()}`)
      }
      lines.push("")
    }

    if (allowGptbot) {
      lines.push("# Specific rules for gptbot (OpenAI)")
      lines.push("User-Agent: gptbot")
      lines.push(blockAll ? "Allow: /" : "Disallow: /")
      if (crawlDelay.trim()) {
        lines.push(`Crawl-Delay: ${crawlDelay.trim()}`)
      }
      lines.push("")
    }

    if (allowOther && otherAgentName.trim()) {
      lines.push(`# Specific rules for ${otherAgentName.trim()}`)
      lines.push(`User-Agent: ${otherAgentName.trim()}`)
      lines.push(blockAll ? "Allow: /" : "Disallow: /")
      if (crawlDelay.trim()) {
        lines.push(`Crawl-Delay: ${crawlDelay.trim()}`)
      }
      lines.push("")
    }

    if (customNotes.trim()) {
      lines.push("# Custom notes")
      customNotes
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .forEach((line) => {
          lines.push(`# ${line}`)
        })
    }

    return lines.join("\n") || defaultContent
  }

  const handleCopy = async () => {
    const text = generateLlmsTxt()
    try {
      await navigator.clipboard.writeText(text)
      alert("llms.txt content copied to clipboard")
    } catch (err) {
      console.error(err)
      alert("Failed to copy. Please copy manually.")
    }
  }

  const handleDownload = () => {
    const text = generateLlmsTxt()
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "llms.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const llmsTxtPreview = generateLlmsTxt()

  return (
    <>
      <Seo
        title="LLMs.txt Generator"
        description="Generate an llms.txt to control how LLM crawlers access your site. Copy or download the file and place it at /llms.txt on your domain."
        keywords="llms.txt, ai crawler policy, gptbot, llm robots"
        url="https://cralite.com/tools/llms-txt-generator"
      />

      <section className="tool-section">
        <div className="tool-grid">
          <div className="tool-form" style={{ minWidth: 0 }}>
            <div className="space-y-6">
              <h2 className="tool-h2">Site settings</h2>
              <div className="tool-field" style={{ minWidth: 0 }}>
                <label className="tool-label">Website URL</label>
                <input
                  type="url"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                  placeholder="https://www.yourdomain.com"
                  className="tool-input"
                />
                <span className="tool-subtext">
                  Your llms.txt file should live at <code>{siteUrl || DEFAULT_HOST}/llms.txt</code>
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Default rule</p>

                <label className="flex items-start gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="defaultRule"
                    checked={blockAll}
                    onChange={() => setBlockAll(true)}
                    className="mt-1"
                  />
                  <span>
                    <span className="font-medium">Block all LLM crawlers</span>
                    <span className="block text-xs text-slate-500">
                      Use this if you do not want any LLM to use or index your content.
                    </span>
                  </span>
                </label>

                <label className="flex items-start gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="defaultRule"
                    checked={!blockAll}
                    onChange={() => setBlockAll(false)}
                    className="mt-1"
                  />
                  <span>
                    <span className="font-medium">Allow all LLM crawlers</span>
                    <span className="block text-xs text-slate-500">
                      Use this if you are okay with LLMs accessing and learning from your content.
                    </span>
                  </span>
                </label>

                <div className="tool-field" style={{ minWidth: 0 }}>
                  <label className="tool-label">Crawl delay (seconds)</label>
                  <input
                    type="number"
                    min={0}
                    value={crawlDelay}
                    onChange={(e) => setCrawlDelay(e.target.value)}
                    className="tool-input w-32"
                  />
                  <span className="tool-subtext">Optional. Ask LLM crawlers to wait between requests.</span>
                </div>
              </div>

              
            </div>

              <h2 className="text-base font-semibold mb-3">Custom notes (optional)</h2>
              <p className="text-xs text-slate-500 mb-2">
                Add human-friendly notes about your policy. These will be added as comments at the bottom of your
                <code className="mx-1 rounded bg-slate-100 px-1 py-0.5 text-[11px]">llms.txt</code> file.
              </p>
              <textarea
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                rows={3}
                placeholder="Example: Our content is copyrighted. Contact us for licensing if you would like to train or fine-tune on our materials."
                className="tool-textarea"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="tool-preview" style={{ minWidth: 0 }}>
            <div className="space-y-4 sticky top-20">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">llms.txt preview</h2>
                <p className="text-xs text-slate-500">
                  Review the generated content, then copy it or download as a <code>llms.txt</code> file.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="toolbar-spacing">
                  <div className="toolbar">
                    <div className="toolbar-wrap">
                      <div className={`tooltip`}>
                        Copy
                      </div>
                      <button onClick={handleCopy} aria-label="Copy" className="toolbar-btn toolbar-btn--blue">
                        Copy
                      </button>
                    </div>

                    <div className="toolbar-wrap">
                      <div className={`tooltip`}>
                        Download
                      </div>
                      <button onClick={handleDownload} aria-label="Download" className="toolbar-btn toolbar-btn--green">
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative rounded-2xl border border-slate-900/5 bg-slate-950 text-[11px] leading-relaxed text-slate-100 shadow-lg">
              <div className="flex items-center gap-1 border-b border-white/5 px-4 py-2 text-[10px] text-slate-300">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-red-500/70" />
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-green-500/70" />
                <span className="ml-2 font-mono text-[10px] text-slate-400">/llms.txt</span>
              </div>
              <pre className="tool-code mt-4 overflow-auto px-4 py-3 font-mono whitespace-pre-wrap wrap-break-word max-h-[460px]" style={{ minHeight: 160 }}>
                <code>{llmsTxtPreview || defaultContent}</code>
              </pre>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[11px] text-slate-600">
              <p className="font-semibold mb-1">How to use this file</p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Download the file as <code>llms.txt</code>.</li>
                <li>Upload it to the root of your main domain (same place as <code>robots.txt</code>).</li>
                <li>
                  Example: <code>{siteUrl || DEFAULT_HOST}/llms.txt</code>.
                </li>
                <li>Update it whenever your AI / LLM access policy changes.</li>
              </ol>
            </div>
            </div>
          </div>
        </section>

      <RelatedTools exclude="/llms-txt-generator" />
    </>
  )
}

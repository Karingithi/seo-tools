import { useState } from "react"
import Seo from "../components/Seo"

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
  const [allowGptbot, setAllowGptbot] = useState(false)
  const [allowOther, setAllowOther] = useState(false)
  const [otherAgentName, setOtherAgentName] = useState("claudebot")
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

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">LLMs.txt Generator</h1>
          <p className="text-sm text-gray-500 max-w-2xl">
            Generate an <code className="px-1 py-0.5 rounded bg-slate-100 text-xs">llms.txt</code> file to control how AI and
            LLM crawlers can use your content. Configure your rules below, then copy or download the file and upload it to
            the root of your domain.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] items-start">
          {/* Controls */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold mb-4">Site settings</h2>
              <label className="block mb-3 text-sm font-medium text-slate-700">
                Website URL
                <input
                  type="url"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                  placeholder="https://www.yourdomain.com"
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/80"
                />
                <span className="mt-1 block text-xs text-slate-500">
                  Your llms.txt file should live at <code>{siteUrl || DEFAULT_HOST}/llms.txt</code>
                </span>
              </label>

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

                <label className="block mt-3 text-xs text-slate-600">
                  Crawl delay (seconds)
                  <input
                    type="number"
                    min={0}
                    value={crawlDelay}
                    onChange={(e) => setCrawlDelay(e.target.value)}
                    className="mt-1 w-32 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/80"
                  />
                  <span className="mt-1 block text-[11px] text-slate-400">
                    Optional. Ask LLM crawlers to wait between requests.
                  </span>
                </label>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold mb-4">Specific LLM agents</h2>

              <label className="flex items-start gap-2 text-sm cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={allowGptbot}
                  onChange={(e) => setAllowGptbot(e.target.checked)}
                  className="mt-1"
                />
                <span>
                  <span className="font-medium">Add rules for gptbot (OpenAI)</span>
                  <span className="block text-xs text-slate-500">
                    Toggle to add an explicit allow/disallow rule for gptbot, on top of your default rule.
                  </span>
                </span>
              </label>

              <label className="flex items-start gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowOther}
                  onChange={(e) => setAllowOther(e.target.checked)}
                  className="mt-1"
                />
                <span className="w-full">
                  <span className="font-medium">Add rules for another LLM agent</span>
                  <span className="block text-xs text-slate-500 mb-2">
                    For example: <code>claudebot</code>, <code>perplexitybot</code>, etc.
                  </span>
                  <input
                    type="text"
                    value={otherAgentName}
                    onChange={(e) => setOtherAgentName(e.target.value)}
                    placeholder="claudebot"
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/80"
                    disabled={!allowOther}
                  />
                </span>
              </label>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
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
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/80"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-4 sticky top-20">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">llms.txt preview</h2>
                <p className="text-xs text-slate-500">
                  Review the generated content, then copy it or download as a <code>llms.txt</code> file.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900/80"
                >
                  Copy
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/80"
                >
                  Download
                </button>
              </div>
            </div>

            <div className="relative rounded-2xl border border-slate-900/5 bg-slate-950 text-[11px] leading-relaxed text-slate-100 shadow-lg">
              <div className="flex items-center gap-1 border-b border-white/5 px-4 py-2 text-[10px] text-slate-300">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-red-500/70" />
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-green-500/70" />
                <span className="ml-2 font-mono text-[10px] text-slate-400">/llms.txt</span>
              </div>
              <pre className="overflow-auto px-4 py-3 font-mono whitespace-pre-wrap break-words max-h-[460px]">
                {llmsTxtPreview || defaultContent}
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
      </div>
    </>
  )
}

import { useMemo, useState } from "react"
import { Helmet } from "react-helmet-async"
import Seo from "../components/Seo"
import ToolSchema from "../components/ToolSchema"
import RelatedTools from "../components/RelatedTools"
import { copyToClipboard } from "../utils/clipboard"
import {
  detectTypes,
  extractJsonLdBlocks,
  validateSchemaBlock,
  type ValidationIssue,
} from "../utils/schemaValidatorUtils"
import copyIcon from "../assets/icons/copy.svg"
import resetIcon from "../assets/icons/reset.svg"

const SAMPLE = `{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "How to Improve Core Web Vitals",
  "image": "https://example.com/cover.jpg",
  "datePublished": "2026-01-15",
  "author": { "@type": "Person", "name": "Jane Doe" }
}`

const FAQ_ITEMS = [
  {
    q: "What does this validator check?",
    a: "It checks that your JSON-LD is syntactically valid, that every node has a valid \"@context\" and \"@type\", and that the fields Google requires for rich results (e.g. headline + image + datePublished for Article, price + priceCurrency for Offer) are present. It mirrors the requirements behind Google's Rich Results Test rather than the full schema.org specification, which requires almost nothing on its own.",
  },
  {
    q: "Can I paste a full HTML page instead of just the JSON?",
    a: "Yes. Paste the whole page (or just the <head>) and the validator will automatically extract every <script type=\"application/ld+json\"> block and validate each one separately.",
  },
  {
    q: "Why does it flag a warning instead of an error?",
    a: "Errors are fields Google requires for a type to be eligible for rich results at all. Warnings are recommended fields that improve how the rich result looks but won't disqualify it if missing.",
  },
  {
    q: "Does passing this validator guarantee rich results in Google Search?",
    a: "No validator can guarantee that — Google also considers page quality, policy compliance, and search demand. This tool catches structural and required-field errors before you publish; use Google's Rich Results Test afterward to confirm live eligibility.",
  },
  {
    q: "How is this different from the Schema Markup Generator?",
    a: "The Schema Markup Generator builds new JSON-LD from a form. This validator checks JSON-LD you already have — whether it came from this site, a CMS plugin, or hand-written code — for errors before you publish it.",
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

function IssueRow({ issue }: { issue: ValidationIssue }) {
  return (
    <li className={issue.level === "error" ? "text-red-700" : "text-amber-800"}>
      <span className="font-mono text-xs bg-gray-100 rounded px-1 py-0.5 mr-2">{issue.path || "(root)"}</span>
      {issue.message}
    </li>
  )
}

export default function SchemaValidator(): JSX.Element {
  const [input, setInput] = useState("")
  const [copiedToast, setCopiedToast] = useState(false)
  const [resetMsgVisible, setResetMsgVisible] = useState(false)

  const blocks = useMemo(() => extractJsonLdBlocks(input), [input])

  const results = useMemo(
    () =>
      blocks.map((block) => ({
        ...block,
        issues: block.data !== null ? validateSchemaBlock(block.data) : [],
        types: block.data !== null ? detectTypes(block.data) : [],
      })),
    [blocks]
  )

  const totalErrors = results.reduce((sum, r) => sum + r.issues.filter((i) => i.level === "error").length, 0)
  const totalWarnings = results.reduce((sum, r) => sum + r.issues.filter((i) => i.level === "warning").length, 0)
  const parseErrorCount = results.filter((r) => r.parseError).length

  const summary = (() => {
    if (!input.trim()) return null
    if (results.length === 0) return "No JSON-LD found."
    if (parseErrorCount > 0) return `${parseErrorCount} block${parseErrorCount === 1 ? "" : "s"} could not be parsed as valid JSON.`
    if (totalErrors > 0) return `${totalErrors} error${totalErrors === 1 ? "" : "s"} found across ${results.length} schema block${results.length === 1 ? "" : "s"}.`
    if (totalWarnings > 0) return `Valid JSON-LD with ${totalWarnings} warning${totalWarnings === 1 ? "" : "s"} to review.`
    return `${results.length} schema block${results.length === 1 ? "" : "s"} passed with no issues.`
  })()

  const handleCopySample = async () => {
    const ok = await copyToClipboard(SAMPLE)
    if (ok) {
      setCopiedToast(true)
      setTimeout(() => setCopiedToast(false), 1400)
    }
  }

  const handleLoadSample = () => setInput(SAMPLE)

  const handleReset = () => {
    setInput("")
    setResetMsgVisible(true)
    setTimeout(() => setResetMsgVisible(false), 1400)
  }

  return (
    <>
      <Seo
        title="Free Structured Data / Rich Results Validator"
        description="Paste any JSON-LD or HTML with embedded structured data to check it for errors and missing fields required for Google Rich Results, before you publish."
        url="https://cralite.com/tools/schema-validator/"
      />
      <ToolSchema
        name="Structured Data / Rich Results Validator"
        description="Paste any JSON-LD or HTML with embedded structured data to check it for errors and missing fields required for Google Rich Results, before you publish."
        url="https://cralite.com/tools/schema-validator/"
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
                <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                  <h3 className="tool-h2 m-0">Paste JSON-LD or HTML</h3>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={handleLoadSample} className="clear-btn">
                      Load sample
                    </button>
                    <div className="toolbar-wrap">
                      <div className={`tooltip ${copiedToast ? "visible msg-fade" : ""}`}>
                        {copiedToast ? "Copied to clipboard" : "Copy sample"}
                      </div>
                      <button type="button" onClick={handleCopySample} aria-label="Copy sample" className="toolbar-btn toolbar-btn--blue">
                        <img src={copyIcon} alt="copy" className="toolbar-icon" width={16} height={16} />
                      </button>
                    </div>
                    <div className="toolbar-wrap">
                      <div className={`tooltip ${resetMsgVisible ? "visible msg-fade" : ""}`}>
                        {resetMsgVisible ? "Cleared" : "Clear"}
                      </div>
                      <button type="button" onClick={handleReset} aria-label="Clear" className="toolbar-btn toolbar-btn--red">
                        <img src={resetIcon} alt="reset" className="toolbar-icon" width={16} height={16} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="tool-field">
                  <textarea
                    className="tool-textarea"
                    rows={16}
                    placeholder={'Paste raw JSON-LD, or a full page/head with <script type="application/ld+json"> tags...'}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    spellCheck={false}
                  />
                </div>

                {summary && (
                  <div
                    className={
                      parseErrorCount > 0 || totalErrors > 0
                        ? "mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                        : totalWarnings > 0
                          ? "mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
                          : "mb-4 bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-gray-800 flex items-center gap-2"
                    }
                  >
                    {totalErrors === 0 && totalWarnings === 0 && parseErrorCount === 0 && results.length > 0 && (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-gray-600 text-xs">✓</span>
                    )}
                    <span>{summary}</span>
                  </div>
                )}

                {results.map((result, idx) => (
                  <div key={idx} className="mb-4 border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                      <h4 className="tool-section-title m-0">
                        {results.length > 1 ? `Schema block ${idx + 1}` : "Schema block"}
                        {result.types.length > 0 && (
                          <span className="ml-2 text-sm font-normal text-gray-500">({result.types.join(", ")})</span>
                        )}
                      </h4>
                    </div>
                    {result.parseError ? (
                      <div className="text-sm text-red-700">Invalid JSON: {result.parseError}</div>
                    ) : result.issues.length === 0 ? (
                      <div className="text-sm text-green-700">No issues found.</div>
                    ) : (
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        {result.issues.map((issue, i) => (
                          <IssueRow key={`${issue.path}-${i}`} issue={issue} />
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>

              <aside className="tool-preview">
                <div className="space-y-6">
                  <div>
                    <h4 className="tool-section-title">What's checked</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Valid JSON, presence of "@context" and "@type", and the fields Google requires per type (Article, Product, FAQPage, Review, Event, JobPosting, and more).
                    </p>
                  </div>
                  <div>
                    <h4 className="tool-section-title">Errors vs. warnings</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Errors block rich result eligibility. Warnings are recommended but not required — fixing them improves how your result looks.
                    </p>
                  </div>
                  <div>
                    <h4 className="tool-section-title">Multiple blocks</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Paste a whole page and every &lt;script type="application/ld+json"&gt; block is detected and validated separately.
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
          <RelatedTools exclude="/schema-validator" />
        </div>
      </section>
    </>
  )
}

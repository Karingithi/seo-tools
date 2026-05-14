import { useMemo, useRef, useState, type ReactNode } from "react"
import Seo from "../components/Seo"
import RelatedTools from "../components/RelatedTools"
import { downloadText } from "../utils/download"
import {
  buildNgrams,
  findTermOccurrences,
  getHtmlSectionText,
  getReadabilityStats,
  stripHtml,
  toDensityItems,
  toTokens,
} from "../utils/keywordDensityUtils"
import { Download, Settings } from "lucide-react"

type GramMode = 1 | 2 | 3

type FaqItem = {
  q: string
  a: ReactNode
}

const FAQ_ITEMS: FaqItem[] = [
  {
    q: "1. What is Keyword Density?",
    a: (
      <p>
        Keyword density refers to the percentage of times a specific keyword or phrase appears in a piece of content compared to the total word count. It is a fundamental metric used by SEO professionals to ensure a topic is properly covered without "stuffing" the text.
      </p>
    ),
  },
  {
    q: "2. What is the \"Optimal\" Keyword Density?",
    a: (
      <>
        <p>
          While there is no "perfect" number that guarantees a #1 ranking, most SEO experts recommend keeping your primary keyword density between <strong>0.5% and 2.5%</strong>.
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Under 0.5%:</strong> Search engines may not understand the primary topic.</li>
          <li><strong>Over 3.0%:</strong> You risk being flagged for "Keyword Stuffing," which can result in search engine penalties.</li>
        </ul>
      </>
    ),
  },
  {
    q: "3. What are \"Stop Words\" (Common Words)?",
    a: (
      <p>
        Stop words are frequently used words like "the," "is," "at," and "which." Since these appear in almost every sentence, they can clutter your data. The <strong>Exclude Common Words</strong> toggle filters these out so you can focus on meaningful keywords. You can customize this list by clicking the <strong>Settings (Gear)</strong> icon.
      </p>
    ),
  },
  {
    q: "4. What do 2-Word and 3-Word toggles do?",
    a: (
      <>
        <p>These analyze <strong>N-grams</strong>:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>1-Word:</strong> Individual keywords (e.g., "Marketing").</li>
          <li><strong>2-Words:</strong> Short-tail phrases (e.g., "Digital Marketing").</li>
          <li><strong>3-Words:</strong> Long-tail phrases (e.g., "Best Digital Marketing").</li>
        </ul>
        <p>Long-tail phrases are often easier to rank for because they are more specific.</p>
      </>
    ),
  },
  {
    q: "5. Why does the Target Keyword indicator turn red?",
    a: (
      <>
        <p>The indicator is a warning system:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Grey:</strong> Low density. You might need to mention your target topic more often.</li>
          <li><strong>Green (Pulsing):</strong> Optimal density. Your content is well-balanced.</li>
          <li><strong>Red:</strong> High density. We recommend reducing the frequency of that specific phrase to avoid looking spammy to search engines.</li>
        </ul>
      </>
    ),
  },
  {
    q: "6. Can I save my analysis?",
    a: (
      <p>
        Yes. Click the <strong>Export CSV</strong> button to download a spreadsheet containing the full breakdown of your keywords, their counts, and their exact percentages. This is useful for client reports or content audits.
      </p>
    ),
  },
  {
    q: "7. Does this tool store my text?",
    a: (
      <p>
        No. All processing happens locally in your browser. Once you refresh the page or click <strong>Clear All</strong>, your text is permanently removed.
      </p>
    ),
  },
  {
    q: "8. How do I find where a keyword is used?",
    a: (
      <p>
        Simply click on any keyword in the results table on the right. The tool will automatically scroll to and highlight the first occurrence of that word in the text editor for you.
      </p>
    ),
  },
]

const DEFAULT_STOP_WORDS = [
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has", "he",
  "in", "is", "it", "its", "of", "on", "that", "the", "to", "was", "were",
  "will", "with", "you", "your", "this", "these", "those", "or", "but", "if",
  "about", "above", "after", "again", "against", "all", "am", "any", "because",
  "been", "before", "being", "below", "between", "both", "can", "did", "do",
  "does", "doing", "don", "down", "during", "each", "few", "further", "had",
  "have", "having", "here", "how", "i", "into", "just", "me", "more", "most",
  "my", "no", "nor", "not", "off", "once", "only", "other", "our", "out",
  "over", "own", "same", "so", "some", "such", "than", "then", "there",
  "these", "they", "them", "their", "too", "under", "until", "up", "very",
  "we", "what", "when", "where", "which", "who", "why",
]

function densityHeatColor(density: number): string {
  if (density > 4) return "bg-red-500"
  if (density > 2.5) return "bg-amber-500"
  return "bg-indigo-500"
}

function densityBarWidth(density: number): number {
  return Math.min(Math.max(density * 15, 3), 100)
}

export default function KeywordDensityChecker(): JSX.Element {
  const [targetKeyword, setTargetKeyword] = useState("")
  const [content, setContent] = useState("")
  const [mode, setMode] = useState<GramMode>(1)
  const [excludeStops, setExcludeStops] = useState(true)
  const [showExclusionSettings, setShowExclusionSettings] = useState(false)
  const [exclusionListText, setExclusionListText] = useState(DEFAULT_STOP_WORDS.join(", "))
  const [limit, setLimit] = useState(20)
  const [textFocusHighlight, setTextFocusHighlight] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const tokens = useMemo(() => toTokens(content), [content])
  const customStopWords = useMemo(
    () =>
      new Set(
        exclusionListText
          .split(",")
          .map((w) => w.trim().toLowerCase())
          .filter(Boolean),
      ),
    [exclusionListText],
  )
  const grams = useMemo(
    () => buildNgrams(tokens, mode, excludeStops, customStopWords),
    [tokens, mode, excludeStops, customStopWords],
  )
  const densityItems = useMemo(() => toDensityItems(grams, tokens.length), [grams, tokens.length])

  const totalWords = tokens.length
  const uniqueWords = useMemo(() => new Set(tokens).size, [tokens])
  const readabilityStats = useMemo(() => getReadabilityStats(content), [content])
  const plainContent = useMemo(() => stripHtml(content), [content])
  const targetOccurrences = useMemo(() => findTermOccurrences(content, targetKeyword), [content, targetKeyword])

  const keywordLocationChecks = useMemo(() => {
    const target = targetKeyword.trim().toLocaleLowerCase()
    if (!target) return null
    const titleText = getHtmlSectionText(content, "title").toLocaleLowerCase()
    const h1Text = getHtmlSectionText(content, "h1").toLocaleLowerCase()
    const firstParagraph =
      getHtmlSectionText(content, "p").toLocaleLowerCase() ||
      stripHtml(content).split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean)[0]?.toLocaleLowerCase() ||
      ""
    return {
      title: titleText.includes(target),
      h1: h1Text.includes(target),
      firstParagraph: firstParagraph.includes(target),
      hasHtmlSignals: /<\/?(title|h1|p)\b/i.test(content),
    }
  }, [content, targetKeyword])

  const targetDensityPercent = useMemo(() => {
    const target = targetKeyword.trim().toLowerCase()
    if (!target || tokens.length === 0) return 0
    const count = findTermOccurrences(plainContent, target).length
    return (count / tokens.length) * 100
  }, [plainContent, targetKeyword, tokens.length])

  const targetDensityTone = useMemo(() => {
    if (!targetKeyword.trim()) return "neutral"
    if (targetDensityPercent < 0.5) return "low"
    if (targetDensityPercent <= 2.5) return "good"
    return "high"
  }, [targetDensityPercent, targetKeyword])

  const densityRecommendation = useMemo(() => {
    const target = targetKeyword.trim()
    if (!target) return null
    const pct = targetDensityPercent.toFixed(2)
    if (targetDensityTone === "high") return `Warning: "${target}" density is high (${pct}%). Possible over-optimization.`
    if (targetDensityTone === "low") return `Tip: "${target}" density is low (${pct}%). Consider adding it naturally in key sections.`
    return `Great: "${target}" density is in the optimal range (${pct}%).`
  }, [targetDensityPercent, targetDensityTone, targetKeyword])

  const visibleItems = densityItems.slice(0, limit)

  const handleClear = () => {
    setTargetKeyword("")
    setContent("")
    setMode(1)
    setExcludeStops(true)
    setShowExclusionSettings(false)
    setExclusionListText(DEFAULT_STOP_WORDS.join(", "))
    setLimit(20)
  }

  const handleExport = () => {
    const lines = ["Term,Count,Density(%)"]
    for (const item of densityItems) {
      lines.push(`"${item.term.replace(/"/g, '""')}",${item.count},${item.density.toFixed(2)}`)
    }
    downloadText(`keyword-density-${mode}gram.csv`, lines.join("\n"))
  }

  const handleFocusTerm = (term: string, occurrenceIndex = 0) => {
    const textarea = textareaRef.current
    if (!textarea || !content) return
    const occurrences = findTermOccurrences(content, term)
    const occurrence = occurrences[occurrenceIndex] || occurrences[0]
    if (!occurrence) return

    textarea.focus()
    textarea.setSelectionRange(occurrence.start, occurrence.end)
    setTextFocusHighlight(true)
    setTimeout(() => setTextFocusHighlight(false), 900)
  }

  return (
    <>
      <Seo
        title="Free Keyword Density Checker"
        description="Professional SEO text analysis for keywords, phrases, and density with 1-word, 2-word, and 3-word distribution insights."
        keywords="keyword density checker, seo keyword analysis, phrase density, n-gram checker"
        url="https://cralite.com/tools/keyword-density-checker"
      />

      <section className="section section--neutral">
        <div className="section-inner">
          <section className="tool-section">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="tool-h2">Keyword Density Checker</h2>
                <p className="text-sm text-gray-600">Professional SEO text analysis and frequency distribution tool.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExport}
                  className={
                    densityItems.length === 0
                      ? "inline-flex items-center gap-1 px-7 py-3 rounded-full text-sm font-normal border border-gray-200 bg-white text-gray-500 opacity-50 cursor-not-allowed"
                      : "inline-flex items-center gap-1 px-7 py-3 rounded-full text-sm font-normal border border-yellow-400 bg-[#ffc50c] text-[#3d2d00] hover:bg-[#f0b800] transition-[transform,box-shadow,background-color] duration-180 ease-[cubic-bezier(0.2,0.9,0.3,1)] hover:-translate-y-px hover:shadow-[0_6px_18px_rgba(0,0,0,0.08)]"
                  }
                  disabled={densityItems.length === 0}
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex items-center gap-1 px-7 py-3 rounded-full text-sm font-normal bg-[#fef2f2] text-red-600 hover:bg-[#fee2e2] transition-[transform,box-shadow,background-color] duration-180 ease-[cubic-bezier(0.2,0.9,0.3,1)] hover:-translate-y-px hover:shadow-[0_6px_18px_rgba(0,0,0,0.08)] disabled:opacity-50"
                  disabled={!content && !targetKeyword}
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="tool-grid">
              <div className="tool-form">
                <div className="tool-field">
                  <label className="tool-label">Target Primary Keyword</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      className="tool-input flex-1"
                      placeholder="Enter target keyword (optional)"
                      value={targetKeyword}
                      onChange={(e) => setTargetKeyword(e.target.value)}
                    />
                    {targetKeyword.trim() && (
                      <div className="bg-gray-100 rounded-lg px-4 h-11.5 min-w-33 flex items-center justify-center gap-2">
                        <span
                          className={
                            targetDensityTone === "good"
                              ? "w-3 h-3 rounded-full bg-green-500"
                              : targetDensityTone === "high"
                                ? "w-3 h-3 rounded-full bg-red-500"
                                : targetDensityTone === "low"
                                  ? "w-3 h-3 rounded-full bg-gray-300"
                                  : "w-3 h-3 rounded-full bg-gray-300"
                          }
                        />
                        <span className="text-sm font-semibold text-gray-700">{targetDensityPercent.toFixed(2)}%</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="tool-field">
                  <textarea
                    ref={textareaRef}
                    className="tool-textarea"
                    rows={14}
                    placeholder="Start typing or paste your content here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    style={textFocusHighlight ? { minHeight: "460px", outline: "2px solid #6366f1", backgroundColor: "#f5f3ff" } : { minHeight: "460px" }}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" className={mode === 1 ? "action-btn" : "clear-btn"} onClick={() => setMode(1)}>1-Word</button>
                  <button type="button" className={mode === 2 ? "action-btn" : "clear-btn"} onClick={() => setMode(2)}>2-Words</button>
                  <button type="button" className={mode === 3 ? "action-btn" : "clear-btn"} onClick={() => setMode(3)}>3-Words</button>
                  <div className="ml-auto flex items-center gap-2">
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={excludeStops}
                        onChange={(e) => setExcludeStops(e.target.checked)}
                      />
                      Exclude Common Words
                    </label>
                    <button
                      type="button"
                      className="p-1 text-gray-600 hover:text-gray-800"
                      onClick={() => setShowExclusionSettings((v) => !v)}
                      aria-label="Exclusion settings"
                      title="Exclusion settings"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {showExclusionSettings && (
                  <div className="mt-4 border border-dashed border-blue-300 rounded-lg bg-blue-50/40 p-4">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <h3 className="tool-label">Exclusion List (Comma Separated)</h3>
                      <button
                        type="button"
                        className="text-sm text-blue-600 hover:text-blue-700"
                        onClick={() => setExclusionListText(DEFAULT_STOP_WORDS.join(", "))}
                      >
                        Reset to Defaults
                      </button>
                    </div>
                    <textarea
                      className="tool-textarea"
                      rows={4}
                      value={exclusionListText}
                      onChange={(e) => setExclusionListText(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <aside className="tool-preview">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="rounded-xl p-4 bg-blue-50/80">
                    <div className="text-gray-500 font-normal">Total Words</div>
                    <div className="text-2xl leading-8 font-semibold text-blue-700">{totalWords}</div>
                  </div>
                  <div className="rounded-xl p-4 bg-green-50/80">
                    <div className="text-gray-500 font-normal">Unique</div>
                    <div className="text-2xl leading-8 font-semibold text-green-700">{uniqueWords}</div>
                  </div>
                </div>

                {densityRecommendation && (
                  <div className="mb-4 bg-indigo-600 rounded-[0.5em] p-4 text-white">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-indigo-500 rounded-full text-xs inline-flex items-center justify-center shrink-0">i</div>
                      <div className="text-sm text-indigo-100 leading-normal">{densityRecommendation}</div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="rounded-xl p-4 bg-slate-50">
                    <div className="text-gray-500 font-normal">Sentences</div>
                    <div className="text-2xl leading-8 font-semibold text-slate-700">{readabilityStats.sentenceCount}</div>
                  </div>
                  <div className="rounded-xl p-4 bg-slate-50">
                    <div className="text-gray-500 font-normal">Reading Time</div>
                    <div className="text-2xl leading-8 font-semibold text-slate-700">{readabilityStats.readingTimeMinutes}m</div>
                  </div>
                  <div className="rounded-xl p-4 bg-slate-50 col-span-2">
                    <div className="text-gray-500 font-normal">Average Sentence Length</div>
                    <div className="text-2xl leading-8 font-semibold text-slate-700">{readabilityStats.averageSentenceLength} words</div>
                  </div>
                </div>

                {keywordLocationChecks && (
                  <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4">
                    <h3 className="tool-section-title mb-3">Target Keyword Placement</h3>
                    <div className="space-y-2 text-sm">
                      {[
                        ["Title", keywordLocationChecks.title],
                        ["H1", keywordLocationChecks.h1],
                        ["First paragraph", keywordLocationChecks.firstParagraph],
                      ].map(([label, ok]) => (
                        <div key={String(label)} className="flex items-center justify-between gap-3">
                          <span>{label}</span>
                          <span className={ok ? "text-green-700" : "text-amber-700"}>{ok ? "Found" : "Not found"}</span>
                        </div>
                      ))}
                    </div>
                    {!keywordLocationChecks.hasHtmlSignals && (
                      <p className="mt-3 text-xs text-gray-500">Paste full HTML or include title, H1, and paragraph fields for more precise placement checks.</p>
                    )}
                  </div>
                )}

                {targetKeyword.trim() && targetOccurrences.length > 0 && (
                  <div className="mb-4 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <h3 className="tool-section-title mb-0">Occurrences</h3>
                      <span className="text-sm text-indigo-700">{targetOccurrences.length} found</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {targetOccurrences.slice(0, 30).map((occurrence, idx) => (
                        <button
                          type="button"
                          key={`${occurrence.start}-${idx}`}
                          className="px-3 py-1 rounded-full bg-white border border-indigo-200 text-sm text-indigo-700 hover:bg-indigo-100"
                          onClick={() => handleFocusTerm(targetKeyword, idx)}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mb-2 px-1">
                  <h3 className="tool-section-title">Keyword Distribution</h3>
                  <div className="text-sm">
                    <label className="text-gray-500 mr-1">Limit:</label>
                    <select
                      className="border border-gray-200 rounded px-2 py-1"
                      value={limit}
                      onChange={(e) => setLimit(Number(e.target.value))}
                    >
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                </div>

                <div className="border border-gray-300 rounded overflow-hidden">
                  <div className="max-h-96 overflow-auto">
                    {visibleItems.length === 0 ? (
                      <div className="p-6 text-center text-gray-400">Waiting for content...</div>
                    ) : (
                      <table className="w-full text-sm table-fixed">
                        <colgroup>
                          <col style={{ width: "60%" }} />
                          <col style={{ width: "20%" }} />
                          <col style={{ width: "20%" }} />
                        </colgroup>
                        <tbody>
                          {visibleItems.map((item) => (
                            <tr key={item.term} className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => handleFocusTerm(item.term)}>
                              <td className="px-3 py-2">
                                <div className="flex flex-col">
                                  <span className="font-normal text-gray-800 break-all">{item.term}</span>
                                  <div className="flex items-center gap-2 mt-1">
                                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full ${densityHeatColor(item.density)}`}
                                        style={{ width: `${densityBarWidth(item.density)}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                <span className={item.density > 4 ? "text-red-600" : item.density > 2.5 ? "text-amber-600" : "text-indigo-600"}>
                                  {item.density.toFixed(2)}%
                                </span>
                              </td>
                              <td className="px-3 py-2 text-right font-semibold text-gray-600">{item.count}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
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
              <div className="pb-6 text-lg text-secondary leading-relaxed space-y-3">{item.a}</div>
            </details>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <RelatedTools exclude="/keyword-density-checker" />
        </div>
      </section>
    </>
  )
}

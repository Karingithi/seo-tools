export type DensityItem = {
  term: string
  count: number
  density: number
}

export function stripHtml(value: string): string {
  return value.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ")
}

export function toTokens(text: string): string[] {
  return stripHtml(text)
    .toLocaleLowerCase()
    .match(/[\p{L}\p{N}]+(?:['’.-][\p{L}\p{N}]+)*/gu) || []
}

export function buildNgrams(tokens: string[], n: number, excludeStops: boolean, stopWords: Set<string>): string[] {
  if (n <= 0 || tokens.length < n) return []
  const grams: string[] = []
  for (let i = 0; i <= tokens.length - n; i++) {
    const chunk = tokens.slice(i, i + n)
    if (excludeStops && chunk.every((token) => stopWords.has(token))) continue
    grams.push(chunk.join(" "))
  }
  return grams
}

export function toDensityItems(grams: string[], totalWords: number): DensityItem[] {
  const counts = new Map<string, number>()
  for (const g of grams) counts.set(g, (counts.get(g) || 0) + 1)
  const total = totalWords || 1
  return Array.from(counts.entries())
    .map(([term, count]) => ({ term, count, density: (count / total) * 100 }))
    .sort((a, b) => b.count - a.count || a.term.localeCompare(b.term))
}

export function getReadabilityStats(text: string): {
  wordCount: number
  sentenceCount: number
  readingTimeMinutes: number
  averageSentenceLength: number
} {
  const tokens = toTokens(text)
  const plain = stripHtml(text).trim()
  const sentences = plain ? plain.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean) : []
  const sentenceCount = Math.max(sentences.length, tokens.length ? 1 : 0)
  return {
    wordCount: tokens.length,
    sentenceCount,
    readingTimeMinutes: Math.max(1, Math.ceil(tokens.length / 200)),
    averageSentenceLength: sentenceCount ? Number((tokens.length / sentenceCount).toFixed(1)) : 0,
  }
}

export function getHtmlSectionText(html: string, tagName: string): string {
  const match = html.match(new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i"))
  return match ? stripHtml(match[1]).trim() : ""
}

export function findTermOccurrences(text: string, term: string): Array<{ start: number; end: number }> {
  const target = term.trim()
  if (!target) return []
  const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  return Array.from(text.matchAll(new RegExp(escaped, "giu"))).map((match) => ({
    start: match.index || 0,
    end: (match.index || 0) + match[0].length,
  }))
}

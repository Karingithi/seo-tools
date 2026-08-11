export type HreflangEntry = {
  id: string
  url: string
  hreflang: string // e.g. "en", "en-US", "x-default"
}

export type HreflangIssue = {
  level: "error" | "warning"
  message: string
}

export function isValidAbsoluteHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value)
    return parsed.protocol === "http:" || parsed.protocol === "https:"
  } catch {
    return false
  }
}

// hreflang values are either "x-default", a bare ISO 639-1 language code, or
// language-REGION (BCP 47 subset actually used by Google: xx or xx-XX).
export function isValidHreflangValue(value: string): boolean {
  if (value === "x-default") return true
  return /^[a-z]{2,3}(-[A-Za-z]{2})?$/.test(value.trim())
}

export function normalizeHreflangValue(value: string): string {
  const trimmed = value.trim()
  if (trimmed.toLowerCase() === "x-default") return "x-default"
  const parts = trimmed.split("-")
  if (parts.length === 1) return parts[0].toLowerCase()
  return `${parts[0].toLowerCase()}-${parts[1].toUpperCase()}`
}

export function buildHreflangTags(entries: HreflangEntry[]): string {
  const valid = entries.filter((e) => e.url.trim() && isValidHreflangValue(e.hreflang))
  if (!valid.length) return ""
  return valid
    .map((e) => `<link rel="alternate" hreflang="${e.hreflang}" href="${e.url.trim()}" />`)
    .join("\n")
}

// Sitemap-embedded form: each URL's <url> block carries xhtml:link entries
// for every alternate, including itself — required by Google for sitemaps.
export function buildHreflangSitemapXml(entries: HreflangEntry[]): string {
  const valid = entries.filter((e) => e.url.trim() && isValidHreflangValue(e.hreflang))
  if (!valid.length) return ""

  const alternatesBlock = valid
    .map((e) => `    <xhtml:link rel="alternate" hreflang="${e.hreflang}" href="${e.url.trim()}" />`)
    .join("\n")

  const urlBlocks = valid
    .map(
      (e) => `  <url>
    <loc>${e.url.trim()}</loc>
${alternatesBlock}
  </url>`
    )
    .join("\n")

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlBlocks}
</urlset>`
}

export function validateHreflangEntries(entries: HreflangEntry[]): HreflangIssue[] {
  const issues: HreflangIssue[] = []
  const nonEmpty = entries.filter((e) => e.url.trim() || e.hreflang.trim())

  if (nonEmpty.length === 0) return issues
  if (nonEmpty.length === 1) {
    issues.push({ level: "warning", message: "Only one entry was added. Hreflang is meant to link multiple language/region versions of a page together." })
  }

  const seenHreflang = new Map<string, number>()
  const seenUrl = new Map<string, number>()
  let hasXDefault = false

  for (const entry of nonEmpty) {
    const url = entry.url.trim()
    const hreflang = entry.hreflang.trim()

    if (!url) {
      issues.push({ level: "error", message: `Missing URL for hreflang "${hreflang || "(empty)"}".` })
      continue
    }
    if (!isValidAbsoluteHttpUrl(url)) {
      issues.push({ level: "error", message: `"${url}" is not a valid absolute http(s) URL.` })
    }
    if (!hreflang) {
      issues.push({ level: "error", message: `Missing hreflang value for ${url}.` })
      continue
    }
    if (!isValidHreflangValue(hreflang)) {
      issues.push({ level: "error", message: `"${hreflang}" is not a valid hreflang value. Use a language code (en), language-REGION (en-US), or x-default.` })
    }
    if (hreflang.toLowerCase() === "x-default") hasXDefault = true

    const normalized = normalizeHreflangValue(hreflang)
    seenHreflang.set(normalized, (seenHreflang.get(normalized) || 0) + 1)
    seenUrl.set(url, (seenUrl.get(url) || 0) + 1)
  }

  for (const [value, count] of seenHreflang) {
    if (count > 1) issues.push({ level: "error", message: `hreflang="${value}" is used ${count} times. Each language/region value should point to exactly one URL.` })
  }
  for (const [url, count] of seenUrl) {
    if (count > 1) issues.push({ level: "warning", message: `${url} is used for ${count} different hreflang values. Each URL should normally represent a single language/region.` })
  }
  if (!hasXDefault && nonEmpty.length > 1) {
    issues.push({ level: "warning", message: "No x-default entry set. Consider adding one to catch visitors whose language/region doesn't match any listed version." })
  }

  return issues
}

let idCounter = 0
export function createHreflangEntry(url = "", hreflang = ""): HreflangEntry {
  idCounter += 1
  return { id: `hreflang-${Date.now()}-${idCounter}`, url, hreflang }
}

// Parses existing hreflang <link> tags out of pasted HTML (mirrors
// extractCanonicalTagsFromHtml in canonicalUtils.ts).
export function extractHreflangTagsFromHtml(html: string): HreflangEntry[] {
  const matches = Array.from(html.matchAll(/<link\b[^>]*rel=["']alternate["'][^>]*>/gi))
  return matches
    .map((match) => {
      const tag = match[0]
      const href = tag.match(/\bhref=["']([^"']+)["']/i)?.[1]
      const hreflang = tag.match(/\bhreflang=["']([^"']+)["']/i)?.[1]
      if (!href || !hreflang) return null
      return createHreflangEntry(href, hreflang)
    })
    .filter((e): e is HreflangEntry => e !== null)
}

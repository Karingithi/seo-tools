import { parseSitemapXml } from "./sitemapUtils"

export type PageEntry = {
  id: string
  url: string
  title: string
  description: string
  section: string
  included: boolean
}

export type SiteInfo = {
  name: string
  summary: string
}

export type LlmsTxtData = {
  siteInfo: SiteInfo
  pages: PageEntry[]
}

export type ProgressCallback = (msg: string) => void

export const MAX_URLS = Number.POSITIVE_INFINITY

// ── Fetch helpers ─────────────────────────────────────────────────────────────

const API_URL = import.meta.env.VITE_API_URL as string | undefined

async function tryFetchText(url: string, ms = 8000): Promise<string> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(ms),
    headers: { Accept: "application/xml, text/xml, text/html, */*" },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.text()
}

/** Race direct + CORS proxies simultaneously; return first success. */
async function fetchFast(targetUrl: string): Promise<string> {
  // Backend endpoint (optional, most reliable)
  const backendAttempt = API_URL
    ? fetch(`${API_URL}/fetch-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl, method: "GET", timeoutMs: 8000 }),
        signal: AbortSignal.timeout(10000),
      }).then(async (r) => {
        if (!r.ok) throw new Error(`backend ${r.status}`)
        const body = await r.json() as { text?: string }
        if (!body.text?.trim()) throw new Error("backend: empty")
        return body.text
      })
    : null

  const attempts: Array<Promise<string>> = [
    tryFetchText(targetUrl, 6000),
    tryFetchText(`https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`, 9000),
    tryFetchText(`https://corsproxy.io/?${encodeURIComponent(targetUrl)}`, 9000),
    tryFetchText(`https://thingproxy.freeboard.io/fetch/${targetUrl}`, 9000),
  ]
  if (backendAttempt) attempts.unshift(backendAttempt)

  return Promise.any(attempts)
}

// ── URL helpers ───────────────────────────────────────────────────────────────

export function extractBaseUrl(url: string): string {
  try { const u = new URL(url); return `${u.protocol}//${u.host}` }
  catch { return "" }
}

export function isValidAbsoluteUrl(url: string): boolean {
  try { const u = new URL(url); return u.protocol === "http:" || u.protocol === "https:" }
  catch { return false }
}

function sameHost(a: string, b: string): boolean {
  try {
    const norm = (h: string) => h.replace(/^www\./, "").toLowerCase()
    return norm(new URL(a).hostname) === norm(new URL(b).hostname)
  } catch { return false }
}

function extractTitle(html: string): string {
  const improved = extractPageTitle(html)
  if (improved) return improved
  const og = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']{1,120})["']/i)
  if (og) return og[1].trim()
  const t = html.match(/<title[^>]*>([^<]{1,120})<\/title>/i)
  if (t) return t[1].replace(/\s*[|\-–—].*$/, "").trim()
  return ""
}

function extractDescription(html: string): string {
  const improved = extractPageDescription(html)
  if (improved) return improved
  const d = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']{1,220})["']/i)
  if (d) return d[1].trim()
  const og = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']{1,220})["']/i)
  if (og) return og[1].trim()
  return ""
}

function decodeHtml(value: string): string {
  const named: Record<string, string> = {
    amp: "&",
    apos: "'",
    hellip: "...",
    nbsp: " ",
    ndash: "-",
    mdash: "-",
    quot: "\"",
  }
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([a-f0-9]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (match, key) => named[key.toLowerCase()] || match)
    .replace(/\s+/g, " ")
    .trim()
}

function getMetaContent(html: string, attr: "name" | "property", value: string, max = 700): string {
  const tags = html.match(/<meta\b[^>]*>/gi) || []
  for (const tag of tags) {
    const attrMatch = tag.match(new RegExp(`${attr}=["']${value}["']`, "i"))
    if (!attrMatch) continue
    const content = tag.match(/content=["']([^"']+)["']/i)?.[1]
    if (content) return decodeHtml(content).slice(0, max).trim()
  }
  return ""
}

function cleanTitle(title: string): string {
  return decodeHtml(title)
    .replace(/\s*[|\-–—]\s*[^|\-–—]{2,80}$/, "")
    .replace(/\s+/g, " ")
    .trim()
}

function extractPageTitle(html: string): string {
  return cleanTitle(
    getMetaContent(html, "property", "og:title", 140) ||
    html.match(/<title[^>]*>([^<]{1,160})<\/title>/i)?.[1] ||
    ""
  )
}

function extractPageDescription(html: string): string {
  return (
    getMetaContent(html, "name", "description", 700) ||
    getMetaContent(html, "property", "og:description", 700)
  ).replace(/\s+/g, " ").trim()
}

function extractSiteName(html: string, base: string): string {
  return (
    getMetaContent(html, "property", "og:site_name", 80) ||
    extractPageTitle(html) ||
    new URL(base).hostname.replace(/^www\./, "")
  )
}

function titleFromPath(url: string): string {
  try {
    const { pathname } = new URL(url)
    if (pathname === "/" || pathname === "") return "Home"
    const last = pathname.replace(/\/$/, "").split("/").filter(Boolean).pop() || ""
    if (last === "sitemap_index.xml" || last === "sitemap.xml") return "XML Sitemap"
    if (last === "post-sitemap.xml") return "Post Sitemap"
    if (last === "page-sitemap.xml") return "Page Sitemap"
    if (last === "portfolio-sitemap.xml") return "Portfolio Sitemap"
    if (last === "category-sitemap.xml") return "Category Sitemap"
    if (last === "llms-full.txt") return "llms-full.txt"
    if (last === "llms.txt") return "llms.txt"
    return last
      .replace(/[-_]/g, " ")
      .replace(/\.[^.]+$/, "")
      .replace(/\b\w/g, (c) => c.toUpperCase())
  } catch { return "" }
}

export function categorizeUrl(url: string): string {
  const path = (() => { try { return new URL(url).pathname.toLowerCase() } catch { return "" } })()
  const filename = path.split("/").filter(Boolean).pop() || ""
  if (path === "/" || path === "") return "Pages"
  if (/^llms(-full)?\.txt$/i.test(filename)) return "LLM Resources"
  if (/sitemap.*\.xml$|\.xml$/i.test(path)) return "Sitemaps"
  if (/\/topics?\//.test(path) || /\/categor(y|ies)\//.test(path)) return "Categories"
  if (/\/portfolio\/.+/.test(path)) return "Portfolio"
  if (/\/(blog|news|articles?|posts?)\/.+/.test(path)) return "Posts"
  return "Pages"
}

function descriptionFromUrl(url: string, title: string): string {
  const section = categorizeUrl(url)
  if (section === "Pages") {
    try {
      const { pathname } = new URL(url)
      if (pathname === "/" || pathname === "") return "Homepage and primary site entry point."
    } catch {}
  }
  if (section === "LLM Resources") {
    return title.toLowerCase().includes("full")
      ? "Expanded LLM-readable content file for deeper site context."
      : "Primary LLM-readable summary file for this site."
  }
  if (section === "Sitemaps") {
    const lower = title.toLowerCase()
    if (lower.includes("post")) return "Blog post URL index."
    if (lower.includes("page")) return "Core page URL index."
    if (lower.includes("category")) return "Topic and category URL index."
    if (lower.includes("portfolio")) return "Portfolio and project URL index."
    return "Includes all crawlable and indexable pages."
  }
  if (section === "Portfolio") return `Project or portfolio page for ${title}.`
  if (section === "Posts") return `Article about ${title}.`
  if (section === "Categories") return `Topic archive for ${title}.`
  return `Reference page for ${title}.`
}

function shouldKeepMetaDescription(description: string): boolean {
  if (!description.trim()) return false
  if (description.length > 170) return false
  return !/(unlock|discover|explore|elevate|transform|boost|supercharge|comprehensive|expert|best-in-class|cutting-edge)/i.test(description)
}

function scoreUrl(url: string): number {
  try {
    const { pathname } = new URL(url)
    const path = pathname.toLowerCase()
    let score = 0
    if (path === "/" || path === "") score += 1000
    if (/\/llms-full\.txt$/i.test(path)) score += 940
    if (/\/llms\.txt$/i.test(path)) score += 930
    if (/sitemap.*\.xml$|\.xml$/i.test(path)) score += 850
    if (/\/(services?|solutions?|products?)\b/.test(path)) score += 760
    if (/\/(portfolio|projects?|case-stud)/.test(path)) score += 720
    if (/\/(about|contact|company|team)\b/.test(path)) score += 650
    if (/\/(pricing|plans?)\b/.test(path)) score += 640
    if (/\/(blog|articles?|posts?)\b/.test(path)) score += 420
    score -= Math.min(path.split("/").filter(Boolean).length * 20, 120)
    if (/\?(.)/.test(url)) score -= 200
    return score
  } catch {
    return 0
  }
}

function prioritizeUrls(urls: string[], base: string): string[] {
  const normalized = new Map<string, string>()
  for (const url of [base, ...urls]) {
    try {
      const u = new URL(url)
      u.hash = ""
      const key = u.href.replace(/\/$/, "")
      if (!normalized.has(key)) normalized.set(key, u.href)
    } catch {}
  }
  return [...normalized.values()]
    .filter((url) => sameHost(url, base))
    .sort((a, b) => scoreUrl(b) - scoreUrl(a))
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  mapper: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = []
  let next = 0
  async function worker() {
    while (next < items.length) {
      const index = next++
      results[index] = await mapper(items[index], index)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return results
}

// ── Sitemap discovery & parsing ───────────────────────────────────────────────

async function findSitemapUrl(base: string): Promise<string | null> {
  // 1. robots.txt Sitemap: directive
  try {
    const robots = await fetchFast(`${base}/robots.txt`)
    const match = robots.match(/^Sitemap:\s*(.+)$/im)
    if (match) {
      const u = match[1].trim()
      if (isValidAbsoluteUrl(u)) return u
    }
  } catch {}

  // 2. Common paths — race all candidates at once
  const candidates = [
    `${base}/sitemap.xml`,
    `${base}/sitemap_index.xml`,
    `${base}/sitemap/sitemap.xml`,
    `${base}/wp-sitemap.xml`,
  ]
  const results = await Promise.allSettled(
    candidates.map(async (c) => {
      const txt = await fetchFast(c)
      if (!/<(urlset|sitemapindex|loc)[\s>]/i.test(txt)) throw new Error("not a sitemap")
      return c
    })
  )
  for (const r of results) {
    if (r.status === "fulfilled") return r.value
  }
  return null
}

export async function parseSitemapFromUrl(sitemapUrl: string, base: string): Promise<string[]> {
  const collected: string[] = []
  const seen = new Set<string>()

  async function fetchOne(url: string, depth = 0): Promise<void> {
    if (depth > 5) return
    let xml: string
    try { xml = await fetchFast(url) } catch { return }
    let result
    try { result = parseSitemapXml(xml) } catch { return }

    if (result.type === "sitemapindex") {
      for (const child of result.childSitemaps) {
        if (!sameHost(child, base) || seen.has(child)) continue
        seen.add(child)
        collected.push(child)
      }
      await Promise.all(
        result.childSitemaps.map((child) => fetchOne(child, depth + 1))
      )
    } else {
      for (const entry of result.entries) {
        if (!entry.loc || seen.has(entry.loc)) continue
        if (!sameHost(entry.loc, base)) continue
        seen.add(entry.loc)
        collected.push(entry.loc)
      }
    }
  }

  await fetchOne(sitemapUrl)
  return collected
}

// ── Main entry ────────────────────────────────────────────────────────────────

let _id = 0
const uid = () => `p${++_id}`

export async function generateLlmsTxtData(
  rawUrl: string,
  manualSitemapUrl: string,
  onProgress: ProgressCallback
): Promise<LlmsTxtData> {
  const base = extractBaseUrl(rawUrl)
  if (!base) throw new Error("Invalid URL")

  // Step 1: homepage info (name + summary)
  onProgress("Fetching homepage info…")
  const homeHtml = await fetchFast(rawUrl).catch(() => "")
  const siteName = homeHtml ? extractSiteName(homeHtml, base) : new URL(base).hostname.replace(/^www\./, "")
  const homeDescription = extractDescription(homeHtml)
  const summary = (
    shouldKeepMetaDescription(homeDescription)
      ? homeDescription
      : `Official website for ${siteName}.`
  ).slice(0, 150)

  // Step 2: resolve sitemap URL
  let sitemapUrl = manualSitemapUrl.trim() || null
  if (!sitemapUrl) {
    onProgress("Discovering sitemap…")
    sitemapUrl = await findSitemapUrl(base)
  }

  // Step 3: parse sitemap URLs
  let urls: string[] = []
  if (sitemapUrl) {
    onProgress("Parsing sitemap…")
    urls = [sitemapUrl, ...await parseSitemapFromUrl(sitemapUrl, base)]
  }

  onProgress("Checking LLM resource files...")
  const llmResourceUrls = await Promise.all(
    [`${base}/llms-full.txt`, `${base}/llms.txt`].map(async (url) => {
      const text = await fetchFast(url).catch(() => "")
      return text.trim() ? url : ""
    })
  )
  urls = [...llmResourceUrls.filter(Boolean), ...urls]

  urls = prioritizeUrls(urls.length > 0 ? urls : [rawUrl], base)

  // Step 4: fetch page metadata for richer titles/descriptions, with URL-based fallbacks.
  onProgress(`Reading page titles and descriptions for ${urls.length} URLs...`)
  const pages: PageEntry[] = await mapWithConcurrency(urls, 4, async (url) => {
    const fallbackTitle = titleFromPath(url)
    const section = categorizeUrl(url)
    const shouldFetch = section !== "Sitemaps" && section !== "LLM Resources"
    const html = shouldFetch ? await fetchFast(url).catch(() => "") : ""
    const title = extractTitle(html) || fallbackTitle
    const metaDescription = extractDescription(html)
    const description = metaDescription || descriptionFromUrl(url, title)

    return {
      id: uid(),
      url,
      title: title === "Home" ? siteName : title,
      description: description.slice(0, 700),
      section,
      included: true,
    }
  })

  return { siteInfo: { name: siteName, summary }, pages }
}

// ── llms.txt builder ──────────────────────────────────────────────────────────

const SECTION_ORDER = [
  "LLM Resources", "Sitemaps", "Posts", "Pages", "Portfolio", "Categories",
]

export function buildLlmsTxt(siteInfo: SiteInfo, pages: PageEntry[]): string {
  const lines: string[] = []
  lines.push("Generated by Cralite Digital, this is an llms.txt file designed to help LLMs better understand and index this website.")
  lines.push("")
  lines.push(`# ${siteInfo.name.trim() || "Site Name"}`)
  lines.push("")
  if (siteInfo.summary.trim()) {
    lines.push(`> ${siteInfo.summary.trim()}`)
    lines.push("")
  }

  const included = pages.filter((p) => p.included)
  const grouped = new Map<string, PageEntry[]>()
  for (const p of included) {
    const sec = p.section || "Docs"
    if (!grouped.has(sec)) grouped.set(sec, [])
    grouped.get(sec)!.push(p)
  }

  const sections = [
    ...SECTION_ORDER.filter((s) => grouped.has(s)),
    ...[...grouped.keys()].filter((s) => !SECTION_ORDER.includes(s)),
  ]

  for (const section of sections) {
    lines.push(`## ${section}`)
    lines.push("")
    for (const p of grouped.get(section)!) {
      const label = p.title.trim() || p.url
      const desc = p.description.trim() ? `: ${p.description.trim()}` : ""
      const prefix = section === "Sitemaps" ? "" : "- "
      lines.push(`${prefix}[${label}](${p.url})${desc}`)
    }
    lines.push("")
  }

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd()
}

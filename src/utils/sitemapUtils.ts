export type SitemapEntry = {
  loc: string
  lastmod?: string
  changefreq?: string
  priority?: string
  valid: boolean
  status?: "unknown" | "valid" | "broken" | "skipped" | "redirect"
  statusCode?: number | null
  warnings: string[]
}

export type SitemapParseResult = {
  entries: SitemapEntry[]
  childSitemaps: string[]
  type: "urlset" | "sitemapindex" | "unknown"
}

function getTagValue(block: string, tag: string): string {
  return block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"))?.[1]?.trim() || ""
}

export function isValidUrl(value: string): boolean {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

export function parseSitemapXml(text: string): SitemapParseResult {
  if (!text.trim()) return { entries: [], childSitemaps: [], type: "unknown" }
  if (/<html[\s>]/i.test(text)) throw new Error("Fetched content appears to be HTML, not XML.")
  if (!/<(urlset|sitemapindex)[\s>]/i.test(text) && !/<loc[\s>]/i.test(text)) throw new Error("No sitemap URLs were found.")

  const childSitemaps = Array.from(text.matchAll(/<sitemap\b[^>]*>([\s\S]*?)<\/sitemap>/gi))
    .map((match) => getTagValue(match[1], "loc"))
    .filter(Boolean)

  if (childSitemaps.length > 0) {
    return { entries: [], childSitemaps, type: "sitemapindex" }
  }

  const entries = Array.from(text.matchAll(/<url\b[^>]*>([\s\S]*?)<\/url>/gi))
    .map((match) => {
      const block = match[1]
      const loc = getTagValue(block, "loc")
      return {
        loc,
        lastmod: getTagValue(block, "lastmod") || undefined,
        changefreq: getTagValue(block, "changefreq") || undefined,
        priority: getTagValue(block, "priority") || undefined,
        valid: isValidUrl(loc),
        status: "unknown" as const,
        statusCode: null,
        warnings: [] as string[],
      }
    })
    .filter((entry) => entry.loc)

  if (entries.length === 0) {
    const locs = Array.from(text.matchAll(/<loc[^>]*>([\s\S]*?)<\/loc>/gi)).map((match) => match[1].trim())
    return {
      entries: locs.map((loc) => ({ loc, valid: isValidUrl(loc), status: "unknown", statusCode: null, warnings: [] })),
      childSitemaps: [],
      type: "unknown",
    }
  }

  return { entries, childSitemaps: [], type: "urlset" }
}

export function applySitemapWarnings(entries: SitemapEntry[]): SitemapEntry[] {
  const counts = new Map<string, number>()
  const protocolsByHost = new Map<string, Set<string>>()

  entries.forEach((entry) => {
    counts.set(entry.loc, (counts.get(entry.loc) || 0) + 1)
    try {
      const url = new URL(entry.loc)
      const protocols = protocolsByHost.get(url.hostname) || new Set<string>()
      protocols.add(url.protocol)
      protocolsByHost.set(url.hostname, protocols)
    } catch {}
  })

  return entries.map((entry) => {
    const warnings = new Set(entry.warnings)
    if (!entry.valid) warnings.add("Invalid URL.")
    if ((counts.get(entry.loc) || 0) > 1) warnings.add("Duplicate URL.")
    try {
      const url = new URL(entry.loc)
      if ((protocolsByHost.get(url.hostname)?.size || 0) > 1) warnings.add("Mixed HTTP/HTTPS variants for this host.")
      if (url.protocol !== "https:") warnings.add("Non-HTTPS URL.")
      if (url.search) warnings.add("URL contains query parameters.")
      if (url.hash) warnings.add("URL contains a fragment.")
      if (url.hostname !== url.hostname.toLowerCase() || url.pathname !== url.pathname.toLowerCase()) warnings.add("URL casing may create duplicate variants.")
      if (entry.status === "redirect" || (entry.statusCode && entry.statusCode >= 300 && entry.statusCode < 400)) warnings.add("URL redirects; sitemap should usually list the final canonical URL.")
    } catch {}
    return { ...entry, warnings: Array.from(warnings) }
  })
}

export function sitemapEntriesToCsv(entries: SitemapEntry[]): string {
  const escapeCsv = (value: string | number | null | undefined) => {
    const text = String(value ?? "")
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
  }
  return [
    ["URL", "Status", "Status Code", "Last Modified", "Changefreq", "Priority", "Warnings"].join(","),
    ...entries.map((entry) => [
      entry.loc,
      entry.status || "unknown",
      entry.statusCode ?? "",
      entry.lastmod || "",
      entry.changefreq || "",
      entry.priority || "",
      entry.warnings.join("; "),
    ].map(escapeCsv).join(",")),
  ].join("\n")
}

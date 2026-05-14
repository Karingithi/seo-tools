export type CanonicalOptions = {
  addTrailingSlash: boolean
  forceLowercase: boolean
  stripQueryParams: boolean
  forceHttps: boolean
  removeWww: boolean
  removeFragments: boolean
}

export type CanonicalResult = {
  input: string
  output: string
  warnings: string[]
}

export function isValidAbsoluteHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value)
    return parsed.protocol === "http:" || parsed.protocol === "https:"
  } catch {
    return false
  }
}

export function normalizeCanonicalUrl(input: string, options: CanonicalOptions): CanonicalResult {
  const original = new URL(input.trim())
  const parsed = new URL(input.trim())
  const warnings: string[] = []

  if (options.forceHttps && parsed.protocol !== "https:") {
    parsed.protocol = "https:"
    warnings.push("Protocol changed to HTTPS.")
  }

  if (options.stripQueryParams && parsed.search) {
    parsed.search = ""
    warnings.push("Query parameters were dropped.")
  }

  if (options.removeFragments && parsed.hash) {
    parsed.hash = ""
    warnings.push("URL fragment was removed.")
  }

  if (options.removeWww && parsed.hostname.toLowerCase().startsWith("www.")) {
    parsed.hostname = parsed.hostname.slice(4)
    warnings.push("WWW subdomain was removed.")
  }

  if (options.forceLowercase) {
    const nextHostname = parsed.hostname.toLowerCase()
    const nextPathname = parsed.pathname
      .split("/")
      .map((p) => p.toLowerCase())
      .join("/")
    if (parsed.hostname !== nextHostname || parsed.pathname !== nextPathname) {
      warnings.push("Hostname or path casing was changed.")
    }
    parsed.hostname = nextHostname
    parsed.pathname = nextPathname
  }

  if (options.addTrailingSlash && !parsed.pathname.endsWith("/")) {
    parsed.pathname = `${parsed.pathname}/`
    warnings.push("Trailing slash was added.")
  }

  if (!options.addTrailingSlash && original.pathname.endsWith("/") !== parsed.pathname.endsWith("/")) {
    warnings.push("Trailing slash changed.")
  }

  return {
    input,
    output: parsed.toString(),
    warnings,
  }
}

export function buildCanonicalTag(url: string): string {
  return `<link rel="canonical" href="${url}" />`
}

export function extractCanonicalTagsFromHtml(html: string): string[] {
  const matches = Array.from(
    html.matchAll(/<link\b[^>]*rel=["']canonical["'][^>]*>|<link\b[^>]*rel=canonical[^>]*>/gi)
  )

  return matches
    .map((match) => {
      const tag = match[0]
      const href = tag.match(/\bhref=["']([^"']+)["']/i)?.[1]
      return href || ""
    })
    .filter(Boolean)
}

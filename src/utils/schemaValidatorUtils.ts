export type ValidationIssue = {
  level: "error" | "warning"
  path: string // e.g. "[0].offers.price" or "@type"
  message: string
}

export type ParsedSchemaBlock = {
  raw: string
  data: unknown | null
  parseError: string | null
}

// Extracts every <script type="application/ld+json"> block from pasted HTML,
// or treats the whole input as raw JSON if no <script> tags are present.
export function extractJsonLdBlocks(input: string): ParsedSchemaBlock[] {
  const trimmed = input.trim()
  if (!trimmed) return []

  const scriptMatches = Array.from(
    trimmed.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)
  )

  const rawBlocks = scriptMatches.length > 0 ? scriptMatches.map((m) => m[1].trim()) : [trimmed]

  return rawBlocks
    .filter((raw) => raw.length > 0)
    .map((raw) => {
      try {
        return { raw, data: JSON.parse(raw), parseError: null }
      } catch (err) {
        return { raw, data: null, parseError: err instanceof Error ? err.message : "Invalid JSON" }
      }
    })
}

// Required/recommended fields per @type, based on Google's Rich Results
// requirements (not the full schema.org spec — schema.org itself requires
// almost nothing; Google's eligibility criteria are what actually matter
// for search features, so that's what this checks).
type FieldRule = { path: string; level: "error" | "warning"; message: string }

const RULES_BY_TYPE: Record<string, FieldRule[]> = {
  Article: [
    { path: "headline", level: "error", message: "Article requires \"headline\"." },
    { path: "image", level: "error", message: "Article requires \"image\"." },
    { path: "datePublished", level: "error", message: "Article requires \"datePublished\"." },
    { path: "author", level: "warning", message: "Article should include \"author\" for full rich result eligibility." },
  ],
  BlogPosting: [
    { path: "headline", level: "error", message: "BlogPosting requires \"headline\"." },
    { path: "image", level: "error", message: "BlogPosting requires \"image\"." },
    { path: "datePublished", level: "error", message: "BlogPosting requires \"datePublished\"." },
  ],
  NewsArticle: [
    { path: "headline", level: "error", message: "NewsArticle requires \"headline\"." },
    { path: "image", level: "error", message: "NewsArticle requires \"image\"." },
    { path: "datePublished", level: "error", message: "NewsArticle requires \"datePublished\"." },
  ],
  Product: [
    { path: "name", level: "error", message: "Product requires \"name\"." },
    { path: "image", level: "warning", message: "Product should include \"image\"." },
    { path: "offers", level: "warning", message: "Product should include \"offers\" (price/availability) for rich results." },
  ],
  Offer: [
    { path: "price", level: "error", message: "Offer requires \"price\"." },
    { path: "priceCurrency", level: "error", message: "Offer requires \"priceCurrency\" (ISO 4217, e.g. USD)." },
  ],
  AggregateOffer: [
    { path: "lowPrice", level: "error", message: "AggregateOffer requires \"lowPrice\"." },
    { path: "priceCurrency", level: "error", message: "AggregateOffer requires \"priceCurrency\"." },
  ],
  AggregateRating: [
    { path: "ratingValue", level: "error", message: "AggregateRating requires \"ratingValue\"." },
    { path: "reviewCount", level: "warning", message: "AggregateRating should include \"reviewCount\" or \"ratingCount\"." },
  ],
  Review: [
    { path: "reviewRating", level: "error", message: "Review requires \"reviewRating\"." },
    { path: "author", level: "error", message: "Review requires \"author\"." },
  ],
  FAQPage: [
    { path: "mainEntity", level: "error", message: "FAQPage requires \"mainEntity\" (an array of Question items)." },
  ],
  Question: [
    { path: "name", level: "error", message: "Question requires \"name\" (the question text)." },
    { path: "acceptedAnswer", level: "error", message: "Question requires \"acceptedAnswer\"." },
  ],
  HowTo: [
    { path: "name", level: "error", message: "HowTo requires \"name\"." },
    { path: "step", level: "error", message: "HowTo requires \"step\" (an array of HowToStep items)." },
  ],
  LocalBusiness: [
    { path: "name", level: "error", message: "LocalBusiness requires \"name\"." },
    { path: "address", level: "warning", message: "LocalBusiness should include \"address\"." },
  ],
  Organization: [
    { path: "name", level: "error", message: "Organization requires \"name\"." },
    { path: "url", level: "warning", message: "Organization should include \"url\"." },
  ],
  Person: [
    { path: "name", level: "error", message: "Person requires \"name\"." },
  ],
  JobPosting: [
    { path: "title", level: "error", message: "JobPosting requires \"title\"." },
    { path: "description", level: "error", message: "JobPosting requires \"description\"." },
    { path: "datePosted", level: "error", message: "JobPosting requires \"datePosted\"." },
    { path: "hiringOrganization", level: "error", message: "JobPosting requires \"hiringOrganization\"." },
    { path: "jobLocation", level: "warning", message: "JobPosting should include \"jobLocation\" unless remote." },
  ],
  Event: [
    { path: "name", level: "error", message: "Event requires \"name\"." },
    { path: "startDate", level: "error", message: "Event requires \"startDate\"." },
    { path: "location", level: "error", message: "Event requires \"location\"." },
  ],
  VideoObject: [
    { path: "name", level: "error", message: "VideoObject requires \"name\"." },
    { path: "description", level: "error", message: "VideoObject requires \"description\"." },
    { path: "thumbnailUrl", level: "error", message: "VideoObject requires \"thumbnailUrl\"." },
    { path: "uploadDate", level: "error", message: "VideoObject requires \"uploadDate\"." },
  ],
  BreadcrumbList: [
    { path: "itemListElement", level: "error", message: "BreadcrumbList requires \"itemListElement\" (an array of ListItem entries)." },
  ],
  WebSite: [
    { path: "url", level: "warning", message: "WebSite should include \"url\"." },
  ],
}

function getAtPath(obj: any, path: string): unknown {
  return path.split(".").reduce((acc, key) => (acc && typeof acc === "object" ? acc[key] : undefined), obj)
}

function isEmpty(value: unknown): boolean {
  if (value === undefined || value === null) return true
  if (typeof value === "string") return value.trim() === ""
  if (Array.isArray(value)) return value.length === 0
  return false
}

function validateNode(node: any, pathPrefix: string, issues: ValidationIssue[], isRoot: boolean) {
  if (!node || typeof node !== "object" || Array.isArray(node)) return

  const context = node["@context"]
  const type = node["@type"]

  // @context is only meaningful (and only ever set) on the outermost node of
  // a JSON-LD block — nested nodes (author, offers, mainEntity items, ...)
  // inherit it and legitimately never carry their own.
  if (isRoot) {
    if (context === undefined) {
      issues.push({ level: "error", path: `${pathPrefix}@context`, message: "Missing \"@context\". Add \"@context\": \"https://schema.org\"." })
    } else {
      const contextStr = typeof context === "string" ? context : ""
      if (!/^https?:\/\/schema\.org\/?$/i.test(contextStr)) {
        issues.push({ level: "warning", path: `${pathPrefix}@context`, message: `"@context" is "${contextStr}" — expected "https://schema.org".` })
      }
    }
  }

  if (type === undefined) {
    issues.push({ level: "error", path: `${pathPrefix}@type`, message: "Missing \"@type\". Every JSON-LD node needs a schema.org type." })
  } else {
    const types = Array.isArray(type) ? type : [type]
    for (const t of types) {
      const rules = RULES_BY_TYPE[String(t)]
      if (!rules) continue
      for (const rule of rules) {
        const value = getAtPath(node, rule.path)
        if (isEmpty(value)) {
          issues.push({ level: rule.level, path: `${pathPrefix}${rule.path}`, message: rule.message })
        }
      }
    }
  }

  // Recurse into nested objects/arrays (covers mainEntity, offers, author,
  // etc.) without needing a full schema.org type graph. Nested nodes are
  // never root, so they skip the @context check above.
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith("@")) continue
    if (Array.isArray(value)) {
      value.forEach((item, idx) => validateNode(item, `${pathPrefix}${key}[${idx}].`, issues, false))
    } else if (value && typeof value === "object") {
      validateNode(value, `${pathPrefix}${key}.`, issues, false)
    }
  }
}

export function validateSchemaBlock(data: unknown): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  if (Array.isArray(data)) {
    data.forEach((item, idx) => validateNode(item, `[${idx}].`, issues, true))
  } else {
    validateNode(data, "", issues, true)
  }
  return issues
}

export function detectTypes(data: unknown): string[] {
  const types = new Set<string>()
  const visit = (node: any) => {
    if (!node || typeof node !== "object") return
    if (Array.isArray(node)) {
      node.forEach(visit)
      return
    }
    const t = node["@type"]
    if (typeof t === "string") types.add(t)
    else if (Array.isArray(t)) t.forEach((x) => typeof x === "string" && types.add(x))
    for (const [key, value] of Object.entries(node)) {
      if (key.startsWith("@")) continue
      visit(value)
    }
  }
  visit(data)
  return Array.from(types)
}

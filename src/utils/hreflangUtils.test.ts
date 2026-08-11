import { describe, expect, it } from "vitest"
import {
  buildHreflangSitemapXml,
  buildHreflangTags,
  extractHreflangTagsFromHtml,
  isValidHreflangValue,
  normalizeHreflangValue,
  validateHreflangEntries,
  type HreflangEntry,
} from "./hreflangUtils"

describe("hreflangUtils", () => {
  it("validates hreflang value shapes", () => {
    expect(isValidHreflangValue("en")).toBe(true)
    expect(isValidHreflangValue("en-US")).toBe(true)
    expect(isValidHreflangValue("x-default")).toBe(true)
    expect(isValidHreflangValue("english")).toBe(false)
    expect(isValidHreflangValue("en_US")).toBe(false)
    expect(isValidHreflangValue("")).toBe(false)
  })

  it("normalizes casing to lang-REGION", () => {
    expect(normalizeHreflangValue("EN-us")).toBe("en-US")
    expect(normalizeHreflangValue("EN")).toBe("en")
    expect(normalizeHreflangValue("X-Default")).toBe("x-default")
  })

  it("builds hreflang link tags, skipping invalid rows", () => {
    const entries: HreflangEntry[] = [
      { id: "1", url: "https://example.com/en/", hreflang: "en" },
      { id: "2", url: "https://example.com/es/", hreflang: "es-ES" },
      { id: "3", url: "", hreflang: "fr" },
    ]
    expect(buildHreflangTags(entries)).toBe(
      '<link rel="alternate" hreflang="en" href="https://example.com/en/" />\n' +
        '<link rel="alternate" hreflang="es-ES" href="https://example.com/es/" />'
    )
  })

  it("builds a sitemap xhtml:link block with every alternate on each url", () => {
    const entries: HreflangEntry[] = [
      { id: "1", url: "https://example.com/en/", hreflang: "en" },
      { id: "2", url: "https://example.com/es/", hreflang: "es" },
    ]
    const xml = buildHreflangSitemapXml(entries)
    expect(xml).toContain('<loc>https://example.com/en/</loc>')
    expect(xml).toContain('<xhtml:link rel="alternate" hreflang="es" href="https://example.com/es/" />')
    // Each <url> block should list both alternates (including itself)
    expect(xml.match(/<xhtml:link/g)?.length).toBe(4)
  })

  it("flags duplicate hreflang values as an error", () => {
    const entries: HreflangEntry[] = [
      { id: "1", url: "https://example.com/en/", hreflang: "en" },
      { id: "2", url: "https://example.com/en2/", hreflang: "en" },
    ]
    const issues = validateHreflangEntries(entries)
    expect(issues.some((i) => i.level === "error" && i.message.includes("used 2 times"))).toBe(true)
  })

  it("flags a missing x-default as a warning when there are multiple entries", () => {
    const entries: HreflangEntry[] = [
      { id: "1", url: "https://example.com/en/", hreflang: "en" },
      { id: "2", url: "https://example.com/es/", hreflang: "es" },
    ]
    const issues = validateHreflangEntries(entries)
    expect(issues.some((i) => i.level === "warning" && i.message.includes("x-default"))).toBe(true)
  })

  it("does not flag missing x-default for a single entry, but warns it's incomplete", () => {
    const entries: HreflangEntry[] = [{ id: "1", url: "https://example.com/en/", hreflang: "en" }]
    const issues = validateHreflangEntries(entries)
    expect(issues.some((i) => i.message.includes("x-default"))).toBe(false)
    expect(issues.some((i) => i.message.includes("Only one entry"))).toBe(true)
  })

  it("rejects invalid URLs and invalid hreflang values", () => {
    const entries: HreflangEntry[] = [
      { id: "1", url: "not-a-url", hreflang: "en" },
      { id: "2", url: "https://example.com/fr/", hreflang: "french" },
    ]
    const issues = validateHreflangEntries(entries)
    expect(issues.some((i) => i.level === "error" && i.message.includes("not a valid absolute"))).toBe(true)
    expect(issues.some((i) => i.level === "error" && i.message.includes("not a valid hreflang value"))).toBe(true)
  })

  it("extracts hreflang tags from pasted HTML", () => {
    const html = `
      <link rel="alternate" hreflang="en" href="https://example.com/en/" />
      <link rel="alternate" hreflang="es-ES" href="https://example.com/es/" />
      <link rel="canonical" href="https://example.com/" />
    `
    const extracted = extractHreflangTagsFromHtml(html)
    expect(extracted).toHaveLength(2)
    expect(extracted[0]).toMatchObject({ url: "https://example.com/en/", hreflang: "en" })
    expect(extracted[1]).toMatchObject({ url: "https://example.com/es/", hreflang: "es-ES" })
  })
})

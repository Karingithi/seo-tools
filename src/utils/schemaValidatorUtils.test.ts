import { describe, expect, it } from "vitest"
import { detectTypes, extractJsonLdBlocks, validateSchemaBlock } from "./schemaValidatorUtils"

describe("schemaValidatorUtils", () => {
  it("parses raw JSON input directly", () => {
    const blocks = extractJsonLdBlocks('{"@context":"https://schema.org","@type":"Organization","name":"Acme"}')
    expect(blocks).toHaveLength(1)
    expect(blocks[0].parseError).toBeNull()
    expect(blocks[0].data).toMatchObject({ "@type": "Organization" })
  })

  it("extracts multiple <script type=application/ld+json> blocks from pasted HTML", () => {
    const html = `
      <head>
        <script type="application/ld+json">{"@context":"https://schema.org","@type":"Organization","name":"Acme"}</script>
        <script type="application/ld+json">{"@context":"https://schema.org","@type":"WebSite","url":"https://acme.com"}</script>
      </head>
    `
    const blocks = extractJsonLdBlocks(html)
    expect(blocks).toHaveLength(2)
    expect(blocks.every((b) => b.parseError === null)).toBe(true)
  })

  it("reports a parse error for invalid JSON instead of throwing", () => {
    const blocks = extractJsonLdBlocks('{"@type": "Organization", "name": }')
    expect(blocks).toHaveLength(1)
    expect(blocks[0].parseError).not.toBeNull()
    expect(blocks[0].data).toBeNull()
  })

  it("returns no blocks for empty input", () => {
    expect(extractJsonLdBlocks("   ")).toEqual([])
  })

  it("flags missing @context and @type", () => {
    const issues = validateSchemaBlock({ name: "Acme" })
    expect(issues.some((i) => i.level === "error" && i.path === "@context")).toBe(true)
    expect(issues.some((i) => i.level === "error" && i.path === "@type")).toBe(true)
  })

  it("warns on a non-schema.org @context", () => {
    const issues = validateSchemaBlock({ "@context": "http://schema.org/", "@type": "Organization", name: "Acme" })
    // http (not https) still matches the tolerant regex, so context itself shouldn't warn
    expect(issues.some((i) => i.path === "@context")).toBe(false)

    const badContext = validateSchemaBlock({ "@context": "https://example.com", "@type": "Organization", name: "Acme" })
    expect(badContext.some((i) => i.level === "warning" && i.path === "@context")).toBe(true)
  })

  it("flags Article missing required fields", () => {
    const issues = validateSchemaBlock({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "My Post",
    })
    expect(issues.some((i) => i.level === "error" && i.path === "image")).toBe(true)
    expect(issues.some((i) => i.level === "error" && i.path === "datePublished")).toBe(true)
    expect(issues.some((i) => i.path === "headline")).toBe(false)
  })

  it("passes a complete, valid Article with no errors", () => {
    const issues = validateSchemaBlock({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "My Post",
      image: "https://example.com/image.jpg",
      datePublished: "2026-01-01",
      author: { "@type": "Person", name: "Jane Doe" },
    })
    expect(issues.filter((i) => i.level === "error")).toHaveLength(0)
  })

  it("recurses into nested Offer and flags missing price", () => {
    const issues = validateSchemaBlock({
      "@context": "https://schema.org",
      "@type": "Product",
      name: "Widget",
      image: "https://example.com/widget.jpg",
      offers: { "@type": "Offer", priceCurrency: "USD" },
    })
    expect(issues.some((i) => i.path === "offers.price")).toBe(true)
  })

  it("recurses into arrays, e.g. FAQPage mainEntity Question items", () => {
    const issues = validateSchemaBlock({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        { "@type": "Question", name: "What is X?", acceptedAnswer: { "@type": "Answer", text: "X is..." } },
        { "@type": "Question", acceptedAnswer: { "@type": "Answer", text: "..." } },
      ],
    })
    expect(issues.some((i) => i.path === "mainEntity[1].name")).toBe(true)
    expect(issues.some((i) => i.path === "mainEntity[0].name")).toBe(false)
  })

  it("validates every item when the top-level input is an array of nodes", () => {
    const issues = validateSchemaBlock([
      { "@context": "https://schema.org", "@type": "Organization", name: "Acme" },
      { "@context": "https://schema.org", "@type": "Product" },
    ])
    expect(issues.some((i) => i.path === "[1].name")).toBe(true)
    expect(issues.some((i) => i.path === "[0].name")).toBe(false)
  })

  it("detects all @type values present, including nested ones", () => {
    const types = detectTypes({
      "@context": "https://schema.org",
      "@type": "Product",
      offers: { "@type": "Offer" },
      review: [{ "@type": "Review" }],
    })
    expect(types.sort()).toEqual(["Offer", "Product", "Review"])
  })

  it("does not flag an unknown/unmapped @type as an error by itself", () => {
    const issues = validateSchemaBlock({ "@context": "https://schema.org", "@type": "SomeFutureType", name: "X" })
    expect(issues.filter((i) => i.level === "error")).toHaveLength(0)
  })
})

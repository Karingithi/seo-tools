import { describe, expect, it } from "vitest"
import { buildCanonicalTag, extractCanonicalTagsFromHtml, normalizeCanonicalUrl } from "./canonicalUtils"

describe("canonicalUtils", () => {
  it("normalizes URLs and reports risky changes", () => {
    const result = normalizeCanonicalUrl("http://www.Example.com/Shop/Page?utm_source=x#reviews", {
      addTrailingSlash: true,
      forceLowercase: true,
      stripQueryParams: true,
      forceHttps: true,
      removeWww: true,
      removeFragments: true,
    })

    expect(result.output).toBe("https://example.com/shop/page/")
    expect(result.warnings).toEqual(expect.arrayContaining([
      "Protocol changed to HTTPS.",
      "Query parameters were dropped.",
      "URL fragment was removed.",
      "WWW subdomain was removed.",
      "Hostname or path casing was changed.",
      "Trailing slash was added.",
    ]))
  })

  it("builds and extracts canonical tags", () => {
    expect(buildCanonicalTag("https://example.com/page/")).toBe('<link rel="canonical" href="https://example.com/page/" />')
    expect(extractCanonicalTagsFromHtml('<link rel="canonical" href="https://example.com/page/" />')).toEqual(["https://example.com/page/"])
  })
})

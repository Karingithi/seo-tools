import { describe, expect, it } from "vitest"
import { applySitemapWarnings, parseSitemapXml, sitemapEntriesToCsv } from "./sitemapUtils"

describe("sitemapUtils", () => {
  it("parses urlset metadata", () => {
    const result = parseSitemapXml(`
      <urlset>
        <url>
          <loc>https://example.com/Page?x=1</loc>
          <lastmod>2026-05-01</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.8</priority>
        </url>
      </urlset>
    `)

    expect(result.type).toBe("urlset")
    expect(result.entries[0]).toMatchObject({
      loc: "https://example.com/Page?x=1",
      lastmod: "2026-05-01",
      changefreq: "weekly",
      priority: "0.8",
    })
  })

  it("parses sitemap indexes", () => {
    const result = parseSitemapXml("<sitemapindex><sitemap><loc>https://example.com/post-sitemap.xml</loc></sitemap></sitemapindex>")
    expect(result.type).toBe("sitemapindex")
    expect(result.childSitemaps).toEqual(["https://example.com/post-sitemap.xml"])
  })

  it("adds duplicate, redirect, and URL-shape warnings", () => {
    const warned = applySitemapWarnings([
      { loc: "http://example.com/Page?x=1", valid: true, status: "redirect", statusCode: 301, warnings: [] },
      { loc: "http://example.com/Page?x=1", valid: true, status: "unknown", statusCode: null, warnings: [] },
    ])

    expect(warned[0].warnings).toEqual(expect.arrayContaining([
      "Duplicate URL.",
      "Non-HTTPS URL.",
      "URL contains query parameters.",
      "URL casing may create duplicate variants.",
      "URL redirects; sitemap should usually list the final canonical URL.",
    ]))
    expect(sitemapEntriesToCsv(warned)).toContain("Warnings")
  })
})

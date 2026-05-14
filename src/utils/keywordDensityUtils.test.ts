import { describe, expect, it } from "vitest"
import { buildNgrams, findTermOccurrences, getHtmlSectionText, getReadabilityStats, toDensityItems, toTokens } from "./keywordDensityUtils"

describe("keywordDensityUtils", () => {
  it("keeps apostrophes, hyphens, and non-English tokens", () => {
    expect(toTokens("It's a well-built café landing page.")).toEqual(expect.arrayContaining(["it's", "well-built", "café"]))
  })

  it("builds density items and readability stats", () => {
    const tokens = toTokens("SEO tools help. SEO audits help.")
    const grams = buildNgrams(tokens, 1, false, new Set())
    const density = toDensityItems(grams, tokens.length)
    expect(density[0]).toMatchObject({ term: "help", count: 2 })
    expect(getReadabilityStats("One short sentence. Another sentence.")).toMatchObject({ wordCount: 5, sentenceCount: 2 })
  })

  it("extracts HTML sections and all occurrences", () => {
    expect(getHtmlSectionText("<h1>Technical SEO</h1>", "h1")).toBe("Technical SEO")
    expect(findTermOccurrences("SEO tools and SEO audits", "SEO")).toHaveLength(2)
  })
})

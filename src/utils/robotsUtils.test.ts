import { describe, expect, it } from "vitest"
import { evaluateRobotsAccess } from "./robotsUtils"

describe("evaluateRobotsAccess", () => {
  it("uses longest-match precedence and allow ties", () => {
    const robots = `
      User-agent: *
      Disallow: /private/
      Allow: /private/public$
    `

    expect(evaluateRobotsAccess(robots, "Googlebot", "/private/secret").allowed).toBe(false)
    expect(evaluateRobotsAccess(robots, "Googlebot", "/private/public").allowed).toBe(true)
  })

  it("uses selected bot fallback rules", () => {
    const robots = `
      User-agent: *
      Disallow: /all/

      User-agent: Bingbot
      Disallow: /bing/
    `

    expect(evaluateRobotsAccess(robots, "Bingbot", "/bing/page").allowed).toBe(false)
    expect(evaluateRobotsAccess(robots, "Googlebot", "/all/page").allowed).toBe(false)
  })
})

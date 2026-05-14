import { describe, expect, it } from "vitest"
import { buildMetaTags } from "./metaUtils"

describe("buildMetaTags", () => {
  it("outputs only tag snippets when wrapper is disabled", () => {
    const output = buildMetaTags({
      title: "Best SEO Tools",
      description: "Free tools for technical SEO.",
      canonical: "https://cralite.com/tools/",
      includeWrapper: false,
    })

    expect(output).toContain("<title>Best SEO Tools</title>")
    expect(output).toContain('<meta name="description" content="Free tools for technical SEO." />')
    expect(output).toContain('<link rel="canonical" href="https://cralite.com/tools/" />')
    expect(output).not.toContain("<html")
    expect(output).not.toContain("<head>")
  })

  it("escapes unsafe text", () => {
    const output = buildMetaTags({ title: 'A "quoted" <title>', includeWrapper: false })
    expect(output).toContain("A &quot;quoted&quot; &lt;title&gt;")
  })
})

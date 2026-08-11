// Prerenders each SPA route to static HTML so crawlers/SEO auditors that don't
// execute JS see the real per-page <title>, meta description, and H1 instead of
// the generic index.html shell (react-helmet-async only updates <head> client-side).
import { createServer } from "node:http"
import { writeFile, mkdir } from "node:fs/promises"
import { existsSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import puppeteer from "puppeteer"
import handler from "serve-handler"

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const distDir = join(root, "dist")
const port = 4173
const base = `http://localhost:${port}/tools`

// Vite builds with base: "/tools/", so assets/routes are requested under
// /tools/*. Mirror that here, and fall back to index.html for SPA routes
// the same way public/.htaccess does for the real Apache deployment.
function requestHandler(req, res) {
  const url = new URL(req.url, "http://localhost")
  if (!url.pathname.startsWith("/tools")) {
    res.statusCode = 404
    res.end("Not found")
    return
  }
  const relativePath = url.pathname.slice("/tools".length) || "/"
  req.url = relativePath + url.search
  handler(req, res, {
    public: distDir,
    rewrites: [{ source: "**", destination: "/index.html" }],
  })
}

// Keep in sync with the <Route path="..."> list in src/App.tsx.
const routes = [
  "/",
  "/meta-tag-generator",
  "/schema-builder",
  "/keyword-generator",
  "/robots-txt-generator",
  "/robots-txt-validator",
  "/sitemap-checker",
  "/canonical-tag-generator",
  "/keyword-density-checker",
  "/llms-txt-generator",
  "/hreflang-generator",
  "/schema-validator",
]

// dist/ is the document root Apache maps to the /tools/ URL path (see
// public/.htaccess: RewriteBase /tools/), so /tools/<route> resolves on disk
// to dist/<route> directly — no extra "tools" segment.
function outputPathFor(route) {
  if (route === "/") return join(distDir, "index.html")
  return join(distDir, route.replace(/^\//, ""), "index.html")
}

// Drop any dynamically-injected third-party <script> tags that snuck into
// the captured DOM (see blockedHosts above) — keep only the original inline
// bootstrap snippets from index.html, which stay dormant since their target
// requests are blocked during prerender and run normally for real visitors.
function stripInjectedScripts(html) {
  const injectedHosts = ["googletagmanager.com", "google-analytics.com", "clarity.ms", "conversations-widget.brevo.com"]
  return html.replace(/<script\b[^>]*\ssrc="([^"]+)"[^>]*><\/script>/g, (tag, src) =>
    injectedHosts.some((host) => src.includes(host)) ? "" : tag
  )
}

async function main() {
  if (!existsSync(distDir)) {
    throw new Error("dist/ not found — run `vite build` before prerendering")
  }

  const server = createServer(requestHandler)
  await new Promise((resolve) => server.listen(port, resolve))

  const browser = await puppeteer.launch({ headless: true })

  // Third-party analytics/chat scripts (GTM, Clarity, Brevo) inject their own
  // <script> tags into the DOM at runtime, and Puppeteer's render cycle can
  // capture that injection mid-flight, baking duplicate <script> tags into
  // the static HTML. Block the network requests during prerender and also
  // strip any injected tags before writing to disk (see stripInjectedTags
  // below) — none of this adds SEO-relevant content anyway.
  const blockedHosts = [
    "googletagmanager.com",
    "google-analytics.com",
    "clarity.ms",
    "conversations-widget.brevo.com",
  ]

  try {
    for (const route of routes) {
      const page = await browser.newPage()
      await page.setRequestInterception(true)
      page.on("request", (req) => {
        const reqUrl = req.url()
        if (blockedHosts.some((host) => reqUrl.includes(host))) {
          req.abort()
        } else {
          req.continue()
        }
      })

      const url = `${base}${route === "/" ? "" : route}`
      await page.goto(url, { waitUntil: "networkidle0" })
      // Let react-helmet-async flush its head-tag effect after the route renders.
      await page.waitForSelector("h1")
      const html = stripInjectedScripts(await page.content())
      await page.close()

      const outPath = outputPathFor(route)
      await mkdir(dirname(outPath), { recursive: true })
      await writeFile(outPath, html, "utf8")
      console.log(`prerendered ${route} -> ${outPath.replace(root, "")}`)
    }
  } finally {
    await browser.close()
    server.close()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

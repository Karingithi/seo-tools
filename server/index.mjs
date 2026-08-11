import express from "express"
import cors from "cors"
import { setTimeout as sleep } from "node:timers/promises"
import dns from "node:dns/promises"
import net from "node:net"

const PORT = process.env.PORT || 3001
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "https://cralite.com")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean)

const app = express()
app.use(express.json({ limit: "256kb" }))
app.use(
  cors({
    origin: ALLOWED_ORIGINS,
    methods: ["POST"],
  })
)

// --- SSRF guard -------------------------------------------------------
// These endpoints fetch arbitrary user-supplied URLs server-side, so a
// naive implementation lets a caller probe internal/private network
// addresses (localhost, 169.254.169.254 metadata endpoints, RFC1918
// ranges, etc). Resolve the hostname first and reject private targets
// before ever issuing the real request.
function isPrivateIp(ip) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number)
    if (a === 10) return true
    if (a === 127) return true
    if (a === 169 && b === 254) return true
    if (a === 172 && b >= 16 && b <= 31) return true
    if (a === 192 && b === 168) return true
    if (a === 0) return true
    return false
  }
  if (net.isIPv6(ip)) {
    const normalized = ip.toLowerCase()
    return (
      normalized === "::1" ||
      normalized.startsWith("fe80:") ||
      normalized.startsWith("fc") ||
      normalized.startsWith("fd")
    )
  }
  return false
}

async function assertPublicHttpUrl(rawUrl) {
  let parsed
  try {
    parsed = new URL(rawUrl)
  } catch {
    throw new Error("Invalid URL")
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("URL must use http or https")
  }
  if (parsed.hostname === "localhost") throw new Error("Refusing to fetch localhost")

  const addresses = await dns.lookup(parsed.hostname, { all: true }).catch(() => [])
  if (addresses.length === 0) throw new Error("Could not resolve hostname")
  if (addresses.some((a) => isPrivateIp(a.address))) {
    throw new Error("Refusing to fetch a private/internal address")
  }
  return parsed
}

async function fetchText(url, { method = "GET", timeoutMs = 10000 } = {}) {
  await assertPublicHttpUrl(url)
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      method,
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "CraliteToolsBot/1.0 (+https://cralite.com/tools)",
        Accept: "text/plain, application/xml, text/xml, */*",
      },
    })
    return { status: res.status, text: method === "HEAD" ? "" : await res.text() }
  } finally {
    clearTimeout(timer)
  }
}

// --- tiny in-memory cache ----------------------------------------------
// Sitemaps/robots.txt don't change second-to-second; caching cuts repeat
// load from the same visitor re-running a check and softens bursts from
// crawlers/reviewers hitting the same tool page.
const CACHE_TTL_MS = 5 * 60 * 1000
const cache = new Map()

function cacheGet(key) {
  const hit = cache.get(key)
  if (!hit) return null
  if (Date.now() - hit.at > CACHE_TTL_MS) {
    cache.delete(key)
    return null
  }
  return hit.value
}

function cacheSet(key, value) {
  cache.set(key, { value, at: Date.now() })
}

// --- routes -------------------------------------------------------------

app.post("/fetch-url", async (req, res) => {
  const { url, method = "GET", timeoutMs } = req.body || {}
  if (typeof url !== "string" || !url.trim()) {
    return res.status(400).json({ error: "url is required" })
  }
  const cacheKey = `fetch-url:${method}:${url}`
  const cached = cacheGet(cacheKey)
  if (cached) return res.json(cached)

  try {
    const { text } = await fetchText(url, { method, timeoutMs: Math.min(timeoutMs || 10000, 15000) })
    const body = { text }
    cacheSet(cacheKey, body)
    res.json(body)
  } catch (err) {
    res.status(502).json({ error: err instanceof Error ? err.message : "fetch failed" })
  }
})

app.post("/fetch-robots", async (req, res) => {
  const { url } = req.body || {}
  if (typeof url !== "string" || !url.trim()) {
    return res.status(400).json({ error: "url is required" })
  }
  const cacheKey = `fetch-robots:${url}`
  const cached = cacheGet(cacheKey)
  if (cached) return res.json(cached)

  try {
    const { text } = await fetchText(url, { timeoutMs: 10000 })
    const body = { text }
    cacheSet(cacheKey, body)
    res.json(body)
  } catch (err) {
    res.status(502).json({ error: err instanceof Error ? err.message : "fetch failed" })
  }
})

app.post("/check-urls", async (req, res) => {
  const { urls, concurrency = 6, timeoutMs = 8000 } = req.body || {}
  if (!Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ error: "urls array is required" })
  }
  const capped = urls.slice(0, 500) // guard against oversized sitemaps abusing the endpoint
  const boundedConcurrency = Math.max(1, Math.min(Number(concurrency) || 6, 10))
  const boundedTimeout = Math.min(Number(timeoutMs) || 8000, 12000)

  const results = new Array(capped.length)
  let idx = 0

  async function worker() {
    while (idx < capped.length) {
      const i = idx++
      const url = capped[i]
      try {
        const { status } = await fetchText(url, { method: "HEAD", timeoutMs: boundedTimeout })
        results[i] = {
          url,
          statusCode: status,
          status: status >= 200 && status < 300 ? "valid" : status >= 300 && status < 400 ? "redirect" : "broken",
        }
      } catch {
        results[i] = { url, status: "skipped" }
      }
      // small stagger to be a polite crawler when checking many URLs on the same host
      await sleep(15)
    }
  }

  await Promise.all(Array.from({ length: Math.min(boundedConcurrency, capped.length) }, worker))
  res.json({ results })
})

app.get("/", (_req, res) => res.json({ ok: true, service: "free-seo-tools-server" }))
app.get("/health", (_req, res) => res.json({ ok: true }))

app.listen(PORT, () => {
  console.log(`free-seo-tools server listening on :${PORT}`)
})

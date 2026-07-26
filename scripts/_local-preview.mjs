import { createServer } from "node:http"
import { existsSync, statSync } from "node:fs"
import handler from "serve-handler"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const distDir = path.join(root, "dist")
const port = 5000

// dist/ is the document root Apache maps to /tools/ (see public/.htaccess),
// so strip the /tools prefix and serve distDir directly — /tools/<route>
// resolves to dist/<route>/index.html, matching what prerender.mjs writes.
function hasRealFileOrDir(pathname) {
  const trimmed = pathname.replace(/^\/+/, "")
  if (trimmed === "") return true
  const full = path.join(distDir, trimmed)
  return existsSync(full) && (statSync(full).isFile() || statSync(full).isDirectory())
}

function reqHandler(req, res) {
  const url = new URL(req.url, "http://localhost")
  if (!url.pathname.startsWith("/tools")) {
    res.writeHead(302, { Location: "/tools/" })
    res.end()
    return
  }
  const relativePath = url.pathname.slice("/tools".length) || "/"
  req.url = relativePath + url.search

  const rewrites = hasRealFileOrDir(relativePath)
    ? []
    : [{ source: "**", destination: "/index.html" }]

  handler(req, res, { public: distDir, rewrites })
}

createServer(reqHandler).listen(port, () => console.log(`Preview running at http://localhost:${port}/tools/`))

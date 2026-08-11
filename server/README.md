# free-seo-tools server

Minimal Express server that fetches sitemaps and robots.txt files server-side
on behalf of the Sitemap Checker, Robots.txt Validator, and LLMs.txt Generator
tools — replacing the public CORS proxies (allorigins.win, corsproxy.io,
thingproxy.freeboard.io) those tools used to fall back to.

## Why this exists

Browsers can't fetch arbitrary third-party URLs due to CORS. The frontend
tools need to fetch *other people's* sitemaps/robots.txt files, which almost
never send permissive CORS headers. Free public proxies have no uptime SLA —
if one is down or rate-limited, the tool silently fails for real visitors
(and for Google, if it ever exercises the tool). This server removes that
dependency.

## Endpoints

- `POST /fetch-url` — `{ url, method?, timeoutMs? }` → `{ text }`
- `POST /fetch-robots` — `{ url }` → `{ text }`
- `POST /check-urls` — `{ urls: string[], concurrency?, timeoutMs? }` → `{ results: [{ url, status, statusCode? }] }`
- `GET /health` — `{ ok: true }`

All URL-accepting endpoints resolve the hostname and reject private/internal
IP ranges (SSRF guard) before fetching, and cache successful responses for 5
minutes.

## Running

```bash
cd server
npm install
ALLOWED_ORIGINS=https://cralite.com PORT=3001 npm start
```

## Deploying (Render)

Live at `https://free-seo-tools-server.onrender.com`, deployed as a Render
**Web Service** (Render's UI didn't offer a Blueprint option at setup time, so
it was configured manually to match `render.yaml`):

- Repo: `Karingithi/Seo-Tools`, branch `gh-pages`
- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm start`
- Instance Type: Free
- Env var: `ALLOWED_ORIGINS=https://cralite.com`
- Health Check Path: `/health`

`VITE_API_URL` (frontend build env) and `connect-src` (root `index.html` CSP)
are already pointed at this URL. If the service is ever recreated under a
different name/URL, update those two places plus this doc.

Note: Render's free tier spins the service down after ~15 minutes of
inactivity and takes a few seconds to cold-start on the next request. The
tools already handle a slow/failed backend attempt by falling back to a
direct client-side fetch, so this only shows up as a slightly slower first
check after idle time, not a broken tool.

## Deploying (anywhere else)

Any Node host works the same way — deploy `server/`, run `npm install && npm
start`, set `PORT` (most platforms set this automatically) and
`ALLOWED_ORIGINS`, then point `VITE_API_URL` and the CSP at whatever URL you
get.

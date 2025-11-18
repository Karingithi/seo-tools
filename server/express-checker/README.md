# Express Checker (scaffold)

This is a minimal example Express server that exposes a POST `/check-urls` endpoint.

Purpose: run URL checks server-side (avoids CORS/public-proxy issues and gives reliable HTTP status checks).

Usage

- Install and run (requires Node 18+ for global fetch):

```powershell
cd server/express-checker
npm install
npm run start
```

Request

POST `/check-urls`
Content-Type: `application/json`

Body:

```
{
  "urls": ["https://example.com/sitemap.xml", "https://example.com/page"],
  "concurrency": 6,
  "timeoutMs": 8000
}
```

Response:

```
{
  "results": [
    { "url": "https://...", "status": "valid|broken|skipped", "statusCode": 200, "attempts": 1 }
  ]
}
```

Notes

- The scaffold tries `HEAD` then falls back to `GET`.
- It classifies 2xx and 3xx responses as `valid`, 4xx/5xx as `broken`, otherwise `skipped`.
- Tweak `concurrency` and `timeoutMs` as needed.

// Minimal Express server to check URLs for sitemap checking
// Requires Node 18+ for global fetch OR you can install a fetch polyfill.
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));

// helper: safe fetch with timeout
async function fetchWithTimeout(url, opts = {}, timeout = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal });
    clearTimeout(id);
    return res;
  } finally {
    clearTimeout(id);
  }
}

const DEFAULT_CONCURRENCY = 6;
const DEFAULT_TIMEOUT = 8000;

function wait(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function checkSingleUrl(url, opts = {}) {
  const { timeoutMs = DEFAULT_TIMEOUT, maxAttempts = 3 } = opts;
  const result = { url, status: 'skipped', statusCode: null, attempts: 0 };

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    result.attempts = attempt;
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);

      // Try HEAD first, fall back to GET
      let res;
      try {
        res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: controller.signal });
      } catch (err) {
        res = await fetch(url, { method: 'GET', redirect: 'follow', signal: controller.signal });
      }
      clearTimeout(id);

      if (!res) throw new Error('no response');

      result.statusCode = res.status;
      if ((res.status >= 200 && res.status < 400) || res.type === 'opaque') {
        result.status = 'valid';
        return result;
      }

      if (res.status >= 400 && res.status < 600) {
        result.status = 'broken';
        return result;
      }

      // otherwise continue to next attempt
    } catch (err) {
      // last attempt -> return skipped with error
      if (attempt === maxAttempts) {
        result.error = String(err?.message || err);
        return result;
      }
      // exponential backoff small delay
      await wait(300 * attempt);
    }
  }
  return result;
}

async function checkUrls(urls, opts = {}) {
  const concurrency = opts.concurrency || DEFAULT_CONCURRENCY;
  const results = [];
  const queue = urls.slice();

  const workers = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
    while (queue.length) {
      const u = queue.shift();
      if (!u) break;
      try {
        const r = await checkSingleUrl(u, opts);
        results.push(r);
      } catch (err) {
        results.push({ url: u, status: 'skipped', error: String(err) });
      }
    }
  });

  await Promise.all(workers);
  return results;
}

app.post('/check-urls', async (req, res) => {
  try {
    const { urls, concurrency, timeoutMs } = req.body || {};
    if (!Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ error: 'Request must include a non-empty `urls` array' });
    }

    const results = await checkUrls(urls, { concurrency, timeoutMs });
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: String(err?.message || err) });
  }
});

// POST /fetch-robots
// body: { url: string, timeoutMs?: number }
app.post('/fetch-robots', async (req, res) => {
  try {
    const { url, timeoutMs = DEFAULT_TIMEOUT } = req.body || {};
    if (!url) return res.status(400).json({ error: 'Missing `url` in body' });

    // Try direct fetch then fallbacks
    try {
      const r = await fetchWithTimeout(url, { headers: { Accept: 'text/plain, */*' }, redirect: 'follow' }, timeoutMs);
      const text = await r.text();
      return res.json({ text, statusCode: r.status });
    } catch (err) {
      // try a simple proxied provider as a best-effort fallback
      const proxied = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      const r2 = await fetchWithTimeout(proxied, { redirect: 'follow' }, timeoutMs);
      const text2 = await r2.text();
      return res.json({ text: text2, statusCode: r2.status, proxied: true });
    }
  } catch (err) {
    res.status(500).json({ error: String(err?.message || err) });
  }
});

// POST /fetch-url - generic fetch returning status and optional text
app.post('/fetch-url', async (req, res) => {
  try {
    const { url, timeoutMs = DEFAULT_TIMEOUT, method = 'HEAD' } = req.body || {};
    if (!url) return res.status(400).json({ error: 'Missing `url` in body' });

    try {
      const r = await fetchWithTimeout(url, { method, redirect: 'follow' }, timeoutMs);
      const text = method === 'GET' ? await r.text() : undefined;
      return res.json({ statusCode: r.status, ok: r.ok, type: r.type, text });
    } catch (err) {
      return res.status(502).json({ error: 'Upstream fetch failed', detail: String(err?.message || err) });
    }
  } catch (err) {
    res.status(500).json({ error: String(err?.message || err) });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Checker server listening on http://localhost:${PORT}`);
});

// Vercel serverless handler example
// Place this file as `api/check-urls.js` for Vercel, or deploy under `serverless/` as reference.

async function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }

const DEFAULT_CONCURRENCY = 6;
const DEFAULT_TIMEOUT = 8000;

async function checkSingleUrl(url, opts = {}) {
  const { timeoutMs = DEFAULT_TIMEOUT, maxAttempts = 3 } = opts;
  const result = { url, status: 'skipped', statusCode: null, attempts: 0 };

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    result.attempts = attempt;
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);

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
    } catch (err) {
      if (attempt === maxAttempts) {
        result.error = String(err?.message || err);
        return result;
      }
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

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { urls, concurrency, timeoutMs } = req.body || {};
    if (!Array.isArray(urls) || urls.length === 0) {
      res.status(400).json({ error: 'Request must include a non-empty `urls` array' });
      return;
    }

    const results = await checkUrls(urls, { concurrency, timeoutMs });
    res.status(200).json({ results });
  } catch (err) {
    res.status(500).json({ error: String(err?.message || err) });
  }
};

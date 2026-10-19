import fs from 'node:fs/promises';
const base = process.env.MIC_TEST_URL || 'http://localhost:3103';
const origin = new URL(base).origin;
const queue = ['/', '/search', '/nearby', '/voices', '/news', '/resources', '/community', '/saved', '/sources', '/privacy', '/credits', '/submit'];
const seen = new Set();
const pages = [], failures = [], anchors = [], assets = new Set();
const decode = s => s.replaceAll('&amp;', '&');
while (queue.length) {
  const batch = queue.splice(0, 5).filter(path => !seen.has(path));
  batch.forEach(path => seen.add(path));
  await Promise.all(batch.map(async path => {
    try {
      const response = await fetch(base + path, { signal: AbortSignal.timeout(30000) });
      const html = await response.text();
      pages.push({ path, status: response.status });
      if (!response.ok || /<title>500|Internal Server Error/.test(html)) { failures.push({ path, status: response.status }); return; }
      if (!/<title>[^<]+<\/title>/.test(html)) failures.push({ path, error: 'Missing title' });
      for (const [, raw] of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
        const url = new URL(decode(raw), base + path);
        if (url.origin !== origin) continue;
        if (url.hash && url.pathname === new URL(base + path).pathname && !html.includes(`id="${url.hash.slice(1)}"`)) anchors.push({ path, target: url.hash });
        url.hash = '';
        if (/\.(?:json|png|jpg|svg|mp4|ico)$/.test(url.pathname)) continue;
        if (!url.pathname.startsWith('/api/')) {
          const target = url.pathname + url.search;
          if (!seen.has(target) && !queue.includes(target)) queue.push(target);
        }
      }
      for (const [, raw] of html.matchAll(/<(?:img|source)\b[^>]*src="([^"]+)"/g)) {
        const url = new URL(decode(raw), base + path);
        if (url.origin === origin) assets.add(url.href);
      }
    } catch(error) { failures.push({ path, error: error.message }); }
  }));
  if (seen.size > 500) throw new Error('Unexpected crawl size');
}
for (const url of assets) {
  try { const r = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(15000) }); if (!r.ok) failures.push({ asset: new URL(url).pathname, status: r.status }); }
  catch(error) { failures.push({ asset: url, error: error.message }); }
}
const report = { base, checkedAt: new Date().toISOString(), pages: pages.sort((a,b)=>a.path.localeCompare(b.path)), assets: assets.size, failures, brokenAnchors: anchors };
await fs.writeFile(process.env.MIC_AUDIT_REPORT || 'data/website-qa.json', JSON.stringify(report,null,2));
console.log(JSON.stringify({ pages: pages.length, assets: assets.size, failures, brokenAnchors: anchors },null,2));
if (failures.length || anchors.length) process.exitCode = 1;

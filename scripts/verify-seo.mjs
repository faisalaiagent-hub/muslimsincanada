import assert from 'node:assert/strict';
const base = process.env.MIC_TEST_URL || 'https://www.muslimsincanada.com';
const origin = 'https://www.muslimsincanada.com';
for (const path of ['/', '/news', '/nearby', '/marketplace', '/voices', '/resources', '/guides', '/guides/find-mosques-halal-food-near-you', '/toronto']) {
  const response = await fetch(base + path, { signal: AbortSignal.timeout(30000) });
  assert.equal(response.status, 200, path);
  const html = await response.text();
  const canonical = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/)[1];
  assert.equal(canonical.replace(/\/$/, ''), (origin + path).replace(/\/$/, ''), `${path}: canonical`);
  assert.match(html, /<meta name="description" content="[^"]{30,}"/);
  assert.ok(html.includes('property="og:image"'), `${path}: sharing image`);
  if (path === '/') {
    const schema = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
    assert.equal(schema['@graph'][0]['@type'], 'Organization');
  }
  console.log(`PASS ${path}: canonical, description and sharing metadata`);
}
for (const path of ['/marketplace/account', '/marketplace/review', '/saved']) {
  const html = await (await fetch(base + path)).text();
  assert.match(html, /name="robots" content="[^"]*noindex/);
}
const sitemap = await (await fetch(base + '/sitemap.xml')).text();
assert.ok(sitemap.includes(`${origin}/guides/share-your-business-on-mic`));
assert.ok(sitemap.includes(`${origin}/toronto/mosques/`));
assert.ok(!sitemap.includes('/marketplace/account'));
assert.ok((await (await fetch(base + '/robots.txt')).text()).includes(`${origin}/sitemap.xml`));
const editorial = await (await fetch(base + '/api/editorial')).json();
assert.deepEqual(editorial.news.map(s => s.id), ['muslim-network', 'cbc-canada', 'muslimmatters', 'bbc-world']);
assert.ok(editorial.news.every(s => s.items.length));
console.log('PASS private-page noindex, sitemap, robots and populated mixed publishers');

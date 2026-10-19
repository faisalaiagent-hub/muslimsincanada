import assert from 'node:assert/strict';
import fs from 'node:fs';
import { snapshotSource } from '../lib/feed-snapshot.ts';
import { voices, publishers } from '../lib/editorial-config.ts';
import { publisherImage } from '../lib/publisher-image.ts';
assert.equal(publisherImage('<meta content="https://www.muslimnetwork.tv/test.jpg" property="og:image">', 'muslimnetwork.tv'), 'https://www.muslimnetwork.tv/test.jpg');
assert.equal(publisherImage('<meta property="og:image" content="http://evil.test/pixel.jpg">', 'muslimnetwork.tv'), undefined);
const snapshot = JSON.parse(fs.readFileSync('data/editorial-snapshot.json'));
for (const source of [...voices, ...publishers]) {
  const result = snapshotSource(snapshot, source);
  assert.ok(result?.items.length, `${source.id}: valid dated fallback required`);
  assert.ok(result.snapshotAt);
}
const source = voices[0];
const bad = structuredClone(snapshot);
bad.sources[source.id].items = [{ id: 'invalid', title: 'Unsafe', url: 'javascript:alert(1)', published: new Date().toISOString() }];
assert.equal(snapshotSource(bad, source), null);
assert.equal(snapshotSource({ sources: { [source.id]: { checkedAt: 'invalid', items: snapshot.sources[source.id].items } } }, source), null);
const base = process.env.MIC_TEST_URL || 'http://localhost:3103';
for (const path of ['/favicon.png', '/favicon.ico', '/apple-icon.png']) {
  const response = await fetch(base + path);
  assert.equal(response.status, 200, path);
  assert.ok(response.headers.get('content-type')?.startsWith('image/'), path);
}
const html = await (await fetch(base + '/')).text();
assert.ok(html.includes('rel="icon"') && html.includes('/favicon.png'));
const response = await fetch(base + '/api/editorial');
assert.equal(response.status, 200);
const data = await response.json();
assert.equal(data.creators.length, 6);
assert.ok(data.creators.every(source => source.items.length && source.items[0].image?.startsWith('https://i.ytimg.com/')));
assert.ok(data.creators.filter(source => source.unavailable).every(source => source.snapshotAt));
console.log('PASS: all eight dated source snapshots, unsafe fallback rejection, favicon/apple icon, six populated creator thumbnails and honest outage dates.');

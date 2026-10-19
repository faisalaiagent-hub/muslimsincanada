import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire, stripTypeScriptTypes } from 'node:module';

const require = createRequire(import.meta.url);
function load(path) {
  const module = { exports: {} };
  const source = stripTypeScriptTypes(fs.readFileSync(path, 'utf8')).replace(/import \{ XMLParser \} from 'fast-xml-parser';/, "const { XMLParser } = require('fast-xml-parser');");
  const names = [...source.matchAll(/export (?:const|function) (\w+)/g)].map(match => match[1]);
  const code = source.replace(/export /g, '') + '; module.exports = {' + names.join(',') + '};';
  new Function('require', 'module', 'exports', code)(require, module, module.exports);
  return module.exports;
}
const { voices, publishers } = load('lib/editorial-config.ts');
const { parseVideos, parseNews } = load('lib/feed-parser.ts');
assert.throws(() => parseVideos('<!DOCTYPE x><feed/>', 'x'));
assert.throws(() => parseVideos('<feed><yt:channelId>wrong</yt:channelId></feed>', 'expected'));
assert.equal(parseNews('<rss><channel><item><title>Bad</title><link>https://evil.test/story</link><pubDate>2026-01-01</pubDate></item></channel></rss>', 'muslimmatters.org').length, 0);
const results = await Promise.all([...voices.map(async voice => {
  const response = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${voice.channelId}`, { signal: AbortSignal.timeout(15000) });
  assert.equal(response.status, 200);
  const items = parseVideos(await response.text(), voice.channelId, voice.match);
  assert.ok(items.length, `${voice.name} needs a real recent upload`);
  return { source: voice.name, items: items.length, latest: items[0].published };
}), ...publishers.map(async publisher => {
  const response = await fetch(publisher.feed, { signal: AbortSignal.timeout(15000) });
  assert.equal(response.status, 200);
  const items = parseNews(await response.text(), publisher.host);
  assert.ok(items.length, `${publisher.name} needs headlines`);
  return { source: publisher.name, items: items.length, latest: items[0].published, images: items.filter(item => item.image).length };
})]);
console.log(JSON.stringify({ passed: true, results }, null, 2));


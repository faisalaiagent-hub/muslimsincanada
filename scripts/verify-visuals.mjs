import assert from 'node:assert/strict';

const base = process.env.MIC_TEST_URL || 'http://localhost:3102';
const pages = [
  ['/', 'In full'], ['/search?type=mosques', 'What will you discover?'],
  ['/resources', 'Find support. Give something back.'],
  ['/community', 'So many stories.'], ['/credits', 'Mohammed Abubakr'],
];
for (const [path, expected] of pages) {
  const response = await fetch(`${base}${path}`);
  assert.equal(response.status, 200, path);
  assert.ok((await response.text()).includes(expected), `Missing expected content at ${path}`);
}
for (const path of ['community-friends.jpg', 'prayer-space.jpg', 'shared-table.jpg', 'volunteers.jpg', 'toronto-poster.jpg']) {
  const response = await fetch(`${base}/media/${path}`, { method: 'HEAD' });
  assert.equal(response.status, 200, path);
  assert.ok(response.headers.get('content-type')?.startsWith('image/'), path);
}
const video = await fetch(`${base}/media/toronto-sunset.mp4`, { headers: { Range: 'bytes=0-1023' } });
assert.equal(video.status, 206, 'Native video seeking requires byte-range support');
assert.ok(video.headers.get('content-type')?.includes('video/mp4'));
assert.equal((await video.arrayBuffer()).byteLength, 1024);
const logo = await fetch(`${base}/brand/mic-maple-emblem-red-green-white.png`, { method: 'HEAD' });
assert.equal(logo.status, 200, 'Approved logo is available');
console.log('PASS: five redesigned routes, five local images, approved logo, and seekable local video.');

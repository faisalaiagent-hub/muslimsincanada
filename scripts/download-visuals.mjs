import { mkdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
await mkdir('public/media', { recursive: true });
const photos = [
  ['community-friends', 8122043], ['prayer-space', 20719987],
  ['shared-table', 25907496], ['volunteers', 6590929],
];
for (const [name, id] of photos) {
  const url = `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1600&q=85`;
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) throw new Error(`${name}: ${response.status}`);
  const data = Buffer.from(await response.arrayBuffer());
  await writeFile(`public/media/${name}.jpg`, data);
  console.log(`${name}: ${data.length} bytes`);
}
// Public source URL observed in the selected Pexels page's video player.
await mkdir('.media-work', { recursive: true });
const clip = await fetch('https://videos.pexels.com/video-files/12655275/12655275-hd_1080_1920_60fps.mp4', { signal: AbortSignal.timeout(60000) });
if (!clip.ok) throw new Error(`Toronto clip: ${clip.status}`);
await writeFile('.media-work/toronto.mp4', Buffer.from(await clip.arrayBuffer()));
execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-i', '.media-work/toronto.mp4', '-vf', 'scale=540:-2', '-an', '-c:v', 'libx264', '-crf', '27', '-preset', 'fast', '-movflags', '+faststart', '-y', 'public/media/toronto-sunset.mp4']);
execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-ss', '1', '-i', '.media-work/toronto.mp4', '-frames:v', '1', '-vf', 'scale=900:-2', '-y', 'public/media/toronto-poster.jpg']);
console.log('Prepared silent Toronto film and poster. See MEDIA_CREDITS.md for source and licence.');

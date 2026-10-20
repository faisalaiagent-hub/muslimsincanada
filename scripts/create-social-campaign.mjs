import fs from 'node:fs/promises';
import sharp from 'sharp';
const folder = 'assets/social/feature-campaign';
await fs.mkdir(folder, { recursive: true });
const logo = (await fs.readFile('public/brand/mic-maple-emblem-red-green-white.png')).toString('base64');
const cards = [
  ['01-near-you', ['Your next stop.', 'A little closer.'], 'MOSQUES + HALAL FOOD', 'Search your area. Discover local connections.', 'GTA coverage is growing. Confirm details with the provider.'],
  ['02-marketplace', ['Small business.', 'Big community.'], 'MIC COMMUNITY MARKETPLACE', 'Share your products, services and skills.', 'Free listings during launch. Review required before publication.'],
  ['03-voices', ['A fresh voice.', 'A new perspective.'], 'COMMUNITY VOICES', 'Discover recent videos from official channels.', 'Muslim educators across Canada and the United States.'],
  ['04-news', ['Your community.', 'A wider world.'], 'COMMUNITY + WORLD NEWS', 'Muslim perspectives. Canada. World headlines.', 'Named publishers. Original stories. Clear attribution.'],
  ['05-resources', ['A helping hand.', 'A next step.'], 'PRACTICAL COMMUNITY RESOURCES', 'Newcomers. Families. Careers. Giving back.', 'Check current services and eligibility with each provider.'],
  ['06-contribute', ['Know a place?', 'Share a connection.'], 'BUILD MIC WITH US', 'Help your neighbourhood find its place.', 'Suggest a listing, gathering or correction for review.'],
];
const escape = s => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;');
function svg(lines, label, sub, note, wide = false) {
  const w = wide ? 1200 : 1080, h = wide ? 630 : 1080;
  const scale = wide ? .78 : 1;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="red" x2="1" y2="1"><stop stop-color="#ee153d"/><stop offset="1" stop-color="#a20729"/></linearGradient><linearGradient id="green"><stop stop-color="#00894b"/><stop offset="1" stop-color="#003e2b"/></linearGradient></defs><rect width="${w}" height="${h}" fill="#fffcf8"/><path d="M0 0H${w}V${h*.78}Q${w*.48} ${h*.61} 0 ${h*.9}Z" fill="url(#red)"/><path d="M0 0H${w*.4}Q${w*.22} ${h*.19} 0 ${h*.17}Z" fill="url(#green)"/><path d="M0 ${h*.82}Q${w*.4} ${h*.61} ${w} ${h*.86}V${h}H0Z" fill="url(#green)"/><circle cx="${w*.88}" cy="${h*.41}" r="${h*.27}" fill="white" opacity=".045"/><g transform="translate(70 ${wide?45:70}) scale(${scale})"><rect width="130" height="130" rx="22" fill="white"/><image href="data:image/png;base64,${logo}" x="9" y="9" width="112" height="112"/><text x="158" y="58" fill="white" font-family="Arial,sans-serif" font-size="23" font-weight="700" letter-spacing="2">MUSLIMS IN CANADA</text><text x="158" y="92" fill="white" font-family="Arial,sans-serif" font-size="20">Your community. In full colour.</text></g><g fill="white" font-family="Arial,sans-serif" transform="translate(70 ${wide?225:335})"><text font-size="${wide?16:18}" letter-spacing="3" font-weight="700">${escape(label)}</text>${lines.map((l,i)=>`<text y="${(wide?72:100)+i*(wide?68:88)}" font-size="${wide?62:73}" font-weight="800" letter-spacing="-2">${escape(l)}</text>`).join('')}<text y="${wide?205:290}" font-size="${wide?22:26}">${escape(sub)}</text></g><g fill="white" font-family="Arial,sans-serif"><text x="70" y="${h-118}" font-size="${wide?30:36}" font-weight="700">muslimsincanada.com</text><text x="70" y="${h-65}" font-size="${wide?15:18}">${escape(note)}</text></g></svg>`;
}
for (const [id, lines, label, sub, note] of cards) {
  const source = svg(lines, label, sub, note);
  await fs.writeFile(`${folder}/${id}.svg`, source);
  await sharp(Buffer.from(source)).png().toFile(`${folder}/${id}.png`);
}
await sharp(Buffer.from(svg(['Your community.', 'In full colour.'], 'LOCAL ROOTS. WIDER CONNECTIONS.', 'Mosques. Halal food. Marketplace. Voices. News.', 'Starting in the GTA. Connected by community.', true))).jpeg({quality:88}).toFile('public/media/mic-share.jpg');
console.log('Created six square campaign graphics and a 1200 × 630 site sharing image.');

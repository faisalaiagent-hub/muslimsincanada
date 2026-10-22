import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { publishers, voices } from '../lib/editorial-config.ts';
import { snapshotSource } from '../lib/feed-snapshot.ts';
import { guides } from '../lib/guides.ts';
import { torontoDate, validDay, chooseDailyItems, validateEdition, dailyCaption } from '../lib/daily-highlights-core.ts';

const now = new Date();
const date = torontoDate(now);
const file = 'data/daily-highlights.json';
const history = JSON.parse(await fs.readFile(file,'utf8'));
const registry = [...publishers,...voices];
const editions = (history.editions || []).flatMap(raw => {const edition = validateEdition(raw,registry,now);return edition ? [edition] : [];});
if (editions.some(e => e.date === date)) { console.log(`Daily pair already set for ${date}; no repeat publication.`); process.exit(0); }
const snapshot = JSON.parse(await fs.readFile('data/editorial-snapshot.json','utf8'));
const id = url => createHash('sha256').update(url).digest('hex').slice(0,12);
const candidates = [];
// Require recent successful checks and real publication dates. No generated news claims.
for (const source of registry) {
  const saved = snapshotSource(snapshot,source);
  if (!saved || now - new Date(saved.snapshotAt) > 48*3600000) continue;
  const video = 'channelId' in source;
  for (const item of saved.items) {
    const age = now - new Date(item.published);
    if (age < 0 || age > (video ? 14 : 3)*86400000) continue;
    candidates.push({ id:id(item.url),kind:video?'talk':'news',title:item.title,summary:video ? `Make time for a recent conversation from ${source.name}. Watch on the official channel and explore the ideas for yourself.` : `A recent headline from ${source.name}. Follow the original reporting for the full story and context.`,url:item.url,sourceId:source.id,source:source.name,published:item.published,...(item.image?{image:item.image}:{}) });
  }
}
// Rotate source preference by date so one publisher or educator cannot own the lead slot.
const seed = Number(date.replaceAll('-',''));
const rank = sourceId => {const i=registry.findIndex(s=>s.id===sourceId);return (i+seed)%registry.length;};
const reflection = item => item.kind === 'talk' && /\b(trust|happiness|kindness|patience|gratitude|hope|anger)\b/i.test(item.title) ? 0 : 1;
candidates.sort((a,b)=>reflection(a)-reflection(b) || rank(a.sourceId)-rank(b.sourceId) || b.published.localeCompare(a.published));
for (const guide of guides) candidates.push({id:id(`/guides/${guide.slug}`),kind:'guide',title:guide.title,summary:guide.description,url:`/guides/${guide.slug}`,sourceId:'mic',source:'Muslims in Canada',image:guide.image});
for (const [url,title,summary,image] of [
  ['/resources?category=Newcomers','A practical starting point for newcomers','Explore named settlement and community-service providers. Confirm current services and eligibility directly with each provider.','/media/volunteers.jpg'],
  ['/resources?category=Family%20%26%20support','A helping hand for families','Explore family and community support resources, with links to the organizations that provide them.','/media/community-friends.jpg'],
  ['/resources?category=Careers%20%26%20learning','Make room for your next career step','Discover employment and learning resources. Check each provider for available programs and eligibility.','/media/community-friends.jpg'],
  ['/resources?category=Give%20back','A small act. A stronger community.','Find organizations and ways to give back, then contact the provider to confirm current opportunities.','/media/volunteers.jpg'],
  ['/nearby','Your next local connection starts here','Search an area for mosques and source-listed halal food. Coverage starts in the GTA and is growing.','/media/prayer-space.jpg'],
  ['/submit','Know a place your neighbours should find?','Suggest a public listing, gathering or correction for MIC review. Help make your neighbourhood easier to explore.','/media/community-friends.jpg'],
]) candidates.push({id:id(url),kind:'guide',title,summary,url,sourceId:'mic',source:'Muslims in Canada',image});

// Curated greetings/events need explicit Gregorian date windows and a review note.
const overrides = JSON.parse(await fs.readFile('data/daily-highlight-overrides.json','utf8'));
for (const item of overrides.items || []) {
  if (!item.reviewedBy || !item.reviewNote || !validDay(item.startsOn) || !validDay(item.endsOn) || date < item.startsOn || date > item.endsOn || !['greeting','event'].includes(item.kind) || !item.expiresAt || !Number.isFinite(Date.parse(item.expiresAt)) || torontoDate(new Date(item.expiresAt)) <= date) continue;
  candidates.unshift({...item,id:id(item.url),sourceId:'mic',source:'Muslims in Canada'});
}
try {
  const response = await fetch('https://www.muslimsincanada.com/api/highlights/events',{signal:AbortSignal.timeout(12000)});
  if(response.ok) {
    const {events} = await response.json();
    for(const event of Array.isArray(events)?events:[]) {
      const start = new Date(event.startsAt);
      // Never feature an event that will become outdated during this Toronto edition.
      if (!Number.isFinite(start.getTime()) || torontoDate(start) <= date || start-now > 30*86400000 || typeof event.title !== 'string' || typeof event.city !== 'string') continue;
      candidates.unshift({id:id(event.url),kind:'event',title:event.title,summary:`Coming up in ${event.city}: ${start.toLocaleDateString('en-CA',{timeZone:'America/Toronto',month:'long',day:'numeric',year:'numeric'})}. Check the organizer’s current details before making plans.`,url:event.url,sourceId:'mic',source:'MIC event directory',expiresAt:start.toISOString(),image:'/media/community-friends.jpg'});
    }
  }
} catch { console.warn('Event directory unavailable; using other eligible highlights.'); }
const selected = chooseDailyItems(candidates,editions,date);
const edition = validateEdition({date,generatedAt:now.toISOString(),items:selected},registry,now);
if(!edition)throw new Error('Daily pair failed source, date or URL validation.');
await fs.writeFile(file,JSON.stringify({version:1,editions:[...editions,edition].sort((a,b)=>a.date.localeCompare(b.date)).slice(-120)},null,2)+'\n');
await fs.mkdir('assets/social/daily-highlights',{recursive:true});
await fs.writeFile(`assets/social/daily-highlights/${date}.md`, `# MIC daily highlights — ${date}\n\nPrepared captions. Not posted to social media.\n\n`+edition.items.map(i=>`## ${i.kind}\n\n${dailyCaption(date,i)}\n\nBranded sharing image: https://www.muslimsincanada.com/today/${date}/${i.id}/opengraph-image\n`).join('\n'));
console.log(`Created two different daily highlights for ${date}: ${edition.items.map(i=>i.kind).join(' + ')}. Social captions saved; no external posts sent.`);

import { PageIntro } from '@/components/portal-shell';

const credits = [
  { title: 'Community friendship', creator: 'MART PRODUCTION', url: 'https://www.pexels.com/photo/woman-taking-photo-of-her-friend-8122043/' },
  { title: 'Mosque interior', creator: 'Esra Erdem', url: 'https://www.pexels.com/photo/columns-and-red-carpet-in-mosque-20719987/' },
  { title: 'Shared mezze table', creator: 'Ali Dashti', url: 'https://www.pexels.com/photo/abundance-of-food-on-table-25907496/' },
  { title: 'Volunteers packing donations', creator: 'cottonbro studio', url: 'https://www.pexels.com/photo/two-volunteers-packing-the-charity-goods-6590929/' },
  { title: 'Toronto waterfront sunset video', creator: 'Mohammed Abubakr', url: 'https://www.pexels.com/video/sunset-over-toronto-12655275/' },
];

export const metadata = {alternates:{canonical:'/credits'}, title: 'Photography & film credits | MIC' };

export default function CreditsPage() {
  return <main className="portal-container page-main"><PageIntro eyebrow="THE PEOPLE BEHIND THE PICTURES" title="A little credit. A lot of creativity." description="Photography and film help bring our community portal to life. Here are the creators behind the visuals." /><section className="prose-panel"><h2>About the imagery</h2><p>These images and the Toronto film are illustrative stock media. The people shown are not presented as MIC members or endorsers. Images do not document MIC events or depict particular businesses, services or mosques in our directory. The mosque interior photograph is not a Canadian mosque listing.</p><p>Downloaded October 18, 2026 under the <a className="text-link" href="https://www.pexels.com/license/" target="_blank" rel="noreferrer">Pexels licence ↗</a>. Photos have been resized for the web; the film is a compressed silent copy of the original clip. MIC’s approved logo is separately generated brand artwork.</p></section><section className="prose-panel"><h2>Community voices and newsroom</h2><p>Video thumbnails and click-to-play embeds come from the official YouTube channels credited on each card. News images, when available, come from publisher RSS feeds and link to the original article. These remain third-party media. Cards without a feed image use original MIC editorial illustrations, labelled as illustrations rather than photographs of the reported event.</p></section><div className="source-list">{credits.map(item => <article key={item.url}><div><strong>{item.title}</strong><span>{item.creator} · Pexels</span></div><a href={item.url} target="_blank" rel="noreferrer">Original media ↗</a></article>)}</div></main>;
}


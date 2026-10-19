import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowRight, ArrowUpRight, Building2, CalendarDays, CheckCircle2, Globe2, HeartHandshake, MapPin, Search, Sparkles, Users } from 'lucide-react';
import { getDirectory } from '@/lib/directory';
import { FACEBOOK_URL, resources } from '@/lib/community';
import { ListingCard } from '@/components/listing-card';
import { ResourceCard } from '@/components/resource-card';
import { VisualMotion } from '@/components/visual-motion';
import { CommunityVideo } from '@/components/community-video';
import { Suspense } from 'react';
import { EditorialSections } from '@/components/editorial-sections';
import { NearbyTeaser } from '@/components/nearby-teaser';

export const dynamic = 'force-dynamic';

const topics = [
  { title: 'A space to pray.', category: 'FAITH & BELONGING', image: '/media/prayer-space.jpg', alt: 'Sunlit arches and red prayer carpet in a mosque; illustrative stock photography', href: '/search?type=mosques', action: 'Find a mosque', className: 'faith' },
  { title: 'More shared moments.', category: 'PEOPLE & GATHERINGS', image: '/media/community-friends.jpg', alt: 'Friends taking photographs outdoors; illustrative stock photography', href: '/search?type=events', action: 'Explore events', className: 'people' },
  { title: 'A taste of connection.', category: 'FOOD & LOCAL LIFE', image: '/media/shared-table.jpg', alt: 'A colourful spread of breads, dips and mezze; illustrative stock photography', href: '/search?type=businesses', action: 'Discover businesses', className: 'food' },
  { title: 'Small acts. Big heart.', category: 'SERVICE & SUPPORT', image: '/media/volunteers.jpg', alt: 'Volunteers packing donation boxes; illustrative stock photography', href: '/resources?category=Give+back', action: 'Find ways to give back', className: 'service' },
];

export default async function Home() {
  const { cities, listings, unavailable } = await getDirectory();
  const mosques = listings.filter(item => item.type === 'mosques');
  const events = listings.filter(item => item.type === 'events');

  return (
    <main className="v-home">
      <section className="v-hero" aria-labelledby="visual-hero-title">
        <div className="v-hero-copy">
          <div className="v-hero-overline"><span className="v-live-dot" /> LOCAL ROOTS. LIMITLESS CONNECTIONS.</div>
          <h1 id="visual-hero-title">Your community.<br /><span>In full</span> <em>colour.</em></h1>
          <p>Find your people. Discover your city. Make room for the moments that bring us together.</p>
          <form action="/search" className="v-search">
            <Search size={21} aria-hidden="true" />
            <label className="sr-only" htmlFor="visual-search">Search your community</label>
            <input id="visual-search" name="q" placeholder="What are you looking for?" />
            <button type="submit" aria-label="Search community"><ArrowRight size={22} /></button>
          </form>
          <div className="v-hero-links"><Link href="/search?type=mosques">Mosques</Link><Link href="/search?type=events">Events</Link><Link href="/resources">Resources</Link><Link href="/search?type=businesses">Local businesses</Link></div>
          <a href={FACEBOOK_URL} target="_blank" rel="noreferrer" className="v-hero-social"><span className="v-social-icon"><Users size={20} /></span><span><strong>13K followers. One shared community.</strong><small>Join the conversation on Facebook <ArrowUpRight size={12} /></small></span></a>
          <div className="v-hero-scribble" aria-hidden="true">✳</div>
        </div>
        <div className="v-hero-media">
          <Image src="/media/community-friends.jpg" alt="Friends enjoying a moment outdoors. Stock photograph by MART PRODUCTION." fill priority sizes="(max-width: 760px) 100vw, 56vw" className="v-hero-photo" />
          <div className="v-photo-shade" />
          <span className="v-photo-label">MOMENTS THAT MAKE US, US.</span>
          <div className="v-belong-sticker"><HeartHandshake size={29} strokeWidth={1.5} /><span>YOU BELONG<br />HERE.</span><span className="v-sticker-star">✳</span></div>
          <div className="v-hero-media-bottom"><a href="#visual-stories" className="v-watch-link"><span><ArrowDown size={20} /></span>Explore life in motion</a><VisualMotion /></div>
          <Link href="/credits" className="v-image-credit">Stock photography · Image credits</Link>
        </div>
      </section>

      <div className="v-ticker" aria-hidden="true"><div className="v-ticker-track">{[0, 1, 2].map(item => <span key={item}>ROOTED IN CANADA <b>✳</b> CONNECTED BY COMMUNITY <b>✳</b> OPEN TO THE WORLD <b>✳</b></span>)}</div></div>

      <NearbyTeaser />
      <Suspense fallback={<div className="portal-container v-section">Loading community voices and publisher headlines…</div>}><EditorialSections /></Suspense>

      <section className="portal-container v-section" id="explore">
        <div className="v-section-heading"><div><span className="v-label">FOLLOW YOUR CURIOSITY</span><h2>So many ways<br />to <em>belong.</em></h2></div><p>A place to gather. A favourite local spot. A chance to make someone’s day. Start with what matters to you.</p></div>
        <div className="v-topic-grid">{topics.map((topic, index) => <Link href={topic.href} key={topic.title} className={`v-topic-card v-topic-${topic.className}`}><Image src={topic.image} alt={topic.alt} fill sizes="(max-width: 600px) 90vw, (max-width: 1000px) 45vw, 24vw" /><div className="v-topic-shade" /><div className="v-topic-top"><span>{String(index + 1).padStart(2, '0')}</span><ArrowUpRight size={20} /></div><div className="v-topic-copy"><span>{topic.category}</span><h3>{topic.title}</h3><span className="v-topic-action">{topic.action}<ArrowRight size={16} /></span></div></Link>)}</div>
        <p className="v-media-note">Images illustrate community life and do not depict specific MIC listings or events.</p>
      </section>

      <section className="v-local-section"><div className="portal-container v-section"><div className="v-section-heading"><div><span className="v-label">YOUR NEIGHBOURHOOD. YOUR NEXT CONNECTION.</span><h2>Find your community.</h2></div><Link className="v-link" href="/search?type=mosques">Explore the directory <ArrowUpRight size={20} /></Link></div><div className="v-city-pills">{cities.filter(city => city.is_launched).map(city => <Link href={`/${city.slug}`} key={city.id}><MapPin size={15} />{city.name}<span>{listings.filter(item => item.citySlug === city.slug).length} listings</span><ArrowUpRight size={16} /></Link>)}</div>{unavailable && <p className="notice">Some directory data is temporarily unavailable. Community resource links are still available.</p>}{mosques.length ? <div className="listing-grid">{mosques.slice(0, 3).map(item => <ListingCard listing={item} key={item.id} />)}</div> : <div className="empty-state"><Building2 size={30} /><h3>Your next connection starts here.</h3><Link href="/submit" className="portal-button">Suggest a place</Link></div>}</div></section>

      <section className="portal-container v-section" id="visual-stories"><div className="v-section-heading"><div><span className="v-label">LIFE DOESN’T STAND STILL</span><h2>More than a place.<br /><em>A feeling.</em></h2></div><p>A glimpse of the city. A shared table. A little kindness. There’s a world of connection waiting outside your door.</p></div><div className="v-story-grid"><CommunityVideo /><div className="v-story-photo"><Image src="/media/shared-table.jpg" alt="A shared mezze platter, photographed by Ali Dashti" fill sizes="(max-width:760px) 90vw, 32vw" /><div className="v-story-photo-copy"><span className="v-label">A SEAT AT THE TABLE</span><h3>Good food.<br />Even better company.</h3><Link href="/search?type=businesses">Explore local businesses <ArrowUpRight size={16} /></Link></div></div><div className="v-story-message"><span className="v-message-star" aria-hidden="true">✳</span><span className="v-label">MAKE A LITTLE DIFFERENCE</span><h3>Community<br />is a verb.</h3><p>Show up. Lend a hand. Share something useful. The smallest gesture can open the biggest door.</p><Link href="/resources?category=Give+back" className="v-round-link"><ArrowUpRight size={25} /><span>Find your way to give back</span></Link></div></div><p className="v-media-note">Toronto stock footage by Mohammed Abubakr · Pexels. Silent, click-to-play. <Link href="/credits">All media credits ↗</Link></p></section>

      <section className="v-gather"><div className="v-gather-photo"><Image src="/media/volunteers.jpg" alt="Two volunteers organizing donations. Stock photograph by cottonbro studio." fill sizes="(max-width:760px) 100vw, 48vw" /></div><div className="v-gather-copy"><span className="v-label">MAKE TIME FOR TOGETHER</span><h2>Good things happen<br />when we <em>show up.</em></h2><p>Workshops, community gatherings, family activities. Help make your neighbourhood a little more connected.</p>{events.length ? <Link href="/search?type=events" className="portal-button">Find your next event <ArrowUpRight size={18} /></Link> : <><p className="v-gather-small">Our event calendar is growing. Know a gathering worth sharing?</p><Link href="/submit?type=event" className="portal-button">Suggest an event <ArrowUpRight size={18} /></Link></>}<span className="v-gather-outline" aria-hidden="true">TOGETHER</span></div></section>

      <section className="portal-container v-section"><div className="v-section-heading"><div><span className="v-label">A HELPING HAND, WHEN YOU NEED IT</span><h2>Life is easier<br />with <em>connection.</em></h2></div><Link className="v-link" href="/resources">Explore all resources <ArrowUpRight size={20} /></Link></div><div className="listing-grid">{resources.slice(0, 3).map(item => <ResourceCard resource={item} key={item.id} />)}</div></section>

      <section className="portal-container v-join-section"><div className="v-join"><div className="v-join-mark" aria-hidden="true"><Image src="/brand/mic-maple-emblem-red-green-white.png" alt="" width={230} height={230} /></div><div><span className="v-label">THE NEXT CHAPTER STARTS WITH YOU</span><h2>Your people.<br />Your stories. <em>Your MIC.</em></h2><p>13,000 Facebook followers. Countless connections to make.<br />Let’s build a community that feels like home.</p><div className="button-row"><a href={FACEBOOK_URL} className="portal-button" target="_blank" rel="noreferrer">Meet MIC on Facebook <ArrowUpRight size={17} /></a><Link className="v-link" href="/submit">Add your connection <ArrowRight size={17} /></Link></div></div><span className="v-join-star" aria-hidden="true">✳</span></div></section>

      <section className="portal-container v-trust"><div><CheckCircle2 size={22} /><strong>Real sources. Clear labels.</strong><span>See what’s checked and what still needs confirmation.</span></div><div><Globe2 size={22} /><strong>Local roots. Wider connections.</strong><span>Starting in the GTA, with resources across borders.</span></div><div><Sparkles size={22} /><strong>Better, together.</strong><span>Every suggestion helps someone find their place.</span></div></section>
    </main>
  );
}

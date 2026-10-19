import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Bookmark, Compass, HeartHandshake, Plus, Users } from 'lucide-react';
import { FACEBOOK_URL } from '@/lib/community';

function Brand({ footer = false }: { footer?: boolean }) {
  return (
    <Link href="/" className={`brand ${footer ? 'footer-brand' : ''}`} aria-label="Muslims in Canada home">
      <Image className="approved-logo" src="/brand/mic-maple-emblem-red-green-white.png" alt="MIC red and green maple leaf emblem" width={76} height={76} priority={!footer} />
      <span className="brand-name">MUSLIMS IN CANADA<span>Find your people. Find your place.</span></span>
    </Link>
  );
}

export function PortalHeader() {
  return (
    <>
      <div className="community-ribbon">Rooted in Canada. Connected by community.<a href={FACEBOOK_URL} target="_blank" rel="noreferrer">Meet MIC on Facebook <ArrowUpRight size={13} /></a></div>
      <header className="portal-header">
        <div className="portal-container header-inner">
          <Brand />
          <nav aria-label="Main navigation" className="desktop-nav">
            <Link href="/search">Discover</Link>
            <Link href="/nearby">Near you</Link>
            <Link href="/voices">Voices</Link>
            <Link href="/news">News</Link>
            <Link href="/resources">Resources</Link>
            <Link href="/marketplace">Marketplace</Link>
          </nav>
          <div className="header-actions"><Link href="/saved" className="saved-nav" aria-label="Saved places and resources"><Bookmark size={20} /></Link><Link href="/submit" className="portal-button small"><Plus size={16} /> Contribute</Link></div>
        </div>
      </header>
    </>
  );
}

export function PortalFooter() {
  return (
    <>
      <footer className="portal-footer">
        <div className="portal-container footer-grid">
          <div><Brand footer /><p>Local roots.<br />A world of connection.</p></div>
          <div><strong>Explore your community</strong><Link href="/marketplace">Community marketplace</Link><Link href="/nearby?type=mosque">Mosques near you</Link><Link href="/nearby?type=food">Halal food near you</Link><Link href="/search?type=events">Events & gatherings</Link><Link href="/resources">Community resources</Link></div>
          <div><strong>Build it with us</strong><Link href="/voices">Community voices</Link><Link href="/news">Muslim newsroom</Link><Link href="/submit">Suggest a listing</Link><Link href="/sources">Our sources & approach</Link><Link href="/community">Community guidelines</Link><a href={FACEBOOK_URL} target="_blank" rel="noreferrer">MIC on Facebook ↗</a></div>
        </div>
        <div className="portal-container footer-bottom"><span>© {new Date().getFullYear()} Muslims in Canada</span><span><Link href="/credits">Photography & film credits</Link> · <Link href="/privacy">Privacy</Link></span></div>
      </footer>
      <nav className="mobile-nav" aria-label="Mobile navigation"><Link href="/"><HeartHandshake size={20} />Home</Link><Link href="/nearby"><Compass size={20} />Near you</Link><Link href="/marketplace"><Users size={20} />Market</Link><Link href="/saved"><Bookmark size={20} />Saved</Link><Link href="/marketplace/new"><Plus size={20} />Post ad</Link></nav>
    </>
  );
}

export function PageIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="page-intro"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>;
}

import Link from 'next/link';
import { ArrowUpRight, Building2, CalendarDays, MapPin, Store } from 'lucide-react';
import type { Listing } from '@/lib/directory';
import { SaveButton } from './saved-items';
export function ListingCard({ listing }: { listing: Listing }) {
  const href = `/${listing.citySlug}/${listing.type}/${listing.slug}`;
  const Icon = listing.type === 'mosques' ? Building2 : listing.type === 'events' ? CalendarDays : Store;
  return <article className="listing-card"><div className={`listing-art art-${listing.type}`}><Icon size={40} strokeWidth={1.15} /><span>{listing.city}</span><SaveButton item={{ id: `${listing.type}:${listing.id}`, name: listing.name, href, category: listing.type, location: listing.city }} /></div><div className="listing-body"><div className="card-meta"><span>{listing.type === 'mosques' ? 'Mosque & prayer space' : listing.type === 'events' ? 'Community event' : 'Local business'}</span><span className={`status-dot ${listing.status === 'published' ? '' : 'pending'}`}>{listing.status === 'published' ? 'Published' : 'Needs verification'}</span></div><h3><Link href={href}>{listing.name}</Link></h3><p className="location"><MapPin size={14} />{listing.address || listing.city}</p>{listing.affiliation ? <span className="tag">{listing.affiliation}</span> : null}<div className="card-bottom"><span>{listing.lastVerified ? `Checked ${new Date(listing.lastVerified).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', timeZone: 'America/Toronto' })}` : 'Verification date unavailable'}</span><Link href={href} aria-label={`View ${listing.name}`}><ArrowUpRight size={18} /></Link></div></div></article>;
}

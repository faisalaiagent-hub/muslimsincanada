import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, MapPin } from 'lucide-react';
import { getDirectory } from '@/lib/directory';
import { getSupabase } from '@/lib/supabase';
import { safeUrl } from '@/lib/community';
import { getPublicSource } from '@/lib/source-provenance';
import { SaveButton, ShareButton } from './saved-items';
import { PageIntro } from './portal-shell';
type Row = Record<string, unknown>;
const text = (value: unknown) => typeof value === 'string' ? value : '';
const date = (value: unknown) => typeof value === 'string' && Number.isFinite(Date.parse(value)) ? new Date(value).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/Toronto' }) : 'Not recorded';
export async function DetailPage({ city, slug, type }: { city: string; slug: string; type: 'mosques' | 'businesses' | 'events' }) {
  const directory = await getDirectory();
  const selectedCity = directory.cities.find(item => item.slug === city);
  if (directory.unavailable && !selectedCity) return <main className="portal-container page-main"><PageIntro eyebrow="DIRECTORY" title="We couldn’t load this connection." description="The directory is temporarily unavailable. Please try again shortly." /><Link href="/resources" className="portal-button">Explore resources</Link></main>;
  if (!selectedCity || !selectedCity.is_launched) notFound();
  const table = type === 'mosques' ? 'mosque' : type === 'events' ? 'event' : 'business';
  const client = getSupabase();
  const { data, error } = await client.from(table).select('*').eq('city_id', selectedCity.id).eq('slug', slug).in('verification_status', ['published', 'validating']).abortSignal(AbortSignal.timeout(10000)).maybeSingle();
  if (error) return <main className="portal-container page-main"><PageIntro eyebrow="PLEASE TRY AGAIN" title="This listing couldn’t be loaded." description="We’re having trouble connecting to the directory." /><Link href="/search" className="portal-button">Back to discovery</Link></main>;
  if (!data) notFound();
  const row = data as Row; const name = text(row.name) || text(row.title); const website = safeUrl(row.website) || safeUrl(row.registration_url);
  const facilities = row.facilities && typeof row.facilities === 'object' ? row.facilities as Row : {};
  const prayers = row.prayer_times && typeof row.prayer_times === 'object' ? row.prayer_times as Row : {};
  const affiliation = text(facilities.affiliation) || text(facilities.tradition);
  let source: Row | null = null;
  if (row.source_id) {
    source = await getPublicSource(text(row.source_id));
  }
  const sourceUrl = safeUrl(source?.url); const path = `/${city}/${type}/${slug}`;
  const phone = text(row.phone); const address = text(row.address) || text(row.venue_name);
  const pending = row.verification_status === 'validating';
  const facts = [['Jumu’ah', text(row.jummah_time)], ...Object.entries(prayers).filter(([, value]) => typeof value === 'string').map(([key, value]) => [key, text(value)])].filter(([, value]) => value);
  return <main className="portal-container page-main"><Link href={`/${city}/${type}`} className="text-link"><ArrowLeft size={15} /> Back to {selectedCity.name} {type}</Link><div className="detail-title-row"><PageIntro eyebrow={`${selectedCity.name} · ${type === 'mosques' ? 'MOSQUE & PRAYER SPACE' : type.toUpperCase()}`} title={name} description={address || 'Connect directly with this organization for location details.'} /><div className="button-row"><SaveButton item={{ id: `${type}:${text(row.id)}`, name, href: path, category: type, location: selectedCity.name }} /><ShareButton title={name} /></div></div>{pending ? <p className="notice">This listing needs verification. Some details may be incomplete or conflicting. Confirm directly before travelling.</p> : null}
  <div className="detail-layout"><div><section className="prose-panel"><span className={`status-dot ${pending ? 'pending' : ''}`}>{pending ? 'Needs verification' : 'Published listing'}</span>{affiliation ? <p><span className="tag">{affiliation}</span></p> : null}<h2>Make a connection</h2>{text(row.description) ? <p>{text(row.description)}</p> : <p>Explore this community connection in {selectedCity.name}. Contact the organization for current programs, facilities and visiting information.</p>}{address ? <p className="detail-address"><MapPin size={18} />{address}</p> : null}<div className="button-row">{website ? <a href={website} target="_blank" rel="noreferrer" className="portal-button">{type === 'events' ? 'Visit organizer / registration' : 'Visit official website'}<ArrowUpRight size={16} /></a> : null}{phone && /^[+\d\s().-]+$/.test(phone) ? <a className="portal-button secondary" href={`tel:${phone.replace(/[^+\d]/g, '')}`}>{phone}</a> : null}{address ? <a className="text-link" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${address}`)}`} target="_blank" rel="noreferrer">Find directions ↗</a> : null}</div></section>
  {type === 'mosques' ? <section className="prose-panel"><h2>Prayer times & facilities</h2>{facts.length ? <dl className="detail-facts">{facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl> : <p>Prayer times have not been confirmed in this directory. Check the mosque’s own timetable for current prayer and Jumu’ah times.</p>}<div className="detail-facts">{Object.entries(facilities).filter(([key, value]) => typeof value === 'boolean' && !['affiliation', 'tradition'].includes(key)).map(([key, value]) => <div key={key}><span>{key.replace(/_/g, ' ')}: {value ? 'Reported available' : 'Reported unavailable'}</span></div>)}</div><p>Facilities and timetables can change. Missing information means unknown, rather than unavailable.</p></section> : null}
  {type === 'events' ? <section className="prose-panel"><h2>Plan your visit</h2><p>Starts: {date(row.starts_at)}{text(row.starts_at) ? ` · ${new Date(text(row.starts_at)).toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Toronto', timeZoneName: 'short' })}` : ''}</p><p>{row.is_online ? 'Online event. See the organizer for access details.' : `Venue: ${text(row.venue_name) || 'Confirm with the organizer'}`}</p><p>{Date.parse(text(row.starts_at)) < Date.now() ? 'This event has passed.' : 'Confirm availability, pricing and registration directly with the organizer.'}</p></section> : null}
  {type === 'businesses' ? <section className="prose-panel"><h2>About this business</h2><p>A business listing does not establish halal certification. Ask the business for current certification and verify it directly with the issuing body.</p></section> : null}</div>
  <aside className="prose-panel detail-sidebar"><h2>Know where it comes from.</h2><p><strong>Source:</strong> {text(source?.name) || 'Source details are not publicly available.'}</p>{sourceUrl ? <a href={sourceUrl} target="_blank" rel="noreferrer" className="text-link">View source ↗</a> : null}<p><strong>Last verified:</strong><br />{date(row.last_verified_at)}</p><p>Published status reflects the directory review process. Confirm current details with the organization.</p><Link href="/sources" className="text-link">How our labels work →</Link><div className="button-row"><Link className="portal-button secondary" href={`/submit?type=correction&listing=${encodeURIComponent(path)}`}>Suggest a correction</Link><Link className="text-link" href={`/submit?type=claim&listing=${encodeURIComponent(path)}`}>Manage this organization? →</Link></div></aside></div></main>;
}

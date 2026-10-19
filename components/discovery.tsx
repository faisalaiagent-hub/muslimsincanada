'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Grid2X2, List, Search, SlidersHorizontal } from 'lucide-react';
import type { City, Listing } from '@/lib/directory';
import { resources } from '@/lib/community';
import { ListingCard } from './listing-card';
import { ResourceCard } from './resource-card';

export function Discovery({ listings, cities, initialCity = 'all', initialType = 'all', initialQuery = '', unavailable = false }: { listings: Listing[]; cities: City[]; initialCity?: string; initialType?: string; initialQuery?: string; unavailable?: boolean }) {
  const [query, setQuery] = useState(initialQuery);
  const [city, setCity] = useState(initialCity);
  const [type, setType] = useState(initialType);
  const [status, setStatus] = useState('all');
  const [view, setView] = useState('grid');
  const term = query.trim().toLocaleLowerCase();
  const filtered = listings.filter(item => (city === 'all' || item.citySlug === city) && (type === 'all' || item.type === type) && (status === 'all' || item.status === status) && `${item.name} ${item.address} ${item.city} ${item.affiliation ?? ''}`.toLocaleLowerCase().includes(term));
  const guides = (type === 'resources' || type === 'all') && city === 'all' && status === 'all' ? resources.filter(item => `${item.name} ${item.category} ${item.description} ${item.region}`.toLocaleLowerCase().includes(term)) : [];
  const count = filtered.length + guides.length;
  return <><div className="n-browse-link"><Link href="/nearby">Find mosques & halal food near an area or your location →</Link></div><div className="discovery-controls"><label className="search-field"><Search size={20} /><span className="sr-only">Search the directory</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="A place, a neighbourhood, a way to connect…" /></label><label className="select-field"><span>Community</span><select value={city} onChange={event => setCity(event.target.value)}><option value="all">All communities</option>{cities.filter(item => item.is_launched).map(item => <option key={item.id} value={item.slug}>{item.name}</option>)}</select></label></div>
    <div className="discovery-tabs" aria-label="Listing categories">{[['all', 'Everything'], ['mosques', 'Mosques'], ['events', 'Events'], ['businesses', 'Businesses'], ['resources', 'Resources']].map(([value, label]) => <button key={value} type="button" onClick={() => setType(value)} aria-pressed={type === value} className={type === value ? 'active' : ''}>{label}</button>)}</div>
    <div className="results-toolbar"><p aria-live="polite"><strong>{count}</strong> {count === 1 ? 'connection' : 'connections'} to explore</p><div className="results-options"><label><SlidersHorizontal size={14} /><span className="sr-only">Publication status</span><select value={status} onChange={event => setStatus(event.target.value)}><option value="all">All statuses</option><option value="published">Published</option><option value="validating">Needs verification</option></select></label><button type="button" className="icon-button" aria-label="Grid view" aria-pressed={view === 'grid'} onClick={() => setView('grid')}><Grid2X2 size={18} /></button><button type="button" className="icon-button" aria-label="List view" aria-pressed={view === 'list'} onClick={() => setView('list')}><List size={18} /></button></div></div>
    {unavailable ? <p className="notice" role="status">Some directory data is temporarily unavailable. Independently sourced resource links are still available.</p> : null}
    {type === 'resources' && city !== 'all' ? <p className="notice">Resource guides cover broader regions. Choose “All communities” to explore them.</p> : null}
    {count ? <div className={`listing-grid ${view === 'list' ? 'list-view' : ''}`}>{filtered.map(item => <ListingCard key={`${item.type}:${item.id}`} listing={item} />)}{guides.map(item => <ResourceCard key={item.id} resource={item} />)}</div> : <div className="empty-state"><Search size={32} /><h2>Room for another connection.</h2><p>{type === 'events' ? 'No upcoming events match these filters. Help put your next community gathering on the map.' : 'Try another city, category or keyword—or help us add something missing.'}</p><button className="portal-button secondary" onClick={() => { setQuery(''); setCity('all'); setType('all'); setStatus('all'); }}>Reset filters</button><a href="/submit" className="text-link">Suggest a listing →</a></div>}</>;
}

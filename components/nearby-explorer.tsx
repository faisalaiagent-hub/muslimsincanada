'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, LocateFixed, MapPin, Search } from 'lucide-react';
import { areaCentres, rankNearby, type NearbyPlace, type Point } from '@/lib/nearby';
import { useDeviceLocation } from './location-provider';

type Area = Point & { name: string; approximate?: boolean };
export function NearbyExplorer({ places, unavailable, initialQuery = '', initialType = 'all' }: { places: NearbyPlace[]; unavailable: boolean; initialQuery?: string; initialType?: string }) {
  const location = useDeviceLocation();
  const manualArea = useRef(Boolean(initialQuery));
  const previousDeviceRequest = useRef(location.requestId);
  const [query, setQuery] = useState(initialQuery);
  const [keyword, setKeyword] = useState('');
  const [type, setType] = useState(initialType);
  const [area, setArea] = useState<Area | null>(null);
  const [choices, setChoices] = useState<Area[]>([]);
  const [radius, setRadius] = useState(25);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [limit, setLimit] = useState(18);
  const [textArea, setTextArea] = useState('');
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const request = useRef<AbortController | null>(null);
  const generation = useRef(0);
  const active = useRef(true);
  useEffect(() => { active.current = true; return () => { active.current = false; request.current?.abort(); generation.current++; }; }, []);

  async function searchArea(value: string) {
    manualArea.current = true;
    const version = ++generation.current;
    request.current?.abort();
    const controller = new AbortController(); request.current = controller;
    setBusy(true); setError(''); setChoices([]); setLimit(18);
    try {
      const response = await fetch('/api/areas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: value }), signal: controller.signal });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Area search is unavailable.');
      if (version !== generation.current || !active.current) return;
      if (!data.areas?.length) { setArea(null); setTextArea(value); setError('No map match found. Showing text matches in the available directory instead.'); return; }
      setChoices(data.areas); setTextArea('');
      if (data.areas.length === 1) choose(data.areas[0]);
    } catch (err) {
      if ((err as Error).name !== 'AbortError' && version === generation.current && active.current) { setArea(null); setTextArea(value); setError((err as Error).message); }
    } finally { if (version === generation.current && active.current) setBusy(false); }
  }
  useEffect(() => { if (initialQuery.trim()) void searchArea(initialQuery); else manualArea.current = false; }, [initialQuery]);

  function choose(selected: Area) { manualArea.current = true; if (location.busy) location.clearLocation(); setArea(selected); setChoices([]); setAccuracy(null); setTextArea(''); setLimit(18); setError(''); }
  function locate() { manualArea.current = false; location.requestLocation(); }
  useEffect(() => {
    if (previousDeviceRequest.current !== location.requestId) { previousDeviceRequest.current = location.requestId; manualArea.current = false; }
    if (location.position && !manualArea.current) {
      generation.current++; request.current?.abort(); setBusy(false); setChoices([]); setError('');
      setArea({ ...location.position, name: 'Your current location' }); setAccuracy(location.position.accuracy); setTextArea(''); setLimit(18);
    } else if (!location.position) {
      setArea(current => current?.name === 'Your current location' ? null : current);
      setAccuracy(null);
    }
  }, [location.position, location.requestId, initialQuery]);
  const normalized = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const matching = places.filter(place => (type === 'all' || place.type === type) && normalized(`${place.name} ${place.address} ${place.city} ${place.region ?? ''}`).includes(normalized(keyword.trim())) && (!textArea || normalized(`${place.city} ${place.address} ${place.region ?? ''}`).includes(normalized(textArea.trim()))));
  const results = area ? rankNearby(matching, area, radius) : matching.map(place => ({ ...place, distance: null as number | null })).sort((a, b) => a.name.localeCompare(b.name));
  const unknown = matching.filter(place => place.latitude == null || place.longitude == null).length;
  return <>
    <section className="n-search-panel" aria-label="Find places by area"><form onSubmit={event => { event.preventDefault(); void searchArea(query); }} className="n-area-form"><label htmlFor="nearby-area"><MapPin size={18} />Where would you like to explore?</label><div><input id="nearby-area" value={query} onChange={event => setQuery(event.target.value)} placeholder="City, neighbourhood, address or postal code" minLength={2} maxLength={160} required /><button className="portal-button" disabled={busy}><Search size={17} />{busy ? 'Finding…' : 'Find area'}</button></div></form><button type="button" className="n-locate" onClick={locate} disabled={busy || location.busy}><LocateFixed size={19} />{location.busy ? 'Finding your location…' : location.position ? 'Refresh my location' : 'Use my location'}</button><p className="n-privacy">Location is optional. Your device coordinates stay in this browser session. Typed area searches use Photon / OpenStreetMap.</p>
    {error && <p className="notice" role="alert">{error}</p>}
    {choices.length > 0 && <div className="n-area-choices"><strong>Choose your area</strong>{choices.map((choice, index) => <button type="button" key={`${choice.name}-${index}`} onClick={() => choose(choice)}><MapPin size={16} /><span>{choice.name}</span><ArrowUpRight size={16} /></button>)}</div>}
    <div className="n-popular"><span>Start somewhere:</span>{areaCentres.slice(0, 7).map(city => <button key={city.name} type="button" onClick={() => { generation.current++; request.current?.abort(); setBusy(false); choose({ ...city, name: `${city.name} city centre`, approximate: true }); }}>{city.name}</button>)}</div></section>
    <div className="n-filters"><div className="discovery-tabs" aria-label="Nearby categories">{[['all', 'All places'], ['mosque', 'Mosques'], ['food', 'Halal food']].map(([value, label]) => <button key={value} type="button" aria-pressed={type === value} className={type === value ? 'active' : ''} onClick={() => { setType(value); setLimit(18); }}>{label}</button>)}</div><label className="n-radius">Within <select value={radius} onChange={event => { setRadius(+event.target.value); setLimit(18); }} disabled={!area}>{[5, 10, 25, 50, 100].map(km => <option value={km} key={km}>{km} km</option>)}</select></label></div>
    <label className="search-field n-keyword"><Search size={18} /><span className="sr-only">Filter places by name or address</span><input value={keyword} onChange={event => { setKeyword(event.target.value); setLimit(18); }} placeholder="Filter by place name, city or address" /></label>
    <div className="n-result-summary" role="status"><strong>{results.length} places{area ? ` near ${area.name}` : textArea ? ` matching ${textArea}` : ' to explore'}</strong><span>{area ? `Sorted by approximate straight-line distance · ${radius} km radius${accuracy ? ` · device accuracy about ${Math.round(accuracy)} m` : ''}` : 'Choose an area or use your location to sort by distance.'}</span>{area && <button type="button" onClick={() => { generation.current++; request.current?.abort(); setBusy(false); location.clearLocation(); setArea(null); setAccuracy(null); setTextArea(''); setChoices([]); setError(''); }}>Clear location</button>}</div>
    {unavailable && <p className="notice">The mosque directory is temporarily unavailable. Food source records remain accessible.</p>}
    {area && unknown > 0 && <p className="n-small">{unknown} matching listings have no resolved location and are excluded from distance results. Clear location to browse them by city.</p>}
    <div className="n-results">{results.slice(0, limit).map(place => <article className="n-place" key={`${place.type}:${place.id}`}><div className="n-place-image"><Image src={place.type === 'mosque' ? '/media/prayer-space.jpg' : '/media/shared-table.jpg'} alt="" fill sizes="(max-width:600px) 90vw, (max-width:1000px) 45vw, 30vw" /><span>{place.type === 'mosque' ? 'MOSQUE & PRAYER SPACE' : 'HALAL FOOD · SOURCE-LISTED'}</span><small>Illustrative photo</small>{place.distance !== null && <b>{place.distance < 1 ? '< 1' : place.distance.toFixed(1)} km</b>}</div><div className="n-place-copy"><span className="v-label">{place.city}</span><h3>{place.href ? <Link href={place.href}>{place.name}</Link> : place.name}</h3><p><MapPin size={15} />{place.address || `${place.city} · branch address needs confirmation`}</p>{place.halal && <p className="n-halal">{place.halal}</p>}<small>{place.geoAccuracy || 'Location unavailable'} · {place.checkedAt ? `Source checked ${place.checkedAt.slice(0, 10)}` : 'Check current details with the mosque'}</small><div className="n-place-links">{place.href && <Link href={place.href}>View details ↗</Link>}{place.website && <a href={place.website} target="_blank" rel="noreferrer">Website ↗</a>}{place.sourceUrl && <a href={place.sourceUrl} target="_blank" rel="noreferrer">View source ↗</a>}<a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name} ${place.address || place.city} Canada`)}`} target="_blank" rel="noreferrer">Directions ↗</a></div></div></article>)}</div>
    {!results.length && <div className="empty-state"><MapPin size={36} /><h2>We’re still growing here.</h2><p>No listings in our current directory match this area and radius. Try a wider radius or another area, or suggest a place.</p><Link className="portal-button" href="/submit">Suggest a place</Link><p>For wider coverage, explore <a className="text-link" href="https://gtamasjids.com/" target="_blank" rel="noreferrer">GTA Masjids ↗</a> or <a className="text-link" href="https://halalfoodpass.ca/canada/" target="_blank" rel="noreferrer">Halal Food Pass Canada ↗</a>.</p></div>}
    {results.length > limit && <button className="portal-button secondary n-show-more" onClick={() => setLimit(value => value + 18)}>Show more places ({results.length - limit} remaining)</button>}
    <aside className="n-coverage"><h2>Local discovery, with context.</h2><p>Search areas across Canada; listing coverage currently starts in the GTA. Map matches and distances are approximate, not driving routes. This is not an exhaustive directory. Food entries include certifier listings and owner declarations, with source labels. Confirm current certification, ingredients and menu scope with the outlet and certifier. Photos illustrate the category and do not depict the listed places.</p><p>Area lookup and food coordinates: <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap contributors / ODbL</a> via <a href="https://github.com/komoot/photon" target="_blank" rel="noreferrer">Photon</a>. <a href="/data/nearby-food.json">Download the attributed food-location dataset</a> · <a href="/data/nearby-mosques.json">Mosque-location dataset</a>. <Link href="/privacy">Location privacy</Link>.</p></aside>
  </>;
}

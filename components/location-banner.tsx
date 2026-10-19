'use client';
import Link from 'next/link';
import { LocateFixed, MapPin, X } from 'lucide-react';
import { useDeviceLocation } from './location-provider';
export function LocationBanner() {
  const { position, busy, message, requestLocation, clearLocation } = useDeviceLocation();
  return <aside className={`l-banner ${position ? 'l-enabled' : ''}`} aria-label="Location services"><div className="portal-container l-banner-inner"><MapPin size={21} aria-hidden="true" /><div className="l-banner-copy"><strong>{busy ? 'Finding your location…' : position ? 'Your location is on' : 'Discover what’s close to you'}</strong><span>{position ? 'Nearby mosques & halal food, sorted for you.' : 'Enable location for relevant mosques & halal food.'}</span></div><div className="l-banner-actions">{position ? <><Link href="/nearby" onClick={requestLocation} className="l-location-button"><LocateFixed size={16} />Near me</Link><button className="l-disable" onClick={clearLocation} aria-label="Turn off location for this session"><X size={17} /></button></> : <><button className="l-location-button" onClick={requestLocation} disabled={busy}><LocateFixed size={16} />{busy ? 'Locating…' : 'Enable location'}</button><Link href="/nearby#nearby-area" className="l-search-instead">Choose area</Link></>}</div>{message && <p className="l-error" role="alert">{message} <Link href="/nearby#nearby-area">Search an area →</Link></p>}</div></aside>;
}

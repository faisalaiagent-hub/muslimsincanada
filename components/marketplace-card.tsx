'use client';
import Link from 'next/link';
import {useState} from 'react';
import {ShoppingBag,MapPin} from 'lucide-react';
import {marketPrice,type MarketAd} from '@/lib/marketplace';
import {SaveButton} from './saved-items';
export function MarketplacePhoto({src,title}:{src?:string;title:string}){const [failed,setFailed]=useState<string>();return src&&failed!==src?<img src={src} alt={title} loading="lazy" onError={()=>setFailed(src)}/>:<div className="m-photo-fallback"><ShoppingBag size={42}/><span>Community offering</span></div>;}
export function MarketplaceCard({ad,distance}:{ad:MarketAd;distance?:number}){return <article className="m-card"><Link href={`/marketplace/${ad.id}`} className="m-card-photo"><MarketplacePhoto src={ad.images[0]} title={ad.title}/><span className="m-ad-label">Community advertisement</span></Link><div className="m-card-copy"><div className="m-card-meta"><span>{ad.category}</span><SaveButton item={{id:`marketplace:${ad.id}`,name:ad.title,href:`/marketplace/${ad.id}`,category:'Community advertisement',location:ad.city}}/></div><h3><Link href={`/marketplace/${ad.id}`}>{ad.title}</Link></h3><strong className="m-price">{marketPrice(ad)}</strong><p><MapPin size={14}/>{ad.city}{distance!==undefined?` · ~${distance.toFixed(1)} km`:''}</p><small>{ad.contactName} · Posted {new Date(ad.createdAt).toLocaleDateString('en-CA',{month:'short',day:'numeric'})}</small></div></article>;}

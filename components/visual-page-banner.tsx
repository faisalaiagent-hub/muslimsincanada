import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export function VisualPageBanner({ variant = 'discover' }: { variant?: 'discover' | 'resources' }) {
  const resource = variant === 'resources';
  return <aside className={`v-page-banner ${resource ? 'v-page-banner-resources' : ''}`}><div><span className="v-label">{resource ? 'A LITTLE HELP GOES A LONG WAY' : 'MAKE A LITTLE ROOM FOR DISCOVERY'}</span><h2>{resource ? 'Find support. Give something back.' : 'New places. Familiar feeling.'}</h2><Link href={resource ? '/submit?type=resource' : '/submit'}>{resource ? 'Share a helpful resource' : 'Know a place we’ve missed?'} <ArrowUpRight size={15} /></Link></div><div className="v-banner-images"><Image src={resource ? '/media/volunteers.jpg' : '/media/community-friends.jpg'} alt={resource ? 'Stock photograph of volunteers packing donations' : 'Stock photograph of friends enjoying time outdoors'} fill sizes="(max-width: 760px) 35vw, 25vw" /></div></aside>;
}

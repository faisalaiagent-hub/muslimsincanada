'use client';
import { useState } from 'react';
import { Copy, Share2 } from 'lucide-react';

export function DailyShare({ title, caption, path }: { title:string; caption:string; path:string }) {
  const [message,setMessage] = useState('');
  async function share() {
    const url = new URL(path,window.location.origin).href;
    try {
      if (navigator.share) await navigator.share({title,text:title,url});
      else {await navigator.clipboard.writeText(url);setMessage('Link copied');}
    } catch(error) {if(!(error instanceof DOMException && error.name==='AbortError'))setMessage('Open the highlight page and copy its address.');}
  }
  async function copy() {try{await navigator.clipboard.writeText(caption);setMessage('Post text copied');}catch{setMessage('Open the highlight page to select the post text.');}}
  return <div className="dh-share"><button type="button" onClick={share} aria-label={`Share ${title}`}><Share2 size={15}/>Share</button><button type="button" onClick={copy} aria-label={`Copy post text for ${title}`}><Copy size={15}/>Copy post</button><span role="status">{message}</span></div>;
}

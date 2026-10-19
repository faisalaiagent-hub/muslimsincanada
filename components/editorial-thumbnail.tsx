'use client';
import { useState } from 'react';
import { Globe2 } from 'lucide-react';

export function EditorialThumbnail({ src, label, small = false }: { src?: string; label: string; small?: boolean }) {
  const [failed, setFailed] = useState<string | undefined>();
  return src && failed !== src ? <img src={src} alt="" loading="lazy" onError={() => setFailed(src)} /> : <div className={`e-news-art${small ? ' e-art-small' : ''}`} aria-hidden="true"><Globe2 size={small ? 30 : 110} strokeWidth={.7} /><span>{label}</span>{!small && <><b>IDEAS. STORIES.<br />CONNECTIONS.</b><small>MIC illustration · image unavailable</small></>}</div>;
}

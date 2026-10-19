'use client';
import { useState } from 'react';
import type { FeedItem } from '@/lib/feed-parser';
import { EditorialThumbnail } from './editorial-thumbnail';

export function VoiceVideo({ video }: { video: FeedItem }) {
  const [playing, setPlaying] = useState<FeedItem | null>(null);
  return <div className="e-video">{playing ? <iframe src={`https://www.youtube-nocookie.com/embed/${playing.id}?autoplay=1`} title={playing.title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" /> : <button onClick={() => setPlaying(video)} aria-label={`Play ${video.title}`}><EditorialThumbnail src={video.image} label="Official channel video" /><span className="e-play" aria-hidden="true">▶</span><span className="e-video-label">WATCH VIDEO</span></button>}</div>;
}

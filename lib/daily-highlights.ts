import 'server-only';
import { cache } from 'react';
import bundled from '@/data/daily-highlights.json';
import { publishers, voices } from './editorial-config';
import { validateEdition, torontoDate } from './daily-highlights-core';
import type { DailyEdition } from './daily-highlights-core';

export const getDailyEditions = cache(async (): Promise<DailyEdition[]> => {
  let remote: unknown;
  try {
    const response = await fetch('https://raw.githubusercontent.com/faisalaiagent-hub/muslimsincanada/main/data/daily-highlights.json', { cache: 'no-store', signal: AbortSignal.timeout(4000) });
    if (response.ok && Number(response.headers.get('content-length') || 0) < 1_000_000) {
      const text = await response.text();
      if (text.length < 1_000_000) remote = JSON.parse(text);
    }
  } catch { /* Keep the bundled dated edition if the refresh service is unavailable. */ }
  const registry = [...publishers, ...voices];
  function editions(value: unknown): DailyEdition[] {
    const raw = (value as {editions?:unknown[]})?.editions;
    return Array.isArray(raw) ? raw.slice(-120).flatMap(e => {const valid = validateEdition(e, registry); return valid ? [valid] : [];}) : [];
  }
  const combined = new Map(editions(bundled).map(e => [e.date,e]));
  for (const edition of editions(remote)) combined.set(edition.date,edition);
  return [...combined.values()].sort((a,b) => b.date.localeCompare(a.date));
});
export async function getDailyEdition(date?: string) {
  const editions = await getDailyEditions();
  return date ? editions.find(e => e.date === date) : editions.find(e => e.date <= torontoDate() && e.items.every(i => !i.expiresAt || Date.parse(i.expiresAt) > Date.now()));
}

export function publisherImage(html: string, host: string): string | undefined {
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    if (!/(?:property|name)\s*=\s*["'](?:og:image|twitter:image)["']/i.test(tag)) continue;
    const raw = tag.match(/\bcontent\s*=\s*["']([^"']+)["']/i)?.[1]?.replace(/&amp;/g, '&');
    try { const url = new URL(raw || ''); if (url.protocol === 'https:' && url.hostname.replace(/^www\./, '') === host) return url.href; } catch {}
  }
}

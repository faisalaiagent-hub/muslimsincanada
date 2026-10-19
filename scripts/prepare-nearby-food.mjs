import { readFile, writeFile, mkdir } from 'node:fs/promises';
const input = JSON.parse(await readFile('data/gta-directory/gta-source-records.json', 'utf8'));
const text = value => value.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/\s+/g, ' ').trim();
const rows = input.hma_food_outlets.filter(row => row.category === 'restaurant_or_dessert_outlet');
const results = [];
for (let i = 0; i < rows.length; i += 3) {
  results.push(...await Promise.all(rows.slice(i, i + 3).map(async row => {
    try {
      const response = await fetch(row.source_url, { signal: AbortSignal.timeout(12000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const html = await response.text();
      const spans = [...html.matchAll(/<span\b[^>]*class="elementor-icon-list-text"[^>]*>([\s\S]*?)<\/span>/gi)].map(match => text(match[1]));
      const address = spans.find(value => /\b[A-Z]\d[A-Z]\s?\d[A-Z]\d\b/i.test(value) && !value.includes('1825 Markham')) || '';
      const website = [...html.matchAll(/<a\b[^>]*href="(https?:\/\/[^"<>]+)"[^>]*>([\s\S]*?)<\/a>/gi)].find(match => /fa-globe/.test(match[2]))?.[1] || '';
      return { id: row.id, name: row.name, type: 'food', city: row.city, region: row.region, address, website,
        sourceUrl: row.source_url, source: 'HMA branch page', checkedAt: new Date().toISOString(),
        halal: 'Listed by HMA; confirm current branch certificate and menu scope', latitude: null, longitude: null,
        geoAccuracy: 'unavailable', ...(address ? {} : { review: 'Branch address not resolved; excluded from distance results' }) };
    } catch (error) { return { id: row.id, error: error.message }; }
  })));
}
await mkdir('data/nearby', { recursive: true });
await writeFile('data/nearby/food-source-review.json', JSON.stringify(results, null, 2));
console.log(JSON.stringify({ total: results.length, withAddress: results.filter(row => row.address).length, errors: results.filter(row => row.error) }, null, 2));

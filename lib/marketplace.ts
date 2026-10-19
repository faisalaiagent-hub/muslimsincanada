export const marketCategories = ['Food & catering', 'Home services', 'Tutoring & classes', 'Professional services', 'Clothing & gifts', 'Products & other'] as const;
export type MarketState = 'draft' | 'pending' | 'published' | 'rejected' | 'withdrawn';
export type MarketInput = { title: string; description: string; category: string; city: string; serviceArea: string; latitude: number | null; longitude: number | null; priceMode: 'fixed' | 'quote' | 'free'; price: number | null; contactName: string; contactUrl: string; contactPhone: string; contactEmail: string; imagePaths: string[] };
export type MarketAd = MarketInput & { id: string; createdAt: string; state: MarketState | 'expired'; expiresAt?: string; images: string[]; revision: number; moderationNote?: string; sellerEmail?: string };
export function validateMarketInput(input: unknown, ownerId: string): MarketInput {
  if (!input || typeof input !== 'object') throw new Error('Complete your offering details.');
  const row = input as Record<string, unknown>;
  const text = (key: string, min: number, max: number) => { const value = typeof row[key] === 'string' ? row[key].trim() : ''; if (value.length < min || value.length > max) throw new Error(`Check ${key}: ${min}–${max} characters required.`); return value; };
  const title = text('title', 5, 120), description = text('description', 30, 3000), category = text('category', 1, 60), city = text('city', 2, 100), serviceArea = text('serviceArea', 0, 160), contactName = text('contactName', 2, 100);
  if (!(marketCategories as readonly string[]).includes(category)) throw new Error('Choose a category.');
  const priceMode = text('priceMode', 1, 20) as MarketInput['priceMode'];
  if (!['fixed', 'quote', 'free'].includes(priceMode)) throw new Error('Choose how to display your price.');
  const price = priceMode === 'fixed' ? Number(row.price) : null;
  if (priceMode === 'fixed' && (row.price === '' || row.price == null || !Number.isFinite(price) || price! < 0 || price! > 1000000)) throw new Error('Enter a price from $0 to $1,000,000 CAD.');
  const contactUrl = text('contactUrl', 0, 1000), contactPhone = text('contactPhone', 0, 30), contactEmail = text('contactEmail', 0, 254).toLowerCase();
  if (contactUrl) { let url; try { url = new URL(contactUrl); } catch { throw new Error('Enter a complete https:// business link.'); } if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Use an HTTPS business link without credentials.'); }
  if (contactPhone && !/^\+?[\d\s().-]{7,30}$/.test(contactPhone)) throw new Error('Check your public business phone number.');
  if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) throw new Error('Check your public contact email.');
  if (!contactUrl && !contactPhone && !contactEmail) throw new Error('Choose at least one public contact method.');
  const imagePaths = row.imagePaths;
  if (!Array.isArray(imagePaths) || imagePaths.length > 5 || new Set(imagePaths).size !== imagePaths.length || imagePaths.some(path => typeof path !== 'string' || !path.startsWith(`${ownerId}/`) || !/^[\w-]+\/[\w-]+\.jpg$/.test(path))) throw new Error('Use up to five photos uploaded through MIC.');
  let latitude: number | null = null, longitude: number | null = null;
  if (row.latitude != null || row.longitude != null) {
    if (typeof row.latitude !== 'number' || typeof row.longitude !== 'number' || !Number.isFinite(row.latitude) || !Number.isFinite(row.longitude) || row.latitude < 41 || row.latitude > 84 || row.longitude < -141 || row.longitude > -52) throw new Error('Choose a Canadian service area, or leave map location unset.');
    latitude = Math.round(row.latitude * 1000) / 1000; longitude = Math.round(row.longitude * 1000) / 1000;
  }
  return { title, description, category, city, serviceArea, latitude, longitude, priceMode, price: price == null ? null : Math.round(price * 100) / 100, contactName, contactUrl, contactPhone, contactEmail, imagePaths };
}
export function marketPrice(ad: Pick<MarketAd, 'priceMode' | 'price'>) { return ad.priceMode === 'free' ? 'Free' : ad.priceMode === 'quote' ? 'Request a quote' : new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 2 }).format(ad.price || 0) + ' CAD'; }
export function activeMarketAd(payload: Record<string, any>, now = Date.now()) { return payload.market_state === 'published' && Number.isFinite(Date.parse(payload.expires_at)) && Date.parse(payload.expires_at) > now; }

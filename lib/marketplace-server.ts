import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { activeMarketAd, type MarketAd } from './marketplace';
export const MARKET_CHANNEL = 'mic-marketplace-v1';
export const MARKET_BUCKET = 'mic-marketplace';
export function marketAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Marketplace is temporarily unavailable.');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
export function marketModerator(email: string) { return (process.env.MIC_MARKETPLACE_MODERATORS || '').split(',').map(x => x.trim().toLowerCase()).filter(Boolean).includes(email.toLowerCase()); }
export async function marketUser(request: Request) {
  const token = request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
  if (!token || token.length > 10000) throw new MarketError('Sign in with your verified email to continue.', 401);
  const { data, error } = await marketAdmin().auth.getUser(token);
  if (error || !data.user?.email || !data.user.email_confirmed_at) throw new MarketError('Your sign-in expired, or your email is not verified. Sign in again.', 401);
  return { id: data.user.id, email: data.user.email.toLowerCase(), moderator: marketModerator(data.user.email) };
}
export class MarketError extends Error { constructor(message: string, public status = 400) { super(message); } }
export function marketResponse(error: unknown) { if(!(error instanceof MarketError)) console.error('Marketplace service error:', (error as {message?:string})?.message || 'Unknown service error'); return Response.json({ error: error instanceof MarketError ? error.message : 'The marketplace could not complete that request. Please try again.' }, { status: error instanceof MarketError ? error.status : 503, headers: { 'Cache-Control': 'no-store' } }); }
export function marketOrigin(request: Request) { if (request.headers.get('origin') !== new URL(request.url).origin) throw new MarketError('Use the form on MIC.', 403); }
export async function marketJson(request: Request) {
  marketOrigin(request);
  if (!request.headers.get('content-type')?.includes('application/json')) throw new MarketError('Send a JSON form.', 415);
  const reader = request.body?.getReader(); if (!reader) throw new MarketError('The form is empty.');
  let size = 0; const chunks: Uint8Array[] = [];
  while (true) { const {done,value} = await reader.read(); if(done) break; size += value.byteLength; if(size > 20000) { await reader.cancel(); throw new MarketError('The form is too large.',413); } chunks.push(value); }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw new MarketError('Invalid form data.'); }
}
export async function marketRow(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw new MarketError('Advertisement not found.', 404);
  const { data, error } = await marketAdmin().from('submission').select('id,created_at,submitter_email,payload').eq('id', id).eq('payload->>channel', MARKET_CHANNEL).maybeSingle();
  if (error) throw new Error('Marketplace lookup failed'); if (!data) throw new MarketError('Advertisement not found.', 404); return data;
}
export async function checkMarketPhotos(paths: string[], ownerId: string) {
  for (const path of paths) {
    if (!path.startsWith(`${ownerId}/`)) throw new MarketError('A photo does not belong to this advertiser.');
    const parts = path.split('/');
    const {data,error} = await marketAdmin().storage.from(MARKET_BUCKET).list(parts[0], {search:parts[1],limit:2});
    if(error || !data?.some(file=>file.name===parts[1])) throw new MarketError('A photo is missing. Please upload it again.');
  }
}
export async function marketDto(row: any, privateView = false): Promise<MarketAd> {
  const p = row.payload;
  const images = privateView ? await Promise.all((p.imagePaths || []).map(async (path: string) => { const {data} = await marketAdmin().storage.from(MARKET_BUCKET).createSignedUrl(path, 300); return data?.signedUrl || ''; })) : (p.imagePaths || []).map((_: string, index: number) => `/api/marketplace/media?ad=${row.id}&index=${index}`);
  return { id: row.id, createdAt: row.created_at, title: p.title, description: p.description, category: p.category, city: p.city, serviceArea: p.serviceArea, latitude: p.latitude ?? null, longitude: p.longitude ?? null, priceMode: p.priceMode, price: p.price, contactName: p.contactName, contactUrl: p.contactUrl, contactPhone: p.contactPhone, contactEmail: p.contactEmail, imagePaths: privateView ? p.imagePaths || [] : [], images, state: p.market_state === 'published' && !activeMarketAd(p) ? 'expired' : p.market_state, expiresAt: p.expires_at, revision: p.revision || 1, ...(privateView ? { moderationNote: p.moderation_note || '', sellerEmail: row.submitter_email } : {}) };
}
export async function publicMarket() {
  try {
    const {data,error} = await marketAdmin().from('submission').select('id,created_at,payload').eq('payload->>channel', MARKET_CHANNEL).eq('payload->>market_state','published').order('created_at',{ascending:false}).limit(500).abortSignal(AbortSignal.timeout(10000));
    if(error) throw error;
    return { ads: await Promise.all((data || []).filter(row => activeMarketAd(row.payload)).map(row => marketDto(row))), unavailable: false };
  } catch { return { ads: [] as MarketAd[], unavailable: true }; }
}

import 'server-only';
import { createHmac } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { validateSubmission } from '@/lib/submission-validation';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  if (request.headers.get('origin') !== new URL(request.url).origin) return NextResponse.json({ error: 'Please submit from the MIC website.' }, { status: 403 });
  if (!request.headers.get('content-type')?.includes('application/json')) return NextResponse.json({ error: 'Expected a JSON form submission.' }, { status: 415 });
  let input: ReturnType<typeof validateSubmission>;
  try {
    const reader = request.body?.getReader(); if (!reader) throw new Error('The form is empty.');
    let length = 0; const chunks: Uint8Array[] = [];
    while (true) { const { done, value } = await reader.read(); if (done) break; length += value.byteLength; if (length > 16000) { await reader.cancel(); return NextResponse.json({ error: 'Please shorten your submission.' }, { status: 413 }); } chunks.push(value); }
    input = validateSubmission(JSON.parse(Buffer.concat(chunks).toString('utf8')));
  } catch (error) { return NextResponse.json({ error: error instanceof SyntaxError ? 'Invalid form data.' : error instanceof Error ? error.message : 'Check the form fields.' }, { status: 400 }); }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ error: 'Suggestions are temporarily unavailable. Please try again later.' }, { status: 503 });
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  // The Vercel proxy owns this header in production. Hash before storage; never save raw IPs.
  const ip = process.env.VERCEL ? request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() || 'unknown' : 'local-development';
  const requestHash = createHmac('sha256', key).update(ip).digest('hex');
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  try {
    const [byEmail, byNetwork] = await Promise.all([
      client.from('submission').select('id', { count: 'exact', head: true }).eq('submitter_email', input.email).gte('created_at', since).abortSignal(AbortSignal.timeout(10000)),
      client.from('submission').select('id', { count: 'exact', head: true }).eq('payload->>request_hash', requestHash).gte('created_at', since).abortSignal(AbortSignal.timeout(10000)),
    ]);
    if (byEmail.error || byNetwork.error) throw new Error('Queue unavailable');
    if ((byEmail.count ?? 0) >= 3 || (byNetwork.count ?? 0) >= 10) return NextResponse.json({ error: 'Too many suggestions. Please try again in an hour.' }, { status: 429 });
    const { data, error } = await client.from('submission').insert({ submission_type: input.type, submitter_email: input.email, status: 'pending', payload: { name: input.name, city: input.city, description: input.description, source_url: input.url, listing_path: input.listing || null, email_verified: false, consent: true, request_hash: requestHash, channel: 'mic-portal' } }).select('id').abortSignal(AbortSignal.timeout(10000)).single();
    if (error || !data) throw new Error('Queue unavailable');
    return NextResponse.json({ id: data.id, status: 'pending' }, { status: 201 });
  } catch { return NextResponse.json({ error: 'We couldn’t save your suggestion. Your form is still here; please try again shortly.' }, { status: 503 }); }
}

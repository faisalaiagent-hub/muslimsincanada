import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { getSupabase } from './supabase';
// Source registry RLS is admin-only. Expose only public attribution fields,
// never raw snapshots, credentials or operational metadata.
export async function getPublicSource(id: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const client = url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : getSupabase();
  const { data } = await client.from('source').select('name,type,url').eq('id', id).abortSignal(AbortSignal.timeout(10000)).maybeSingle();
  return data as { name: string; type: string; url: string | null } | null;
}

import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
const base = process.env.MIC_TEST_URL || 'http://localhost:3100';
const origin = new URL(base).origin;
const publicClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const body = { type: 'resource', name: 'MIC portal automated QA — disposable test', city: 'Toronto, Canada', email: 'mic-portal-qa@example.invalid', description: 'Temporary verification record created to check the private moderation queue. This is not a public listing.', url: 'https://211.ca/', consent: true, company: '' };
async function post(payload, requestOrigin = origin) { return fetch(`${base}/api/submissions`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: requestOrigin }, body: JSON.stringify(payload) }); }
const pages = [['/', 'Your community.'], ['/search?type=mosques', 'What will you discover?'], ['/toronto/mosques', 'Mosques &amp; connections'], ['/resources', 'You don’t have to figure it out alone.'], ['/sources', 'Every connection has a source.'], ['/community', 'Find your people.'], ['/privacy', 'Privacy, in plain language.'], ['/submit', 'Know something worth sharing?']];
for (const [path, expected] of pages) {
  const response = await fetch(`${base}${path}`); assert.equal(response.status, 200, path);
  assert.ok((await response.text()).includes(expected), `Expected page content at ${path}`);
}
assert.equal((await post(body, 'https://unrelated.example')).status, 403, 'Reject foreign origins');
assert.equal((await post({ ...body, url: 'javascript:alert(1)' })).status, 400, 'Reject unsafe source URL');
assert.equal((await post({ ...body, consent: false })).status, 400, 'Require consent');
assert.equal((await post({ ...body, company: 'spam' })).status, 400, 'Reject honeypot');
let id;
try {
  const response = await post(body); const result = await response.json();
  assert.equal(response.status, 201, JSON.stringify(result)); id = result.id;
  const privateRecord = await admin.from('submission').select('id,status,payload').eq('id', id).single();
  assert.ifError(privateRecord.error); assert.equal(privateRecord.data.status, 'pending'); assert.equal(privateRecord.data.payload.email_verified, false);
  const publicRecord = await publicClient.from('submission').select('id').eq('id', id);
  assert.ok(publicRecord.error || publicRecord.data.length === 0, 'Pending submissions must not be publicly readable');
  console.log('PASS: 8 portal pages; cross-origin, URL, consent and spam rejection; persistent pending suggestion; private queue access.');
} finally {
  if (id) {
    const cleanup = await admin.from('submission').delete().eq('id', id).eq('submitter_email', body.email);
    assert.ifError(cleanup.error);
    const check = await admin.from('submission').select('id').eq('id', id);
    assert.ifError(check.error); assert.equal(check.data.length, 0);
    console.log('PASS: temporary QA suggestion removed.');
  }
}

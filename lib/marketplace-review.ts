import 'server-only';
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { marketAdmin, marketRow, marketModerator, MarketError, MARKET_BUCKET, MARKET_CHANNEL, checkMarketPhotos, marketDto } from './marketplace-server';
import { marketPrice } from './marketplace';

const CHANNEL = 'mic-marketplace-review-email';
const SITE = 'https://www.muslimsincanada.com';
const escape = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]!));
function tokenFor(id: string) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('Review signing is unavailable');
  return createHmac('sha256', key).update(`mic-review-v1:${id}`).digest('hex');
}

export async function reviewAccess(id: unknown, token: unknown) {
  if (typeof id !== 'string' || !/^[0-9a-f-]{36}$/i.test(id) || typeof token !== 'string' || !/^[0-9a-f]{64}$/.test(token)) throw new MarketError('This review link is invalid or expired.',403);
  if (!timingSafeEqual(Buffer.from(token), Buffer.from(tokenFor(id)))) throw new MarketError('This review link is invalid or expired.',403);
  const { data, error } = await marketAdmin().from('submission').select('id,payload').eq('id',id).eq('payload->>channel',CHANNEL).maybeSingle();
  if (error) throw error;
  if (!data || !marketModerator(data.payload.recipient) || (!Number.isFinite(Date.parse(data.payload.expires_at)) || Date.parse(data.payload.expires_at) <= Date.now())) throw new MarketError('This review link has expired. Use the moderator dashboard for a fresh review.',410);
  const row = await marketRow(data.payload.ad_id);
  if (row.payload.market_state !== 'pending' || row.payload.revision !== data.payload.revision) throw new MarketError('This ad has already been reviewed, withdrawn or edited. Open the dashboard for its current version.',409);
  return { row, notice:data };
}

export async function reviewDecision(id: unknown, token: unknown, action: unknown, note: unknown) {
  const {row,notice} = await reviewAccess(id,token);
  if(action !== 'approve' && action !== 'reject') throw new MarketError('Choose an approval or request changes.');
  if(action === 'reject' && (typeof note !== 'string' || note.trim().length < 5 || note.length > 1000)) throw new MarketError('Explain the requested changes in 5–1,000 characters.');
  if(action === 'approve') {
    if(!row.payload.imagePaths?.length) throw new MarketError('The offering needs a photo before publication.');
    await checkMarketPhotos(row.payload.imagePaths,row.payload.owner_id);
  }
  const payload = {...row.payload,revision:row.payload.revision+1,market_state:action === 'approve' ? 'published':'rejected',moderation_note:action === 'reject' ? (note as string).trim():'',moderated_at:new Date().toISOString(),moderated_by:notice.payload.recipient,moderation_method:'email-confirmation',updated_at:new Date().toISOString(),expires_at:action === 'approve' ? new Date(Date.now()+30*86400000).toISOString():null};
  const result=await marketAdmin().from('submission').update({payload}).eq('id',row.id).eq('payload->>channel',MARKET_CHANNEL).eq('payload->>market_state','pending').eq('payload->>revision',String(row.payload.revision)).select('id').maybeSingle();
  if(result.error) throw result.error;
  if(!result.data) throw new MarketError('Another reviewer changed this ad. Refresh its current status in the dashboard.',409);
  return {state:payload.market_state,adId:row.id};
}

async function sendNotice(notice: any, row: any) {
  const key=process.env.RESEND_API_KEY;
  if(!key) return false;
  const base=`${SITE}/marketplace/review#id=${notice.id}&token=${tokenFor(notice.id)}`;
  const p=row.payload;
  const photos=await Promise.all((p.imagePaths || []).map(async(path:string)=>{
    const {data}=await marketAdmin().storage.from(MARKET_BUCKET).createSignedUrl(path,86400);
    return data?.signedUrl;
  }));
  const price=marketPrice(p);
  const button=(label:string,action:string,color:string)=>`<a href="${base}&action=${action}" style="display:inline-block;background:${color};color:white;padding:14px 19px;margin:6px 8px 6px 0;border-radius:8px;text-decoration:none;font-weight:bold">${label}</a>`;
  const html=`<!doctype html><html><body style="margin:0;background:#f1f5ef;font-family:Arial,sans-serif;color:#173b36"><main style="max-width:620px;margin:24px auto;background:white;border-radius:16px;overflow:hidden"><div style="height:7px;background:linear-gradient(100deg,#00843d,#004333 65%,#df1230)"></div><div style="padding:28px"><p style="font-size:12px;letter-spacing:2px;color:#00843d">MIC · COMMUNITY MARKETPLACE</p><h1 style="font-size:25px">A community offering needs your review.</h1><p>The following details are provided by the advertiser. Review the photos and claims before approving.</p><h2>${escape(p.title)}</h2><p><strong>${escape(price)}</strong> · ${escape(p.category)} · ${escape(p.city)}</p><p>${escape(p.serviceArea)}</p>${photos.filter(Boolean).map(url=>`<img src="${escape(url)}" alt="Advertiser-provided offering photo" width="560" style="display:block;width:100%;max-width:560px;height:auto;border-radius:9px;margin:14px 0"/>`).join('')}<p style="white-space:pre-wrap;line-height:1.7">${escape(p.description)}</p><p><strong>Advertiser:</strong> ${escape(p.contactName)}<br/><strong>Account:</strong> ${escape(row.submitter_email)}<br/><strong>Public contact:</strong> ${escape([p.contactUrl,p.contactEmail,p.contactPhone].filter(Boolean).join(' · '))}</p>${button('Approve for 30 days','approve','#00843d')}${button('Request changes','reject','#a91e32')}<p><a href="${base}&action=inspect" style="color:#075c3b">View full advertisement and all photos →</a></p><p style="font-size:12px;line-height:1.7;color:#596d61">These private review links expire in 24 hours and stop working when the offering changes or is reviewed. Opening a link never publishes an ad: you must confirm the decision. Keep this email private; anyone holding the link can review this version.</p><p><a href="${SITE}/marketplace/account">Open MIC moderation dashboard</a></p></div></main></body></html>`;
  const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json','Idempotency-Key':`mic-review-${notice.id}-${notice.payload.last_attempt || 'first'}`},body:JSON.stringify({from:'Muslims in Canada <signin@muslimsincanada.com>',to:[notice.payload.recipient],subject:`MIC review needed: ${p.title.replace(/[\r\n]/g,' ').slice(0,120)}`,html,text:`MIC offering awaiting review\n\n${p.title}\n${price} · ${p.city}\n${p.description}\n\nApprove (confirmation required): ${base}&action=approve\nRequest changes: ${base}&action=reject\nView full details: ${base}&action=inspect\n\nPrivate links expire in 24 hours. Do not forward.`,tags:[{name:'category',value:'marketplace-review'}]}),signal:AbortSignal.timeout(12000)});
  if(!response.ok) throw new Error(`Moderator email provider returned ${response.status}`);
  return true;
}

// A private durable notice is saved before delivery. Failure never loses the ad.
export async function notifyMarketReview(row: any) {
  if(row.payload.market_state !== 'pending') return false;
  const recipients=[...new Set((process.env.MIC_MARKETPLACE_MODERATORS || '').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean))].slice(0,10);
  let allSent=recipients.length>0;
  for(const recipient of recipients) {
    try {
      const previous=await marketAdmin().from('submission').select('id,payload').eq('payload->>channel',CHANNEL).eq('payload->>ad_id',row.id).eq('payload->>revision',String(row.payload.revision)).eq('payload->>recipient',recipient).order('created_at',{ascending:false}).limit(1).maybeSingle();
      if(previous.error) throw previous.error;
      let notice=previous.data;
      if(notice?.payload.delivery === 'sent' && Date.parse(notice.payload.expires_at)>Date.now()) continue;
      if(notice?.payload.last_attempt && Date.now()-Date.parse(notice.payload.last_attempt)<60000){allSent=false;continue;}
      if(!notice || Date.parse(notice.payload.expires_at)<=Date.now()) {
        const payload={channel:CHANNEL,ad_id:row.id,revision:row.payload.revision,recipient,expires_at:new Date(Date.now()+86400000).toISOString(),delivery:'queued',last_attempt:null};
        const saved=await marketAdmin().from('submission').insert({id:randomUUID(),submission_type:'correction',submitter_email:recipient,status:'pending',payload}).select('id,payload').single();
        if(saved.error) throw saved.error;
        notice=saved.data;
      }
      let delivered=false;
      try { delivered=await sendNotice(notice,row); }
      catch(error) { console.error('Marketplace moderator email:',(error as Error).message); }
      if(!delivered) allSent=false;
      await marketAdmin().from('submission').update({payload:{...notice!.payload,delivery:delivered?'sent':process.env.RESEND_API_KEY?'failed':'unconfigured',last_attempt:new Date().toISOString()}}).eq('id',notice!.id).eq('payload->>channel',CHANNEL);
    } catch(error) { allSent=false;console.error('Marketplace review notice:',(error as Error).message); }
  }
  return allSent;
}

export async function inspectReview(id:unknown,token:unknown) {
  const {row,notice}=await reviewAccess(id,token);
  return {ad:await marketDto(row,true),expiresAt:notice.payload.expires_at};
}

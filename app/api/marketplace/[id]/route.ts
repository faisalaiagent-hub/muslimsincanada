import { marketAdmin, marketUser, marketJson, marketResponse, marketDto, marketRow, MarketError, MARKET_CHANNEL, checkMarketPhotos } from '@/lib/marketplace-server';
import { validateMarketInput } from '@/lib/marketplace';
export async function PATCH(request: Request, context: {params: Promise<{id:string}>}) {
  try {
    const user = await marketUser(request), body = await marketJson(request), {id} = await context.params, row = await marketRow(id), p = row.payload;
    if(p.owner_id !== user.id && !user.moderator) throw new MarketError('You cannot manage this advertisement.',403);
    if(body.revision !== p.revision) throw new MarketError('This ad changed in another tab. Refresh before trying again.',409);
    let next = {...p,revision:p.revision+1,updated_at:new Date().toISOString()};
    if(body.action === 'withdraw') next.market_state = 'withdrawn';
    else if(body.action === 'approve' || body.action === 'reject') {
      if(!user.moderator) throw new MarketError('MIC moderator access is required.',403);
      if(body.action === 'approve' && p.market_state !== 'pending') throw new MarketError('Only submitted ads awaiting review can be approved.');
      if(body.action === 'approve' && !p.imagePaths?.length) throw new MarketError('At least one photo is required before publication.');
      if(body.action === 'reject' && (typeof body.note !== 'string' || !body.note.trim())) throw new MarketError('Include a review note for the advertiser.');
      if(body.action === 'approve') await checkMarketPhotos(p.imagePaths,p.owner_id);
      next = {...next,market_state:body.action === 'approve' ? 'published' : 'rejected',moderation_note:typeof body.note === 'string' ? body.note.trim().slice(0,1000) : '',moderated_at:new Date().toISOString(),...(body.action === 'approve' ? {expires_at:new Date(Date.now()+30*86400000).toISOString()} : {})};
    } else if(body.action === 'save' || body.action === 'renew') {
      if(p.owner_id !== user.id) throw new MarketError('Only the advertiser can edit or renew this ad.',403);
      if(p.market_state === 'withdrawn') {
        const quota = await marketAdmin().from('submission').select('id',{count:'exact',head:true}).eq('payload->>channel',MARKET_CHANNEL).eq('payload->>owner_id',user.id).neq('payload->>market_state','withdrawn');
        if(quota.error) throw quota.error;
        if((quota.count || 0) >= 10) throw new MarketError('Withdraw another ad before restoring this one. You can have up to 10 active or draft advertisements.',429);
      }
      if(body.action === 'renew' && !['expired','rejected','withdrawn','published'].includes(p.market_state) && !(p.expires_at && Date.parse(p.expires_at)<=Date.now())) throw new MarketError('Save your ad to submit it for review.');
      if(body.action === 'save') { let offering; try { offering=validateMarketInput(body,user.id); } catch(error) {throw new MarketError((error as Error).message);} next={...next,...offering}; }
      if(body.consent !== true) throw new MarketError('Confirm your permission to publish these details.');
      next={...next,market_state:body.saveDraft === true ? 'draft' : 'pending',moderation_note:'',expires_at:null};
    } else throw new MarketError('Unknown advertisement action.');
    if(next.market_state === 'pending' && !next.imagePaths?.length) throw new MarketError('Add at least one photo before submitting for review.');
    if(body.action === 'save' || body.action === 'renew') await checkMarketPhotos(next.imagePaths,user.id);
    const {data,error} = await marketAdmin().from('submission').update({payload:next}).eq('id',id).eq('payload->>channel',MARKET_CHANNEL).eq('payload->>revision',String(p.revision)).select('id,created_at,submitter_email,payload').maybeSingle();
    if(error) throw error; if(!data) throw new MarketError('This ad changed. Refresh before trying again.',409);
    return Response.json({ad:await marketDto(data,true)},{headers:{'Cache-Control':'no-store'}});
  } catch(error) {return marketResponse(error);}
}

import {marketJson,marketResponse,MarketError} from '@/lib/marketplace-server';
import {inspectReview,reviewDecision} from '@/lib/marketplace-review';

// GET and link previews cannot change moderation state.
export async function POST(request:Request) {
  try {
    const body=await marketJson(request);
    if(body.action === 'inspect') return Response.json(await inspectReview(body.id,body.token),{headers:{'Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});
    if(body.confirm !== true) throw new MarketError('Confirm the review decision before continuing.');
    return Response.json(await reviewDecision(body.id,body.token,body.action,body.note),{headers:{'Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});
  } catch(error) { return marketResponse(error); }
}

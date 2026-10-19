import sharp from 'sharp';
import { randomUUID } from 'node:crypto';
import { marketUser, marketAdmin, marketOrigin, marketResponse, MarketError, MARKET_BUCKET } from '@/lib/marketplace-server';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    marketOrigin(request); const user = await marketUser(request);
    if(!request.headers.get('content-type')?.includes('multipart/form-data')) throw new MarketError('Choose a photo.',415);
    const reader=request.body?.getReader(); if(!reader) throw new MarketError('Photo is missing.'); let size=0; const chunks:Uint8Array[]=[];
    while(true) {const {done,value}=await reader.read(); if(done)break; size+=value.byteLength; if(size>3500000){await reader.cancel();throw new MarketError('Please use a smaller photo (under 3 MB).',413);}chunks.push(value);}
    const form=await new Response(Buffer.concat(chunks),{headers:{'content-type':request.headers.get('content-type')!}}).formData();
    const photo=form.get('photo'); if(!(photo instanceof File) || !['image/jpeg','image/png','image/webp'].includes(photo.type)) throw new MarketError('Choose a JPG, PNG or WebP photo.');
    const admin=marketAdmin(); const existing=await admin.storage.from(MARKET_BUCKET).list(user.id,{limit:51});
    if(existing.error)throw existing.error; if((existing.data?.length||0)>=50)throw new MarketError('Your photo allowance is full. Contact MIC for help.',429);
    let image:Buffer; const bytes=Buffer.from(await photo.arrayBuffer());
    if(!((bytes[0]===255&&bytes[1]===216&&bytes[2]===255)||bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))||(bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP')))throw new MarketError('The file is not a supported photo.');
    try {image=await sharp(bytes,{limitInputPixels:32000000,animated:false}).rotate().resize({width:1600,height:1600,fit:'inside',withoutEnlargement:true}).flatten({background:'#ffffff'}).jpeg({quality:82}).toBuffer();} catch {throw new MarketError('That photo could not be read. Try another JPG, PNG or WebP.');}
    const path=`${user.id}/${randomUUID()}.jpg`;
    const saved=await admin.storage.from(MARKET_BUCKET).upload(path,new Blob([new Uint8Array(image)],{type:'image/jpeg'}),{contentType:'image/jpeg',upsert:false}); if(saved.error)throw new Error(`Photo storage failed: ${saved.error.message}`);
    const signed=await admin.storage.from(MARKET_BUCKET).createSignedUrl(path,300); if(signed.error)throw signed.error;
    return Response.json({path,url:signed.data.signedUrl},{status:201,headers:{'Cache-Control':'no-store'}});
  }catch(error){return marketResponse(error);}
}

import {NextRequest,NextResponse} from 'next/server';
import {createClient} from '@supabase/supabase-js';
export const runtime='nodejs';
const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishable=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const secret=process.env.SUPABASE_SERVICE_ROLE_KEY;
export async function POST(req:NextRequest){
 try{
  if(!url||!publishable||!secret)return NextResponse.json({error:'Submissions unavailable'},{status:503});
  const origin=req.headers.get('origin');
  if(!origin||new URL(origin).host!==req.nextUrl.host)return NextResponse.json({error:'Invalid origin'},{status:403});
  const token=req.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
  if(!token)return NextResponse.json({error:'Sign in required'},{status:401});
  const auth=createClient(url,publishable,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:{user},error:authError}=await auth.auth.getUser(token);
  if(authError||!user||user.is_anonymous)return NextResponse.json({error:'Sign in required'},{status:401});
  const payload=await req.json();
  const title=String(payload.title||'').trim(),model=String(payload.model||'').trim();
  const source=String(payload.source||'').trim(),link=String(payload.source_url||'').trim();
  const asking=Number(payload.asking_price),reference=Number(payload.reference_price);
  if(title.length<3||title.length>180||model.length<2||model.length>120||source.length<2||source.length>80||!Number.isFinite(asking)||asking<=0||!Number.isFinite(reference)||reference<=0)return NextResponse.json({error:'Invalid fields'},{status:400});
  let parsed:URL;try{parsed=new URL(link)}catch{return NextResponse.json({error:'Invalid URL'},{status:400})}
  if(parsed.protocol!=='https:'||parsed.username||parsed.password||link.length>1500)return NextResponse.json({error:'HTTPS link required'},{status:400});
  parsed.hash='';
  const admin=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:duplicate,error:duplicateError}=await admin.from('public_deals').select('id').eq('source_url',parsed.toString()).limit(1);
  if(duplicateError)throw duplicateError;
  if(duplicate?.length)return NextResponse.json({error:'Already submitted'},{status:409});
  // The submitter is only stored as a non-public marker in an unpublished row.
  const marker='[submission:'+user.id+']';
  const since=new Date(Date.now()-86400000).toISOString();
  const {count,error:countError}=await admin.from('public_deals').select('id',{count:'exact',head:true}).eq('published',false).gte('created_at',since).like('note',marker+'%');
  if(countError)throw countError;
  if((count||0)>=3)return NextResponse.json({error:'Daily submission limit reached'},{status:429});
  const {error}=await admin.from('public_deals').insert({title,model,source,source_url:parsed.toString(),asking_price:asking,reference_price:reference,category:'Смартфони',note:marker+' Pending manual review; reference price unverified.',published:false,expires_at:new Date(Date.now()+86400000).toISOString()});
  if(error)throw error;
  return NextResponse.json({ok:true,status:'pending'},{status:201});
 }catch{return NextResponse.json({error:'Unable to submit deal'},{status:500})}
}

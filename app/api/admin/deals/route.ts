import {NextRequest,NextResponse} from 'next/server';
import {createClient} from '@supabase/supabase-js';
export const runtime='nodejs';
const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishable=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const secret=process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminIds=(process.env.FLIPRADAR_ADMIN_USER_IDS||'').split(',').map(x=>x.trim()).filter(Boolean);
const fail=(status:number,error:string)=>NextResponse.json({error},{status});
async function authorize(req:NextRequest){
 if(!url||!publishable||!secret||adminIds.length===0)return null;
 const origin=req.headers.get('origin');if(!origin||new URL(origin).host!==req.nextUrl.host)return null;
 const token=req.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];if(!token)return null;
 const auth=createClient(url,publishable,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:{user},error}=await auth.auth.getUser(token);
 return !error&&user&&!user.is_anonymous&&adminIds.includes(user.id)?createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}}):null;
}
export async function GET(req:NextRequest){
 const db=await authorize(req);if(!db)return fail(403,'Немає доступу');
 const {data,error}=await db.from('public_deals').select('id,title,model,category,source,source_url,asking_price,reference_price,estimated_costs,condition,note,created_at,expires_at,published').eq('published',false).order('created_at',{ascending:false}).limit(100);
 if(error)return fail(500,'Помилка завантаження');
 return NextResponse.json({items:data},{headers:{'Cache-Control':'no-store'}});
}
export async function PATCH(req:NextRequest){
 const db=await authorize(req);if(!db)return fail(403,'Немає доступу');
 const body=await req.json();
 if(!body||typeof body.id!=='string'||!['approve','reject'].includes(body.action))return fail(400,'Некоректні дані');
 if(body.action==='reject'){
  // Keep a record of rejected submissions to preserve deduplication and moderation history.
  const {error}=await db.from('public_deals').update({note:'Відхилено модератором. '+String(body.reason||'').slice(0,180),expires_at:new Date(Date.now()+86400000).toISOString()}).eq('id',body.id).eq('published',false);
  return error?fail(500,'Не вдалося відхилити'):NextResponse.json({ok:true});
 }
 const costs=Number(body.estimated_costs);
 if(!Number.isFinite(costs)||costs<0||costs>100000000||typeof body.note!=='string'||body.note.trim().length<15||body.note.length>500)return fail(400,'Вкажіть перевірені витрати та доказ ринкової ціни (від 15 символів)');
 const {data:existing,error:readError}=await db.from('public_deals').select('id,source_url,asking_price,reference_price').eq('id',body.id).eq('published',false).single();
 if(readError||!existing)return fail(404,'Чернетку не знайдено');
 if(!existing.source_url?.startsWith('https://')||Number(existing.asking_price)<=0||Number(existing.reference_price)<=0)return fail(400,'Перевірте посилання і ціни');
 const {error}=await db.from('public_deals').update({estimated_costs:costs,note:body.note.trim(),condition:'Перевірено модератором',observed_at:new Date().toISOString(),expires_at:new Date(Date.now()+86400000).toISOString(),published:true}).eq('id',body.id).eq('published',false);
 return error?fail(500,'Не вдалося опублікувати'):NextResponse.json({ok:true});
}

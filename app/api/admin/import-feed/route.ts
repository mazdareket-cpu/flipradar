import {NextRequest,NextResponse} from 'next/server';
import {createClient} from '@supabase/supabase-js';
export const runtime='nodejs';
const categories=['Смартфони','Компʼютери','Автозапчастини','Інструменти','Велосипеди','Одяг та взуття','Меблі','Зоотовари','Інше'];
const reply=(error:string,status:number)=>NextResponse.json({error},{status});
export async function POST(req:NextRequest){
 try{
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,publicKey=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,secret=process.env.SUPABASE_SERVICE_ROLE_KEY;
  const admins=(process.env.FLIPRADAR_ADMIN_USER_IDS||'').split(',').map(s=>s.trim());
  if(!url||!publicKey||!secret||!admins.some(Boolean))return reply('Сервіс не налаштовано',503);
  const origin=req.headers.get('origin');
  if(!origin||new URL(origin).host!==req.nextUrl.host)return reply('Недозволене джерело',403);
  if(Number(req.headers.get('content-length')||0)>80000)return reply('Файл завеликий',413);
  const token=req.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
  if(!token)return reply('Увійдіть в акаунт',401);
  const auth=createClient(url,publicKey,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:{user},error:authError}=await auth.auth.getUser(token);
  if(authError||!user||!admins.includes(user.id))return reply('Немає доступу',403);
  const payload=await req.json();
  if(!payload||!Array.isArray(payload.items)||payload.items.length<1||payload.items.length>30)return reply('Надішліть від 1 до 30 товарів',400);
  const rows=[] as Record<string,unknown>[];
  const seen=new Set<string>();
  for(const item of payload.items){
   if(!item||typeof item!=='object'||Array.isArray(item))return reply('Некоректний товар',400);
   const title=String(item.title||'').trim(),model=String(item.model||'').trim(),source=String(item.source||'').trim();
   const category=String(item.category||'Інше'),price=Number(item.asking_price),reference=Number(item.reference_price);
   if(title.length<3||title.length>180||model.length<2||model.length>120||source.length<2||source.length>80||!categories.includes(category)||!Number.isFinite(price)||price<=0||price>100000000||!Number.isFinite(reference)||reference<=0||reference>100000000)return reply('Перевірте назву, категорію та ціни',400);
   if(item.currency!==undefined&&item.currency!=='UAH')return reply('Підтримуються лише ціни у гривнях',400);
   let link:URL;try{link=new URL(String(item.source_url||''))}catch{return reply('Некоректне посилання',400)}
   if(link.protocol!=='https:'||link.username||link.password||link.href.length>1500||link.hostname==='localhost'||!link.hostname.includes('.'))return reply('Потрібне публічне HTTPS-посилання',400);
   link.hash='';const normalized=link.toString();
   if(seen.has(normalized))continue;
   seen.add(normalized);
   rows.push({title,model,source,source_url:normalized,category,asking_price:price,reference_price:reference,estimated_costs:0,condition:'Не перевірено',note:'Імпортовано з дозволеного фіду. Потребує ручної перевірки.',published:false,observed_at:new Date().toISOString(),expires_at:new Date(Date.now()+3*86400000).toISOString()});
  }
  const db=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data,error}=await db.from('public_deals').upsert(rows,{onConflict:'source_url',ignoreDuplicates:true}).select('id');
  if(error){console.error('Feed import failed',{code:error.code,message:error.message});return reply('Помилка імпорту ('+error.code+')',500)}
  return NextResponse.json({ok:true,imported:data?.length||0,duplicates:payload.items.length-(data?.length||0),status:'pending_moderation'},{headers:{'Cache-Control':'no-store'}});
 }catch{return reply('Не вдалося обробити фід',400)}
}

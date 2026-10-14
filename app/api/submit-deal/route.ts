import {NextRequest,NextResponse} from 'next/server';
import {createClient} from '@supabase/supabase-js';
export const runtime='nodejs';
const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishable=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const secret=process.env.SUPABASE_SERVICE_ROLE_KEY;
const categories=['Смартфони','Компʼютери','Автозапчастини','Інструменти','Велосипеди','Одяг та взуття','Меблі','Зоотовари','Інше'];
const respond=(error:string,status:number)=>NextResponse.json({error},{status});
export async function POST(req:NextRequest){
 try{
  if(!url||!publishable||!secret)return respond('Сервіс тимчасово недоступний',503);
  const origin=req.headers.get('origin');
  if(!origin||new URL(origin).host!==req.nextUrl.host)return respond('Неприпустиме джерело запиту',403);
  if(Number(req.headers.get('content-length')||0)>8000)return respond('Запит завеликий',413);
  const token=req.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
  if(!token)return respond('Увійдіть в акаунт',401);
  const auth=createClient(url,publishable,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:{user},error:authError}=await auth.auth.getUser(token);
  if(authError||!user||user.is_anonymous||!user.email_confirmed_at)return respond('Підтвердіть email і увійдіть',401);
  const payload=await req.json();
  if(!payload||typeof payload!=='object'||Array.isArray(payload))return respond('Некоректні дані',400);
  if(payload.website)return respond('Не вдалося прийняти пропозицію',400); // honeypot
  const title=String(payload.title||'').trim(),model=String(payload.model||'').trim();
  const source=String(payload.source||'').trim(),link=String(payload.source_url||'').trim();
  const category=String(payload.category||'Смартфони');
  const asking=Number(payload.asking_price),reference=Number(payload.reference_price);
  if(title.length<3||title.length>180||model.length<2||model.length>120||source.length<2||source.length>80||!categories.includes(category)||!Number.isFinite(asking)||asking<=0||asking>100000000||!Number.isFinite(reference)||reference<=0||reference>100000000)return respond('Перевірте назву, категорію та ціни',400);
  let parsed:URL;try{parsed=new URL(link)}catch{return respond('Некоректне посилання',400)}
  if(parsed.protocol!=='https:'||parsed.username||parsed.password||link.length>1500||parsed.hostname==='localhost'||!parsed.hostname.includes('.'))return respond('Потрібне публічне HTTPS-посилання',400);
  parsed.hash='';
  const admin=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
  const {error}=await admin.rpc('submit_public_deal',{p_user_id:user.id,p_title:title,p_model:model,p_category:category,p_source:source,p_source_url:parsed.toString(),p_asking_price:asking,p_reference_price:reference});
  if(error){
   if(error.code==='23505')return respond('Таке оголошення вже подано',409);
   if(error.message.includes('RATE_LIMIT'))return respond('Ліміт: 3 оголошення за 24 години',429);
   if(error.message.includes('INVALID_SUBMISSION'))return respond('Некоректні дані',400);
   return respond('Помилка збереження',500);
  }
  return NextResponse.json({ok:true,status:'pending'},{status:201});
 }catch{return respond('Не вдалося обробити запит',500)}
}

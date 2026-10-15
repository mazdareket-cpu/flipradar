'use client';
import {useEffect,useState} from 'react';
import {getSupabase} from '../lib/supabase';
type MyDeal={id:string;title:string;source:string;asking_price:number;created_at:string;published:boolean;expires_at:string;note:string};
export default function ContributorDashboard(){
 const [signedIn,setSignedIn]=useState(false),[deals,setDeals]=useState<MyDeal[]>([]),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 async function load(){
  const db=getSupabase();if(!db)return;
  setBusy(true);setMessage('');
  const {data:{user},error:authError}=await db.auth.getUser();
  if(authError||!user){setSignedIn(false);setDeals([]);setBusy(false);return}
  setSignedIn(true);
  const {data,error}=await db.from('public_deals').select('id,title,source,asking_price,created_at,published,expires_at,note').eq('contributor_id',user.id).order('created_at',{ascending:false}).limit(100);
  if(error)setMessage('Не вдалося отримати ваші знахідки.');else setDeals((data||[]) as MyDeal[]);
  setBusy(false);
 }
 useEffect(()=>{void load();const db=getSupabase();if(!db)return;const {data:{subscription}}=db.auth.onAuthStateChange(()=>{void load()});return ()=>subscription.unsubscribe()},[]);
 const status=(d:MyDeal)=>d.published?(new Date(d.expires_at).getTime()>Date.now()?'Опубліковано':'Термін публікації минув'):d.note.startsWith('Відхилено')?'Відхилено':'Очікує перевірки';
 return <section className="sectionBlock" id="my-finds"><div className="sectionHeading"><div><div className="eyebrow">FLIPRADAR · CONTRIBUTORS</div><h2>Мої знахідки</h2><p>Тут відображаються тільки пропозиції, які ти подав зі свого акаунта. Винагороди та виплати ще не працюють.</p></div><button className="ghostBtn" disabled={busy} onClick={()=>void load()}>↻ Оновити</button></div>
 {!signedIn?<p className="feedEmpty">Увійди в акаунт нижче, щоб побачити свої пропозиції.</p>:busy?<p className="feedEmpty">Завантаження…</p>:deals.length===0?<p className="feedEmpty">Ти ще не подав жодної пропозиції. Додай знахідку через форму нижче.</p>:<div className="feedGrid">{deals.map(d=><article className="feedCard" key={d.id}><div className="feedCardTop"><span>{status(d)}</span><span>{d.source}</span></div><h3>{d.title}</h3><p>Ціна: {Number(d.asking_price).toLocaleString('uk-UA')} грн</p><div className="feedCardBottom"><small>Подано: {new Date(d.created_at).toLocaleDateString('uk-UA')}</small><span>Винагорода: не нарахована</span></div></article>)}</div>}
 {message&&<p role="status">{message}</p>}<p className="feedDisclaimer">Публікація знахідки сама по собі не дає права на комісію. Майбутні виплати можливі лише після окремої згоди продавця, підтвердженого продажу та фактичного отримання винагороди.</p></section>
}

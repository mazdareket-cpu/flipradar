'use client';
import {useState,type FormEvent} from 'react';
import {getSupabase} from '../lib/supabase';
import {calculateReward} from '../lib/reward-policy';
export default function SubmitDeal(){
 const [status,setStatus]=useState(''),[busy,setBusy]=useState(false),[reward,setReward]=useState('500');
 const quote=calculateReward(Number(reward));
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setBusy(true);setStatus('');
  const form=e.currentTarget;const values=Object.fromEntries(new FormData(form).entries());
  try{
   const db=getSupabase();if(!db)throw Error('Supabase не налаштований');
   const {data:{session}}=await db.auth.getSession();
   if(!session)throw Error('Спочатку увійдіть в акаунт');
   const response=await fetch('/api/submit-deal',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+session.access_token},body:JSON.stringify(values)});
   const result=await response.json();if(!response.ok)throw Error(result.error||'Помилка');
   setStatus('Дякуємо! Пропозиція очікує перевірки.');form.reset();
  }catch(error){setStatus(error instanceof Error?error.message:'Помилка надсилання')}finally{setBusy(false)}
 }
 return <section className="sectionBlock" id="submit-deal"><div className="sectionHeading"><div><div className="eyebrow">FLIPRADAR · COMMUNITY</div><h2>Запропонувати оголошення</h2><p>Підтвердіть email, увійдіть в акаунт і надішліть реальну пропозицію. Публікуємо тільки після перевірки. До 3 пропозицій на добу.</p></div></div>
 <div className="feedEmpty"><h3>Майбутня винагорода за знахідку · 99/1</h3><p>За новою моделлю FlipRadar отримуватиме <strong>1% від винагороди автора знахідки</strong>, а автор — 99%. Це НЕ 1% від ціни товару. Винагорода можлива лише за умовами окремої погодженої програми, після підтвердженого продажу й надходження коштів. Поки що реферальне відстеження, підтвердження продажів і виплати не запущені: надсилання оголошення не гарантує заробітку.</p><label>Приклад винагороди від продавця, грн <input type="number" min="0" max="100000000" step="1" value={reward} onChange={e=>setReward(e.target.value)} style={{marginLeft:8,maxWidth:160}}/></label>{quote?<p><strong>Автор: {quote.contributorUah.toLocaleString('uk-UA')} грн · FlipRadar: {quote.platformFeeUah.toLocaleString('uk-UA')} грн</strong> (лише розрахунок, не баланс)</p>:<p>Вкажіть цілу суму від 0 до 100 000 000 грн.</p>}<p>Для українських продавців: надсилай справжні пропозиції з актуальною ціною. Після перевірки вони можуть потрапити в каталог на 3 дні.</p></div>
 <form onSubmit={submit} className="feedFilters">
 <input name="title" required minLength={3} maxLength={180} placeholder="Назва товару" aria-label="Назва товару"/>
 <input name="model" required minLength={2} maxLength={120} placeholder="Модель" aria-label="Модель"/>
 <select name="category" aria-label="Категорія" defaultValue="Смартфони"><option>Смартфони</option><option>Компʼютери</option><option>Автозапчастини</option><option>Інструменти</option><option>Велосипеди</option><option>Одяг та взуття</option><option>Меблі</option><option>Зоотовари</option><option>Інше</option></select><input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{position:"absolute",left:"-10000px"}}/><input name="source" required maxLength={80} placeholder="Майданчик (OLX тощо)" aria-label="Майданчик"/>
 <input name="source_url" type="url" required pattern="https://.*" placeholder="https://... посилання" aria-label="Посилання"/>
 <input name="asking_price" type="number" required min="1" step="0.01" placeholder="Ціна продавця, грн" aria-label="Ціна продавця"/>
 <input name="reference_price" type="number" required min="1" step="0.01" placeholder="Орієнтир ринку, грн" aria-label="Орієнтир ринку"/>
 <button type="submit" className="ghostBtn" disabled={busy}>{busy?'Надсилаємо…':'Надіслати на перевірку'}</button>
 </form><p role="status">{status}</p></section>
}

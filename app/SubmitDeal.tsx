'use client';
import {useState,type FormEvent} from 'react';
import {getSupabase} from '../lib/supabase';
export default function SubmitDeal(){
 const [status,setStatus]=useState(''),[busy,setBusy]=useState(false);
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
 return <section className="sectionBlock" id="submit-deal"><div className="sectionHeading"><div><div className="eyebrow">FLIPRADAR · COMMUNITY</div><h2>Запропонувати оголошення</h2><p>Увійдіть в акаунт і надішліть реальну пропозицію. Публікуємо тільки після перевірки. До 3 пропозицій на добу.</p></div></div>
 <form onSubmit={submit} className="feedFilters">
 <input name="title" required minLength={3} maxLength={180} placeholder="Назва товару" aria-label="Назва товару"/>
 <input name="model" required minLength={2} maxLength={120} placeholder="Модель" aria-label="Модель"/>
 <input name="source" required maxLength={80} placeholder="Майданчик (OLX тощо)" aria-label="Майданчик"/>
 <input name="source_url" type="url" required pattern="https://.*" placeholder="https://... посилання" aria-label="Посилання"/>
 <input name="asking_price" type="number" required min="1" step="0.01" placeholder="Ціна продавця, грн" aria-label="Ціна продавця"/>
 <input name="reference_price" type="number" required min="1" step="0.01" placeholder="Орієнтир ринку, грн" aria-label="Орієнтир ринку"/>
 <button type="submit" className="ghostBtn" disabled={busy}>{busy?'Надсилаємо…':'Надіслати на перевірку'}</button>
 </form><p role="status">{status}</p></section>
}

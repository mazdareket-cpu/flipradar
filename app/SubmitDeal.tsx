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
 return <section className="sectionBlock" id="submit-deal"><div className="sectionHeading"><div><div className="eyebrow">FLIPRADAR · COMMUNITY</div><h2>Запропонувати оголошення</h2><p>Підтвердіть email, увійдіть в акаунт і надішліть реальну пропозицію. Публікуємо тільки після перевірки. До 3 пропозицій на добу.</p></div></div>
 <div className="feedEmpty"><h3>Заробляй із FlipRadar · 85/15</h3><p>Якщо ти привів покупця за партнерським оголошенням і продавець підтвердив продаж та сплатив погоджену винагороду, 85% винагороди належить тобі, 15% — FlipRadar. Це частки від винагороди, а не ціни товару. Наразі система відстеження угод і виплат ще розробляється: звичайне подання оголошення не створює права на автоматичну виплату.</p><p>Для українських продавців: надсилай справжні пропозиції з актуальною ціною. Після перевірки вони можуть потрапити в каталог на 3 дні.</p></div>
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

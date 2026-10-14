'use client';

import {ChangeEvent, useEffect, useMemo, useState} from 'react';

type Listing = {id:string;model:string;price:number;url:string;source:string;condition:string;memory:string;date:string;note:string};
type Watch = {id:string;model:string;maxPrice:number;minDiscount:number};
const key='flipradar-listings-v4', watchKey='flipradar-watch-v4';
const uah=(n:number)=>new Intl.NumberFormat('uk-UA',{style:'currency',currency:'UAH',maximumFractionDigits:0}).format(n);
const median=(a:number[])=>{const b=[...a].sort((x,y)=>x-y);return b.length?(b.length%2?b[(b.length-1)/2]:(b[b.length/2-1]+b[b.length/2])/2):0};
const uid=()=>crypto.randomUUID();
const normalize=(s:string)=>s.toLowerCase().replace(/[^a-zа-яіїєґ0-9]+/gi,' ').trim();
const safeUrl=(s:string)=>{try{const u=new URL(s);return ['https:','http:'].includes(u.protocol)?u.toString():''}catch{return ''}};
const initial:Listing[]=[];
export default function DealHunter(){
 const [list,setList]=useState<Listing[]>(initial),[watches,setWatches]=useState<Watch[]>([]),[loaded,setLoaded]=useState(false);
 const [model,setModel]=useState('iPhone 13 128GB'),[price,setPrice]=useState(''),[url,setUrl]=useState(''),[source,setSource]=useState('OLX'),[condition,setCondition]=useState('Б/в'),[memory,setMemory]=useState('128GB'),[note,setNote]=useState('');
 const [search,setSearch]=useState(''),[cost,setCost]=useState('500'),[threshold,setThreshold]=useState('20'),[watchMax,setWatchMax]=useState('8000'),[message,setMessage]=useState('');
 useEffect(()=>{try{const a=localStorage.getItem(key),b=localStorage.getItem(watchKey);if(a)setList(JSON.parse(a));if(b)setWatches(JSON.parse(b))}catch{}setLoaded(true)},[]);
 useEffect(()=>{if(loaded)localStorage.setItem(key,JSON.stringify(list))},[list,loaded]);
 useEffect(()=>{if(loaded)localStorage.setItem(watchKey,JSON.stringify(watches))},[watches,loaded]);
 const stats=useMemo(()=>list.map(d=>{
   const peers=list.filter(x=>x.id!==d.id&&normalize(x.model)===normalize(d.model)&&normalize(x.memory)===normalize(d.memory)&&x.condition===d.condition&&x.price>0);
   const baseline=median(peers.map(x=>x.price));
   const discount=baseline>0?(baseline-d.price)/baseline*100:0;
   const profit=baseline-d.price-(Math.max(0,Number(cost)||0));
   const flags=[d.price<=0?'Некоректна ціна':'',!d.url?'Немає посилання':'',d.note.toLowerCase().match(/icloud|блок|розбит|дефект|неробоч|на запчастини/)?'Можливий дефект':'',peers.length<3?'Мало аналогів':''].filter(Boolean);
   return {...d,baseline,discount,profit,peerCount:peers.length,flags};
 }).filter(d=>normalize(d.model).includes(normalize(search))).sort((a,b)=>b.discount-a.discount),[list,cost,search]);
 const matches=stats.filter(d=>d.peerCount>=3&&d.discount>=(Number(threshold)||0)&&d.profit>0&&d.flags.length===0);
 function add(){const p=Number(price);if(!model.trim()||!Number.isFinite(p)||p<=0){setMessage('Вкажи модель і додатну ціну.');return}if(url.trim()&&!safeUrl(url)){setMessage('Посилання має починатися з https:// або http://');return}setList(v=>[{id:uid(),model:model.trim(),price:p,url:safeUrl(url),source,condition,memory,note,date:new Date().toISOString()},...v]);setPrice('');setUrl('');setNote('');setMessage('Оголошення додано до локального аналізу.') }
 function parseCSV(line:string){const a:string[]=[];let val='',q=false;for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'){if(q&&line[i+1]==='"'){val+='"';i++}else q=!q}else if(c===','&&!q){a.push(val);val=''}else val+=c}a.push(val);return a}
 async function importFile(e:ChangeEvent<HTMLInputElement>){const f=e.target.files?.[0];if(!f)return;try{if(f.size>2_000_000)throw Error('Файл завеликий (максимум 2 МБ).');const text=await f.text();const lines=text.replace(/^\uFEFF/,'').split(/\r?\n/).filter(x=>x.trim());const header=parseCSV(lines[0]).map(x=>x.trim().toLowerCase());const index=(...names:string[])=>header.findIndex(x=>names.includes(x));const mi=index('model','модель','title'),pi=index('price','ціна'),ui=index('url','посилання'),si=index('source','джерело'),ci=index('condition','стан'),mem=index('memory','память','памʼять'),ni=index('note','нотатка');if(mi<0||pi<0)throw Error('CSV повинен мати колонки model,price.');const incoming=lines.slice(1,1001).map(line=>{const a=parseCSV(line),p=Number((a[pi]||'').replace(/\s/g,'').replace(',','.'));return {id:uid(),model:(a[mi]||'').trim(),price:p,url:ui<0?'':safeUrl(a[ui]||''),source:si<0?'CSV':a[si]||'CSV',condition:ci<0?'Б/в':a[ci]||'Б/в',memory:mem<0?'Не вказано':a[mem]||'Не вказано',note:ni<0?'':a[ni]||'',date:new Date().toISOString()}}).filter(x=>x.model&&x.price>0);setList(old=>[...incoming,...old]);setMessage('Імпортовано '+incoming.length+' записів. Джерело та ціни не перевірені.')}catch(err){setMessage(err instanceof Error?err.message:'Помилка CSV')}e.target.value=''}
 function exportCSV(){const cols=['model','price','url','source','condition','memory','note'];const rows=[cols.join(','),...list.map(d=>cols.map(k=>'"'+String(d[k as keyof Listing]??'').replace(/"/g,'""')+'"').join(','))];const blob=new Blob([rows.join('\r\n')],{type:'text/csv;charset=utf-8'});const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='flipradar-listings.csv';a.click();URL.revokeObjectURL(u)}
 function addWatch(){const n=Number(watchMax);if(!model.trim()||n<=0){setMessage('Вкажи модель і максимальну ціну.');return}setWatches(w=>[{id:uid(),model:model.trim(),maxPrice:n,minDiscount:Number(threshold)||0},...w]);setMessage('Фільтр збережено у цьому браузері. Автоматичних сповіщень поки немає.')}
 return <section className="sectionBlock hunter" id="hunter">
  <div className="sectionHeading"><div><div className="eyebrow">FLIPRADAR 4.0 / 5.0 · DEAL INTELLIGENCE</div><h2>Мисливець за вигідними угодами</h2><p>Власний портфель знахідок, порівняння аналогів, ризики та збережені фільтри. Без фальшивих live-даних.</p></div><span className="sourceBadge">LOCAL · BETA</span></div>
  <div className="hunterStats"><div><span>Зібрано оголошень</span><strong>{list.length}</strong></div><div><span>Сигнали з 3+ аналогами</span><strong>{matches.length}</strong></div><div><span>Збережені фільтри</span><strong>{watches.length}</strong></div></div>
  <div className="hunterColumns"><div className="hunterPanel"><h3>＋ Додати реальне оголошення</h3><p>Встав дані з OLX або іншого дозволеного джерела. Не додавай особисті дані продавців.</p><div className="hunterFields">
    <label>Модель<input value={model} onChange={e=>setModel(e.target.value)} placeholder="iPhone 13 128GB"/></label><label>Ціна, грн<input type="number" min="1" value={price} onChange={e=>setPrice(e.target.value)} placeholder="7500"/></label>
    <label>Пам'ять<input value={memory} onChange={e=>setMemory(e.target.value)} placeholder="128GB"/></label><label>Стан<select value={condition} onChange={e=>setCondition(e.target.value)}><option>Б/в</option><option>Новий</option><option>Потребує ремонту</option><option>На запчастини</option></select></label>
    <label>Джерело<input value={source} onChange={e=>setSource(e.target.value)}/></label><label>Посилання<input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://..."/></label>
    <label className="hunterWide">Ризики / примітка<input value={note} onChange={e=>setNote(e.target.value)} placeholder="Батарея 82%, Face ID працює..."/></label></div>
    <button className="primaryBtn" onClick={add}>Додати до аналізу →</button>
    <div className="hunterImport"><label className="importBtn">⇧ Імпорт CSV<input type="file" accept=".csv,text/csv" hidden onChange={importFile}/></label><button className="ghostBtn" onClick={exportCSV}>⇩ Експорт CSV</button></div>
    <small>CSV: model,price,url,source,condition,memory,note. Імпорт — вручну або з джерела, яке дозволяє використання даних.</small>
  </div><div className="hunterPanel"><h3>◎ Налаштування радара</h3><p>Система порівнює лише однакові модель, пам'ять і стан. Ринковий орієнтир — медіана інших доданих записів.</p>
    <div className="hunterFields"><label>Мінімальна знижка, %<input type="number" min="0" max="99" value={threshold} onChange={e=>setThreshold(e.target.value)}/></label><label>Додаткові витрати, грн<input type="number" min="0" value={cost} onChange={e=>setCost(e.target.value)}/></label><label className="hunterWide">Макс. ціна для спостереження, грн<input type="number" min="0" value={watchMax} onChange={e=>setWatchMax(e.target.value)}/></label></div>
    <button className="ghostBtn" onClick={addWatch}>☆ Зберегти фільтр для {model}</button>
    <div className="hunterWatches">{watches.map(w=><div key={w.id}><span>{w.model} · до {uah(w.maxPrice)} · від {w.minDiscount}%</span><button aria-label="Видалити фільтр" onClick={()=>setWatches(v=>v.filter(x=>x.id!==w.id))}>×</button></div>)}</div>
    <div className="hunterInfo">Сповіщення Telegram, синхронізація між пристроями та автоматичний імпорт потребують сервера, бази даних і дозволеного джерела. Зараз збереження локальне.</div>
  </div></div>
  {message&&<div className="hunterMessage" role="status">{message}<button onClick={()=>setMessage('')} aria-label="Закрити">×</button></div>}
  <div className="hunterPanel hunterResults"><div className="hunterResultTop"><div><h3>Аналітика знахідок</h3><p>Сигнал формується лише за наявності мінімум 3 порівнюваних аналогів. Навіть тоді потрібна ручна перевірка.</p></div><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Фільтр за моделлю..."/></div>
   <div className="hunterTable"><table><thead><tr><th>Товар</th><th>Ціна</th><th>Медіана аналогів</th><th>Знижка</th><th>Потенційний прибуток</th><th>Перевірка</th><th>Дії</th></tr></thead><tbody>{stats.map(d=><tr key={d.id}><td><strong>{d.model}</strong><small>{d.memory} · {d.condition} · {d.source}</small></td><td>{uah(d.price)}</td><td>{d.peerCount>=3?uah(d.baseline):'Мало даних ('+d.peerCount+'/3)'}</td><td>{d.peerCount>=3?d.discount.toFixed(1)+'%':'—'}</td><td className={d.profit>0?'positive':'negative'}>{d.peerCount>=3?uah(d.profit):'—'}</td><td>{d.flags.length?d.flags.join(' · '):'Перевір вручну'}</td><td><div className="rowActions">{d.url&&<a href={d.url} target="_blank" rel="noopener noreferrer" className="iconBtn" title="Джерело">↗</a>}<button className="iconBtn" onClick={()=>setList(v=>v.filter(x=>x.id!==d.id))} title="Видалити">×</button></div></td></tr>)}</tbody></table>{!stats.length&&<div className="emptyState">Поки немає оголошень. Додай перше або імпортуй CSV.</div>}</div>
  </div>
  <div className="hunterPanel hunterPricing"><div><div className="eyebrow">FLIPRADAR 5.0 · BUSINESS</div><h3>Модель монетизації</h3><p>Можна використовувати сервіс для власних закупівель і згодом продавати доступ іншим реселерам.</p></div><div className="hunterPlans"><div><b>Free</b><strong>0 ₴</strong><span>Ручний аналіз і локальний список</span></div><div><b>Pro · план</b><strong>299 ₴/міс</strong><span>Майбутні розширені фільтри та історія цін</span></div><div><b>Hunter · план</b><strong>599 ₴/міс</strong><span>Майбутні швидкі сповіщення</span></div></div><small>Платежі й підписки ще НЕ активовані. Для них потрібні реєстрація, база даних, еквайринг і захищена серверна перевірка оплат.</small></div>
 </section>
}

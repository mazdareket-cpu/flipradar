'use client';

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import DealHunter from './DealHunter';
import PublicDeals from './PublicDeals';
import ResaleLedger from './ResaleLedger';
import AccountPanel from './AccountPanel';

type Deal = {
  id: string; title: string; category: string; buy: number; sell: number;
  shipping: number; repair: number; fees: number; source: string; condition: string; note: string; demo?: boolean;
};

const seedDeals: Deal[] = [
  { id: 'demo-1', title: 'Ігрова відеокарта — приклад', category: 'Компʼютери', buy: 4200, sell: 5400, shipping: 100, repair: 0, fees: 150, source: 'https://www.olx.ua/uk/list/q-відеокарта/', condition: 'Б/в', note: 'Демонстраційні дані — перевірити реальні ціни', demo: true },
  { id: 'demo-2', title: 'Смартфон — приклад', category: 'Смартфони', buy: 5200, sell: 6500, shipping: 100, repair: 300, fees: 150, source: 'https://www.olx.ua/uk/list/q-смартфон/', condition: 'Потребує перевірки', note: 'Не є реальною актуальною пропозицією', demo: true },
  { id: 'demo-3', title: 'Електроінструмент — приклад', category: 'Інструменти', buy: 1800, sell: 2600, shipping: 100, repair: 0, fees: 80, source: 'https://www.olx.ua/uk/list/q-електроінструмент/', condition: 'Б/в', note: 'Приклад розрахунку', demo: true }
];
const categories = ['Смартфони', 'Компʼютери', 'Автозапчастини', 'Інструменти', 'Велосипеди', 'Одяг та взуття', 'Меблі', 'Зоотовари', 'Інше'];
const money = (v: number) => new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH', maximumFractionDigits: 0 }).format(v);
const calc = (d: Deal) => { const cost = d.buy + d.shipping + d.repair + d.fees; const profit = d.sell - cost; return { cost, profit, roi: cost > 0 ? profit / cost * 100 : 0, margin: d.sell > 0 ? profit / d.sell * 100 : 0 }; };
const blank: Omit<Deal, 'id'> = { title: '', category: 'Смартфони', buy: 0, sell: 0, shipping: 0, repair: 0, fees: 0, source: '', condition: 'Б/в', note: '' };

export default function Home() {
  const [deals, setDeals] = useState<Deal[]>(seedDeals);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Усі категорії');
  const [minProfit, setMinProfit] = useState('0');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(blank);
  const [notice, setNotice] = useState('');
  const [searchTerm, setSearchTerm] = useState('iPhone');
  const [searchCategory, setSearchCategory] = useState('Усі категорії');
  const [techModel, setTechModel] = useState('iPhone 13 128GB');
  const [techBuy, setTechBuy] = useState('8500');
  const [techMarket, setTechMarket] = useState('11000');
  const [techCosts, setTechCosts] = useState('450');
  const techModels = ['iPhone 13 128GB','iPhone 14 128GB','Samsung Galaxy S23','MacBook Air M1','Lenovo ThinkPad T14','RTX 3060','PlayStation 5'];
  const buyPrice = Math.max(0, Number(techBuy) || 0);
  const marketPrice = Math.max(0, Number(techMarket) || 0);
  const extraCosts = Math.max(0, Number(techCosts) || 0);
  const estimatedProfit = marketPrice - buyPrice - extraCosts;
  const priceGap = marketPrice > 0 ? (marketPrice - buyPrice) / marketPrice * 100 : 0;
  const techROI = buyPrice + extraCosts > 0 ? estimatedProfit / (buyPrice + extraCosts) * 100 : 0;


  useEffect(() => {
    try { const raw = localStorage.getItem('flipradar-deals-v1'); if (raw) setDeals(JSON.parse(raw)); } catch { /* use demo seed */ }
    setReady(true);
  }, []);
  useEffect(() => { if (ready) localStorage.setItem('flipradar-deals-v1', JSON.stringify(deals)); }, [deals, ready]);

  const filtered = useMemo(() => deals.filter(d => {
    const q = query.trim().toLowerCase();
    return (!q || `${d.title} ${d.category} ${d.note}`.toLowerCase().includes(q)) &&
      (category === 'Усі категорії' || d.category === category) && calc(d).profit >= (Number(minProfit) || 0);
  }).sort((a, b) => calc(b).profit - calc(a).profit), [deals, query, category, minProfit]);
  const totalPotential = filtered.reduce((s, d) => s + Math.max(0, calc(d).profit), 0);
  const positive = filtered.filter(d => calc(d).profit > 0).length;

  function submitDeal(e: FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || form.buy <= 0 || form.sell <= 0) { setNotice('Вкажи назву та ціни купівлі й продажу більше нуля.'); return; }
    const newDeal: Deal = { ...form, id: crypto.randomUUID(), title: form.title.trim(), source: form.source.trim(), note: form.note.trim() };
    setDeals(prev => [newDeal, ...prev]); setForm(blank); setShowForm(false); setNotice('Угоду додано. Оцінка попередня — перевір ринкову ціну та стан товару.');
  }
  function importCsv(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const lines = String(reader.result || '').split(/\r?\n/).filter(Boolean);
      const rows = lines.slice(1).map((line, i) => {
        const cols = line.split(',').map(s => s.trim().replace(/^"|"$/g, ''));
        if (!cols[0] || !Number(cols[2]) || !Number(cols[3])) return null;
        return { id: crypto.randomUUID() + i, title: cols[0], category: cols[1] || 'Інше', buy: Number(cols[2]), sell: Number(cols[3]), shipping: Number(cols[4] || 0), repair: Number(cols[5] || 0), fees: Number(cols[6] || 0), source: cols[7] || '', condition: cols[8] || 'Не вказано', note: cols[9] || '' } as Deal;
      }).filter((x): x is Deal => Boolean(x));
      if (rows.length) { setDeals(prev => [...rows, ...prev]); setNotice(`Імпортовано угод: ${rows.length}. Перевір коректність CSV та цін.`); }
      else setNotice('Не вдалося імпортувати рядки. Перевір CSV і формат колонок у README.');
      e.target.value = '';
    }; reader.readAsText(file, 'utf-8');
  }
  function openSearch() {
    const term = [searchTerm.trim(), searchCategory !== 'Усі категорії' ? searchCategory : ''].filter(Boolean).join(' ');
    if (!term) { setNotice('Введи назву товару для пошуку.'); return; }
    const url = `https://www.olx.ua/uk/list/q-${encodeURIComponent(term).replace(/%20/g, '-')}/`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setNotice('Відкрито OLX. Це зовнішній пошук, а не автоматичний збір цін.');
  }
  function resetDemo() { setDeals(seedDeals); setNotice('Демонстраційні приклади відновлено.'); }

  return <main className="shell">
    <header className="topbar"><a className="brand" href="#top"><span className="brandMark">F</span><span>Flip<span className="brandAccent">Radar</span><small>SMART DEAL WORKSPACE</small></span></a><div className="topActions"><span className="status"><i/> MVP · локальний режим</span><a className="ghostBtn" href="#sources">Джерела даних ↗</a></div></header>
    <section className="hero" id="top"><div className="heroCopy"><div className="eyebrow"><span className="pulse"/> ЗНАЙДИ. ПЕРЕВІР. ПЕРЕПРОДАЙ.</div><h1>Не вгадуй ціну.<br/><em>Рахуй угоду.</em></h1><p>Робочий простір для реселерів: оцінюй витрати, рахуй потенційний прибуток і відкривай пошук товарів у зовнішніх джерелах.</p><div className="heroButtons"><button className="primaryBtn" onClick={() => { setShowForm(true); document.getElementById('deal-form')?.scrollIntoView({behavior:'smooth'}); }}>＋ Додати угоду</button><a className="ghostBtn" href="#deals">Переглянути список ↓</a></div><div className="trustLine"><span>✓ Безкоштовний MVP</span><span>✓ Дані зберігаються у цьому браузері</span></div></div><div className="heroVisual"><div className="orb orbOne"/><div className="orb orbTwo"/><div className="radarCard"><div className="radarHeader"><span>DEAL SNAPSHOT</span><span className="liveDot">● DEMO</span></div><div className="radarRing"><div className="ringLabel">ROI</div><strong>+{Math.round(calc(seedDeals[0]).roi)}%</strong><small>приклад</small></div><div className="snapshotRows"><div><span>Купівля</span><b>{money(seedDeals[0].buy)}</b></div><div><span>Витрати</span><b>{money(calc(seedDeals[0]).cost)}</b></div><div><span>Можливий прибуток</span><b className="positive">{money(calc(seedDeals[0]).profit)}</b></div></div><div className="snapshotFoot"><span className="miniBar"><i/></span><span>Демонстраційні дані, не актуальна пропозиція</span></div></div><div className="floatTag tagTop">↗ Аналіз витрат</div><div className="floatTag tagBottom">◎ 9 категорій</div></div></section>
    <section className="statsGrid"><div className="statCard"><span>Угод у списку</span><strong>{deals.length}</strong><small>Включно з демо-прикладами</small></div><div className="statCard"><span>Позитивний результат</span><strong>{positive}<small className="mutedInline"> / {filtered.length}</small></strong><small>За поточними фільтрами</small></div><div className="statCard"><span>Сума потенційного прибутку</span><strong>{money(totalPotential)}</strong><small>Не гарантія фактичного доходу</small></div><div className="statCard accentStat"><span>Майданчики</span><strong>4 джерела ↗</strong><small>OLX · Prom · ROZETKA · Hotline</small></div></section>
    {notice && <div className="notice" role="status"><span>ⓘ</span>{notice}<button onClick={() => setNotice('')} aria-label="Закрити повідомлення">×</button></div>}
    <section className="sectionBlock" id="deals"><div className="sectionHeading"><div><div className="eyebrow">ТВОЯ АНАЛІТИКА</div><h2>Список угод <span className="countPill">{filtered.length}</span></h2><p>Порівнюй потенційну маржу з урахуванням витрат.</p></div><div className="headingActions"><label className="importBtn">⇧ Імпорт CSV<input type="file" accept=".csv,text/csv" onChange={importCsv} hidden/></label><button className="primaryBtn small" onClick={() => setShowForm(v => !v)}>＋ Нова угода</button></div></div>
      <div className="filterBar"><label className="searchInput"><span>⌕</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Пошук за назвою або категорією..."/></label><select value={category} onChange={e => setCategory(e.target.value)}><option>Усі категорії</option>{categories.map(c => <option key={c}>{c}</option>)}</select><label className="minProfit"><span>Мін. прибуток</span><input type="number" value={minProfit} min="0" onChange={e => setMinProfit(e.target.value)}/><span>₴</span></label></div>
      {showForm && <form className="dealForm" id="deal-form" onSubmit={submitDeal}><div className="formTitle"><div><h3>Додати нову угоду</h3><p>Внеси дані вручну або імпортуй CSV.</p></div><button type="button" className="closeBtn" onClick={() => setShowForm(false)}>×</button></div><div className="formGrid"><label>Назва товару<input required value={form.title} onChange={e => setForm({...form,title:e.target.value})} placeholder="Наприклад, iPhone 13 128 GB"/></label><label>Категорія<select value={form.category} onChange={e => setForm({...form,category:e.target.value})}>{categories.map(c=><option key={c}>{c}</option>)}</select></label><label>Ціна купівлі, ₴<input required min="1" type="number" value={form.buy || ''} onChange={e => setForm({...form,buy:Number(e.target.value)})}/></label><label>Очікувана ціна продажу, ₴<input required min="1" type="number" value={form.sell || ''} onChange={e => setForm({...form,sell:Number(e.target.value)})}/></label><label>Доставка, ₴<input min="0" type="number" value={form.shipping} onChange={e => setForm({...form,shipping:Number(e.target.value)})}/></label><label>Ремонт, ₴<input min="0" type="number" value={form.repair} onChange={e => setForm({...form,repair:Number(e.target.value)})}/></label><label>Комісії та інше, ₴<input min="0" type="number" value={form.fees} onChange={e => setForm({...form,fees:Number(e.target.value)})}/></label><label>Стан товару<select value={form.condition} onChange={e => setForm({...form,condition:e.target.value})}><option>Б/в</option><option>Новий</option><option>Потребує перевірки</option><option>Потребує ремонту</option><option>Не вказано</option></select></label><label className="wideField">Посилання на оголошення<input type="url" value={form.source} onChange={e => setForm({...form,source:e.target.value})} placeholder="https://..."/></label><label className="wideField">Нотатка<input value={form.note} onChange={e => setForm({...form,note:e.target.value})} placeholder="Що потрібно перевірити перед покупкою"/></label></div><div className="formBottom"><span>Після збереження розрахунок оновиться автоматично.</span><button className="primaryBtn small" type="submit">Зберегти угоду →</button></div></form>}
      <div className="tableWrap"><table><thead><tr><th>Товар</th><th>Купівля</th><th>Продаж (оцінка)</th><th>Витрати всього</th><th>Прибуток</th><th>ROI</th><th>Дія</th></tr></thead><tbody>{filtered.map(d => { const c = calc(d); return <tr key={d.id}><td><div className="productCell"><div className="productIcon">{d.category.includes('Смартф')?'▣':d.category.includes('Комп')?'▦':d.category.includes('Авто')?'◈':d.category.includes('Інстру')?'⚒':'◇'}</div><div><strong>{d.title}</strong><span>{d.category} · {d.condition}{d.demo && <i className="demoTag">DEMO</i>}</span>{d.note && <small>{d.note}</small>}</div></div></td><td>{money(d.buy)}</td><td>{money(d.sell)}</td><td>{money(c.cost)}</td><td><strong className={c.profit >= 0 ? 'positive' : 'negative'}>{c.profit > 0 ? '+' : ''}{money(c.profit)}</strong></td><td><span className={`roiPill ${c.roi >= 0 ? 'roiPositive':'roiNegative'}`}>{c.roi.toFixed(1)}%</span></td><td><div className="rowActions">{d.source && <a className="iconBtn" href={d.source} target="_blank" rel="noreferrer" title="Відкрити джерело">↗</a>}<button className="iconBtn deleteBtn" title="Видалити" onClick={() => setDeals(prev => prev.filter(x => x.id !== d.id))}>×</button></div></td></tr>})}</tbody></table>{filtered.length===0 && <div className="emptyState"><strong>Нічого не знайдено</strong><span>Зміни фільтри або додай нову угоду.</span></div>}</div>
      <div className="tableFoot"><span>ⓘ Результати розраховуються з введених тобою даних.</span><button className="textBtn" onClick={resetDemo}>Відновити демо-приклади</button></div>
    </section>
    <section className="sectionBlock techSection" id="tech-radar">
      <div className="sectionHeading"><div><div className="eyebrow">FLIPRADAR 3.0 · TECH LAB</div><h2>Аналіз смартфонів і техніки</h2><p>Перевір потенційну вигоду за введеними цінами. Це калькулятор, не потік актуальних оголошень.</p></div><div className="sourceBadge"><span className="sourceDot"/> Ручний аналіз</div></div>
      <div className="techLayout"><div className="techControls">
        <label>Модель товару<select value={techModel} onChange={e=>setTechModel(e.target.value)}>{techModels.map(m=><option key={m}>{m}</option>)}</select></label>
        <label>Ціна оголошення, грн<input type="number" min="0" value={techBuy} onChange={e=>setTechBuy(e.target.value)}/></label>
        <label>Орієнтир ринкової ціни, грн<input type="number" min="0" value={techMarket} onChange={e=>setTechMarket(e.target.value)}/></label>
        <label>Доставка, ремонт, комісії, грн<input type="number" min="0" value={techCosts} onChange={e=>setTechCosts(e.target.value)}/></label>
        <div className="techActions"><a href={`https://www.olx.ua/uk/list/q-${encodeURIComponent(techModel).replace(/%20/g,'-')}/`} target="_blank" rel="noopener noreferrer" className="ghostBtn">Знайти на OLX ↗</a><a href={`https://hotline.ua/ua/sr/?q=${encodeURIComponent(techModel)}`} target="_blank" rel="noopener noreferrer" className="ghostBtn">Порівняти на Hotline ↗</a></div>
      </div><div className="techResult">
        <div className="eyebrow">DEAL SIGNAL · ОЦІНКА</div><div className="techSignal">{estimatedProfit > 0 ? '↗' : '↘'} {estimatedProfit > 0 ? 'Потенційно вигідно' : 'Недостатня маржа'}</div>
        <div className="techNumbers"><div><span>Різниця з орієнтиром</span><strong>{priceGap.toFixed(1)}%</strong></div><div><span>Оцінка прибутку</span><strong className={estimatedProfit >= 0 ? 'positive':'negative'}>{money(estimatedProfit)}</strong></div><div><span>ROI з урахуванням витрат</span><strong>{techROI.toFixed(1)}%</strong></div><div><span>Максимальна ціна для 20% ROI</span><strong>{money(Math.max(0,(marketPrice / 1.2) - extraCosts))}</strong></div></div>
        <p className="techWarning">⚠ Ринкова ціна введена вручну. Перевір модель, памʼять, стан батареї, блокування, комплектність і реальну ціну продажу. Результат не гарантує прибутку.</p>
      </div></div>
    </section>
    <PublicDeals/>
    <DealHunter/>
    <ResaleLedger/>
    <AccountPanel/>
    <section className="sectionBlock sourceBlock" id="sources"><div className="sectionHeading"><div><div className="eyebrow">ПОШУК ПРОПОЗИЦІЙ</div><h2>Радар українських маркетплейсів</h2><p>Введи товар і відкрий пошук на OLX, Prom.ua, ROZETKA або Hotline. Знайдені ціни додай до розрахунку.</p></div><div className="sourceBadge"><span className="sourceDot"/> Підключення джерел — MVP</div></div><div className="sourceGrid"><div className="sourceSearch"><div className="sourceTitle"><div className="olxLogo">olx</div><div><strong>OLX Україна</strong><span>Пошук у новій вкладці</span></div><span className="externalMark">↗</span></div><label>Що шукаємо?<input value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder="iPhone 13, RTX 3060, Makita..." onKeyDown={e=>{if(e.key==='Enter')openSearch()}}/></label><label>Категорія (необовʼязково)<select value={searchCategory} onChange={e=>setSearchCategory(e.target.value)}><option>Усі категорії</option>{categories.map(c=><option key={c}>{c}</option>)}</select></label><button className="primaryBtn" onClick={openSearch}>Шукати на OLX ↗</button><small>Ця дія відкриває пошукову сторінку OLX. Автоматичне збирання оголошень ще не підключене.</small></div><div className="sourceInfo"><div className="sourceInfoIcon">⌁</div><div className="marketGrid"><a href={`https://prom.ua/ua/search?search_term=${encodeURIComponent(searchTerm.trim() || 'iPhone')}`} target="_blank" rel="noopener noreferrer" className="marketLink"><b>Prom.ua</b><span>Знайти товари ↗</span></a><a href={`https://rozetka.com.ua/ua/search/?text=${encodeURIComponent(searchTerm.trim() || 'iPhone')}`} target="_blank" rel="noopener noreferrer" className="marketLink"><b>ROZETKA</b><span>Порівняти пропозиції ↗</span></a><a href={`https://hotline.ua/ua/sr/?q=${encodeURIComponent(searchTerm.trim() || 'iPhone')}`} target="_blank" rel="noopener noreferrer" className="marketLink"><b>Hotline</b><span>Пошук цін ↗</span></a></div><h3>Наступне підключення: автоматичний моніторинг</h3><p>Для автоматичного пошуку потрібне джерело, яке дозволяє отримувати публічні оголошення інших продавців. Офіційний OLX API сам по собі не вирішує цю задачу.</p><ul><li><span>01</span> Перевірити доступні партнерські фіди та API.</li><li><span>02</span> Додати серверний адаптер і регулярне оновлення даних.</li><li><span>03</span> Надсилати сповіщення про збіги з твоїми фільтрами.</li></ul><div className="pendingNote">◷ Інтеграція запланована — не показуємо фальшивий статус «сканується».</div></div></div></section>
    <section className="bottomCta"><div><div className="eyebrow">НАСТУПНИЙ РІВЕНЬ</div><h2>Від калькулятора — до радару угод.</h2><p>Спершу перевіримо, чи користувачі готові платити за аналітику. Потім інвестуємо в автоматичні джерела.</p></div><a className="primaryBtn" href="mailto:hello@flipradar.app?subject=FlipRadar%20%E2%80%94%20early%20access">Хочу тестувати першим ↗</a></section>
    <footer><a className="brand footerBrand" href="#top"><span className="brandMark">F</span><span>Flip<span className="brandAccent">Radar</span><small>SMART DEAL WORKSPACE</small></span></a><span>© 2026 FlipRadar · MVP для тестування попиту</span><span>Не є фінансовою гарантією. Перевіряй товар, продавця та ринкову ціну.</span></footer>
  </main>;
}

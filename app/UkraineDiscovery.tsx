'use client';
import {useMemo,useState} from 'react';
const categories=[
 {name:'Смартфони',terms:['iPhone 13','Samsung Galaxy S23','Google Pixel 7']},
 {name:'Компʼютери',terms:['RTX 3060','MacBook Air M1','ThinkPad T14']},
 {name:'Інструменти',terms:['Makita шуруповерт','Bosch перфоратор','DeWalt']},
 {name:'Велосипеди',terms:['Trek велосипед','Giant велосипед']},
 {name:'Автозапчастини',terms:['диски R17','фари LED']},
 {name:'Ігрові консолі',terms:['PlayStation 5','Nintendo Switch']}
];
const urlFor=(term:string)=>{const u=new URL('https://www.olx.ua/uk/list/q-'+encodeURIComponent(term).replace(/%20/g,'-')+'/');u.searchParams.set('search[order]','filter_float_price:asc');return u.toString()};
export default function UkraineDiscovery(){
 const [category,setCategory]=useState('Усі'),[query,setQuery]=useState('');
 const searches=useMemo(()=>categories.filter(c=>category==='Усі'||c.name===category).flatMap(c=>c.terms.map(term=>({category:c.name,term}))).filter(x=>x.term.toLowerCase().includes(query.toLowerCase())),[category,query]);
 return <section className="sectionBlock" id="ua-discovery"><div className="sectionHeading"><div><div className="eyebrow">FLIPRADAR · УКРАЇНА</div><h2>Пошук пропозицій на українському ринку</h2><p>Переходи до пошуку OLX із запитом сортування за зростанням ціни. Найдешевші товари не обовʼязково найвигідніші: перевіряй комплектацію, стан і справжність оголошення. Сортування визначає OLX.</p></div></div>
 <div className="feedFilters"><select aria-label="Категорія пошуку" value={category} onChange={e=>setCategory(e.target.value)}><option>Усі</option>{categories.map(c=><option key={c.name}>{c.name}</option>)}</select><input aria-label="Фільтр моделей" placeholder="Модель або товар" value={query} onChange={e=>setQuery(e.target.value)}/></div>
 <div className="feedGrid">{searches.map(s=><article className="feedCard" key={s.term}><div className="feedCardTop"><span>{s.category}</span><span>OLX · Україна</span></div><h3>{s.term}</h3><p>Почни з дешевших пропозицій, потім перевір комплектність, стан, продавця та ринкову ціну.</p><div className="feedCardBottom"><small>Зовнішній пошук</small><a href={urlFor(s.term)} target="_blank" rel="noopener noreferrer">Дивитися дешевші спочатку ↗</a></div></article>)}</div>
 <p className="feedDisclaimer">FlipRadar не копіює чужі оголошення з OLX. Для автоматичного імпорту конкретних товарів потрібне дозволене джерело даних або згода продавця.</p></section>
}

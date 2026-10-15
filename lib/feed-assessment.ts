export type FeedCandidate={title?:unknown;model?:unknown;source?:unknown;source_url?:unknown;asking_price?:unknown;reference_price?:unknown;currency?:unknown};
export type FeedAssessment={index:number;title:string;discount:number|null;difference:number|null;flags:string[];priority:'high'|'review'|'skip'};
const suspicious=/(на запчаст|не працю|неробоч|розбит|заблокован|icloud|без диспле|коробк|чохол|муляж|копія|реплік)/i;
export function assessFeed(items:FeedCandidate[]):FeedAssessment[]{
 return items.map((item,index)=>{
  const price=Number(item?.asking_price),reference=Number(item?.reference_price);
  const flags:string[]=[];
  if(!Number.isFinite(price)||price<=0||!Number.isFinite(reference)||reference<=0)flags.push('Некоректні ціни');
  if(item?.currency!==undefined&&item.currency!=='UAH')flags.push('Валюта не UAH');
  const title=String(item?.title||'');
  if(suspicious.test(title+' '+String(item?.model||'')))flags.push('Можлива несправність або аксесуар');
  const discount=price>0&&reference>0&&Number.isFinite(price)&&Number.isFinite(reference)?(reference-price)/reference*100:null;
  const difference=discount===null?null:reference-price;
  if(discount!==null&&discount<=0)flags.push('Немає цінової переваги');
  if(discount!==null&&discount>70)flags.push('Надзвичайно низька ціна — перевірити ризик');
  if(!item?.source_url)flags.push('Немає посилання');
  const priority=flags.length||discount===null||discount<15?'skip':discount>=30?'high':'review';
  return {index,title,discount,difference,flags,priority};
 });
}

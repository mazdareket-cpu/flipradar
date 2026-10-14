#!/usr/bin/env node
// Official eBay Browse API discovery, EU markets only. Does NOT publish listings.
// Example: EBAY_CLIENT_ID=... EBAY_CLIENT_SECRET=... node scripts/ebay-candidates.mjs DE "iPhone 13"
import {mkdir,writeFile} from 'node:fs/promises';
const markets={DE:{id:'EBAY_DE',currency:'EUR',language:'de-DE'},FR:{id:'EBAY_FR',currency:'EUR',language:'fr-FR'},IT:{id:'EBAY_IT',currency:'EUR',language:'it-IT'},ES:{id:'EBAY_ES',currency:'EUR',language:'es-ES'},NL:{id:'EBAY_NL',currency:'EUR',language:'nl-NL'},IE:{id:'EBAY_IE',currency:'EUR',language:'en-IE'}};
const [marketArg,...terms]=process.argv.slice(2);
const market=(marketArg||'DE').toUpperCase();
if(!Object.hasOwn(markets,market))throw Error('Supported markets: '+Object.keys(markets).join(', '));
const query=terms.join(' ').trim()||'iPhone 13';
const clientId=process.env.EBAY_CLIENT_ID,secret=process.env.EBAY_CLIENT_SECRET;
if(!clientId||!secret)throw Error('Private EBAY_CLIENT_ID and EBAY_CLIENT_SECRET required');
const oauth=await fetch('https://api.ebay.com/identity/v1/oauth2/token',{method:'POST',headers:{Authorization:'Basic '+Buffer.from(clientId+':'+secret).toString('base64'),'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'client_credentials',scope:'https://api.ebay.com/oauth/api_scope'})});
if(!oauth.ok)throw Error('eBay OAuth HTTP '+oauth.status);
const {access_token}=await oauth.json();
const endpoint=new URL('https://api.ebay.com/buy/browse/v1/item_summary/search');
endpoint.searchParams.set('q',query);endpoint.searchParams.set('limit','50');
const response=await fetch(endpoint,{headers:{Authorization:'Bearer '+access_token,'X-EBAY-C-MARKETPLACE-ID':markets[market].id,'Accept-Language':markets[market].language,'Accept':'application/json'}});
if(!response.ok)throw Error('eBay Browse HTTP '+response.status);
const data=await response.json();
const candidates=(data.itemSummaries||[]).flatMap(item=>{
 const price=Number(item.price?.value);
 if(!item.itemWebUrl?.startsWith('https://')||!Number.isFinite(price)||price<=0||item.price.currency!==markets[market].currency)return [];
 return [{source:'eBay',marketplace:markets[market].id,source_id:item.itemId,title:item.title,source_url:item.itemWebUrl,asking_price:price,currency:item.price.currency,condition:item.condition||'',shipping_unknown:true,observed_at:new Date().toISOString(),review_status:'candidate_unverified'}];
});
await mkdir('candidates',{recursive:true});
const file='candidates/ebay-'+market.toLowerCase()+'-candidates.json';
await writeFile(file,JSON.stringify({marketplace:markets[market].id,query,disclaimer:'Unverified EUR candidates only. No automatic publishing. Verify availability, fees, shipping, seller, and reference price.',items:candidates},null,2));
console.log('Saved '+candidates.length+' unverified candidates: '+file);

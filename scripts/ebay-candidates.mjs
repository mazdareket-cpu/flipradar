#!/usr/bin/env node
// Official eBay Browse API discovery adapter. READ ONLY.
// Usage: EBAY_CLIENT_ID=... EBAY_CLIENT_SECRET=... node scripts/ebay-candidates.mjs "iPhone 13"
// Output: candidates/ebay-candidates.json (USD). NEVER automatically publishes to Supabase.
import {mkdir,writeFile} from 'node:fs/promises';
const clientId=process.env.EBAY_CLIENT_ID,secret=process.env.EBAY_CLIENT_SECRET;
if(!clientId||!secret)throw Error('Set EBAY_CLIENT_ID and EBAY_CLIENT_SECRET as private environment variables');
const query=process.argv.slice(2).join(' ').trim()||'iPhone 13';
const tokenResponse=await fetch('https://api.ebay.com/identity/v1/oauth2/token',{
 method:'POST',headers:{Authorization:'Basic '+Buffer.from(clientId+':'+secret).toString('base64'),'Content-Type':'application/x-www-form-urlencoded'},
 body:new URLSearchParams({grant_type:'client_credentials',scope:'https://api.ebay.com/oauth/api_scope'})
});
if(!tokenResponse.ok)throw Error('eBay OAuth failed: HTTP '+tokenResponse.status);
const {access_token}=await tokenResponse.json();
const endpoint=new URL('https://api.ebay.com/buy/browse/v1/item_summary/search');
endpoint.searchParams.set('q',query);endpoint.searchParams.set('limit','50');
const response=await fetch(endpoint,{headers:{Authorization:'Bearer '+access_token,'X-EBAY-C-MARKETPLACE-ID':'EBAY_US','Accept':'application/json'}});
if(!response.ok)throw Error('eBay Browse failed: HTTP '+response.status);
const data=await response.json();
const candidates=(data.itemSummaries||[]).flatMap(item=>{
 const price=Number(item.price?.value);
 if(!item.itemWebUrl?.startsWith('https://')||!Number.isFinite(price)||price<=0)return [];
 return [{source:'eBay',source_id:item.itemId,title:item.title,source_url:item.itemWebUrl,asking_price:price,currency:item.price.currency,condition:item.condition||'',shipping_unknown:true,observed_at:new Date().toISOString(),review_status:'candidate_unverified'}];
});
await mkdir('candidates',{recursive:true});
await writeFile('candidates/ebay-candidates.json',JSON.stringify({marketplace:'EBAY_US',query,disclaimer:'Discovery only. USD listings are NOT UAH deals. Verify availability, shipping, customs, seller, price comparison and convert currency before manual approval.',items:candidates},null,2));
console.log('Saved',candidates.length,'UNVERIFIED candidates to candidates/ebay-candidates.json');

#!/usr/bin/env node
// FlipRadar verified-listing importer. Run locally only; NEVER in the browser.
// Usage: node scripts/import-deals.mjs verified-deals.json --dry-run
//        node scripts/import-deals.mjs verified-deals.json --publish
// Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY only for --publish.
import {readFile} from 'node:fs/promises';
import {createClient} from '@supabase/supabase-js';

const [file,mode='--dry-run']=process.argv.slice(2);
if(!file || !['--dry-run','--publish'].includes(mode)){
 console.error('Usage: node scripts/import-deals.mjs <verified-deals.json> [--dry-run|--publish]');
 process.exit(2);
}
const input=JSON.parse(await readFile(file,'utf8'));
if(!Array.isArray(input))throw Error('Input must be a JSON array');
const now=Date.now(), seen=new Set(), clean=[];
for(const [i,d] of input.entries()){
 const fail=m=>{throw Error('Row '+(i+1)+': '+m)};
 if(!d || typeof d!=='object')fail('invalid object');
 const title=String(d.title||'').trim(),model=String(d.model||'').trim();
 if(title.length<3||title.length>180||model.length<2||model.length>120)fail('invalid title/model');
 const url=String(d.source_url||'');
 let parsed;try{parsed=new URL(url)}catch{fail('invalid URL')}
 if(parsed.protocol!=='https:'||parsed.username||parsed.password)fail('HTTPS URL required without credentials');
 parsed.hash='';const normalized=parsed.toString();
 if(seen.has(normalized))fail('duplicate URL in input');seen.add(normalized);
 const asking=Number(d.asking_price),reference=Number(d.reference_price),costs=Number(d.estimated_costs??0);
 if(![asking,reference,costs].every(Number.isFinite)||asking<=0||reference<=0||costs<0)fail('invalid prices');
 if(!d.verified_at||!Number.isFinite(Date.parse(d.verified_at))||Date.parse(d.verified_at)>now||now-Date.parse(d.verified_at)>86400000)fail('verified_at must be within past 24 hours');
 if(!d.reference_evidence||String(d.reference_evidence).trim().length<15)fail('reference_evidence required');
 if(!d.source||String(d.source).trim().length<2)fail('source required');
 // Review is mandatory. The importer creates unpublished rows only.
 clean.push({title,model,category:String(d.category||'Смартфони'),source:String(d.source),source_url:normalized,asking_price:asking,reference_price:reference,estimated_costs:costs,condition:String(d.condition||'Б/в'),note:'Орієнтир: '+String(d.reference_evidence).slice(0,500),observed_at:d.verified_at,expires_at:new Date(Date.parse(d.verified_at)+86400000).toISOString(),published:false});
}
console.log('Validated',clean.length,'listings; all will remain UNPUBLISHED.');
if(mode==='--dry-run'){console.log('Dry run only: no database changes.');process.exit(0)}
const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!url||!key)throw Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in a private local environment; never NEXT_PUBLIC_');
const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
for(const row of clean){
 const {data:existing,error:lookupError}=await db.from('public_deals').select('id').eq('source_url',row.source_url).limit(1);
 if(lookupError)throw lookupError;
 if(existing?.length){console.log('Skipped existing URL:',row.source_url);continue}
 const {error}=await db.from('public_deals').insert(row);
 if(error)throw error;
 console.log('Inserted draft:',row.source_url);
}
console.log('Import complete. Manually review and approve drafts in Supabase SQL Editor.');

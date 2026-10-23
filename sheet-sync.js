/* Browser-only, read-only Google Sheets integration. Never persist access tokens. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ChinaSheetSync=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
'use strict';
const SCOPE='https://www.googleapis.com/auth/spreadsheets.readonly';
const TABS=['Dashboard','Master Itinerary','Budget','Bookings','Hotels','Transportation','Attractions','Food','Packing & Requirements','China Payments'];
const clean=x=>String(x??'').trim();
const money=x=>{const s=clean(x).replace(/[₱¥,\s]/g,'');return s!==''&&Number.isFinite(Number(s))?Number(s):null;};
function table(rows,required){const i=rows.findIndex(r=>required.every(h=>r.map(clean).includes(h)));if(i<0)throw new Error('Tracker headers changed. Your previous snapshot is safe.');const headers=rows[i].map(clean);return rows.slice(i+1).filter(r=>r.some(x=>clean(x))).map(r=>Object.fromEntries(headers.filter(Boolean).map(h=>[h,r[headers.indexOf(h)]??''])));}
function isoDate(value){const s=clean(value);if(/^\d{4}-\d{2}-\d{2}$/.test(s))return s;const m=s.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/);if(!m)return null;const month=['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'].indexOf(m[1].slice(0,3).toLowerCase());if(month<0||+m[2]>31||+m[2]<1)return null;return `${m[3]}-${String(month+1).padStart(2,'0')}-${m[2].padStart(2,'0')}`;}
// Content-derived identifiers survive insertion/reordering of source rows.
function hash(s){let n=2166136261;for(const c of s)n=Math.imul(n^c.charCodeAt(0),16777619);return (n>>>0).toString(36);}
function mapWorkbook(tabs,previous={},now=new Date().toISOString()){
 const activities=table(tabs['Master Itinerary']||[],['Date','City','Activity','Time']);
 const seen=new Map();
 const itinerary=activities.filter(r=>clean(r.Activity)).map(r=>{const date=isoDate(r.Date);if(!date)throw new Error('An itinerary date is invalid. Previous snapshot kept.');const base='sheet-'+hash([date,r.City,r.Activity].join('|'));const duplicate=seen.get(base)||0;seen.set(base,duplicate+1);const existing=(previous.itinerary||[]).filter(x=>x.date===date&&x.city===clean(r.City)&&x.activity===clean(r.Activity))[duplicate];return {id:existing?.id||base+(duplicate?'-'+duplicate:''),date,city:clean(r.City),time:clean(r.Time),activity:clean(r.Activity),area:clean(r['Key Area / Highlight']),transport:clean(r['Major Transport']),status:[r.Status,r.Priority].filter(Boolean).join(' · '),notes:clean(r.Notes),chineseName:clean(r['Chinese Name']||r['Name CN']),addressCN:clean(r['Chinese Address']||r['Address CN']),latitude:money(r.Latitude),longitude:money(r.Longitude)};});
 if(!itinerary.length)throw new Error('The tracker returned no itinerary. Previous snapshot kept.');
 const bookings=table(tabs.Bookings||[],['Type','Booking','Amount PHP']).filter(r=>clean(r.Booking)).map(r=>({...r,'Amount PHP':money(r['Amount PHP'])??0}));
 const hotels=table(tabs.Hotels||[],['City','Hotel','Check-in','Check-out']).filter(r=>clean(r.City));
 const budget=table(tabs.Budget||[],['Category','Item','Actual PHP','Paid?']);
 const dashboard=tabs.Dashboard||[];
 const target=money(dashboard.find(r=>r[0]==='Budget Target (PHP)')?.[1]);
 const summary=(tabs.Budget||[]).find(r=>r.includes('Estimated Total'));
 const estimated=summary?money(summary[summary.indexOf('Estimated Total')+1]):null;
 // Sum actual paid budget lines once; do not sum bookings again or round dashboard totals.
 const baseline=budget.filter(r=>clean(r.Item)&&/^paid(?:$|\s|[•✓])/i.test(clean(r['Paid?']))).reduce((n,r)=>n+(money(r['Actual PHP'])??0),0);
 return {...previous,schemaVersion:2,source:'China Trip Command Center 2027',sourceDate:now,sync:{lastSuccess:now},trip:{...previous.trip,title:'China 2027',budgetPHP:target??previous.trip?.budgetPHP??150000,baselineSpentPHP:Math.round(baseline*100)/100,estimatedTotalPHP:estimated??money(dashboard.find(r=>r[0]==='Estimated Total (PHP)')?.[1])??0},itinerary,bookings,hotels,paidBudgetItems:budget.filter(r=>clean(r.Item)&&/^paid(?:$|\s|[•✓])/i.test(clean(r['Paid?']))).map(r=>({id:'paid-'+hash([r.Category,r.Item,r.City].join('|')),item:clean(r.Item),city:clean(r.City),amountPHP:money(r['Actual PHP'])??0})),transport:table(tabs.Transportation||[],['Date','From','To','Mode']),attractions:table(tabs.Attractions||[],['City','Attraction / Activity']),food:table(tabs.Food||[],['City','Restaurant / Food']),checklist:table(tabs['Packing & Requirements']||[],['Category','Item','Status']),paymentGuide:table(tabs['China Payments']||[],['SITUATION','USE FIRST','BACKUP'])};
}
class SyncError extends Error{constructor(code,message){super(message);this.code=code;}}
function errorMessage(e){return e instanceof SyncError||/previous snapshot|Previous snapshot|Tracker headers/.test(e?.message||'')?e.message:'Could not refresh the tracker. Your saved snapshot is still available. Retry when connected.';}
function create(options){
 const {sheetId,fetcher=fetch,onData,onState=()=>{},now=()=>Date.now(),sleep=ms=>new Promise(r=>setTimeout(r,ms)),random=Math.random}=options;
 let token=null,expires=0,pending=null,generation=0,blockedUntil=0,lastAttempt=0;
 const state=(code,message)=>onState({code,message});
 function clear(){generation++;token=null;expires=0;state('disconnected','Disconnected. The offline snapshot stays on this device.');}
 function authorize(response){if(!response.access_token||!clean(response.scope).split(/\s+/).includes(SCOPE)){clear();throw new SyncError('scope','Read-only Sheets permission was not granted. Connect again and approve it.');}generation++;token=response.access_token;expires=now()+Math.max(0,Number(response.expires_in)||0)*1000;blockedUntil=0;state('connected','Connected with read-only access.');}
 async function get(path,session,sessionToken){
  for(let attempt=0;attempt<3;attempt++){
   if(session!==generation)throw new SyncError('cancelled','Sync cancelled.');
   const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),15000);let res;
   try{res=await fetcher('https://sheets.googleapis.com/v4/spreadsheets/'+encodeURIComponent(sheetId)+path,{method:'GET',headers:{Authorization:'Bearer '+sessionToken},cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer',signal:controller.signal});}catch{throw new SyncError('network','Google is unreachable. Your saved snapshot is available offline.');}finally{clearTimeout(timer);}
   if(res.status===401){if(session===generation){token=null;expires=0;}throw new SyncError('auth','Google authorization expired. Tap Connect Google to resume.');}
   if(res.status===403)throw new SyncError('permission','Google denied access. Check the account, Sheets API and read-only consent. Saved data kept.');
   if(res.status===404)throw new SyncError('missing','Tracker not found for this Google account. Saved data kept.');
   if(res.status===429||res.status>=500){if(attempt<2){await sleep((2**attempt)*1000+random()*500);continue;}blockedUntil=now()+60000;throw new SyncError('retry','Google is busy or rate-limited. Retry in a minute; saved data kept.');}
   if(!res.ok)throw new SyncError('response','Google could not read this tracker. Saved data kept.');
   const json=await res.json();if(session!==generation)throw new SyncError('cancelled','Sync cancelled.');return json;
  }
 }
 function sync(previous={},force=false){
  if(pending)return pending;
  if(!token||now()>=expires-30000){token=null;state('auth','Connect Google to refresh. Your saved snapshot remains available.');return Promise.resolve(false);}
  if(now()<blockedUntil||(!force&&lastAttempt&&now()-lastAttempt<60000))return Promise.resolve(false);
  lastAttempt=now();const session=generation,sessionToken=token;state('syncing','Refreshing the private tracker…');
  const work=async()=>{try{
   const meta=await get('?fields=spreadsheetId,properties(title),sheets(properties(title,gridProperties(rowCount,columnCount)))',session,sessionToken);
   if(meta.properties?.title!=='China Trip Command Center 2027')throw new SyncError('schema','Unexpected tracker identity. Previous snapshot kept.');
   const ranges=TABS.map(name=>{const props=meta.sheets?.find(s=>s.properties?.title===name)?.properties;if(!props)throw new SyncError('schema',`Required tab missing: ${name}. Previous snapshot kept.`);const rows=props.gridProperties?.rowCount,cols=props.gridProperties?.columnCount;if(!rows||rows>2000||!cols||cols>26)throw new SyncError('schema','Tracker size changed. Previous snapshot kept pending review.');return `'${name.replace(/'/g,"''")}'!A1:${String.fromCharCode(64+cols)}${rows}`;});
   const params=new URLSearchParams({valueRenderOption:'FORMATTED_VALUE',fields:'valueRanges(values)'});ranges.forEach(r=>params.append('ranges',r));
   const batch=await get('/values:batchGet?'+params,session,sessionToken);
   if(batch.valueRanges?.length!==TABS.length)throw new SyncError('schema','Incomplete tracker response. Previous snapshot kept.');
   const tabs=Object.fromEntries(TABS.map((name,i)=>[name,batch.valueRanges[i].values||[]]));
   const next=mapWorkbook(tabs,previous,new Date(now()).toISOString());
   if(session!==generation)return false;
   await onData(next);state('synced','Tracker refreshed. Automatic checks every 5 minutes while open and authorized.');return true;
  }catch(e){if(session!==generation)return false;state(e.code||'error',errorMessage(e));return false;}};
  pending=work().finally(()=>{pending=null;});return pending;
 }
 return {authorize,sync,disconnect:clear,hasToken:()=>!!token&&now()<expires-30000,revoke(){const current=token;clear();if(current&&options.revoke)options.revoke(current);}};
}
return {SCOPE,TABS,table,isoDate,mapWorkbook,create,SyncError};
});

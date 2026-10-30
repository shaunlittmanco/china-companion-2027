/* File-scoped, opt-in Daily Carry Google Sheets two-way sync. No auth tokens in storage. */
(function(root,f){const api=f(typeof module==='object'&&module.exports?require('./daily-carry.js'):root.ChinaDailyCarry);if(typeof module==='object'&&module.exports)module.exports=api;else root.ChinaDailyCarrySync=api;})(globalThis,D=>{'use strict';
const TAB='Daily Carry',HEADERS=['Record ID','Date','Record Type','Item ID','Item / Day','Status','Bag','Notes','Updated At','Revision','Source'];
const text=v=>String(v??'').trim(),copy=v=>JSON.parse(JSON.stringify(v)),dates=D.DATES;
const sig=rows=>JSON.stringify(rows.map(r=>[r[0],r[1],r[2],r[3],r[4],r[5],r[6],r[7],r[10]]).sort((a,b)=>a[0].localeCompare(b[0])));
const recordId=(date,id)=>'ITEM-'+date+'-'+id;
function encodeDate(d,date){
 const p=D.plan(d,date),state=D.dayState(d,date),at=state.updatedAt||'';
 const rows=[['DAY-'+date,date,'DAY','','Daily carry','Planned',p.bag,p.notes,at,'','China Companion']];
 const excluded=new Set(state.excluded||[]),items=[...p.items,...[...excluded].map(id=>{const suggestion=Object.values(D.catalog).find(r=>r.id===id),custom=(state.custom||[]).find(x=>x.id===id);return suggestion?{...suggestion,id}:custom?{...custom,category:'My extras'}:{id,title:id,category:'Unknown'};})];
 const known=new Set();
 for(const item of items){if(known.has(item.id))continue;known.add(item.id);
 const label=text(item.title).slice(0,140),custom=item.id.startsWith('custom:');
 rows.push([recordId(date,item.id),date,'ITEM',item.id,label,excluded.has(item.id)?'Skipped':state.checks?.[item.id]?'Ready':'Not Ready','',custom?text(item.note||'').slice(0,300):'',at,'',custom?'My extra':'Suggested']);
 }
 return rows;
}
function encode(d){return Object.fromEntries(dates.map(date=>[date,encodeDate(d,date)]));}
function parse(rows){
 if(JSON.stringify((rows[0]||[]).slice(0,11).map(text))!==JSON.stringify(HEADERS))throw Error('Daily Carry headers must match A1:K1; no writes made.');
 const out={},seen=new Set();for(let i=1;i<rows.length;i++){const v=rows[i];if(!v||!v.some(x=>text(x)))continue;const row=Array.from({length:11},(_,j)=>text(v[j]));const [id,date,type,itemId,,status]=row;
 if(!dates.includes(date)||!id||!['DAY','ITEM'].includes(type)||seen.has(id)||type==='DAY'&&id!=='DAY-'+date||type==='ITEM'&&(!itemId||id!==recordId(date,itemId)))throw Error('Daily Carry record identity/date requires review; no writes made.');
 if(type==='DAY'&&status!=='Planned'||type==='ITEM'&&!['Ready','Not Ready','Skipped'].includes(status))throw Error('Daily Carry status value invalid; no writes made.');
 seen.add(id);(out[date]??=[]).push({...{id,values:row,row:i+1}});
 }
 return out;
}
function importDate(day,rows){const next={...day,checks:{},excluded:[],custom:[]},dayRow=rows.find(r=>r.values[2]==='DAY');if(dayRow){next.bag=dayRow.values[6];next.notes=dayRow.values[7];next.updatedAt=dayRow.values[8]||new Date().toISOString();}
 for(const row of rows.filter(r=>r.values[2]==='ITEM')){const [,date,,id,title,status,,note]=row.values;if(status==='Ready')next.checks[id]=true;if(status==='Skipped')next.excluded.push(id);if(id.startsWith('custom:'))next.custom.push({id,title,note});}
 return next;
}
function ingest(d,remote,datesToPull=[],baselines={}){
 const old=d.smartState?.dailyCarry||{},days={...old.days},sync={...old.sync,base:{...old.sync?.base,...baselines},conflicts:{...old.sync?.conflicts}};
 for(const date of datesToPull)days[date]=importDate(days[date]||{},remote[date]||[]);
 for(const date of datesToPull)delete sync.conflicts[date];
 return {...d,smartState:{...d.smartState,dailyCarry:{...old,days,sync}}};
}
function create({sheetId,getData,saveData,fetcher=fetch,onState=()=>{},now=()=>Date.now()}){
 const sheet=typeof sheetId==='function'?sheetId:()=>sheetId;let token='',expiry=0,generation=0,running=null,last=0;const emit=(status,message)=>onState({status,message});
 const hasToken=()=>!!token&&now()+30000<expiry;
 function disconnect(){token='';expiry=0;generation++;emit('Needs Sign-in','Packing session expired or disconnected. Offline changes are retained.');}
 function authorize(r,selected){disconnect();if(!r.access_token||selected!==sheet()||!text(r.scope).split(/\s+/).includes('https://www.googleapis.com/auth/drive.file'))throw Error('Select the configured master workbook with file-scoped permission.');token=r.access_token;expiry=now()+Number(r.expires_in||0)*1000;emit('Connected','Daily Carry connected to the selected workbook.');}
 async function api(path,opts={},version){if(version!==generation||!hasToken())throw Error('Google permission expired; local changes retained.');
 const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),15000);
 let response;try{response=await fetcher('https://sheets.googleapis.com/v4/spreadsheets/'+encodeURIComponent(sheet())+path,{method:opts.method||'GET',headers:{Authorization:'Bearer '+token,...(opts.body?{'Content-Type':'application/json'}:{})},...(opts.body?{body:JSON.stringify(opts.body)}:{}),signal:ctrl.signal,credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer'});}finally{clearTimeout(timer);}
 if(version!==generation)throw Error('Sync session changed; local data retained.');
 if(response.status===401){disconnect();throw Error('Google access expired. Reconnect to resume.');}
 if(!response.ok)throw Error('Daily Carry Google Sheets request failed ('+response.status+'). Pending edits retained.');
 return response.json();
 }
 async function read(version){
 const metadata=await api('?fields=spreadsheetId,properties(title),sheets(properties(sheetId,title,gridProperties))',{},version);
 if(metadata.spreadsheetId!==sheet()||metadata.properties?.title!=='China Trip Command Center 2027')throw Error('Unexpected workbook. Writes blocked.');
 const tab=metadata.sheets?.find(s=>s.properties?.title===TAB)?.properties;
 if(!tab||tab.gridProperties?.columnCount!==11||tab.gridProperties.rowCount>10000)throw Error('Daily Carry tab missing or incompatible. Writes blocked.');
 const r=await api('/values/'+encodeURIComponent("'Daily Carry'!A1:K"+tab.gridProperties.rowCount)+'?valueRenderOption=UNFORMATTED_VALUE',{},version);
 return {groups:parse(r.values||[]),rowCount:tab.gridProperties.rowCount};
 }
 async function run({readOnly=false,force=false}={}){
 if(running)return running;if(!hasToken()){emit('Needs Sign-in','Connect the existing master workbook; local data remains safe.');return false;}
 if(!force&&now()-last<30000)return false;last=now();const version=generation;
 running=(async()=>{try{
 emit('Syncing',readOnly?'Reviewing both tabs without writing…':'Checking Daily Carry for changes…');
 const first=await read(version),existing=first.groups,planned=encode(getData()),saved=getData().smartState?.dailyCarry||{},baseline=saved.sync?.base||{},localDays=saved.days||{};
 const pull=[],write=[],conflicts=[],bases={};
 for(const date of dates){
  const remote=existing[date]||[],local=planned[date],rSig=sig(remote.map(r=>r.values)),lSig=sig(local),b=baseline[date];
  if(rSig===lSig){bases[date]=rSig;continue;}
  if(!remote.length){write.push(date);continue;}
  if(b===rSig){write.push(date);continue;}
  if((b===lSig||!localDays[date]&&b===undefined)&&remote.length){pull.push(date);bases[date]=rSig;continue;}
  conflicts.push(date);
 }
 if(conflicts.length){const current=getData(),s=current.smartState?.dailyCarry||{};
  const merge={...s,sync:{...s.sync,base:{...baseline,...bases},conflicts:{...s.sync?.conflicts,...Object.fromEntries(conflicts.map(date=>[date,{local:planned[date],remote:(existing[date]||[]).map(r=>r.values),at:new Date().toISOString()}]))}}};
  await saveData({...current,smartState:{...current.smartState,dailyCarry:merge}});
  emit('Conflict','Daily Carry changed in both locations: '+conflicts.join(', ')+'. Review before choosing a version.');return false;
 }
 if(readOnly){
  emit('Review Required',write.length+' dates would be written; '+pull.length+' dates would be imported. No changes sent.');
  return {write:write.length,pull:pull.length,conflicts:0};
 }
 if(pull.length){let updated=ingest(getData(),existing,pull,bases);await saveData(updated);}
 if(write.length){
  const second=await read(version);
  if(JSON.stringify(second.groups)!==JSON.stringify(first.groups))throw Error('Daily Carry changed during preflight; no writes sent. Refresh and review.');
  const afterPlan=encode(getData());
  const updates=[],appends=[];
  for(const date of write){
   const next=afterPlan[date],old=new Map((second.groups[date]||[]).map(r=>[r.id,r]));
   for(const values of next){const record=old.get(values[0]);if(record){if(sig([record.values])===sig([values]))continue;updates.push({range:"'Daily Carry'!A"+record.row+":K"+record.row,values:[values]});}
    else appends.push(values);
   }
  }
  if(updates.length)await api('/values:batchUpdate',{method:'POST',body:{valueInputOption:'RAW',data:updates}},version);
  if(appends.length)await api('/values/'+encodeURIComponent("'Daily Carry'!A1:K"+second.rowCount)+':append?valueInputOption=RAW&insertDataOption=INSERT_ROWS',{method:'POST',body:{values:appends}},version);
 }
 const after=await read(version),finalPlan=encode(getData()),newBase={...baseline,...bases};for(const date of dates){const desired=sig(finalPlan[date]),actual=sig((after.groups[date]||[]).map(x=>x.values));if(desired!==actual)throw Error('Daily Carry readback differs on '+date+'. No success claimed; review before retry.');newBase[date]=actual;}
 const current=getData(),state=current.smartState?.dailyCarry||{};await saveData({...current,smartState:{...current.smartState,dailyCarry:{...state,sync:{...state.sync,base:newBase,conflicts:{},lastSuccess:new Date().toISOString()}}}});
 emit('Synced','Daily Carry '+dates.length+' days verified with readback.');return true;
 }catch(e){emit(hasToken()?'Sync Failed':'Needs Sign-in',e.message||'Daily Carry sync stopped. Local data retained.');return false;}})().finally(()=>{running=null;});return running;
 }
 return {authorize,disconnect,hasToken,run};
}
return {TAB,HEADERS,encodeDate,encode,parse,sig,ingest,create};
});

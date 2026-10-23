const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const vm=require('node:vm');
const {mapWorkbook,create,SCOPE,TABS}=require('../sheet-sync');
function fixture(){return {
 Dashboard:[['Trip'],[],['Trip Overview','Details'],['Budget Target (PHP)','₱150,000'],['Estimated Total (PHP)','₱100']],
 'Master Itinerary':[['Title'],[],['Day','Date','City','Time','Activity','Key Area / Highlight','Major Transport','Status','Notes','Priority'],['Day 1','Jan 12, 2027','Test City','10:00 AM','Test activity','Test area','Walk','Planned','Private note','P1']],
 Budget:[['Title'],[],['Category','Item','Actual PHP','Paid?','Summary','PHP'],['Flight','Example','₱1,234.56','Paid','Estimated Total','₱3,456.78'],['Hotel','Unpaid','₱9,999','No'],['','', '', '', 'Total','₱500']],
 Bookings:[['Title'],[],['Type','Booking','Amount PHP','Payment Status'],['Hotel','Example booking','₱2,000','Booked']],
 Hotels:[['Title'],[],['City','Hotel','Check-in','Check-out'],['Test City','Example','2027-01-12','2027-01-13']],
 Transportation:[['Date','From','To','Mode']],Attractions:[['City','Attraction / Activity']],Food:[['City','Restaurant / Food']],
 'Packing & Requirements':[['Category','Item','Status']], 'China Payments':[['SITUATION','USE FIRST','BACKUP']]
};}
const response=(body,status=200)=>({ok:status<400,status,json:async()=>body});
const meta={spreadsheetId:'private-id',properties:{title:'China Trip Command Center 2027'},sheets:TABS.map(title=>({properties:{title,gridProperties:{rowCount:100,columnCount:15}}}))};
function transport(tabs=fixture()){return async url=>response(url.includes('/values:batchGet?')?{valueRanges:TABS.map(t=>({values:tabs[t]}))}:meta);}
const auth={access_token:'TEST_ONLY_TOKEN',expires_in:3600,scope:SCOPE};
test('maps actual headers, dates, exact paid amounts and ignores unpaid budget',()=>{
 const next=mapWorkbook(fixture(),{},'2026-10-23T00:00:00Z');
 assert.equal(next.itinerary[0].date,'2027-01-12');assert.equal(next.trip.baselineSpentPHP,1234.56);assert.equal(next.trip.estimatedTotalPHP,3456.78);assert.equal(next.bookings[0]['Amount PHP'],2000);assert.equal(next.trip.budgetPHP,150000);
});
test('preserves imported IDs/checkmarks, tolerates reordering/insertion, and maps duplicate activities',()=>{
 const tabs=fixture(),previous=mapWorkbook(tabs);previous.itinerary[0].id='imported-id';
 tabs['Master Itinerary'].push([...tabs['Master Itinerary'][3]]);
 const next=mapWorkbook(tabs,previous);assert.equal(next.itinerary[0].id,'imported-id');assert.notEqual(next.itinerary[1].id,next.itinerary[0].id);
 const reordered=fixture();reordered['Master Itinerary'].splice(3,0,['Day 1','Jan 12, 2027','Test City','','Another activity']);
 assert.equal(mapWorkbook(reordered,previous).itinerary[1].id,'imported-id');
});
test('rejects changed headers, invalid dates and empty itinerary',()=>{
 for(const mutate of [t=>t['Master Itinerary']=[],t=>t['Master Itinerary'][3][1]='Invalid',t=>t['Master Itinerary'].pop()]){const tabs=fixture();mutate(tabs);assert.throws(()=>mapWorkbook(tabs));}
});
test('only GETs fixed Sheets endpoint, bearer header, no tokens in URLs or snapshot; coalesces refreshes',async()=>{
 const calls=[];let commits=0;const sync=create({sheetId:'private-id',fetcher:async(u,o)=>{calls.push([u,o]);return transport()(u,o);},onData:n=>{commits++;assert.ok(!JSON.stringify(n).includes(auth.access_token));}});
 sync.authorize(auth);const a=sync.sync({}),b=sync.sync({});assert.equal(a,b);assert.equal(await a,true);assert.equal(commits,1);assert.equal(calls.length,2);
 for(const [url,opts] of calls){assert.ok(url.startsWith('https://sheets.googleapis.com/v4/spreadsheets/private-id'));assert.ok(!url.includes(auth.access_token));assert.equal(opts.method,'GET');assert.equal(opts.cache,'no-store');assert.equal(opts.headers.Authorization,'Bearer '+auth.access_token);}
 assert.equal(await sync.sync({}),false);assert.equal(calls.length,2);
});
test('requires exact read-only consent and expires without opening popups',async()=>{
 let t=1000000,calls=0,state;const sync=create({sheetId:'x',now:()=>t,onData:()=>{},onState:s=>state=s,fetcher:()=>{calls++;}});
 assert.throws(()=>sync.authorize({...auth,scope:'https://www.googleapis.com/auth/spreadsheets'}));
 sync.authorize(auth);t+=3600000;assert.equal(await sync.sync(),false);assert.equal(state.code,'auth');assert.equal(calls,0);assert.equal(sync.hasToken(),false);
});
test('401,403,404 and network failures never replace cached data',async()=>{
 for(const status of [401,403,404,0]){let commits=0,state;const sync=create({sheetId:'x',onState:s=>state=s,onData:()=>commits++,fetcher:async()=>{if(!status)throw Error('secret server detail');return response({},status);}});sync.authorize(auth);assert.equal(await sync.sync(),false);assert.equal(commits,0);assert.ok(!state.message.includes('secret'));if(status===401)assert.equal(sync.hasToken(),false);}
});
test('429 and 503 retries are bounded and backed off; enforce cooldown',async()=>{
 for(const status of [429,503]){let calls=0,delays=[];const sync=create({sheetId:'x',onData:()=>assert.fail(),fetcher:async()=>{calls++;return response({},status);},sleep:async ms=>delays.push(ms),random:()=>0});sync.authorize(auth);assert.equal(await sync.sync(),false);assert.equal(calls,3);assert.deepEqual(delays,[1000,2000]);assert.equal(await sync.sync({},true),false);assert.equal(calls,3);}
});
test('retry recovers, while partial response or malformed workbook preserves saved data',async()=>{
 let calls=0;const sync=create({sheetId:'x',onData:()=>{},sleep:async()=>{},fetcher:async(u,o)=>{if(calls++===0)return response({},500);return transport()(u,o);}});sync.authorize(auth);assert.equal(await sync.sync(),true);
 for(const fetcher of [async u=>response(u.includes('batchGet')?{valueRanges:[]}:meta),transport({...fixture(),Bookings:[]})]){let commits=0;const bad=create({sheetId:'x',onData:()=>commits++,fetcher});bad.authorize(auth);assert.equal(await bad.sync(),false);assert.equal(commits,0);}
});
test('storage failure cannot claim a successful refresh',async()=>{
 let state;const sync=create({sheetId:'x',fetcher:transport(),onData:()=>{throw Error('quota');},onState:s=>state=s});sync.authorize(auth);assert.equal(await sync.sync(),false);assert.equal(state.code,'error');
});
test('disconnect during a pending fetch cannot restore private data or session',async()=>{
 let resolve,commits=0;const sync=create({sheetId:'x',fetcher:()=>new Promise(r=>resolve=r),onData:()=>commits++});sync.authorize(auth);const job=sync.sync();sync.disconnect();resolve(response(meta));assert.equal(await job,false);assert.equal(commits,0);assert.equal(sync.hasToken(),false);
});
test('service worker ignores Google API and authorization requests, caches app shell only',()=>{
 const handlers={};vm.runInNewContext(readFileSync(require.resolve('../sw.js'),'utf8'),{URL,self:{addEventListener:(n,f)=>handlers[n]=f,location:{origin:'https://example.test'},registration:{scope:'https://example.test/china/'}}});
 for(const [url,method] of [['https://sheets.googleapis.com/v4/spreadsheets/id','GET'],['https://accounts.google.com/gsi/client','GET'],['https://example.test/china/private.json','GET'],['https://example.test/china/app.js','POST']])handlers.fetch({request:{url,method},respondWith:()=>assert.fail('Private or non-shell request intercepted')});
});

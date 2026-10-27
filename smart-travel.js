/* Offline domain logic. No credentials, account records, remote APIs or Sheet writes. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ChinaSmartTravel=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
'use strict';
const TICKET_STATES=['Free','To Buy','Reserved / Unpaid','Paid','Not Required','Needs Verification'];
const DISCOVERIES=['Shibati','Mountain City Trail','Xiahaoli','Longmenhao'].map(name=>({city:'Chongqing',activity:name,source:'Discover More · proposed from your brief',notes:'New app suggestion, not a tracker booking. Verify route, opening hours, terrain and cost.'}));
const DAY='2027-01-16',CITIES=['Shanghai','Chongqing','Chengdu','Beijing'];
const txt=v=>String(v??'').trim(),norm=v=>txt(v).toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
function num(v){if(v==null||txt(v)==='')return null;const n=Number(txt(v).replace(/[₱¥,\s]/g,''));return Number.isFinite(n)&&n>=0?n:null;}
function match(a,b){a=norm(a);b=norm(b);return a.length>3&&b.length>3&&(a.includes(b)||b.includes(a));}
function safeUrl(v){try{const u=new URL(v);return u.protocol==='https:'&&!u.username&&!u.password?u.href:'';}catch{return '';}}
function stale(at,now=Date.now(),hours=24){const time=Date.parse(at);return !Number.isFinite(time)||time>now+300000||now-time>hours*3600000;}
const GUIDES=[{key:'yu-garden',names:['Yu Garden','Yuyuan','豫园'],chineseName:'豫园',city:'Shanghai',
 history:'Yu Garden began in 1559 under Pan Yunduan during the Ming dynasty. Its courtyards, ponds and rockwork offer a quieter view of old Shanghai.',
 highlights:['Pond reflections and pavilions','Rockwork and framed courtyard views','Roof lines and carved details'],
 source:'https://www.meet-in-shanghai.net/en/huangpu-district/yu-garden-182016/',verifiedAt:'2026-10-27T00:00:00Z',
 hours:'Check the venue for your visit date.',booking:'Check dated garden admission separately from surrounding market events.',
 intro:'We’re at Yu Garden in Shanghai. Let’s slow down and look at the details.',
 voiceover:'This garden began in 1559, during the Ming dynasty. We’re looking for pond reflections, rockwork and little courtyards framed by traditional roofs.',
 closing:'That was a quieter side of Shanghai. Let’s see what’s around the next corner.'}];
GUIDES.push(
 {key:'mutianyu',names:['Mutianyu','慕田峪'],city:'Beijing',chineseName:'慕田峪长城',history:'Mutianyu is a Ming-dynasty section of the Great Wall in Beijing’s Huairou District. Its watchtowers and battlements follow the mountain ridges.',highlights:['Wall and mountain layers from an open viewpoint','Watchtower details','A portrait with the wall trailing behind'],source:'https://english.beijing.gov.cn/travellinginbeijing/attractions/202603/t20260325_4566115.html',verifiedAt:'2026-10-27T00:00:00Z',hours:'Verify winter opening and access.',booking:'Check dated entry and separate transport/cable-car inclusions.',intro:'We made it to Mutianyu. Look at how the wall follows those mountains.',voiceover:'This is a Ming-dynasty section of the Great Wall. The watchtowers and battlements are part of what makes this mountain route so distinctive.',closing:'That view was worth slowing down for. Time to head back carefully.'},
 {key:'panda-base',names:['Panda Base','Chengdu Research Base','Chengdu Research Base of Giant Panda Breeding'],city:'Chengdu',chineseName:'成都大熊猫繁育研究基地',history:'The Chengdu Research Base of Giant Panda Breeding supports panda conservation, breeding, research and public education. It also cares for red pandas and other wildlife.',highlights:['Observe pandas from designated visitor areas','Read the conservation exhibits','Capture the setting quietly, following visitor rules'],source:'https://www.panda.org.cn/en/about/introduction/',verifiedAt:'2026-10-27T00:00:00Z',hours:'Verify the official dated opening notice.',booking:'Check official entry reservations and passport requirements.',intro:'Today we’re visiting Chengdu’s Panda Base. Let’s see what the pandas are up to.',voiceover:'This base combines conservation and research with public education. The visit is also a chance to learn about the work behind caring for these animals.',closing:'Favourite moment? Definitely that one. Let’s keep the rest of the day relaxed.'}
);
function guideFor(a){return GUIDES.find(g=>txt(a.city).includes(g.city)&&g.names.some(n=>match(a.activity,n)))||null;}
function attractionFor(a,data){return (data.attractions||[]).find(r=>txt(r.City)===a.city&&match(a.activity,r['Attraction / Activity']))||{};}
function ticket(a,data,expenses=[],now=Date.now()){
 const paidLine=(data.paidBudgetItems||[]).find(p=>norm(p.item)===norm(a.activity)&&p.city===a.city);
 const r=attractionFor(a,data),local=data.smartState?.tickets?.[a.id];
 const explicit=TICKET_STATES.includes(a.ticketStatus)?a.ticketStatus:null;
 const base=paidLine?'Paid':explicit==='Paid'&&!a.ticketEvidence?'Needs Verification':explicit||'Needs Verification';
 const update=data.smartState?.priceUpdates?.[a.id];
 const published=num(r['Entrance Fee CNY']),price=num(update?.cny)??published??num(a.admissionCNY);
 const fromTracker=!!paidLine||explicit==='Paid'&&!!a.ticketEvidence;
 const state=fromTracker?'Paid':local?.status||base;
 const linked=expenses.find(e=>e.id===local?.expenseId);
 return {status:state,local:!!local&&!fromTracker,evidence:fromTracker?(a.ticketEvidence||paidLine?.id):local?.evidence||'',publishedCNY:price,
 priceStatus:txt(update?.status||r['Price Status']||a.priceStatus)||'Historical / unverified tracker estimate',source:safeUrl(update?.source||r.Source||a.priceSource),verifiedAt:update?.verifiedAt||r['Last Verified']||a.priceVerifiedAt||'',
 stale:stale(update?.verifiedAt||r['Last Verified']||a.priceVerifiedAt,now,168),applicability:update?.applicability||r.Applicability||a.priceApplicability||'Visit-date applicability not verified',
 inclusions:update?.inclusions||r.Inclusions||'Check admission inclusions and exclusions with the venue.',bookingUrl:safeUrl(r['Booking URL']||a.bookingUrl||guideFor(a)?.source),deadline:r['Booking Deadline']||'',
 paidCNY:fromTracker?num(a.paidCNY):linked?num(linked.amountCNY):num(local?.paidCNY),paidPHP:fromTracker?num(a.paidPHP)??num(paidLine?.amountPHP):linked?num(linked.actualPHP):num(local?.paidPHP),expenseId:linked?.id||null};
}
function updateTicket(a,data,status,evidence='',expenseId='',expenses=[]){
 if(!TICKET_STATES.includes(status))throw Error('Choose a valid ticket status.');
 if(ticket(a,data,expenses).status==='Paid'&&!ticket(a,data,expenses).local)throw Error('Verified tracker payment is preserved. Update its source separately.');
 if(status==='Paid'&&!txt(evidence)&&!expenses.some(e=>e.id===expenseId))throw Error('Add a payment/receipt reference or link an existing expense.');
 return {...data.smartState,tickets:{...data.smartState?.tickets,[a.id]:{status,evidence:txt(evidence).slice(0,400),expenseId:expenses.some(e=>e.id===expenseId)?expenseId:'',updatedAt:new Date().toISOString()}}};
}
function optionComparison(rows=[]){return rows.map(r=>{const working=rows.find(w=>w.Decision===r.Decision&&/^(working|booked)$/i.test(txt(w.Status))),amount=num(r['Est. PHP']),base=num(working?.['Est. PHP']);return {...r,deltaPHP:amount!==null&&base!==null?Math.round((amount-base)*100)/100:null,budgetSelected:/^yes$/i.test(txt(r['Use in Budget?'])),confidence:txt(r['Price Status'])||'Unverified',interpretation:amount!==null&&base!==null?(amount<base?'Lower historical/estimated price; reprice for current dates.':amount>base?'Higher historical/estimated price; assess benefits.':'Same saved price as working choice.'):'No comparable current price. See saved pros and cons.'};});}
function cityRows(data,city){return (data.cityPlans?.[city]||[]).map((r,i)=>({id:'city-'+city+'-'+i,city,activity:r.Activity,date:extractDate(r['Date / Day']),time:r.Time,area:r.Area,transport:r.Transport,duration:r['Travel Time'],notes:r.Notes,status:r.Status,sourceTab:city}));}
function extractDate(v){const s=txt(v).split(' / ')[0];if(/^\d{4}-\d{2}-\d{2}$/.test(s))return s;const m=s.match(/Jan\s+(\d{1,2}),?\s+2027/i);return m?'2027-01-'+m[1].padStart(2,'0'):'';}
function related(a,data){const city=a.city,all=[...(data.smartState?.savedNearby||[]).map(r=>({...r,source:'Saved on this device'})),...(data.itinerary||[]).map(r=>({...r,source:'My itinerary'})),...cityRows(data,city).map(r=>({...r,source:'My city plan'})),...(data.attractions||[]).map(r=>({city:r.City,activity:r['Attraction / Activity'],notes:r.Notes,area:r['Nearby / Pair With'],source:'My saved attractions'})),...(data.savedOptions||[]).filter(r=>/attraction|itinerary/i.test(r.Category)).map(r=>({city:r.City,activity:r.Option,notes:r.Notes,source:'My Saved Options'}))];const seen=new Set();return all.filter(r=>{const k=norm(r.activity);if(!k||r.city!==city||match(r.activity,a.activity)||seen.has(k))return false;seen.add(k);return true;});}
function foodFor(a,data){return (data.food||[]).filter(r=>r.City===a.city).map(r=>({...r,nearby:!!txt(r['Nearby Attraction'])&&match(a.activity,r['Nearby Attraction']),fit:/beef|牛肉/i.test([r['Dish / Order'],r.Notes].join(' '))})).sort((a,b)=>Number(b.nearby)-Number(a.nearby)||Number(b.fit)-Number(a.fit));}
function routeKey(a,origin){return a.id+'|'+origin;}
const MODES=['Walking','Bicycle','Metro','Bus','Train / HSR','DiDi'];
function routes(a,origin,data,now=Date.now(),originSignature=null){
 const stored=(data.smartState?.routes?.[routeKey(a,origin)]||[]).filter(r=>(originSignature===null||r.sample||r.originSignature===originSignature)&&(!r.destinationSignature||r.destinationSignature===JSON.stringify([a.activity,a.addressCN])));
 return MODES.map(mode=>{const r=stored.find(r=>r.mode===mode)||{};const fresh=!stale(r.updatedAt,now,24);
 const practical=r.practical===true&&r.safe===true&&r.weatherOK===true&&r.scenic===true&&!r.luggage&&!r.steep;
 const recommended=mode==='Walking'&&num(r.km)!==null&&num(r.km)<2&&r.distanceType==='walking-route'&&practical&&fresh;
 return {...r,mode,recommended,stale:!fresh,source:r.source||'No route provider connected',reliability:r.sample?'Sample estimate':fresh?'User-entered route reference; verify locally':'Unavailable / stale',fareCNY:num(r.fareCNY),km:num(r.km),minutes:num(r.minutes)};
 });
}
function amapRoute(place,origin,mode){
 // URI navigation requires confirmed GCJ-02 endpoints. Never mislabel WGS-84 GPS.
 const modes={Walking:'walk',Bicycle:'ride',Metro:'bus',Bus:'bus','Train / HSR':'bus',DiDi:'car'};
 if(place.coordinateSystem==='GCJ-02'&&origin?.coordinateSystem==='GCJ-02'&&[place.latitude,place.longitude,origin.latitude,origin.longitude].every(v=>num(v)!==null)){
  const u=new URL('https://uri.amap.com/navigation');u.searchParams.set('from',`${origin.longitude},${origin.latitude},${origin.name||'Origin'}`);u.searchParams.set('to',`${place.longitude},${place.latitude},${place.chineseName||place.activity||place.name}`);u.searchParams.set('mode',modes[mode]||'walk');u.searchParams.set('coordinate','gaode');u.searchParams.set('src','ChinaCompanion2027');u.searchParams.set('callnative','1');return u.href;
 }
 const u=new URL('https://uri.amap.com/search');u.searchParams.set('keyword',[place.chineseName||place.activity||place.name,place.addressCN].filter(Boolean).join(' '));u.searchParams.set('city',place.city||'');u.searchParams.set('src','ChinaCompanion2027');u.searchParams.set('callnative','1');return u.href;
}
function snowDecision(e={},now=Date.now()){
 const target=Date.parse(DAY+'T00:00:00+08:00');
 if(now<target-3*86400000)return {plan:'C',reason:'Too early for a reliable January 16 decision. Recheck January 13, January 15 evening and January 16 morning.'};
 if(now>target+86400000)return {plan:'C',reason:'This decision date has passed. Historical evidence is not a current recommendation.'};
 if(stale(e.observedAt,now,24)||e.area!=='Fairy Mountain'||!safeUrl(e.source))return {plan:'C',reason:'Recent mountain-area evidence with a source is missing. City weather and snowfall probability do not prove ground coverage.'};
 if(e.park==='closed'||e.roads==='unsafe'||e.transport==='unavailable'||e.practical==='no'||e.visibility==='poor'||['none','patchy'].includes(e.coverage))return {plan:'B',reason:'Reported coverage, access, visibility or transport does not justify the mountain trip. Use the city fallback.'};
 if(e.coverage==='scenic'&&e.park==='open'&&e.roads==='safe'&&e.transport==='available'&&e.practical==='yes'&&e.visibility==='good')return {plan:'A',reason:'Recent evidence reports worthwhile ground coverage, open access and practical safe transport. Verify again before departure.'};
 return {plan:'C',reason:'Ground coverage, park access, roads, visibility or feasible transport remains unverified. Prepare the city fallback.'};
}
function protectedActivity(a,data){return ticket(a,data).status==='Paid'||/\bpaid\b|ticketed/i.test(a.status||'')&& !/unpaid|not paid/i.test(a.status||'')||(data.bookings||[]).some(b=>match(a.activity,b.Booking)&&/paid|ticketed|confirmed/i.test(b['Payment Status']||''));}
function plans(data,now=Date.now()){
 const original=(data.itinerary||[]).filter(a=>a.date===DAY),adjacent=(data.itinerary||[]).filter(a=>a.date==='2027-01-17');
 const mountain=a=>/wulong|fairy|winter gear|descend|mountain snow/i.test([a.activity,a.area].join(' '));
 const evening=original.filter(a=>!mountain(a));
 const candidates=related({city:'Chongqing',activity:''},data).filter(a=>!mountain(a)&&!(data.itinerary||[]).some(b=>match(a.activity,b.activity))&&!/hotel|airport|station|HSR|flight|three natural bridges/i.test(a.activity));
 // The fall-back is deliberately conservative: two saved stops and a rest/lunch buffer.
 const fallback=candidates.length?candidates:DISCOVERIES.filter(a=>!(data.itinerary||[]).some(b=>match(a.activity,b.activity)));
 const selected=fallback.slice(0,2).map((a,i)=>({...a,id:'fallback-'+norm(a.activity),date:DAY,time:i?'11:00–12:00':'09:00–10:00',status:'Proposed local alternative',notes:[a.notes,'Proposed 60-minute block; verify opening and transfer time. No reservation made.'].filter(Boolean).join(' ')}));
 const conflicts=original.filter(a=>mountain(a)&&protectedActivity(a,data));
 for(const b of data.bookings||[])if(extractDate(b.Date)===DAY&&/wulong|fairy|mountain snow/i.test(b.Booking||'')&&/booked|confirmed|ticketed|paid/i.test(b['Payment Status']||'')&&!conflicts.some(a=>match(a.activity,b.Booking)))conflicts.push({activity:b.Booking,status:b['Payment Status'],date:DAY,source:'Protected reservation'});
 const duplicateAvoided=candidates.length?[]:adjacent.map(a=>a.activity);
 const schedule=[...selected,{id:'fallback-buffer',date:DAY,city:'Chongqing',time:'12:00–15:00',activity:'Lunch, transfer buffer and rest',status:'Flexible',notes:'Choose a saved solo-friendly beef meal; allow extra time for hills and stairs.'},...evening];
 return {decision:snowDecision(data.smartState?.conditions,now),A:original,B:schedule,conflicts,adjacent,duplicateAvoided,
 missing:!selected.length?'No unscheduled city choices available. Save new alternatives before applying a full city schedule.':'',
 explanation:'Jan 17 stays unchanged. Its activities are excluded from fallback suggestions. Existing evening items are retained; drone shows remain conditional on official confirmation.',
 prices:(data.savedOptions||[]).filter(r=>/wulong|fairy/i.test([r.Decision,r.Option].join(' ')))};
}
function applyPlan(data,plan,confirmed,now=Date.now()){
 if(!confirmed)throw Error('Confirm the alternative schedule before applying it.');if(!['A','B'].includes(plan))throw Error('Choose Plan A or Plan B.');
 const p=plans(data,now);if(plan==='B'&&(p.conflicts.length||p.missing))throw Error(p.conflicts.length?'A protected paid/ticketed reservation conflicts. Resolve it before applying.':p.missing);
 return {...data.smartState,plans:{...data.smartState?.plans,[DAY]:{plan,sourceSignature:JSON.stringify(p.A),adjacentSignature:JSON.stringify(p.adjacent),schedule:plan==='A'?p.A:p.B,acceptedAt:new Date(now).toISOString()}}};
}
function effectiveItinerary(data){const overlay=data.smartState?.plans?.[DAY];if(!overlay||!Array.isArray(overlay.schedule))return data.itinerary||[];const current=(data.itinerary||[]).filter(a=>a.date===DAY);if(overlay.sourceSignature!==JSON.stringify(current)||overlay.plan==='B'&&(plans(data).conflicts.length||overlay.adjacentSignature!==JSON.stringify((data.itinerary||[]).filter(a=>a.date==='2027-01-17'))))return data.itinerary||[];return [...(data.itinerary||[]).filter(a=>a.date!==DAY),...overlay.schedule].sort((a,b)=>a.date.localeCompare(b.date));}
function scenarioAdvice(kind,evidence){if(!evidence?.confirmed||!safeUrl(evidence.source)||stale(evidence.at))return 'Uncertain: add recent reliable evidence. Keep the current schedule and prepare saved alternatives.';
 return ({rain:'Compare saved indoor stops and keep timed reservations.',wall:'Compare a saved city day; verify Great Wall access and visibility before changing tickets.',drone:'Keep the riverfront and night photography; remove only the unconfirmed show.',delay:'Keep the booked transfer, add a buffer, and drop optional stops first.',closed:'Check the venue notice; compare saved alternatives without duplicating the next day.',overrun:'Keep timed bookings; shorten optional filming and food stops first.',missed:'Check the reservation terms before rescheduling. Do not assume a refund.'})[kind]||'Review saved options; no schedule changes applied.';
}
function mergeState(incoming={},current={}){const result={...incoming,...current};for(const key of ['shots','stories','things','notes','tickets','routes','plans','priceUpdates'])result[key]={...incoming[key],...current[key]};for(const key of ['proposals','savedNearby']){const seen=new Set();result[key]=[...(current[key]||[]),...(incoming[key]||[])].filter(r=>{const id=norm(r.activity)+'|'+r.after;if(seen.has(id))return false;seen.add(id);return true;});}return result;}
const SHOTS=[['arrival','Entrance / name sign','Wide arrival and visible place name','Both',true,6,'Landscape + one short vertical take'],['wide','Establish the place','Slow wide shot from a permitted viewpoint','YouTube',true,8,'Landscape'],['pov','Walking POV','A steady few steps along your actual route','Both',true,6,'Landscape + vertical'],['detail','A detail worth noticing','Medium shot, then close-up of texture or architecture','YouTube',true,5,'Landscape'],['highlight','Main highlight','One clean scene showing why you came','Both',false,8,'Landscape + vertical'],['sound','Let the place speak','Hold still for clean ambient sound; respect filming rules','YouTube',false,10,'Landscape'],['food','Food / experience','Order, detail shot and honest first reaction, if already planned','Both',false,6,'Landscape + vertical'],['reaction','Your take / transition','Natural on-camera reaction and next destination','YouTube',false,12,'Landscape']];
function shots(a,quick=false){return SHOTS.filter(s=>!quick||s[4]).map(([id,title,angle,platform,must,seconds,framing])=>({id:a.id+':'+id,title,angle,platform,must,seconds,framing}));}
function scripts(a){const g=guideFor(a);return {history:g?.history||'No researched history is saved for this place. Keep narration observational until verified.',intro:g?.intro||`We’re at ${a.activity} in ${a.city}. Let’s take a look around.`,voiceover:g?.voiceover||'Describe only what you can see and what you personally experience. Add sourced history after verification.',closing:g?.closing||'That’s my favourite detail here. Let’s head to the next stop.',source:g?.source||'',verifiedAt:g?.verifiedAt||''};}
function storyPrompts(date,itinerary){const a=itinerary.filter(a=>a.date===date);return [{id:date+':open',title:'Opening moment',caption:'A new day in '+(a[0]?.city||'China'),must:true},{id:date+':place',title:'Place highlight',caption:a.find(a=>!/(transfer|hotel|airport)/i.test(a.activity))?.activity||'A little look around',must:true},{id:date+':food',title:'Food / activity',caption:'Today’s little discovery',must:false},{id:date+':visual',title:'Strong visual',caption:'Keeping this view',must:false},{id:date+':close',title:'Natural closing',caption:'That’s today. More tomorrow.',must:false}];}
return {DISCOVERIES,mergeState,TICKET_STATES,DAY,CITIES,GUIDES,MODES,num,match,safeUrl,stale,guideFor,attractionFor,ticket,updateTicket,optionComparison,cityRows,foodFor,related,extractDate,routes,routeKey,amapRoute,snowDecision,plans,applyPlan,effectiveItinerary,scenarioAdvice,shots,scripts,storyPrompts};
});

/* Daily Carry: offline activity-aware suggestions, never a packing inventory or Sheet mutation. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ChinaDailyCarry=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{'use strict';
const start='2027-01-11',end='2027-01-21';
const DATES=Array.from({length:11},(_,i)=>'2027-01-'+String(11+i).padStart(2,'0'));
const trim=v=>String(v??'').trim();
const norm=v=>trim(v).normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ');
const items=[
 ['phone','Phone + offline Chinese addresses','Essentials','Keep ticket screenshots, hotel address and navigation accessible.',true,['phone','iphone','手机']],
 ['payment','Primary GCash/Alipay+ + physical backup card','Essentials','Check login and QR payment readiness before leaving the hotel.',true,['gcash','visa']],
 ['powerbank','Power bank + USB-C cable','Power & tech','Plan for GPS, filming and winter battery drain. Carry power banks in cabin baggage on flights.',true,['power bank','powerbank','usb c']],
 ['water','Water bottle','Essentials','Hydrate; refill as permitted.',true,['water bottle','thermos']],
 ['tissues','Tissues / wet wipes','Essentials','Useful on long walks, stations and food stops.',true,['tissue','wet wipe']],
 ['meds','Personal essential medication (review)','Essentials','Only your own prescribed/needed items, in their suitable packaging; do not auto-assume medication.',true,['medication','medicine']],
 ['wintercoat','Warm winter coat / jacket','Cold weather','Winter layers according to the actual forecast and your comfort.',true,['winter jacket','coat','puffer','down jacket']],
 ['walking','Comfortable walking shoes','Clothing','Wear rather than carry. Expect substantial walking and possible stairs.',true,['walking shoes','sneakers']],
 ['pocket','DJI Osmo Pocket 3 or Pocket 4','Camera','Compact default walking/vlog camera, not both unless planned.',false,['osmo pocket','pocket 3','pocket 4']],
 ['sdcard','Spare SD card + safe case','Camera','Use a small protected case; avoid leaving footage cards unsecured.',false,['sd card','micro sd']],
 ['mic','DJI Mic 2 or Mic Mini','Camera','For on-camera Taglish vlog and clean ambient audio.',false,['dji mic','mic mini']],
 ['sparecamera','Camera spare battery / charging cable','Camera','Cold weather reduces battery runtime. Check battery transport rules.',false,['battery','camera charger']],
 ['umbrella','Compact umbrella / rain layer','Weather','Only if forecast suggests rain; verify daily.',false,['umbrella','raincoat']],
 ['sunscreen','Sunscreen + lip balm','Weather','Useful during sunny, dry and windy winter sightseeing.',false,['sunscreen','lip balm']],
 ['hotpacks','Hand warmers / warm gloves','Cold weather','Consider for extended outdoor winter exposure.',false,['gloves','hand warmer']],
 ['warmhat','Warm hat / scarf','Cold weather','Extra warmth when standing outside for long periods.',false,['hat','scarf','beanie']],
 ['warmboots','Grippy water-resistant footwear','Cold weather','Wear appropriate footwear for potentially icy or wet terrain; actual conditions unverified.',false,['boots','snow boots','traction']],
 ['actioncam','DJI Osmo Action camera','Camera','Optional for mountain or movement-based footage where permitted.',false,['osmo action','action 6']],
 ['camera360','360 camera + short grip','Camera','Optional for wide scenic footage; verify venue and selfie-stick restrictions.',false,['360','insta360']],
 ['ticket','Tickets / booking confirmation offline','Travel day','Store offline QR, reservation code and Chinese destination address.',true,['ticket','booking']],
 ['passport','Passport / required travel ID','Travel day','Check actual ID requirements for each leg before departure.',true,['passport']],
 ['charger','Phone charger + travel adapter','Travel day','For airport/train/hotel transfers; check airline cabin rules.',true,['travel adapter','charger']],
 ['earbuds','Earbuds','Travel day','Useful during long transit, when safe and permitted.',false,['earbuds','airpods']],
 ['snack','Compact snack','Travel day','Useful for long travel or attraction queues; check venue and transport food rules.',false,['snack']],
 ['disney','Disney booking QR / park app ready','Special day','Check park entry, ticket QR and official current rules.',true,['disney ticket']],
 ['raincover','Weather protection for camera bag','Special day','Protect electronics in snow/rain. Check current conditions.',false,['rain cover','waterproof']],
 ['seat','HSR / flight boarding details','Travel day','Check actual terminal/station and departure before leaving.',true,['boarding','train ticket']],
 ['map','Offline route and Chinese destination address','Travel day','Save the exact destination and entrance; no live ETA offline.',true,['map']],
];
const catalog=Object.fromEntries(items.map(([id,title,category,reason,base,aliases])=>[id,{id:'rec:'+id,title,category,reason,base,aliases}]));
const CORE=['phone','payment','powerbank','water','tissues','meds','walking'];
const WINTER=['wintercoat'];const FILM=['pocket','sdcard'];const TRANSIT=['passport','ticket','seat','charger','earbuds','snack','map'];
const SPECIAL={
 disney:['disney','pocket','sdcard','snack','powerbank','sunscreen'],
 snow:['hotpacks','warmhat','warmboots','raincover','actioncam','sparecamera','sdcard'],
 wall:['hotpacks','warmhat','warmboots','sunscreen','pocket','sparecamera'],
 panda:['pocket','sdcard','sunscreen'],
 night:['pocket','sparecamera','warmhat'],
};
const uniq=xs=>[...new Set(xs)];
const effective=d=>{const src=d?.itinerary||[];const p=d?.smartState?.plans?.['2027-01-16'];if(!p?.schedule||!Array.isArray(p.schedule)||p.sourceSignature!==JSON.stringify(src.filter(a=>a.date==='2027-01-16')))return src;return [...src.filter(a=>a.date!=='2027-01-16'),...p.schedule];};
const activities=(d,date,activityId='')=>effective(d).filter(a=>a?.date===date&&(!activityId||a.id===activityId));
const detect=a=>{const s=norm([a.activity,a.area,a.notes,a.transport].join(' '));
 return {disney:/disney|迪士尼/.test(s),snow:/wulong|fairy mountain|snow|仙女山|武隆/.test(s),wall:/mutianyu|great wall|长城|慕田峪/.test(s),panda:/panda|熊猫/.test(s),night:/night|evening|cruise|skyline|hongya|洪崖|夜/.test(s),transit:/airport|flight|fly |railway|high speed|hsr|station|train|transfer|depart|arrival|check.out|check.in|飞机|火车|机场/.test(s)};
};
const dayState=(d,date)=>d?.smartState?.dailyCarry?.days?.[date]||{};
const eligible=d=>{const v=d?.smartState?.dailyCarry?.days||{};return v&&typeof v==='object'?v:{};};
function plan(d,date,{activityId=''}={}){
 if(!DATES.includes(date))throw Error('Choose a China trip date from January 11–21, 2027.');
 const all=activities(d,date),selected=activities(d,date,activityId),events=selected.length?selected:all,flags=events.map(detect);
 const transit=flags.some(f=>f.transit),disney=flags.some(f=>f.disney),snow=flags.some(f=>f.snow),wall=flags.some(f=>f.wall),panda=flags.some(f=>f.panda),night=flags.some(f=>f.night),tour=events.length&&events.some(a=>!detect(a).transit);
 let ids=[...CORE,...WINTER];
 if(tour)ids.push(...FILM);if(transit)ids.push(...TRANSIT);
 if(disney)ids.push(...SPECIAL.disney);if(snow)ids.push(...SPECIAL.snow);if(wall)ids.push(...SPECIAL.wall);if(panda)ids.push(...SPECIAL.panda);if(night)ids.push(...SPECIAL.night);
 if(tour&&!disney&&!snow&&!wall)ids.push('umbrella','sunscreen');if(events.length===0)ids.push('ticket','charger');
 ids=uniq(ids);
 const s=dayState(d,date),excluded=new Set(s.excluded||[]),checks=s.checks||{};
 const base=ids.map(id=>catalog[id]).filter(Boolean).map(item=>({...item,required:item.base||transit&&TRANSIT.includes(item.id.slice(4)),checked:!!checks[item.id],source:'suggested',matched:matchItem(d,item)}));
 const extra=(s.custom||[]).filter(x=>x&&trim(x.title)).map(x=>({id:x.id,title:trim(x.title).slice(0,140),category:'My extras',reason:trim(x.note).slice(0,300),checked:!!checks[x.id],source:'custom',required:false,matched:matchItem(d,x)}));
 const rows=[...base,...extra].filter(x=>!excluded.has(x.id));
 return {date,activities:all,filteredActivities:events,items:rows,excluded:[...excluded],stats:{checked:rows.filter(x=>x.checked).length,total:rows.length},bag:trim(s.bag)||'Ulanzi PB038 10L sling',notes:trim(s.notes||''),flags:{transit,disney,snow,wall,panda,night},cautions:[
   'Suggestions are not proof that an item is owned, packed, or safe to carry. Your main Packing & Bags checklist stays independent.',
   'Check the actual weather, airline lithium battery requirements, venue photography/selfie-stick rules, and entry ID before leaving.',
   ...(snow||wall?['Mountain / winter conditions are unverified. Use suitable cold and potentially icy terrain protection.']:[]),
   ...(disney?['Check Shanghai Disneyland’s current prohibited-item and photography rules before packing a camera or tripod.']:[]),
 ]};
}
function matchItem(d,item){const pack=d?.smartState?.packing,raw=d?.packingRecords||[],stored=Object.values(pack?.items||{}),names=[...raw.filter(r=>r['Record Type']==='ITEM').map(x=>x['Item / Task']),...stored.filter(x=>x?.archived!==true).map(x=>x.name)].map(norm).filter(Boolean);
 const aliases=(item.aliases||[]).map(norm).filter(x=>x.length>=4);
 return names.find(n=>aliases.some(a=>n===a||n.includes(a)&&a.length>=6))||'';
}
function changed(d,date,operation){
 if(!DATES.includes(date))throw Error('Date outside China trip.');
 const old=d?.smartState?.dailyCarry||{},days={...old.days},s={...days[date],checks:{...days[date]?.checks},excluded:[...(days[date]?.excluded||[])],custom:[...(days[date]?.custom||[])]};
 const validate=id=>{if(!String(id).startsWith('rec:')&&!s.custom.some(x=>x.id===id))throw Error('Unknown day-carry item.');};
 switch(operation.type){
  case'check':validate(operation.id);s.checks[operation.id]=!!operation.value;break;
  case'exclude':validate(operation.id);if(!s.excluded.includes(operation.id))s.excluded.push(operation.id);break;
  case'restore':s.excluded=[];break;
  case'add':{const title=trim(operation.title).slice(0,140);if(!title)throw Error('Enter the item to carry.');if(s.custom.length>=40)throw Error('Daily carry limit is 40 personal items.');if(s.custom.some(x=>norm(x.title)===norm(title)))throw Error('This day already has that item.');const id='custom:'+Date.now().toString(36)+':'+Math.random().toString(36).slice(2,10);s.custom.push({id,title,note:''});break;}
  case'bag':s.bag=trim(operation.value).slice(0,90)||'Ulanzi PB038 10L sling';break;
  case'notes':s.notes=trim(operation.value).slice(0,1500);break;
  case'reset-checks':s.checks={};break;
  default:throw Error('Unknown daily-carry operation.');
 }
 s.updatedAt=new Date().toISOString();days[date]=s;return {...old,days};
}
function progress(d,date){const p=plan(d,date);return p.stats;}
function merge(incoming={},current={}){const days={...incoming.days};for(const [date,cur]of Object.entries(current.days||{})){const inc=days[date]||{};days[date]={...inc,...cur,checks:{...inc.checks,...cur.checks},custom:[...new Map([...(inc.custom||[]),...(cur.custom||[])].map(x=>[x.id,x])).values()],excluded:[...new Set([...(inc.excluded||[]),...(cur.excluded||[])])]};}return {...incoming,...current,days};}
return {DATES,catalog,activities,detect,plan,changed,progress,merge,dayState};
});
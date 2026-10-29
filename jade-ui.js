/* Presentation helpers only. Existing trip, expense and OAuth storage is untouched. */
(function(root,factory){
 const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.ChinaJade=api;
 if(root.document){let theme='light';try{theme=api.theme(root.localStorage.getItem(api.THEME_KEY));}catch{}api.applyTheme(theme,root.document);}
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const THEME_KEY='chinaCompanionThemeV1',START='2027-01-11',END='2027-01-21';
 const theme=value=>value==='dark'?'dark':'light';
 function applyTheme(value,doc){value=theme(value);doc.documentElement.dataset.theme=value;doc.documentElement.style.colorScheme=value;const meta=doc.querySelector('meta[name="theme-color"]');if(meta)meta.content=value==='dark'?'#1B1D21':'#FAF7F1';return value;}
 function clock(now=new Date()){
  const p=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now).map(x=>[x.type,x.value]));
  return {date:`${p.year}-${p.month}-${p.day}`,minutes:Number(p.hour)*60+Number(p.minute)};
 }
 function timeMinutes(value){const m=String(value||'').match(/\b(\d{1,2}):(\d{2})\s*(AM|PM)?/i);if(!m)return null;let hour=Number(m[1]),minute=Number(m[2]);if(hour>23||minute>59)return null;if(m[3]){if(hour<1||hour>12)return null;hour=hour%12+(m[3].toUpperCase()==='PM'?12:0);}return hour*60+minute;}
 function today(itinerary=[],done={},now=new Date()){
  const current=clock(now),before=current.date<START,after=current.date>END;
  const displayDate=before?START:after?END:current.date;
  const ordered=itinerary.map((a,i)=>({...a,_order:i})).filter(a=>/^\d{4}-\d{2}-\d{2}$/.test(a.date||'')).sort((a,b)=>a.date.localeCompare(b.date)||((timeMinutes(a.time)??1440)-(timeMinutes(b.time)??1440))||a._order-b._order);
  const candidates=ordered.filter(a=>!done[a.id]&&a.date>=current.date&&(a.date>current.date||timeMinutes(a.time)===null||timeMinutes(a.time)>=current.minutes));
  const next=after?null:candidates[0]||null;
  const city=ordered.find(a=>a.date===displayDate)?.city||next?.city||'';
  const day=Math.floor((Date.parse(displayDate+'T00:00:00Z')-Date.parse(START+'T00:00:00Z'))/86400000)+1;
  const days=Math.max(0,Math.ceil((Date.parse(START+'T00:00:00Z')-Date.parse(current.date+'T00:00:00Z'))/86400000));
  return {date:displayDate,currentDate:current.date,before,after,city,next,countdown:before?`${days} ${days===1?'day':'days'} to go`:after?'Journey complete':`Day ${day} of 11`};
 }
 function address(h={}){return {name:String(h.Hotel||h.name||'Saved place'),chineseName:String(h['Chinese Name']||h['Hotel CN']||h.chineseName||''),address:String(h['Chinese Address']||h['Address CN']||h.Address||h.addressCN||''),city:String(h.City||h.city||'')};}
 function addressText(h){const a=address(h);return [a.chineseName,a.address].filter(Boolean).join('\n');}
 function amapUrl(place={}){
  const a=address(place),keyword=[a.chineseName||a.name,a.address].filter(Boolean).join(' ');
  const url=new URL('https://uri.amap.com/search');url.searchParams.set('keyword',keyword);if(a.city)url.searchParams.set('city',a.city);url.searchParams.set('src','ChinaCompanion2027');url.searchParams.set('callnative','1');return url.href;
 }
 function coordinates(p={}){
  if(!['GCJ-02','WGS-84'].includes(p.coordinateSystem)||p.latitude==null||p.longitude==null||String(p.latitude).trim()===''||String(p.longitude).trim()==='')return null;
  const lat=Number(p.latitude),lon=Number(p.longitude);return Number.isFinite(lat)&&Number.isFinite(lon)&&Math.abs(lat)<=90&&Math.abs(lon)<=180?{lat,lon,dev:p.coordinateSystem==='GCJ-02'?'0':'1'}:null;
 }
 function amapNative(place={},origin=null,mode=null){
  const a=address(place),name=a.chineseName||place.activity||a.name,c=coordinates(place),modes={Walking:'2',Bicycle:'3',Metro:'1',Bus:'1',DiDi:'0',Driving:'0',Transit:'1',Cycling:'3'};
  const u=new URL('iosamap://'+(mode&&modes[mode]?'path':c?'viewMap':'poi'));u.searchParams.set('sourceApplication','ChinaCompanion2027');
  if(mode&&modes[mode]){
   u.searchParams.set('t',modes[mode]);u.searchParams.set('dname',name);
   const o=coordinates(origin||{});
   // dev applies to both endpoints. Mixed/unknown systems use names, never relabel GPS.
   if(c&&(!o||o.dev===c.dev)){u.searchParams.set('dlat',c.lat);u.searchParams.set('dlon',c.lon);u.searchParams.set('dev',c.dev);if(o){u.searchParams.set('slat',o.lat);u.searchParams.set('slon',o.lon);}}
   if(origin?.name)u.searchParams.set('sname',origin.name);
  }else if(c){u.searchParams.set('poiname',name);u.searchParams.set('lat',c.lat);u.searchParams.set('lon',c.lon);u.searchParams.set('dev',c.dev);}
  else u.searchParams.set('name',[a.city,name,a.address].filter(Boolean).join(' '));
  return u.href;
 }
 function isIOS(nav=globalThis.navigator){return /iPhone|iPad|iPod/.test(nav?.userAgent||'')||nav?.platform==='MacIntel'&&nav?.maxTouchPoints>1;}
 function amapActions(place,options={}){
  const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const web=new URL(options.web||amapUrl(place));web.searchParams.set('callnative','0');
  return `${isIOS()?`<a class="secondary-btn" href="${esc(amapNative(place,options.origin,options.mode))}" referrerpolicy="no-referrer">Open in AMap App</a>`:''}<a class="secondary-btn" href="${esc(web.href)}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">Open AMap Website ↗</a><small class="amap-help">${isIOS()?'If the app does not open, use the website link. AMap uses your installed app language; confirm the Chinese destination and entrance.':'On iPhone, open the installed AMap app or use the website.'}</small>`;
 }
 return {THEME_KEY,START,END,theme,applyTheme,clock,timeMinutes,today,address,addressText,amapUrl,coordinates,amapNative,amapActions,isIOS};
});

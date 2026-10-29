'use strict';
(() => {
const UI=globalThis.ChinaJade;
const KEY='chinaCompanionPrivateV2',EXP='chinaCompanionExpensesV1',CHECK='chinaCompanionDoneV1';
const $=q=>document.querySelector(q), $$=q=>[...document.querySelectorAll(q)];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const php=n=>'₱'+Number(n||0).toLocaleString('en-PH',{minimumFractionDigits:2,maximumFractionDigits:2});
const safeNum=x=>Number.isFinite(Number(x))?Number(x):0;
const dateStr=d=>new Date(d+'T12:00:00').toLocaleDateString('en-PH',{weekday:'short',month:'short',day:'numeric'});
const dates=Array.from({length:11},(_,i)=>`2027-01-${String(11+i).padStart(2,'0')}`);
let data={schemaVersion:2,trip:{title:'China Companion Demo',budgetPHP:150000,baselineSpentPHP:0,dailyAllowancePHP:8000},itinerary:[],bookings:[],hotels:[],transport:[],paymentGuide:[],food:[],attractions:[]};
let expenses=[],done={},selectedDay=dates[0],view='home',translation={text:'',language:'zh-CN'},direction='en-zh',recognition=null,micRequested=false,recognitionBusy=false,recognitionProcessing=false,voiceErrors=0,voiceEpoch=0,translationSeq=0,toastTimer;
let mapCity='Shanghai',sheetSync=null,googleClient=null,syncState={message:'Connect Google to refresh your private tracker.'};
const OAUTH_CONFIG='chinaCompanionGoogleClientIdV1',SPEECH_RATE_KEY='chinaCompanionSpeechRateV1';
const mapData={
 Shanghai:{lat:31.2304,lon:121.4737,zoom:.075,places:[['The Bund',31.2400,121.4900,'Riverside views'],['Shanghai Disneyland',31.1438,121.6570,'Theme park'],['Shanghai Wild Animal Park',31.0557,121.7209,'Wildlife park']]},
 Chongqing:{lat:29.5630,lon:106.5725,zoom:.075,places:[['Hongyadong',29.5625,106.5747,'Night lights'],['Kuixing Tower',29.5646,106.5746,'Multi-level city'],['Jiefangbei',29.5582,106.5770,'City center'],['Liziba Station',29.5530,106.5437,'Train through building']]},
 Chengdu:{lat:30.6580,lon:104.0650,zoom:.08,places:[['Panda Base',30.7346,104.1476,'Morning visit'],['Jinli Street',30.6468,104.0499,'Lanterns and food'],['Anshun Bridge',30.6412,104.0906,'Night photo stop']]},
 Beijing:{lat:39.9170,lon:116.3970,zoom:.12,places:[['Forbidden City',39.9163,116.3972,'Historic palace'],['Tiananmen Square',39.9054,116.3976,'Square'],['Summer Palace',39.9994,116.2755,'Lakes and gardens'],['Mutianyu Great Wall',40.4372,116.5704,'Wall day trip']]}}
;
const phrases=[
['How much is this?','这个多少钱？','Zhège duōshao qián?'],
['Can you make it cheaper?','可以便宜一点吗？','Kěyǐ piányi yìdiǎn ma?'],
['I only eat beef.','我只吃牛肉。','Wǒ zhǐ chī niúròu.'],
['No vegetables, please.','不要蔬菜，谢谢。','Bù yào shūcài, xièxie.'],
['Is this spicy?','这个辣吗？','Zhège là ma?'],
['I want it very spicy.','我要很辣的。','Wǒ yào hěn là de.'],
['Where is the restroom?','洗手间在哪里？','Xǐshǒujiān zài nǎlǐ?'],
['Please take me to this address.','请带我去这个地址。','Qǐng dài wǒ qù zhège dìzhǐ.'],
['Can I pay with Alipay?','可以用支付宝吗？','Kěyǐ yòng Zhīfùbǎo ma?'],
['Can I pay with WeChat Pay?','可以用微信支付吗？','Kěyǐ yòng Wēixìn zhīfù ma?'],
['Where is the metro station?','地铁站在哪里？','Dìtiě zhàn zài nǎlǐ?'],
['I do not speak Chinese.','我不会说中文。','Wǒ bú huì shuō Zhōngwén.'],
['Please speak slowly.','请说慢一点。','Qǐng shuō màn yìdiǎn.'],
['Thank you!','谢谢！','Xièxie!'],
['I need help.','我需要帮助。','Wǒ xūyào bāngzhù.'],
['Please call an ambulance.','请帮我叫救护车。','Qǐng bāng wǒ jiào jiùhùchē.'],
['Please call the police.','请帮我报警。','Qǐng bāng wǒ bàojǐng.'],
['I need a doctor.','我需要看医生。','Wǒ xūyào kàn yīshēng.'],
['Beef noodles, please.','请给我一碗牛肉面。','Qǐng gěi wǒ yì wǎn niúròu miàn.']
];
function notify(s){const t=$('#toast');t.textContent=s;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),3000)}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(data));localStorage.setItem(EXP,JSON.stringify(expenses));localStorage.setItem(CHECK,JSON.stringify(done));}catch(e){notify('Storage unavailable. Download a backup of your files.')}}
function initSpeechRate(){let value='0.70';try{value=localStorage.getItem(SPEECH_RATE_KEY)||value}catch{}if(['0.55','0.70','0.85','1.00'].includes(value))$('#speechSpeed').value=value;}
function boot(){try{const d=JSON.parse(localStorage.getItem(KEY));if(d?.schemaVersion>=1&&d?.trip)data=d;}catch{}try{const x=JSON.parse(localStorage.getItem(EXP));if(Array.isArray(x))expenses=x;}catch{}try{const x=JSON.parse(localStorage.getItem(CHECK));if(x&&typeof x==='object')done=x;}catch{}const now=new Date();const t=UI.clock(now).date;selectedDay=dates.find(x=>x>=t)||dates.at(-1);if(t<dates[0])selectedDay=dates[0];initJade();initHandlers();populatePaymentMethods();document.addEventListener('visibilitychange',()=>{if(document.visibilityState!=='visible'&&micRequested)stopMic('Conversation paused while the app was in the background. Tap Start to resume.');});window.addEventListener('pagehide',()=>{if(micRequested)stopMic();});resetExpenseForm();initSpeechRate();window.ChinaReceipts?.init();try{if(expenses.some(e=>e.receiptStatus==='uploading'))writeExpenses(expenses.map(e=>e.receiptStatus==='uploading'?{...e,receiptStatus:'pending',receiptError:'Upload was interrupted. Retry checks Drive before uploading again.'}:e));}catch{}initSheetSync();globalThis.ChinaCompanionUI?.init({getData:()=>data,getPlaces:savedMapPlaces,getExpenses:()=>expenses,getDone:()=>done,getDay:()=>selectedDay,setDay:day=>{selectedDay=day;renderDay();},nav,notify,setBookingView,refresh:renderEverything,saveSmart:smartState=>{const next={...data,smartState:globalThis.ChinaPackingSync?.queued(data,smartState)||smartState};localStorage.setItem(KEY,JSON.stringify(next));data=next;globalThis.ChinaPackingSync?.changed();}});renderEverything();refreshDailyFx();updateNetwork();window.addEventListener('online',updateNetwork);window.addEventListener('online',refreshDailyFx);window.addEventListener('offline',updateNetwork);if('serviceWorker'in navigator && location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).catch(()=>{});}
function updateNetwork(){$('#networkIndicator').textContent=navigator.onLine?'Online':'Offline';$('#networkIndicator').dataset.online=String(navigator.onLine);if(view==='map')renderMap();}
function nav(name){if(!$('#page-'+name))return;const changed=view!==name;if(view==='translate'&&name!=='translate'&&micRequested)stopMic('Conversation paused when leaving Talk.');view=name;$$('.page').forEach(x=>x.classList.toggle('active',x.id===`page-${name}`));$$('[data-nav]').forEach(x=>{const active=x.dataset.nav===name;x.classList.toggle('nav-active',active);if(active)x.setAttribute('aria-current','page');else x.removeAttribute('aria-current');});if(changed){window.scrollTo({top:0,behavior:'auto'});$('#main').focus({preventScroll:true});}if(name==='map')renderMap();if(name==='wallet')renderMoney();if(name==='bookings')renderBookings();if(name==='translate')renderPhrases();globalThis.ChinaCompanionUI?.onNav(name);}
function isReal(){return Array.isArray(data.itinerary)&&data.itinerary.length>0}
function travelItinerary(){return globalThis.ChinaSmartTravel?.effectiveItinerary(data)||data.itinerary||[];}
function records(day){return travelItinerary().filter(x=>x.date===day)}
function cardActivity(x){const ticket=globalThis.ChinaSmartTravel?.ticket(x,data,expenses);const c=!!done[x.id],must=/must|p1/i.test(x.status+' '+x.activity);return `<div class="activity ${c?'done':''}"><span class="time-tick">${esc(x.time||'Anytime')}</span><div class="activity-main"><button class="activity-title activity-open" data-smart="open" data-id="${esc(x.id)}">${esc(x.activity)}</button><div class="activity-meta">${esc(x.city)}${x.area?' · '+esc(x.area):''}${x.transport?' · '+esc(x.transport):''}</div>${x.notes?`<div class="activity-note">${esc(x.notes).slice(0,500)}</div>`:''}<span class="status ${must?'pending':''}">${must?'Priority':esc(x.status||'Planned')}</span>${ticket?`<span class="ticket-brief">${esc(ticket.status)} · ${ticket.publishedCNY===null?'Price to verify':'¥'+ticket.publishedCNY+' · tracker reference'}</span>`:''}<button class="text-btn" data-map-activity="${esc(x.id)}">Map & address</button></div><input type="checkbox" class="done-check" data-done="${esc(x.id)}" aria-label="Completed: ${esc(x.activity)}" ${c?'checked':''}></div>`}
function setDates(el){el.innerHTML=dates.map(d=>`<button class="day-pill ${d===selectedDay?'selected':''}" data-date="${d}" aria-pressed="${d===selectedDay}"><small>${dateStr(d).split(',')[0]}</small><strong>${d.slice(-2)}</strong><small>JAN</small></button>`).join('')}
function renderDay(){setDates($('#homeDates'));setDates($('#itineraryDates'));const row=records(selectedDay);$('#welcomeTitle').textContent=isReal()?(row[0]?.city||'China')+' · '+dateStr(selectedDay):'Your China trip, all in one place.';$('#welcomeSub').textContent=isReal()?`${row.length} scheduled items for this day. Browse, check off, and keep plans handy.`:'Connect Google in Settings to load your private itinerary, tickets, and bookings.';$('#homeItinerary').innerHTML=row.length?row.slice(0,5).map(cardActivity).join(''):'<div class="empty">No itinerary items loaded for this date. Connect Google or import private data in Settings.</div>';renderItinerary();renderSmartToday()}
function renderItinerary(){const q=$('#activitySearch').value.trim().toLowerCase();const filter=$('#activityFilter').value;const filtered=records(selectedDay).filter(x=>(!q||[x.activity,x.area,x.notes,x.transport].join(' ').toLowerCase().includes(q))&&(filter!=='must'||/p1|must/i.test(x.status+' '+x.activity))&&(filter!=='incomplete'||!done[x.id]));$('#itineraryList').innerHTML=filtered.length?filtered.map(cardActivity).join(''):'<div class="empty">No activities match this filter.</div>'}
function renderMetrics(){const cap=safeNum(data.trip?.budgetPHP)||150000;const baseline=safeNum(data.trip?.baselineSpentPHP);const planned=safeNum(data.trip?.estimatedTotalPHP);const spent=baseline+ChinaTravelData.localTotal(expenses);$('#budgetCap').textContent=php(cap);$('#totalSpent').textContent=php(spent);$('#budgetLeft').textContent=php(cap-spent);$('#budgetLeft').classList.toggle('negative',spent>cap);$('#budgetForecast').textContent=isReal()&&planned>0?`Tracker's planned trip total: ${php(planned)} · Estimated headroom: ${php(cap-planned)}. Some unbooked activities and transport may still change this estimate.`:'Planned budget projection will appear after importing your private tracker data.';$('#syncStatus').textContent=data.sync?.lastSuccess?`Last tracker refresh: ${new Date(data.sync.lastSuccess).toLocaleString('en-PH')}. Offline copy saved on this device.`:`Snapshot: ${data.sourceDate||'Demo'} · Connect Google or import a snapshot.`;$('#importStatus').textContent=isReal()?`Imported ${data.itinerary.length} activities, ${data.bookings?.length||0} bookings. Snapshot: ${data.sourceDate||'unknown date'}.`:'Demo mode. Your trip file has not been imported.'}
function renderEverything(){renderDay();renderMetrics();renderBookings();renderPhrases();renderMoney();renderExpenses();nav(view);globalThis.ChinaCompanionUI?.render();}
function bookingCard(x){const status=String(x['Payment Status']||'');return `<article class="booking-card"><header><span class="status ${/confirmed|ticketed|paid/i.test(status)?'confirmed':'pending'}">${esc(x.Type||'Booking')}</span><span class="amount">${esc(x['Amount PHP']?php(safeNum(x['Amount PHP'])):'Amount TBD')}</span></header><h4>${esc(x.Booking)}</h4><p>${esc(x.City)} · ${esc(x.Date)}</p><p><strong>${esc(status||'Not booked')}</strong></p>${x['Cancellation Deadline']?`<p>Cancellation: ${esc(x['Cancellation Deadline'])}</p>`:''}${x.Notes?`<div class="booking-notes">${esc(x.Notes).slice(0,400)}</div>`:''}</article>`;}
function hotelCard(h,index){const a=UI.address(h),hasAddress=!!UI.addressText(h);return `<article class="hotel-reference"><div class="eyebrow dark">${esc(a.city||'SAVED STAY')}</div><h3>${esc(a.name)}</h3><p class="caption">${esc(h['Check-in']||'Check-in TBD')} → ${esc(h['Check-out']||'Check-out TBD')}</p>${a.chineseName?`<p class="hotel-cn" lang="zh-CN">${esc(a.chineseName)}</p>`:''}${a.address?`<p class="address-cn" lang="zh-CN">${esc(a.address)}</p>`:'<p class="caption">Chinese address not saved. Add it to your private tracker or saved places.</p>'}<div class="address-actions"><button class="secondary-btn" data-copy-hotel="${index}" ${hasAddress?'':'disabled'}>Copy</button><button class="secondary-btn" data-large-hotel="${index}" ${hasAddress?'':'disabled'}>Show large</button>${UI.amapActions(h)}</div>${h.Notes?`<details><summary>Stay details</summary><div class="booking-notes">${esc(h.Area||'')} ${esc(h.Notes).slice(0,500)}</div></details>`:''}</article>`;}
function setBookingView(value){const hotels=value==='hotels';$('#ticketReferences').hidden=hotels;$('#hotelReferences').hidden=!hotels;$('#showHotels').setAttribute('aria-pressed',String(hotels));$('#showTickets').setAttribute('aria-pressed',String(!hotels));}
function renderBookings(){const b=data.bookings||[];$('#bookingList').innerHTML=b.length?b.map(bookingCard).join(''):'<div class="empty">No bookings saved yet. Connect Google in Settings to keep your reservations here.</div>';$('#hotelList').innerHTML=(data.hotels||[]).length?data.hotels.map(hotelCard).join(''):'<div class="empty">Your saved hotels will appear here after a tracker refresh.</div>';}
function renderSmartToday(){
 const model=UI.today(travelItinerary(),done),city=model.city.split(' / ')[0],cn={Shanghai:'上海',Chongqing:'重庆',Chengdu:'成都',Beijing:'北京'};
 $('#todayLabel').textContent=model.before?'YOUR CHINA CHAPTER':model.after?'MEMORIES, WELL KEPT':'TODAY, AT YOUR PACE';
 $('#todayDate').textContent=new Date(model.currentDate+'T12:00:00').toLocaleDateString('en-PH',{weekday:'long',month:'long',day:'numeric'});
 $('#tripCountdown').textContent=model.countdown;$('#todayCityCN').textContent=cn[city]||'中国';
 $('#welcomeTitle').textContent=model.before?'Your China chapter awaits.':model.after?'What a journey.':city?`A day in ${city}.`:'A little further. A little wonder.';
 $('#welcomeSub').textContent=model.before?'Four cities. Eleven days. A collection of moments to make your own.':model.after?'Your saved places, plans and expenses are still here.':city?'Room for the plan. And for the unexpected.':'Connect your private tracker to bring your journey together.';
 $('#nextActivityLabel').textContent=model.before?'First on your journey':'Next on your journey';
 const n=model.next;$('#nextActivity').innerHTML=n?`<article class="next-card"><div class="next-card-top"><span>${esc(n.date===model.currentDate?'TODAY':dateStr(n.date).toUpperCase())} · ${esc(n.time||'FLEXIBLE TIME')}</span><span aria-hidden="true">↗</span></div><h3><button class="activity-open" data-smart="open" data-id="${esc(n.id)}">${esc(n.activity)}</button></h3><p>${esc([n.city,n.area].filter(Boolean).join(' · '))}</p>${n.transport?`<p>${esc(n.transport)}</p>`:''}<button class="text-btn" data-map-activity="${esc(n.id)}">Map & address <span aria-hidden="true">↗</span></button></article>`:`<div class="empty">${isReal()?'Nothing else scheduled. Take your time, or explore your saved places.':'Your next activity will appear after you connect Google or import a private snapshot.'}</div>`;
 const hotels=data.hotels||[],active=hotels.find(h=>/^\d{4}-\d{2}-\d{2}/.test(h['Check-in']||'')&&h['Check-in'].slice(0,10)<=model.currentDate&&String(h['Check-out']||'').slice(0,10)>=model.currentDate),upcoming=hotels.filter(h=>String(h['Check-in']||'')>=model.currentDate).sort((a,b)=>String(a['Check-in']).localeCompare(String(b['Check-in']))),hotel=active||upcoming[0]||hotels.find(h=>h.City===model.city);
 $('#homeHotel').innerHTML=hotel?hotelCard(hotel,hotels.indexOf(hotel)):'<div class="empty">Save a hotel in your tracker to keep its address close at hand.</div>';
 const bookings=(data.bookings||[]).filter(b=>!/^\d{4}-\d{2}-\d{2}/.test(b.Date||'')||String(b.Date).slice(0,10)>=model.currentDate).sort((a,b)=>String(a.Date).localeCompare(String(b.Date))).slice(0,2);
 $('#homeBookings').innerHTML=bookings.length?bookings.map(bookingCard).join(''):'<div class="empty">No upcoming bookings. All saved reservations are in Tickets.</div>';
 $('#offlineReadiness').textContent=isReal()?'Your loaded itinerary, hotel details and phrasebook stay on this device. Maps and uploads need internet.':'Save a tracker snapshot first. The phrasebook and currency calculations already work offline.';
}
let addressOpener=null,addressToCopy='';
async function copyAddress(text){if(!text){notify('No Chinese address is saved for this place.');return;}try{if(!navigator.clipboard?.writeText)throw Error();await navigator.clipboard.writeText(text);notify('Address copied');}catch{notify('Copy unavailable. Long-press the address to select it.');}}
function showLargeAddress(place,opener){const a=UI.address(place);addressToCopy=UI.addressText(place);addressOpener=opener;$('#addressTitle').textContent=a.name;$('#addressChinese').textContent=a.chineseName;$('#addressChinese').hidden=!a.chineseName;$('#addressLarge').textContent=a.address||'No address saved.';$('#copyLargeAddress').disabled=!addressToCopy;const dialog=$('#addressDialog');if(!dialog.open){if(dialog.showModal)dialog.showModal();else dialog.setAttribute('open','');}$('#closeAddress').focus();}
function closeAddress(){const dialog=$('#addressDialog');if(dialog.close)dialog.close();else dialog.removeAttribute('open');addressOpener?.focus();}
function openExpenseEditor(){$('#expenseEditor').open=true;$('#expenseForm').scrollIntoView({behavior:'auto',block:'start'});$('#expenseDesc').focus({preventScroll:true});}
function logConversion(){if(editingExpenseId||$('#expenseDesc').value.trim()){openExpenseEditor();notify('Finish or cancel your current expense first.');return;}const methods=Object.fromEntries((window.ChinaFX?.METHODS||[]).map(m=>[m.id,m.label]));$('#expenseCNY').value=$('#cnyInput').value;$('#expenseRate').value=$('#fxRate').value;$('#expenseMethod').value=methods[$('#paymentMethod').value]||'Other';$('#expenseIssuer').value=$('#extraFee').value;$('#expensePlatform').value=$('#platformFee').value;$('#expenseAmount').value=$('#walletActual').value;$('#expenseFixed').value='0';renderExpenseCalculation();openExpenseEditor();}
function renderSelectedMap(){const el=$('#mapSelectedPlace');if(!el)return;const p=selectedMapPlace;if(!p){el.innerHTML='';return;}const a=UI.address(p),text=UI.addressText(p);el.innerHTML=`<div class="hotel-reference"><div class="eyebrow dark">SAVED PLACE · ${esc(a.city)}</div><h3>${esc(a.name)}</h3><p class="address-cn" lang="zh-CN">${esc(text||'Chinese address not saved.')}</p><div class="address-actions"><button class="secondary-btn" data-copy-map ${text?'':'disabled'}>Copy</button><button class="secondary-btn" data-large-map ${text?'':'disabled'}>Show large</button>${UI.amapActions(p)}</div><button class="secondary-btn" id="mapTransport">Compare transport options</button><p class="caption">AMap opens separately. Confirm the matching destination and choose your route there.</p></div>`;}
function initJade(){
 const icons={home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',plan:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>',map:'<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3ZM9 3v15m6-12v15"/>',talk:'<path d="M21 11a8 8 0 0 1-8 8H7l-4 3V11a8 8 0 1 1 18 0Z"/><path d="M8 10h8m-6 4h4"/>',wallet:'<path d="M20 7H5a2 2 0 0 1 0-4h13v4M4 7v13h17V7"/><path d="M21 11h-6v5h6m-3-2.5h.01"/>',ticket:'<path d="M3 5h18v5a2 2 0 0 0 0 4v5H3v-5a2 2 0 0 0 0-4Z"/><path d="M15 5v3m0 3v2m0 3v3"/>',settings:'<path d="m9 3-1 3-3 1v3l-2 2 2 2v3l3 1 1 3h6l1-3 3-1v-3l2-2-2-2V7l-3-1-1-3Z"/><circle cx="12" cy="12" r="3"/>',offline:'<path d="M7 18H5a4 4 0 0 1-1-8 7 7 0 0 1 13-3 5 5 0 0 1 3 9"/><path d="m9 17 3 3 6-7"/>',close:'<path d="m6 6 12 12M6 18 18 6"/>'};
 $$('[data-icon]').forEach(el=>el.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[el.dataset.icon]||''}</svg>`);
 setInterval(()=>{if(document.visibilityState==='visible')renderSmartToday();},60000);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')renderSmartToday();});
 $('#themeSelect').value=UI.theme(document.documentElement.dataset.theme);$('#themeSelect').addEventListener('change',()=>{const value=UI.applyTheme($('#themeSelect').value,document);try{localStorage.setItem(UI.THEME_KEY,value);$('#themeStatus').textContent=(value==='dark'?'Dark':'Light')+' theme saved on this device.';}catch{$('#themeStatus').textContent='Theme applied for this session. Device storage is unavailable.';}});
 $('#showTickets').addEventListener('click',()=>setBookingView('tickets'));$('#showHotels').addEventListener('click',()=>setBookingView('hotels'));
 $('#closeAddress').addEventListener('click',closeAddress);$('#addressDialog').addEventListener('close',()=>addressOpener?.focus());$('#copyLargeAddress').addEventListener('click',()=>copyAddress(addressToCopy));$('#newExpense').addEventListener('click',openExpenseEditor);$('#logConversion').addEventListener('click',logConversion);
}
let selectedMapPlace=null,mapPlaces=[],mapSearchEpoch=0,mapLastLookup=0,mapViewKey='';
const chinesePlaces={'The Bund':'外滩','Shanghai Disneyland':'上海迪士尼乐园','Shanghai Wild Animal Park':'上海野生动物园','Hongyadong':'洪崖洞','Kuixing Tower':'魁星楼','Jiefangbei':'解放碑','Liziba Station':'李子坝站','Panda Base':'成都大熊猫繁育研究基地','Jinli Street':'锦里古街','Anshun Bridge':'安顺廊桥','Forbidden City':'故宫博物院','Tiananmen Square':'天安门广场','Summer Palace':'颐和园','Mutianyu Great Wall':'慕田峪长城'};
function getBox(lat,lon,size){return [lon-size*1.2,lat-size,lon+size*1.2,lat+size].map(v=>v.toFixed(5)).join(',')}
function mapPosition(place){const lat=Number(place.latitude),lon=Number(place.longitude);return place.latitude!==null&&place.latitude!==undefined&&place.latitude!==''&&place.longitude!==null&&place.longitude!==undefined&&place.longitude!==''&&Number.isFinite(lat)&&Number.isFinite(lon)&&lat>=18&&lat<=54&&lon>=73&&lon<=135?{lat,lon}:null;}
function showMapPosition(lat,lon,name,zoom=.025){const key=[lat,lon,name,zoom,navigator.onLine].join('|');if(key===mapViewKey)return;mapViewKey=key;if(!navigator.onLine){$('#mapCanvas').innerHTML='<div class="map-placeholder"><span aria-hidden="true">地图</span><b>Offline — saved places are below</b><small>Street tiles and online search need internet. Copy a saved Chinese address for help.</small></div>';return;}const url=new URL('https://www.openstreetmap.org/export/embed.html');url.searchParams.set('bbox',getBox(lat,lon,zoom));url.searchParams.set('layer','mapnik');url.searchParams.set('marker',`${lat},${lon}`);const frame=document.createElement('iframe');frame.title=`Map: ${name}`;frame.loading='lazy';frame.style.cssText='width:100%;height:350px;border:0';frame.referrerPolicy='no-referrer';frame.src=url.href;$('#mapCanvas').replaceChildren(frame);}
function savedMapPlaces(){const result=[];for(const [city,d] of Object.entries(mapData))for(const p of d.places)result.push({city,name:p[0],chineseName:chinesePlaces[p[0]],latitude:p[1],longitude:p[2],notes:p[3],source:'Approximate landmark pin'});for(const h of data.hotels||[])if(h.Hotel&&!/^TBD/i.test(h.Hotel))result.push({city:h.City,name:h.Hotel,chineseName:h['Chinese Name']||h['Hotel CN']||'',addressCN:h['Chinese Address']||h['Address CN']||h.Address||'',latitude:h.Latitude,longitude:h.Longitude,notes:[h.Area,h['Nearest Metro'],h.Notes].filter(Boolean).join(' · '),source:'Your saved hotel'});for(const a of data.attractions||[])result.push({city:a.City,name:a['Attraction / Activity'],chineseName:a['Chinese Name']||'',addressCN:a['Chinese Address']||a['Address CN']||'',latitude:a.Latitude,longitude:a.Longitude,notes:a.Notes||'',source:'Tracker attraction'});for(const a of data.mapSaved||[])result.push({...a,source:'Saved on this device'});return result.filter(p=>p.name);}
function renderMap(){mapCity=$('#mapCity').value;const d=mapData[mapCity]||mapData.Shanghai,q=$('#mapSearch').value.trim().toLowerCase();const all=savedMapPlaces().filter(p=>String(p.city||'').includes(mapCity));mapPlaces=all.filter(p=>!q||[p.name,p.chineseName,p.addressCN,p.notes].join(' ').toLowerCase().includes(q)).slice(0,60);const p=selectedMapPlace,position=p&&mapPosition(p);showMapPosition(position?.lat??d.lat,position?.lon??d.lon,p?.name||mapCity,position?.lat?.toString()?0.025:d.zoom);$('#mapMessage').textContent=p?`${p.name}${p.chineseName?' · '+p.chineseName:''}. ${position?'Approximate pin; verify the building entrance locally.':'Exact coordinates unavailable — showing the city overview.'} ${p.addressCN||''} ${p.notes||''}`:'City overview. OSM coverage/availability can vary in China. Saved Chinese addresses and itinerary transport notes remain available offline. Live walking/transit routing is not provided.';$('#mapPlaces').innerHTML=mapPlaces.length?mapPlaces.map((p,i)=>`<div class="place-card"><div><b>${esc(p.name)}</b><small lang="zh-CN">${esc(p.chineseName||p.addressCN||'Chinese address not saved yet')}</small><small>${esc(p.source)}${mapPosition(p)?' · Approximate coordinates':' · Address/details only'}</small></div><button data-map-place="${i}">Open</button></div>`).join(''):'<div class="empty">No saved places match. Add a Chinese address below, or use explicit online search.</div>';renderSelectedMap();}
function openActivityMap(id){const a=travelItinerary().find(x=>x.id===id);if(!a)return;const city=Object.keys(mapData).find(c=>a.city?.includes(c));if(city)$('#mapCity').value=city;const known=savedMapPlaces().find(p=>p.city===city&&[p.name,p.chineseName].filter(Boolean).some(name=>a.activity.toLowerCase().includes(name.toLowerCase())));selectedMapPlace=known||{city,name:a.activity,chineseName:a.chineseName,addressCN:a.addressCN,latitude:a.latitude,longitude:a.longitude,notes:[a.area,a.transport,a.notes].filter(Boolean).join(' · ')};$('#mapSearch').value='';nav('map');}
function locate(){if(!navigator.geolocation){notify('GPS is unavailable in this browser.');return;}navigator.geolocation.getCurrentPosition(pos=>{showMapPosition(pos.coords.latitude,pos.coords.longitude,'Current GPS position',.007);$('#mapMessage').textContent='Current GPS position. Coordinates and map alignment can differ in China. Verify your position and building entrance locally; no navigation route is calculated.';},err=>notify('GPS unavailable: '+err.message),{enableHighAccuracy:true,timeout:13000,maximumAge:60000});}
async function searchMapOnline(){const query=$('#mapSearch').value.trim();if(!query){notify('Enter a place name first.');return;}if(!navigator.onLine){notify('Offline. Search saved places or use a saved address.');return;}if(Date.now()-mapLastLookup<1500){notify('Wait a moment before another search.');return;}mapLastLookup=Date.now();const epoch=++mapSearchEpoch,controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);$('#mapMessage').textContent='Searching OpenStreetMap Nominatim…';try{const params=new URLSearchParams({q:query+' '+$('#mapCity').value,format:'jsonv2',countrycodes:'cn',limit:'5','accept-language':'zh,en'});const r=await fetch('https://nominatim.openstreetmap.org/search?'+params,{signal:controller.signal,credentials:'omit',referrerPolicy:'strict-origin-when-cross-origin'});if(!r.ok)throw Error();const results=await r.json();if(epoch!==mapSearchEpoch)return;mapPlaces=results.map(p=>({city:mapCity,name:p.name||query,addressCN:p.display_name,latitude:p.lat,longitude:p.lon,source:'OSM search result; verify locally'})).filter(p=>mapPosition(p));$('#mapPlaces').innerHTML=mapPlaces.length?mapPlaces.map((p,i)=>`<div class="place-card"><div><b>${esc(p.name)}</b><small lang="zh-CN">${esc(p.addressCN)}</small></div><button data-map-place="${i}">Open</button></div>`).join(''):'<div class="empty">No online results. Search a Chinese place name or save the address manually.</div>';$('#mapMessage').textContent='Results from OpenStreetMap contributors. Open one, then Save selected place for offline details. Search results are not guaranteed entrances.';}catch{$('#mapMessage').textContent='Online map search unavailable. Your saved places and Chinese addresses remain available.';}finally{clearTimeout(timer);}}
function saveMapPlace(){const name=$('#savedPlaceName').value.trim()||selectedMapPlace?.name,addressCN=$('#savedPlaceAddress').value.trim()||selectedMapPlace?.addressCN||'',chineseName=selectedMapPlace?.chineseName||'';if(!name){notify('Enter a place name or open a search result.');return;}const place={...selectedMapPlace,name,city:$('#mapCity').value,addressCN,chineseName};const next={...data,mapSaved:[...(data.mapSaved||[]).filter(p=>!(p.name===name&&p.city===place.city)),place]};try{localStorage.setItem(KEY,JSON.stringify(next));data=next;selectedMapPlace=place;$('#mapSearch').value='';renderMap();notify('Place saved privately on this device');}catch{notify('Place could not be saved. Free device storage or export a backup.');}}
function renderPhrases(){$('#phraseChips').innerHTML=phrases.map((p,i)=>`<button data-phrase="${i}"><b>${esc(p[0])}</b><span lang="zh-CN">${esc(p[1])}</span></button>`).join('')}
function normalize(s){return String(s||'').trim().replace(/[?？!！。.,]/g,'').toLowerCase()}
async function translatePhrase(input,fromVoice=false){
 const s=String(input||'').trim(),myTurn=++translationSeq,outputLang=direction==='en-zh'?'zh-CN':'en-US';
 if(!s){if(!fromVoice)notify('Type or dictate a phrase first.');return false}
 $('#translationSource').textContent=(direction==='en-zh'?'English: ':'中文：')+s;
 const finish=async(text,lang,note)=>{
  if(myTurn!==translationSeq)return false;
  setTranslation(text,lang,note);
  if(fromVoice&&micRequested&&lang){const played=await speak(true);if(myTurn!==translationSeq||!micRequested)return true;if(!played){stopMic('Playback was interrupted or blocked. Tap Replay, then Start to continue.');return false;}direction=direction==='en-zh'?'zh-en':'en-zh';syncDir();recognitionProcessing=false;listenNext();}
  if(!fromVoice&&lang&&$('#autoSpeak').checked)await speak();
  return true;
 };
 const match=direction==='en-zh'?phrases.find(p=>normalize(p[0])===normalize(s)):phrases.find(p=>normalize(p[1])===normalize(s));
 if(match)return finish(direction==='en-zh'?match[1]:match[0],outputLang,direction==='en-zh'?match[2]:'Saved phrase · offline');
 if(!$('#onlineTranslate').checked){
  setTranslation('No matching saved phrase','','For open conversation, enable the optional online translation service. It sends your spoken words to a third party.');
  if(fromVoice)stopMic('Conversation paused. Enable online translation to translate unfamiliar sentences.');
  return false;
 }
 if(!navigator.onLine){setTranslation('Offline: phrase not found','','Live translation needs internet. Saved phrases work offline.');if(fromVoice)stopMic('Offline translation unavailable for this sentence.');return false;}
 if(new TextEncoder().encode(s).length>500){setTranslation('Phrase too long','','Please speak in shorter sentences.');if(fromVoice)stopMic('Please use shorter sentences and restart.');return false;}
 setTranslation('Translating…','','Online translation · third-party service');
 try{
  const params=new URLSearchParams({q:s,langpair:direction==='en-zh'?'en|zh-CN':'zh-CN|en'});
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),9500);
  let r;try{r=await fetch('https://api.mymemory.translated.net/get?'+params,{signal:controller.signal});}finally{clearTimeout(timer)}
  const j=await r.json();
  if(!r.ok||Number(j.responseStatus)!==200||!j.responseData?.translatedText)throw Error('Translation unavailable');
  return finish(j.responseData.translatedText,outputLang,'Online translation · verify important details · provider may be blocked in China');
 }catch(e){if(myTurn===translationSeq){setTranslation('Online service unavailable','','You can use the saved phrasebook or try again when connected.');if(fromVoice)stopMic('Online translation unavailable. Automatic conversation stopped.');}return false;}
}
function setTranslation(text,lang,note){translation={text,language:lang};$('#translateResult').innerHTML='<small>TRANSLATION</small><strong>'+esc(text)+'</strong><span>'+esc(note||'')+'</span>'}
function speak(fromVoice=false){
 return new Promise(resolve=>{
  if(!translation.text||!translation.language){if(!fromVoice)notify('Translate a phrase first.');resolve(false);return;}
  if(!('speechSynthesis'in window)){if(!fromVoice)notify('Voice playback not supported.');resolve(false);return;}
  let settled=false,timer;
  const finish=ok=>{if(settled)return;settled=true;clearTimeout(timer);if(!ok&&!fromVoice)$('#voiceStatus').textContent='Playback was interrupted or blocked. Tap Replay; check that the language voice is available on your device.';resolve(ok)};
  try{
   speechSynthesis.cancel();
   const a=new SpeechSynthesisUtterance(translation.text);a.lang=translation.language;a.rate=Number($('#speechSpeed')?.value)||0.70;
   const voice=speechSynthesis.getVoices?.().filter(v=>v.lang.toLowerCase().startsWith(a.lang.slice(0,2))).sort((x,y)=>Number(y.localService)-Number(x.localService))[0];if(voice)a.voice=voice;
   a.onend=()=>finish(true);a.onerror=()=>finish(false);
   timer=setTimeout(()=>{speechSynthesis.cancel();finish(false);},Math.min(120000,Math.max(15000,6000+translation.text.length*650/a.rate)));
   speechSynthesis.speak(a);
  }catch{finish(false)}
 });
}
function stopMic(message='Microphone stopped.'){
 micRequested=false;recognitionProcessing=false;recognitionBusy=false;voiceEpoch++;translationSeq++;
 try{recognition?.abort()}catch{}
 try{speechSynthesis?.cancel()}catch{}
 $('#voiceBtn').textContent='🎙 Start two-way conversation';
 $('#voiceStatus').textContent=message;
}
function listenNext(){
 if(!micRequested)return;
 if(view!=='translate'||document.visibilityState!=='visible'){stopMic('Conversation paused. Return to Talk to restart.');return;}
 const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!SR){stopMic('Speech recognition is unavailable in this browser. Use text or saved phrases.');return;}
 const thisEpoch=++voiceEpoch,instance=new SR();recognition=instance;
 instance.lang=direction==='en-zh'?'en-US':'zh-CN';
 instance.interimResults=false;instance.continuous=false;
 instance.onstart=()=>{if(thisEpoch!==voiceEpoch)return;recognitionBusy=true;$('#voiceBtn').textContent='■ Stop conversation';$('#voiceStatus').textContent='Listening for '+(direction==='en-zh'?'English':'Mandarin')+' · speak one sentence, then let the app translate.';};
 instance.onresult=e=>{
  if(thisEpoch!==voiceEpoch||!micRequested||recognitionProcessing)return;
  const segments=Array.from(e.results).filter(x=>x.isFinal).map(x=>x[0]?.transcript||'').filter(Boolean);
  if(!segments.length)return;
  voiceErrors=0;recognitionProcessing=true;
  const heard=segments.join(' ').trim();$('#translateInput').value=heard;
  $('#voiceStatus').textContent='Translating '+(direction==='en-zh'?'English to Mandarin':'Mandarin to English')+'…';
  try{instance.stop()}catch{}
  translatePhrase(heard,true).catch(()=>stopMic('Voice translation stopped unexpectedly. Please try again.'));
 };
 instance.onerror=e=>{
  if(thisEpoch!==voiceEpoch||!micRequested)return;
  if(['not-allowed','service-not-allowed','audio-capture','language-not-supported','network'].includes(e.error)){stopMic('Microphone/recognition issue ('+e.error+'). Allow permission or check connectivity, then restart.');return;}
  $('#voiceStatus').textContent='Listening issue: '+e.error+'. Trying again if supported.';
 };
 instance.onend=()=>{
  if(thisEpoch!==voiceEpoch)return;
  recognitionBusy=false;
  if(!micRequested||recognitionProcessing)return;
  voiceErrors++;
  if(voiceErrors>3){stopMic('Listening stopped after repeated silence or browser interruptions. Tap Start to retry.');return;}
  setTimeout(()=>{if(thisEpoch===voiceEpoch&&micRequested&&!recognitionProcessing)listenNext()},350);
 };
 try{instance.start()}catch{stopMic('iPhone browser blocked microphone restart. Tap Start again to resume.');}
}
function startMic(){
 if(micRequested){stopMic();return;}
 if(!(window.SpeechRecognition||window.webkitSpeechRecognition)){notify('Speech recognition unavailable. You can type or use the phrasebook.');return;}
 micRequested=true;recognitionBusy=false;recognitionProcessing=false;voiceErrors=0;
 $('#voiceStatus').textContent='Starting two-way conversation. The app alternates English and Mandarin after each spoken translation; it cannot reliably identify both speakers.';
 listenNext();
}
function populatePaymentMethods(){
 const FX=window.ChinaFX;if(!FX)return;
 const options=FX.METHODS.map(m=>{const el=document.createElement('option');el.value=m.id;el.textContent=m.label;return el;});
 $('#paymentMethod').replaceChildren(...options);
 const past=['Alipay using BDO Visa Signature virtual card','BDO UnionPay Diamond','WeChat Pay using linked Visa','Cash'];
 const exp=FX.METHODS.map(m=>{const el=document.createElement('option');el.value=m.label;el.textContent=m.label;return el;});
 for(const label of past){const el=document.createElement('option');el.value=label;el.textContent=label+' (legacy entry)';exp.push(el);}
 const other=document.createElement('option');other.value='Other';other.textContent='Other';exp.push(other);
 $('#expenseMethod').replaceChildren(...exp);
}
async function refreshDailyFx(){
 const FX=window.ChinaFX;if(!FX)return;
 const status=$('#fxSourceState'),saved=FX.cached(localStorage),today=new Date().toISOString().slice(0,10);
 if(saved&&!$('#fxRate').dataset.manual){$('#fxRate').value=saved.rate;$('#expenseRate').value=saved.rate;}
 status.textContent=saved?'Cached daily reference: '+saved.date+' · ₱'+saved.rate+'/CNY. '+(saved.date===today?'':'Potentially stale. '):'No saved daily FX reference yet. ';
 renderMoney();
 if(!navigator.onLine){status.textContent+='Offline; enter a rate manually if needed.';return;}
 try{
  const latest=await FX.refresh();
  if(!window.document?.querySelector?.('#fxRate'))return;
  if(!$('#fxRate').dataset.manual){$('#fxRate').value=latest.rate;$('#expenseRate').value=latest.rate;}
  status.textContent='Daily central-bank reference: '+latest.date+' · ₱'+latest.rate+'/CNY (Frankfurter). Not GCash/Visa/UnionPay actual checkout FX. Verify final posted amount.';
  renderMoney();
 }catch{
  if(!window.document?.querySelector?.('#fxRate'))return;
  status.textContent=(saved?'Cached reference '+saved.date+' retained. ':'')+'FX provider unavailable. Enter a rate or use the last cached reference; final actual PHP is authoritative.';
  renderMoney();
 }
}
function paymentOptions(){
 const FX=window.ChinaFX,m=$('#paymentMethod').value,c=Math.max(0,safeNum($('#cnyInput').value)),r=Number($('#fxRate').value),issuer=$('#extraFee'),platform=$('#platformFee'),actual=$('#walletActual').value;
 const config=FX?.fees(m,c)||{issuer:0,platform:0,description:'Payment method requires verification.'};
 if(issuer.dataset.lastMethod!==m){issuer.value=String(config.issuer);issuer.dataset.lastMethod=m;}
 if(platform.dataset.band!==m+':'+(c>200?'high':'low')){platform.value=String(config.platform);platform.dataset.band=m+':'+(c>200?'high':'low');}
 $('#paymentMethodInfo').textContent=(config.description||'')+' · Card billing: PHP only. Check checkout fee waiver.';
 const total=$('#walletTotal'),breakdown=$('#walletBreakdown'),comparison=$('#paymentComparison');
 if(!Number.isFinite(r)||r<=0){
  total.innerHTML='<small>Cannot estimate from a missing reference rate</small><strong>Enter a valid PHP/CNY rate</strong><span>Online daily reference may be unavailable in China. No fake default rate is used.</span>';
  breakdown.textContent='Reference unavailable; enter your observed rate or final posted PHP amount.';
  comparison.textContent='Rate unavailable; comparison disabled.';
  return;
 }
 try{
  const x=ChinaTravelData.calculate({cny:c,rate:r,issuerPercent:issuer.value,platformPercent:platform.value,actualPHP:actual});
  total.innerHTML=`<small>${x.basis==='actual'?'Final actual PHP (entered)':'Estimated PHP · not a provider FX quote'}</small><strong>${php(x.totalPHP)}</strong><span>${x.basis==='actual'?'The actual entered amount already includes fees; do not add again.':'Daily public reference × selected fee assumptions; check GCash or bank settlement amount.'}</span>`;
  breakdown.innerHTML=`<div class="line"><span>Daily reference conversion</span><b>${php(x.basePHP)}</b></div><div class="line"><span>Potential platform fee (${esc(platform.value)}%)</span><b>${php(x.platformFeePHP)}</b></div><div class="line"><span>Published bank FX fee (${esc(issuer.value)}%)</span><b>${php(x.issuerFeePHP)}</b></div><div class="line"><span>Illustrative estimate</span><b>${php(x.estimatedPHP)}</b></div>`;
  comparison.replaceChildren();
  for(const item of FX.compare(c,r).slice(0,7)){
   const row=document.createElement('div');row.className='line';
   const name=document.createElement('span');name.textContent=item.label;
   const value=document.createElement('b');value.textContent=php(item.estimatePHP);row.append(name,value);comparison.append(row);
  }
 }catch(e){total.textContent=e.message;}
}
function renderMoney(){paymentOptions()}
let expenseBusy=false,editingExpenseId=null;
const uploadJobs=new Map();
function expenseDefaults(){
 const method=$('#expenseMethod').value,c=Number($('#expenseCNY').value)||0,profile=window.ChinaFX?.METHODS.find(m=>m.label===method),f=profile?window.ChinaFX.fees(profile.id,c):{issuer:/UnionPay/.test(method)?1.65:/Visa/.test(method)?1.70:0,platform:/Alipay using|WeChat Pay/.test(method)&&c>200?3:0};
 $('#expenseIssuer').value=f.issuer;$('#expensePlatform').value=f.platform;renderExpenseCalculation();
}
function expenseInputs(){return {id:editingExpenseId||crypto.randomUUID(),localDateTime:$('#expenseDateTime').value,desc:$('#expenseDesc').value,city:$('#expenseCity').value,method:$('#expenseMethod').value,category:$('#expenseCategory').value,cny:$('#expenseCNY').value,rate:$('#expenseRate').value,issuerPercent:$('#expenseIssuer').value,platformPercent:$('#expensePlatform').value,fixedPHP:$('#expenseFixed').value,actualPHP:$('#expenseAmount').value,inTracker:$('#expenseInTracker').checked,trackerPaidId:$('#expenseTrackerPaid').value};}
function renderExpenseCalculation(){try{const result=ChinaTravelData.calculate({cny:$('#expenseCNY').value,rate:$('#expenseRate').value,issuerPercent:$('#expenseIssuer').value,platformPercent:$('#expensePlatform').value,fixedPHP:$('#expenseFixed').value,actualPHP:$('#expenseAmount').value});$('#expenseCalculation').textContent=`Estimated ${php(result.estimatedPHP)} (fees ${php(result.feePHP)}) · ${result.basis==='actual'?'Actual charged: '+php(result.actualPHP):'No posted amount yet; totals use the estimate'}. Actual amount already includes fees.`;}catch(e){$('#expenseCalculation').textContent=e.message;}}
function writeExpenses(next){localStorage.setItem(EXP,JSON.stringify(next));expenses=next;}
function patchExpense(id,patch){const index=expenses.findIndex(e=>e.id===id);if(index<0)return false;const next=expenses.slice();next[index]={...next[index],...patch};writeExpenses(next);renderExpenses();renderMetrics();return true;}
function renderExpenses(){
 $('#expenseList').innerHTML=expenses.length?expenses.slice().reverse().map(e=>{
 const receipt=e.receipt&&/^[A-Za-z0-9_-]{10,}$/.test(e.receipt.id),status=receipt?(e.receipt.verified?'Uploaded · verified in Drive':'Drive receipt · legacy link'):({pending:'Pending · saved on device',uploading:'Uploading · keep page open',failed:'Upload failed · saved for retry','needs-file':'File needed · attach again'}[e.receiptStatus]||'No receipt');
 return `<article class="expense-card"><div class="expense-main"><b>${esc(e.desc)}</b><small>${esc(e.city)} · ${esc(e.category||'Other')} · ${esc(e.localDateTime?.replace('T',' ')||e.date)}${e.timezone?' · '+esc(e.timezone):''}</small><small>${esc(e.method)}</small><div class="expense-amount">${e.amountCNY?`¥${Number(e.amountCNY).toFixed(2)} · `:''}${php(e.amount)} <small>${e.basis==='estimated'?'Estimate':e.basis==='actual'?'Actual':'Saved PHP'}${e.inTracker?' · Already in tracker; excluded from additional total':''}</small></div><span class="status ${e.receiptStatus==='failed'?'pending':''}">${esc(status)}</span>${receipt?`<a href="https://drive.google.com/file/d/${encodeURIComponent(e.receipt.id)}/view" target="_blank" rel="noopener noreferrer" class="receipt-link">View private receipt ↗</a>`:''}${e.receiptError?`<small>${esc(e.receiptError)}</small>`:''}<div class="expense-actions"><button data-edit-expense="${esc(e.id)}">Edit</button>${!receipt&&['pending','failed','uploading'].includes(e.receiptStatus)?`<button data-retry-receipt="${esc(e.id)}" ${uploadJobs.has(e.id)?'disabled':''}>Retry upload</button>`:''}<button data-remove-expense="${esc(e.id)}" ${uploadJobs.has(e.id)?'disabled':''}>Delete</button></div></div></article>`;
 }).join(''):'<div class="empty">No new expenses logged yet.</div>';
 const selected=$('#expenseTrackerPaid').value;
 $('#expenseTrackerPaid').innerHTML='<option value="">No tracker line selected</option>'+(data.paidBudgetItems||[]).map(x=>`<option value="${esc(x.id)}">${esc(x.item)} · ${php(x.amountPHP)}</option>`).join('');$('#expenseTrackerPaid').value=selected;
}
function resetExpenseForm(){editingExpenseId=null;$('#expenseFormTitle').textContent='New expense';$('#saveExpense').textContent='Save expense';$('#cancelExpenseEdit').hidden=true;for(const id of ['expenseAmount','expenseCNY','expenseDesc','expenseReceiptFile'])$('#'+id).value='';$('#removeExpenseReceipt').hidden=true;$('#expenseDateTime').value=ChinaTravelData.localDateTime();if(!editingExpenseId)$('#expenseRate').value=$('#fxRate').value||'';$('#expenseInTracker').checked=false;$('#expenseTrackerPaid').value='';expenseDefaults();}
function editExpense(id){const e=expenses.find(x=>x.id===id);if(!e)return;editingExpenseId=id;$('#expenseFormTitle').textContent='Edit expense';$('#saveExpense').textContent='Save changes';$('#cancelExpenseEdit').hidden=false;$('#expenseDateTime').value=e.localDateTime||e.date+'T12:00';$('#expenseDesc').value=e.desc;$('#expenseCity').value=e.city;const option=[...$('#expenseMethod').options].find(o=>o.value===e.method);$('#expenseMethod').value=option?e.method:'Other';$('#expenseCategory').value=e.category||'Other';$('#expenseCNY').value=e.amountCNY??'';$('#expenseAmount').value=e.actualPHP??(e.basis==='estimated'?'':e.amount);$('#expenseRate').value=e.exchangeRate??$('#fxRate').value??'';$('#expenseIssuer').value=e.issuerPercent??0;$('#expensePlatform').value=e.platformPercent??0;$('#expenseFixed').value=e.fixedPHP??0;$('#expenseInTracker').checked=!!e.inTracker;$('#expenseTrackerPaid').value=e.trackerPaidId||'';$('#expenseReceiptFile').value='';$('#removeExpenseReceipt').hidden=true;renderExpenseCalculation();openExpenseEditor();$('#expenseForm').scrollIntoView({behavior:'smooth'});}
async function saveExpense(){
 if(expenseBusy)return;let record;const file=$('#expenseReceiptFile')?.files?.[0]||null,previous=expenses.find(e=>e.id===editingExpenseId)||{};
 try{if(uploadJobs.has(previous.id))throw Error('Wait for this receipt upload to finish before editing.');record=ChinaTravelData.expense(expenseInputs(),previous);if(file)ChinaReceipts.validate(file);if(file&&previous.receipt)throw Error('This expense already has a Drive receipt. Keep the existing link; use a separate expense for a different receipt.');}catch(e){notify(e.message);return;}
 expenseBusy=true;$('#saveExpense').disabled=true;
 try{
  if(file){record.receiptStatus='pending';record.receiptName=file.name;delete record.receiptError;}
  const next=expenses.filter(e=>e.id!==record.id);next.push(record);
  try{writeExpenses(next);}catch{throw Error('Local storage is full. Expense was not saved. Export a backup and free device space.');}
  renderExpenses();renderMetrics();
  if(file){try{const old=await ChinaReceipts.store().get(record.id);if(old?.driveFileId)throw Error('An earlier receipt upload may have reached Drive. Retry that receipt before replacing it.');await ChinaReceipts.store().put({expenseId:record.id,blob:file,filename:ChinaReceipts.filenameForExpense(record,file),originalName:file.name,createdAt:new Date().toISOString()});}catch(e){patchExpense(record.id,{receiptStatus:previous.receiptStatus||'needs-file',receiptError:e.message});$('#expenseReceiptStatus').textContent='Expense saved. '+e.message;editingExpenseId=record.id;$('#expenseFormTitle').textContent='Edit saved expense';$('#saveExpense').textContent='Save changes';$('#cancelExpenseEdit').hidden=false;notify('Expense saved; receipt needs attention. Keep the original file.');return;}}
  resetExpenseForm();$('#expenseReceiptStatus').textContent=file?'Expense and receipt saved on this device. Connect and retry if upload is pending.':'Expense saved locally.';notify('Expense saved on this device');
  if(file&&navigator.onLine&&ChinaReceipts.authorized())await attemptReceipt(record.id);
 }catch(e){$('#expenseReceiptStatus').textContent=e.message;notify(e.message);}finally{expenseBusy=false;$('#saveExpense').disabled=false;}
}
function attemptReceipt(id){
 if(uploadJobs.has(id))return uploadJobs.get(id);
 const work=(async()=>{
  try{
   const expense=expenses.find(e=>e.id===id);if(!expense)return;
   patchExpense(id,{receiptStatus:'uploading',receiptError:''});
   const store=ChinaReceipts.store(),queued=await store.get(id);
   // Upgrade legacy names, and reflect edits, only before any upload ID has been reserved.
   if(queued&&!queued.driveFileId)await store.renameIfUnreserved(id,ChinaReceipts.filenameForExpense(expense,queued.blob));
   const receipt=await ChinaReceipts.upload(id);
   if(patchExpense(id,{receipt,receiptStatus:'uploaded',receiptError:''})){
    try{await store.remove(id);$('#expenseReceiptStatus').textContent='Receipt verified in your existing private Google Drive folder.';}
    catch{patchExpense(id,{receiptError:'Drive receipt verified. Local queued copy could not be removed; it is kept on this device.'});$('#expenseReceiptStatus').textContent='Receipt verified in Drive. Its local queued copy is still on this device.';}
   }
  }catch(e){
   try{patchExpense(id,{receiptStatus:['offline','auth','folder'].includes(e.code)?'pending':'failed',receiptError:e.message});}
   catch{notify('Upload may have completed, but local update failed. Keep a backup and Retry to check Drive.');}
   $('#expenseReceiptStatus').textContent='Expense kept. '+e.message;
  }finally{uploadJobs.delete(id);renderExpenses();}
 })();
 uploadJobs.set(id,work);return work;
}
// Start OAuth before any asynchronous outbox read so Safari retains the user gesture.
function retryReceipt(id){if(uploadJobs.has(id))return;const auth=ChinaReceipts.connect();auth.then(()=>attemptReceipt(id)).catch(e=>{try{patchExpense(id,{receiptStatus:'pending',receiptError:e.message});}catch{}$('#expenseReceiptStatus').textContent=e.message;});}
async function deleteExpense(id){
 if(uploadJobs.has(id)){notify('Wait for the receipt upload before deleting.');return;}
 if(!confirm('Delete this local expense and its queued attachment? Existing Drive receipts will be kept.'))return;
 const expense=expenses.find(e=>e.id===id);
 try{writeExpenses(expenses.filter(e=>e.id!==id));}
 catch{notify('Expense could not be deleted from local storage. It is kept.');return;}
 if(editingExpenseId===id)resetExpenseForm();renderExpenses();renderMetrics();
 // A receipt-free expense must not require IndexedDB or a Google connection.
 if(expense?.receiptStatus){try{await ChinaReceipts.store().remove(id);}catch{notify('Expense deleted. Its local receipt copy could not be removed; existing Drive files are kept.');}}
}
function downloadFile(content,type,name){const a=document.createElement('a'),url=URL.createObjectURL(new Blob([content],{type}));a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);}
function exportCSV(){downloadFile(ChinaTravelData.csv(expenses),'text/csv;charset=utf-8','china-expenses.csv');}
async function exportBackup(){try{let queued;try{queued=await ChinaReceipts.store().all();}catch(e){if(expenses.some(x=>['pending','uploading','failed'].includes(x.receiptStatus)))throw e;queued=[];}let bytes=0;const receipts=[];for(const r of queued.filter(r=>expenses.some(e=>e.id===r.expenseId))){bytes+=r.blob.size;if(bytes>100*1024*1024)throw Error('Pending receipts exceed 100 MB. Upload receipts before making a full backup.');const base64=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.onerror=()=>reject(Error('Receipt could not be backed up.'));reader.readAsDataURL(r.blob);});receipts.push({expenseId:r.expenseId,name:r.originalName,type:r.blob.type,base64,driveFileId:r.driveFileId||null,filename:r.filename});}const backup={backupVersion:1,createdAt:new Date().toISOString(),data:ChinaTravelData.backupData(data),expenses,done,receipts};downloadFile(JSON.stringify(backup),'application/json','china-companion-private-backup-'+new Date().toISOString().slice(0,10)+'.json');$('#expenseReceiptStatus').textContent='Complete private backup downloaded. Check that it is saved in Files.';}catch(e){notify('Backup failed: '+e.message);}}
async function restoreBackup(file){
 if(!file)return;const inserted=[];let originals=null;
 try{
  if(file.size>150*1024*1024)throw Error('Backup exceeds 150 MB.');if(uploadJobs.size)throw Error('Wait for active receipt uploads before restoring.');
  const b=ChinaTravelData.validateBackup(JSON.parse(await file.text())),merged=new Map(expenses.map(e=>[e.id,e]));let added=0;
  for(const e of b.expenses)if(!merged.has(e.id)){merged.set(e.id,e);added++;}
  const next=[...merged.values()],rows=[];
  for(const r of b.receipts){if(await ChinaReceipts.store().get(r.expenseId))continue;const bytes=Uint8Array.from(atob(r.base64),c=>c.charCodeAt(0)),blob=new File([bytes],r.name||'receipt',{type:r.type});ChinaReceipts.validate(blob);rows.push({expenseId:r.expenseId,blob,originalName:r.name,filename:r.filename||r.expenseId,driveFileId:r.driveFileId||null});}
  if(rows.length)await ChinaReceipts.store().putAll(rows);inserted.push(...rows.map(r=>r.expenseId));
  const nextDone={...b.done,...done},nextData=isReal()?{...data,...(globalThis.ChinaSmartTravel?{smartState:ChinaSmartTravel.mergeState(b.data.smartState||{},data.smartState||{})}:{})}:b.data;
  originals=Object.fromEntries([EXP,CHECK,KEY].map(k=>[k,localStorage.getItem(k)]));
  localStorage.setItem(EXP,JSON.stringify(next));localStorage.setItem(CHECK,JSON.stringify(nextDone));localStorage.setItem(KEY,JSON.stringify(nextData));
  expenses=next;done=nextDone;data=nextData;renderEverything();notify(`Backup merged: ${added} expenses added. Existing entries kept.`);
 }catch(e){if(originals)for(const [k,v]of Object.entries(originals)){try{if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v);}catch{}}
  for(const id of inserted)try{await ChinaReceipts.store().remove(id);}catch{}
  notify('Restore failed: '+e.message);
 }finally{$('#restoreBackup').value='';}
}
async function importFile(file){if(!file)return;if(file.size>5_000_000){notify('File is too large (max 5 MB).');return}try{const parsed=JSON.parse(await file.text());if(!parsed||!Array.isArray(parsed.itinerary)||!parsed.trip||!Array.isArray(parsed.bookings)||!Number.isFinite(Number(parsed.trip.budgetPHP)))throw Error('Not a China Companion export');sheetSync?.disconnect();data=parsed;const ids=new Set(parsed.itinerary.map(x=>x.id));done=Object.fromEntries(Object.entries(done).filter(([id])=>ids.has(id)));persist();renderEverything();notify(`Imported ${data.itinerary.length} activities from your tracker`)}catch(e){notify('Could not import: '+e.message)}finally{$('#dataFile').value=''}}
function bind(q,event,fn){$(q)?.addEventListener(event,fn)}
function initHandlers(){document.body.addEventListener('click',e=>{const hotelAction=e.target.closest('[data-copy-hotel],[data-large-hotel]');if(hotelAction){const h=(data.hotels||[])[Number(hotelAction.dataset.copyHotel??hotelAction.dataset.largeHotel)];if(h){if(hotelAction.hasAttribute('data-copy-hotel'))copyAddress(UI.addressText(h));else showLargeAddress(h,hotelAction);}return;}const mapAction=e.target.closest('[data-copy-map],[data-large-map]');if(mapAction&&selectedMapPlace){if(mapAction.hasAttribute('data-copy-map'))copyAddress(UI.addressText(selectedMapPlace));else showLargeAddress(selectedMapPlace,mapAction);return;}if(e.target.closest('#mapTransport')&&selectedMapPlace){globalThis.ChinaCompanionUI?.openPlace(selectedMapPlace);return;}const mapActivity=e.target.closest('[data-map-activity]');if(mapActivity){openActivityMap(mapActivity.dataset.mapActivity);return}const navButton=e.target.closest('[data-nav]');if(navButton){nav(navButton.dataset.nav);if(navButton.dataset.bookingView)setBookingView(navButton.dataset.bookingView);return}const day=e.target.closest('[data-date]');if(day){selectedDay=day.dataset.date;renderDay();return}const p=e.target.closest('[data-map-place]');if(p){const place=mapPlaces[Number(p.dataset.mapPlace)];if(place){selectedMapPlace=place;$('#savedPlaceName').value=place.name;$('#savedPlaceAddress').value=place.addressCN||place.chineseName||'';const pos=mapPosition(place),d=mapData[mapCity];showMapPosition(pos?.lat??d.lat,pos?.lon??d.lon,place.name,pos?.lat?0.025:d.zoom);$('#mapMessage').textContent=[place.name,place.chineseName,place.addressCN,place.notes,pos?'Approximate pin; confirm the entrance.':'Exact pin unavailable; city overview shown.'].filter(Boolean).join(' · ');renderSelectedMap();}return}const ph=e.target.closest('[data-phrase]');if(ph){const x=phrases[Number(ph.dataset.phrase)];if(x){if(view!=='translate')nav('translate');direction='en-zh';syncDir();$('#translateInput').value=x[0];if(micRequested)stopMic('Conversation paused for phrasebook playback.');$('#translationSource').textContent='English: '+x[0];setTranslation(x[1],'zh-CN',x[2]);speak()}return}const c=e.target.closest('[data-done]');if(c){done[c.dataset.done]=c.checked;persist();renderDay();return}const edit=e.target.closest('[data-edit-expense]');if(edit){editExpense(edit.dataset.editExpense);return}const retry=e.target.closest('[data-retry-receipt]');if(retry){retryReceipt(retry.dataset.retryReceipt);return}const del=e.target.closest('[data-remove-expense]');if(del)deleteExpense(del.dataset.removeExpense);});
bind('#activitySearch','input',renderItinerary);bind('#activityFilter','change',renderItinerary);bind('#mapCity','change',()=>{selectedMapPlace=null;renderMap();});bind('#mapSearch','input',renderMap);bind('#mapSearchOnline','click',searchMapOnline);bind('#saveMapPlace','click',saveMapPlace);bind('#copyMapAddress','click',()=>{const text=selectedMapPlace?.addressCN||selectedMapPlace?.chineseName;if(!text){notify('Open a place with a saved Chinese name or address first.');return;}navigator.clipboard?.writeText(text).then(()=>notify('Address copied')).catch(()=>notify('Copy unavailable. Select the address text to copy.'));});bind('#locateBtn','click',locate);bind('#translateBtn','click',()=>{if(micRequested)stopMic('Conversation paused for typed translation.');translatePhrase($('#translateInput').value);});bind('#voiceBtn','click',startMic);bind('#speakBtn','click',()=>{if(micRequested)stopMic('Conversation paused for replay. Tap Start to resume.');speak();});bind('#speechSpeed','change',()=>{try{localStorage.setItem(SPEECH_RATE_KEY,$('#speechSpeed').value)}catch{}notify('Voice speed saved. Tap Replay to hear it.');});bind('#copyTranslation','click',()=>{if(translation.text)navigator.clipboard?.writeText(translation.text).then(()=>notify('Copied')).catch(()=>notify('Copy not available'))});bind('#toChineseBtn','click',()=>{direction='en-zh';syncDir()});bind('#toEnglishBtn','click',()=>{direction='zh-en';syncDir()});['#cnyInput','#fxRate','#paymentMethod','#extraFee','#platformFee','#walletActual'].forEach(sel=>bind(sel,'input',renderMoney));bind('#saveExpense','click',saveExpense);bind('#expenseReceiptFile','change',()=>{const f=$('#expenseReceiptFile').files?.[0];$('#removeExpenseReceipt').hidden=!f;$('#expenseReceiptStatus').textContent=f?`Selected: ${f.name} (${(f.size/1024/1024).toFixed(2)} MB). Will be saved on this device with the expense, then uploaded when authorized.`:'No receipt selected. Expense can be saved locally.';});bind('#removeExpenseReceipt','click',()=>{$('#expenseReceiptFile').value='';$('#removeExpenseReceipt').hidden=true;$('#expenseReceiptStatus').textContent='No new receipt selected. Save without an attachment; any previously saved receipt is kept.';});bind('#exportExpenses','click',exportCSV);bind('#cancelExpenseEdit','click',resetExpenseForm);bind('#exportBackup','click',exportBackup);bind('#restoreBackup','change',e=>restoreBackup(e.target.files[0]));bind('#connectReceiptFromWallet','click',()=>ChinaReceipts.connect().then(()=>{$('#walletReceiptStatus').textContent='Receipt uploads connected. Retry any pending receipt.';}).catch(e=>{$('#walletReceiptStatus').textContent=e.message;}));bind('#chooseReceiptFromWallet','click',()=>ChinaReceipts.chooseFolder());bind('#expenseMethod','change',expenseDefaults);bind('#fxRate','input',()=>{$('#fxRate').dataset.manual='1';});bind('#expenseHistoricalRate','click',async()=>{const date=$('#expenseDateTime').value.slice(0,10);if(!date)return notify('Enter transaction date first.');if(!navigator.onLine)return notify('Historical rate needs internet. Keep manually entered rate.');try{const ref=await window.ChinaFX.refresh({date});$('#expenseRate').value=ref.rate;$('#expenseRateSource').textContent='Historical daily reference '+ref.date+' · ₱'+ref.rate+'/CNY, not actual bank rate.';renderExpenseCalculation();}catch{notify('Historical rate unavailable. Keep your manual rate.');}});bind('#expenseCNY','input',expenseDefaults);['expenseRate','expenseAmount','expenseIssuer','expensePlatform','expenseFixed'].forEach(id=>bind('#'+id,'input',renderExpenseCalculation));bind('#expenseTrackerPaid','change',()=>{$('#expenseInTracker').checked=!!$('#expenseTrackerPaid').value;});bind('#dataFile','change',e=>importFile(e.target.files[0]));bind('#clearData','click',async()=>{if(!confirm('Clear this browser’s trip, checklist, expenses and queued receipt files? Drive receipts will be kept.'))return;try{await ChinaReceipts.store().clear();}catch{notify('Could not clear local receipts. No app data was erased.');return;}sheetSync?.disconnect();localStorage.removeItem(KEY);localStorage.removeItem(EXP);localStorage.removeItem(CHECK);localStorage.removeItem(OAUTH_CONFIG);localStorage.removeItem('chinaCompanionSheetIdV1');ChinaReceipts.disconnect();expenses=[];done={};location.reload()});}
function renderSyncState(){
 $('#googleSyncState').textContent=syncState.message;
 $('#googleSyncNow').disabled=!sheetSync?.hasToken()||syncState.code==='syncing';
 $('#googleConnect').disabled=syncState.code==='syncing'||syncState.code==='authorizing';
}
function initSheetSync(){
 if(!window.ChinaSheetSync)return;
 try{$('#googleClientId').value=localStorage.getItem(OAUTH_CONFIG)||'';}catch{}
 const sheetConfigKey='chinaCompanionSheetIdV1';
 const configuredSheetId=()=>{try{return localStorage.getItem(sheetConfigKey)||'';}catch{return'';}};
 const saveTracker=()=>{let value=$('#googleSheetId').value.trim();const url=value.match(/^https:\/\/docs\.google\.com\/spreadsheets\/d\/([\w-]+)(?:\/.*)?$/);if(url)value=url[1];if(!/^[\w-]{20,}$/.test(value))throw Error('Enter the existing private workbook URL or ID in Google OAuth setup.');const old=configuredSheetId();if(old&&old!==value)throw Error('This device is bound to its existing workbook. Switching trackers is blocked to protect pending records.');localStorage.setItem(sheetConfigKey,value);$('#googleSheetId').value=value;$('#trackerSourceLink').href='https://docs.google.com/spreadsheets/d/'+value+'/edit';$('#trackerSourceLink').hidden=false;return value;};
 $('#googleSheetId').value=configuredSheetId();if(configuredSheetId())saveTracker();bind('#saveTrackerConfig','click',()=>{try{saveTracker();notify('Existing tracker saved privately on this device.');}catch(e){notify(e.message);}});
 sheetSync=ChinaSheetSync.create({sheetId:configuredSheetId,
  getCurrent:()=>data,
  onState:s=>{syncState=s;renderSyncState();},
  onData:next=>{
   if(next.packingLoaded)next=globalThis.ChinaPackingSync?.ingest({...next,packingLoaded:data.packingLoaded,packingRecords:data.packingRecords,smartState:data.smartState},next.packingRecords)||next;
   // Commit the full validated snapshot atomically before switching the visible app.
   try{localStorage.setItem(KEY,JSON.stringify(next));}catch{throw new ChinaSheetSync.SyncError('storage','Device storage is full or unavailable. Previous offline snapshot kept.');}
   data=next;renderEverything();
  },revoke:token=>window.google?.accounts?.oauth2?.revoke(token,()=>{})});
 globalThis.ChinaPackingSync?.initBrowser({sheetId:configuredSheetId,getData:()=>data,saveData:next=>{localStorage.setItem(KEY,JSON.stringify(next));data=next;renderEverything();},refreshReadOnly:()=>sheetSync.sync(data,true),notify});
 const setState=(code,message)=>{syncState={code,message};renderSyncState();};
 bind('#googleConnect','click',()=>{
  try{saveTracker();}catch(e){setState('setup',e.message);return;}
  if(!navigator.onLine){setState('offline','You are offline. Your saved itinerary is still available.');return;}
  const id=$('#googleClientId').value.trim();
  if(!/^\d+-[a-zA-Z0-9_-]+\.apps\.googleusercontent\.com$/.test(id)){setState('setup','Google Cloud web client setup is pending. Enter its public client ID when available. Never enter a client secret.');return;}
  if(!window.google?.accounts?.oauth2){setState('unavailable','Google sign-in could not load. Check connectivity and retry. Offline data remains available.');return;}
  try{localStorage.setItem(OAUTH_CONFIG,id);}catch{}
  try{googleClient=google.accounts.oauth2.initTokenClient({client_id:id,scope:ChinaSheetSync.SCOPE,include_granted_scopes:false,
   callback:response=>{
    if(response.error){setState('auth','Google authorization was not completed. Tap Connect Google to try again.');return;}
    try{sheetSync.authorize(response);sheetSync.sync(data,true);}catch{setState('scope','Approve the read-only Sheets permission to refresh your tracker.');}
   },error_callback:()=>setState('auth','Google sign-in was closed or blocked. Allow the Google popup, then tap Connect Google.')});
   setState('authorizing','Complete the Google account and consent window.');
   googleClient.requestAccessToken({prompt:''});
  }catch{setState('setup','Google client configuration is unavailable. Check the web client ID and authorized origin.');}
 });
 bind('#googleSyncNow','click',()=>sheetSync.sync(data,true));
 bind('#googleDisconnect','click',()=>sheetSync.disconnect());
 bind('#googleRevoke','click',()=>sheetSync.revoke());
 // No popup or silent token refresh from background work. Google requires a user gesture.
 const auto=()=>{if(document.visibilityState==='visible'&&navigator.onLine)sheetSync.sync(data);};
 setInterval(auto,5*60*1000);window.addEventListener('online',auto);window.addEventListener('focus',auto);document.addEventListener('visibilitychange',auto);
 renderSyncState();
}
function syncDir(){$('#toChineseBtn').classList.toggle('active',direction==='en-zh');$('#toEnglishBtn').classList.toggle('active',direction==='zh-en');$('#translateInput').placeholder=direction==='en-zh'?'How much is this?':'这个多少钱？';if(micRequested&&!recognitionProcessing&&recognitionBusy){try{recognition?.abort()}catch{}}}
boot();
})();

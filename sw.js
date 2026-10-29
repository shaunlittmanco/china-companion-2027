// Keep each worker scope independent, including legacy production at the same origin.
const CACHE_PREFIX='cc27:'+self.registration.scope+':';
const CACHE=CACHE_PREFIX+'v1-7-1';
const CORE=['./packing.js?v=1.7.1','./packing-sync.js?v=1.7.1','./packing-ui.js?v=1.7.1','./trip-guide.js?v=1.7.1','./fx-rates.js?v=1.7.1','./smart-travel.js?v=1.7.1','./companion-ui.js?v=1.7.1','./','./index.html','./styles.css?v=1.7.1','./jade-ui.js?v=1.7.1','./app.js?v=1.7.1','./sheet-sync.js?v=1.7.1','./receipts.js?v=1.7.1','./receipt-store.js?v=1.6.1','./travel-data.js?v=1.7.1','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/favicon.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE.map(path=>new Request(new URL(path,self.registration.scope),{cache:'reload'})))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(CACHE_PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==self.location.origin)return;
 if(!CORE.some(p=>new URL(p,self.registration.scope).href===url.href))return;
 // No Google responses, tokens or private tracker data enter Cache Storage.
 event.respondWith((async()=>{
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),5000);
  try{const res=await fetch(event.request,{signal:controller.signal,cache:'no-store'});if(res.ok){const clone=res.clone();event.waitUntil(caches.open(CACHE).then(c=>c.put(event.request,clone)));return res;}return await (await caches.open(CACHE)).match(event.request)||res;}
  catch{const saved=await (await caches.open(CACHE)).match(event.request);return saved||Response.error();}
  finally{clearTimeout(timer);}
 })());
});

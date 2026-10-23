const CACHE='china-companion-v1-3';
const CORE=['./','./index.html','./styles.css','./app.js','./sheet-sync.js','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/favicon.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE.map(path=>new Request(new URL(path,self.registration.scope),{cache:'reload'})))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('china-companion-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==self.location.origin)return;
 if(!CORE.some(p=>new URL(p,self.registration.scope).href===url.href))return;
 // No Google responses, tokens or private tracker data enter Cache Storage.
 event.respondWith((async()=>{
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),5000);
  try{const res=await fetch(event.request,{signal:controller.signal,cache:'no-store'});if(res.ok){const clone=res.clone();event.waitUntil(caches.open(CACHE).then(c=>c.put(event.request,clone)));return res;}return await caches.match(event.request)||res;}
  catch{const saved=await caches.match(event.request);return saved||Response.error();}
  finally{clearTimeout(timer);}
 })());
});

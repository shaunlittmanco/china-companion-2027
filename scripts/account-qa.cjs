/* Owner-operated Mac/desktop QA. Candidate files at the existing HTTPS app origin, isolated browser data. */
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),APP='https://shaunlittmanco.github.io/china-companion-2027/',smoke=process.argv.includes('--smoke');
const files=['index.html','styles.css','jade-ui.js','sheet-sync.js','receipt-store.js','travel-data.js','receipts.js','smart-travel.js','companion-ui.js','app.js','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/favicon.png'];
const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.webmanifest':'application/manifest+json','.png':'image/png'};
for(const name of files){const committed=cp.execFileSync('git',['show','HEAD:'+name],{cwd:root,maxBuffer:8*1024*1024});if(!committed.equals(fs.readFileSync(path.join(root,name))))throw Error('Runtime file differs from the committed candidate: '+name);}
const candidate=cp.execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
(async()=>{let browser;try{
 browser=await chromium.launch({headless:smoke});const context=await browser.newContext({serviceWorkers:'block',viewport:{width:430,height:900}});
 // A fresh ephemeral context neither imports nor accesses the normal production browser's storage.
 await context.route('**/*',async route=>{const request=route.request(),u=new URL(request.url());
  if(u.href.startsWith(APP)){
   const relative=decodeURIComponent(u.pathname.slice(new URL(APP).pathname.length))||'index.html';
   if(!files.includes(relative))return route.abort();
   let body=fs.readFileSync(path.join(root,relative));
   if(relative==='index.html')body=Buffer.from(body.toString().replace('<head>',`<head><meta name="china-account-qa" content="${candidate}">`).replace('<title>China Companion 2027</title>','<title>LOCAL ACCOUNT QA · China Companion 2027</title>'));
   return route.fulfill({status:200,contentType:types[path.extname(relative)]||'application/octet-stream',headers:{'Cache-Control':'no-store'},body});
  }
  if(smoke)return route.abort();
  if(u.hostname==='sheets.googleapis.com'&&request.method()!=='GET')return route.abort();
  return route.continue(); // Live Google OAuth/Sheets/Drive responses are never mocked, logged or saved by this helper.
 });
 if(smoke){const f=require('./preview-fixture.cjs');await context.addInitScript(f=>{for(const [k,v]of Object.entries(f))localStorage.setItem(k,typeof v==='string'?v:JSON.stringify(v));},f);}
 const page=await context.newPage();await page.goto(APP);await page.locator('#openMenu').waitFor();assert.equal(await page.locator('meta[name="china-account-qa"]').getAttribute('content'),candidate);
 if(smoke){await page.locator('#openMenu').click();await page.locator('#menuContents [data-page="settings"]').first().click();assert.equal(await page.evaluate(()=>location.origin),'https://shaunlittmanco.github.io');console.log(JSON.stringify({passed:true,candidate,origin:new URL(APP).origin,checks:['Exact-origin local candidate override','Isolated ephemeral browser context','Candidate Menu/Settings load','No network requests in smoke mode'],liveGoogleAccount:false,PWA:false,physicalDevice:false},null,2));return;}
 console.log('LOCAL OWNER-ACCOUNT QA · candidate '+candidate);
 console.log('Address bar uses the existing production HTTPS origin; only this isolated browser receives local candidate files. The public site is unchanged.');
 console.log('Use your existing public OAuth client ID, Picker key and project number in Menu → Settings, then sign in yourself. No new scope/project/folder.');
 console.log('Test read-only extended sync and clearly labeled TEST expenses/receipts; see docs/RELEASE_QA.md. Keep all original receipt files.');
 console.log('This helper disables service workers and is NOT an iPhone/PWA/offline acceptance test. Closing this browser discards its temporary local QA data. Export any QA backup you want before closing.');
 await new Promise(resolve=>browser.on('disconnected',resolve));
 }finally{await browser?.close();}})().catch(e=>{console.error(e.message);process.exitCode=1;});

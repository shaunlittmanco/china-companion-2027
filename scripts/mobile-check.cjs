/* Browser checks use fictional fixtures in fresh contexts; never a signed-in profile. */
const {chromium,webkit}=require('playwright'),http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const fixture=require('./preview-fixture.cjs'),root=path.resolve(__dirname,'..'),out=path.join(root,'docs/previews');
const baseline=process.env.BASELINE_DIR&&path.resolve(process.env.BASELINE_DIR);
const secondary=['settings','options','vlog','smart','resources','packing'];
const navSelector=name=>name==='bookings'?'.header-actions [data-nav="bookings"]':'.bottom-nav [data-nav="'+name+'"]';
async function navigate(p,name){if(secondary.includes(name)){const sidebar=p.locator('#sidebarContents [data-page="'+name+'"]').first();if(await sidebar.isVisible()){await sidebar.click();return;}await p.locator('#openMenu').click();await p.locator('#menuContents [data-page="'+name+'"]').first().click();return;}await p.locator(navSelector(name)).click();}
const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.webmanifest':'application/manifest+json','.png':'image/png'};
const server=http.createServer((req,res)=>{const u=new URL(req.url,'http://localhost'),before=u.pathname.startsWith('/before/'),dir=before?baseline:root;let file=path.resolve(dir||root,'.'+u.pathname.replace(/^\/before/,'').replace(/\/$/,'/index.html'));if(!dir||!file.startsWith(dir+path.sep)||!fs.existsSync(file)){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',types[path.extname(file)]||'text/plain');res.end(fs.readFileSync(file));});
async function context(browser,width=390,{seed=true,day='2027-01-12',theme='light',offline=false}={}){
 const c=await browser.newContext({viewport:{width,height:844},deviceScaleFactor:1,isMobile:width<600,hasTouch:width<600,timezoneId:'Asia/Shanghai',reducedMotion:'reduce'});
 await c.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
 await c.addInitScript(({fixture,seed,theme,day,offline})=>{if(location.hostname!=='127.0.0.1')return;const RealDate=Date;class FixedDate extends RealDate{constructor(...args){super(...(args.length?args:[day+'T00:15:00Z']));}static now(){return new RealDate(day+'T00:15:00Z').valueOf();}};window.Date=FixedDate;if(!sessionStorage.getItem('fixtureLoaded')){if(seed)for(const[k,v]of Object.entries(fixture))localStorage.setItem(k,typeof v==='string'?v:JSON.stringify(v));localStorage.setItem('chinaCompanionThemeV1',theme);sessionStorage.setItem('fixtureLoaded','1');}if(offline)Object.defineProperty(navigator,'onLine',{value:false});},{fixture,seed,theme,day,offline});
 return c;
}
async function shot(page,name){await page.screenshot({path:path.join(out,name+'.png'),animations:'disabled'});}
async function main(){
 fs.mkdirSync(out,{recursive:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
 const engines=process.env.TEST_WEBKIT==='1'?{chromium,webkit}:{chromium};const report=[];
 for(const[name,engine]of Object.entries(engines)){
  const browser=await engine.launch();
  try{
   if(baseline&&name==='chromium'){const c=await context(browser);const p=await c.newPage();await p.goto(origin+'/before/');await p.locator('#page-home.active').waitFor();await shot(p,'before-home-390');await p.locator('.bottom-nav [data-nav="wallet"]').click();await shot(p,'before-wallet-390');await c.close();if(process.argv.includes('--before-only'))continue;}
   for(const width of [320,375,390,430,820,1024,1366]){
    const c=await context(browser,width);const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(origin+'/');await p.locator('#page-home.active').waitFor();const storageBefore=await p.evaluate(()=>['chinaCompanionPrivateV2','chinaCompanionExpensesV1','chinaCompanionDoneV1','chinaCompanionSpeechRateV1'].map(k=>localStorage.getItem(k)));
    assert.equal(await p.locator('.bottom-nav button').count(),5);
    for(const page of ['home','itinerary','map','translate','wallet','bookings','settings','options','vlog','smart','resources','packing']){
     await navigate(p,page);
     const overflow=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);assert.equal(overflow,false,`${name} ${width}px ${page} overflows`);
     assert.equal(await p.locator('#page-'+page+'.active').count(),1);
    }
    await navigate(p,'settings');await p.locator('#themeSelect').selectOption('dark');assert.equal(await p.locator('html').getAttribute('data-theme'),'dark');
    await p.reload();assert.equal(await p.locator('html').getAttribute('data-theme'),'dark');assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('chinaCompanionExpensesV1')).length),2);
    assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('chinaCompanionDoneV1'))['preview-arrival']),true);
    for(const page of ['home','itinerary','map','translate','wallet','bookings','settings','options','vlog','smart','resources','packing']){await navigate(p,page);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`${name} ${width}px dark ${page} overflows`);}
    await navigate(p,'itinerary');await p.locator('#itineraryList [data-smart="open"][data-id="preview-garden"]').click();
    for(const tab of ['overview','go','do','nearby','vlog']){await p.locator('[data-smart="activity-tab"][data-value="'+tab+'"]').click();assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`${name} ${width}px activity-${tab} overflows`);}
    for(const theme of ['light','dark']){
     await navigate(p,'settings');await p.locator('#themeSelect').selectOption(theme);await p.locator('#openSearch').click();await p.locator('#globalSearchInput').fill('maleta');
     assert.equal(await p.locator('#globalSearchInput').evaluate(el=>document.activeElement===el),true);assert.ok(await p.locator('#globalSearchResults button').count());
     assert.equal(await p.locator('#globalSearchDialog').evaluate(el=>el.scrollWidth>el.clientWidth+1),false,'Search dialog must fit the viewport');
     await p.locator('#globalSearchInput').press('ArrowDown');assert.equal(await p.evaluate(()=>document.activeElement.hasAttribute('data-search-result')),true);await p.keyboard.press('Escape');assert.equal(await p.locator('#openSearch').evaluate(el=>document.activeElement===el),true);
     await p.locator('#openSearch').click();await p.locator('#globalSearchInput').fill('Home Packing');await p.locator('#globalSearchInput').press('Enter');await p.locator('#page-packing.active #packingStage').waitFor();assert.match(await p.locator('#packingStage').innerText(),/Home/);
     if(width===390&&name==='chromium'){await p.locator('#openSearch').click();await p.locator('#globalSearchInput').fill('packing');await shot(p,'preview8-search-'+theme);await p.keyboard.press('Escape');}
    }
    const targets=await p.locator('.bottom-nav button,.header-actions button').evaluateAll(es=>es.filter(e=>e.getClientRects().length).map(e=>({width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height})));assert.ok(targets.every(x=>x.width>=44&&x.height>=44),'Navigation targets must be at least 44px');
    assert.deepEqual(await p.evaluate(()=>['chinaCompanionPrivateV2','chinaCompanionExpensesV1','chinaCompanionDoneV1','chinaCompanionSpeechRateV1'].map(k=>localStorage.getItem(k))),storageBefore,'Existing local records must remain byte-for-byte unchanged');
    for(const mode of ['light','dark']){await navigate(p,'settings');await p.locator('#themeSelect').selectOption(mode);const contrast=await p.evaluate(()=>{const lum=c=>{const v=c.match(/[0-9.]+/g).slice(0,3).map(Number).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;});return v[0]*.2126+v[1]*.7152+v[2]*.0722;},ratio=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05),button=getComputedStyle(document.querySelector('#googleConnect')),paragraph=getComputedStyle(document.querySelector('#page-settings .page-heading p')),bg=getComputedStyle(document.documentElement).backgroundColor;return {button:ratio(button.color,button.backgroundColor),muted:ratio(paragraph.color,bg),motion:getComputedStyle(document.querySelector('.page.active')).animationName};});assert.ok(contrast.button>=4.5&&contrast.muted>=4.5,`Insufficient ${mode} text contrast`);assert.equal(contrast.motion,'none','Reduced motion must disable page animation');}
    assert.deepEqual(errors,[],`${name} ${width}px script errors`);report.push({engine:name,width,pages:12,themes:'light/dark',overflow:false,storagePreserved:true});
    await c.close();
   }
   if(name==='chromium'){
    const c=await context(browser);const p=await c.newPage();await p.goto(origin+'/');await shot(p,'after-home-light-390');await navigate(p,'settings');await p.locator('#themeSelect').selectOption('dark');await p.locator('.bottom-nav [data-nav="home"]').click();await shot(p,'after-home-dark-390');await navigate(p,'settings');await p.locator('#themeSelect').selectOption('light');
    for(const nav of ['itinerary','bookings','wallet','translate']){await navigate(p,nav);await shot(p,'after-'+nav+'-390');}
    await navigate(p,'bookings');await p.locator('#showHotels').click();await shot(p,'after-hotels-390');await p.locator('#hotelList [data-large-hotel]').first().click();assert.equal(await p.locator('#addressDialog').evaluate(e=>e.open),true);await shot(p,'after-address-390');await p.keyboard.press('Escape');assert.equal(await p.locator('#addressDialog').evaluate(e=>e.open),false);assert.equal(await p.locator('#hotelList [data-large-hotel]').first().evaluate(e=>document.activeElement===e),true);
    await p.locator('.bottom-nav [data-nav="wallet"]').click();await p.locator('#logConversion').click();assert.equal(await p.locator('#expenseCNY').inputValue(),'200');assert.equal(await p.locator('#expenseEditor').evaluate(e=>e.open),true);
    await p.locator('#expenseDesc').fill('Mobile TEST without receipt');await p.locator('#expenseAmount').fill('1600');await p.locator('#saveExpense').click();await p.waitForFunction(()=>JSON.parse(localStorage.getItem('chinaCompanionExpensesV1')).length===3);
    await navigate(p,'settings');await p.locator('#themeSelect').selectOption('dark');await p.reload();assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('chinaCompanionExpensesV1')).length),3);
    await c.close();
    const early=await context(browser,390,{day:'2026-10-27'}),ep=await early.newPage();await ep.goto(origin+'/');await shot(ep,'after-countdown-390');await early.close();
    const oc=await context(browser),op=await oc.newPage();await op.goto(origin+'/');await op.evaluate(async()=>{await navigator.serviceWorker.ready;});await oc.setOffline(true);await op.reload();await op.locator('#page-home.active').waitFor();assert.match(await op.locator('#networkIndicator').innerText(),/Offline/);await navigate(op,'bookings');await op.locator('#showHotels').click();assert.match(await op.locator('#hotelList').innerText(),/云舍/);await op.locator(navSelector('home')).click();await shot(op,'after-offline-390');await oc.close();report.push({engine:name,test:'actual offline PWA reload and saved Chinese hotel lookup',passed:true});
   }
  }finally{await browser.close();}
 }
 fs.writeFileSync(path.join(out,'mobile-results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:true,checks:report},null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());

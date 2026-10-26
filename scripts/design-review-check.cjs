/* Automated review-only checks. All data is synthetic; external requests are blocked. */
const {chromium}=require('playwright'),path=require('node:path'),fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch();
 const out=path.resolve('docs/previews'),errors=[],report=[];
 try{
  const page=await browser.newPage({viewport:{width:1040,height:1490},reducedMotion:'reduce'});
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',r=>new URL(r.request().url()).protocol==='file:'?r.continue():r.abort());
  await page.goto('file://'+path.join(out,'jade-night-review.html'));
  const frames=['light','dark'].map(id=>({id,frame:page.frameLocator('#'+id)}));
  for(const {id,frame} of frames){await frame.locator('html[data-theme="'+id+'"]').waitFor();assert.equal(await frame.locator('#googleConnect').isEnabled(),false);}
  for(const name of ['home','itinerary','map','translate','wallet','bookings','settings']){
   await page.locator('[data-page="'+name+'"]').click();
   for(const {id,frame} of frames){
    await frame.locator('#page-'+name+'.active').waitFor();
    assert.equal(await frame.locator('html').evaluate(e=>e.scrollWidth>e.clientWidth+1),false,id+' '+name+' overflow');
    assert.equal(await frame.locator('html').getAttribute('data-theme'),id);
   }
   await page.locator('.pair').screenshot({path:path.join(out,'review-'+name+'-light-dark.png'),animations:'disabled'});
   report.push({screen:name,themes:['light','dark'],overflow:false});
  }
  await page.locator('#address').click();
  for(const {frame} of frames){await frame.locator('#addressDialog[open]').waitFor();assert.match(await frame.locator('#addressChinese').innerText(),/云舍/);}
  await page.locator('.pair').screenshot({path:path.join(out,'review-chinese-address-light-dark.png'),animations:'disabled'});
  await page.locator('[data-state="countdown"]').click();
  for(const {id,frame} of frames){await frame.locator('html[data-theme="'+id+'"]').waitFor();await frame.locator('#tripCountdown').filter({hasText:'77 days to go'}).waitFor();}
  await page.locator('.pair').screenshot({path:path.join(out,'review-countdown-light-dark.png'),animations:'disabled'});
  await page.locator('[data-state="offline"]').click();
  for(const {id,frame} of frames){await frame.locator('html[data-theme="'+id+'"]').waitFor();await frame.locator('#networkIndicator').filter({hasText:'Offline'}).waitFor();await frame.locator('.offline-card').waitFor();}
  await page.locator('.pair').screenshot({path:path.join(out,'review-offline-light-dark.png'),animations:'disabled'});
  await page.locator('[data-state="trip"]').click();
  for(const {id,frame} of frames)await frame.locator('html[data-theme="'+id+'"]').waitFor();
  for(const width of [320,390,768,1040]){await page.setViewportSize({width,height:1000});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'Review wrapper '+width+'px overflows');}
  assert.deepEqual(errors,[]);
  const result={passed:true,checks:report,extraStates:['large Chinese address','77-day departure countdown on 26 Oct 2026','simulated offline quick access'],wrapperWidths:[320,390,768,1040],externalRequestsAllowed:false};
  fs.writeFileSync(path.join(out,'design-review-results.json'),JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify(result,null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

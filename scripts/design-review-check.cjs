/* Automated review-only checks. All data is synthetic; external requests are blocked. */
const {chromium}=require('playwright'),path=require('node:path'),fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch();
 const out=path.resolve('docs/previews'),errors=[],report=[];
 try{
  const page=await browser.newPage({viewport:{width:1040,height:1490},reducedMotion:'reduce'});
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',r=>new URL(r.request().url()).protocol==='file:'?r.continue():r.abort());
  await page.goto('file://'+path.join(out,'imperial-china-review.html'));
  const frames=['light','dark'].map(id=>({id,frame:page.frameLocator('#'+id)}));
  for(const {id,frame} of frames){await frame.locator('html[data-theme="'+id+'"]').waitFor();assert.equal(await frame.locator('#googleConnect').isEnabled(),false);}
  for(const name of ['home','itinerary','map','translate','wallet','bookings','settings','options','smart','vlog','resources']){
   await page.locator('[data-page="'+name+'"]').click();
   for(const {id,frame} of frames){
    await frame.locator('#page-'+name+'.active').waitFor();
    assert.equal(await frame.locator('html').evaluate(e=>e.scrollWidth>e.clientWidth+1),false,id+' '+name+' overflow');
    assert.equal(await frame.locator('html').getAttribute('data-theme'),id);
    const contrast=await frame.locator('#page-'+name).evaluate(el=>{
      const l=c=>{const v=c.match(/[0-9.]+/g).slice(0,3).map(Number).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;});return .2126*v[0]+.7152*v[1]+.0722*v[2];};
      const ratio=(a,b)=>(Math.max(l(a),l(b))+.05)/(Math.min(l(a),l(b))+.05);
      const bg=e=>{for(let n=e;n;n=n.parentElement){const c=getComputedStyle(n).backgroundColor;if(!c.endsWith(', 0)')&&c!=='transparent'&&c!=='rgba(0, 0, 0, 0)')return c;}return getComputedStyle(document.documentElement).backgroundColor;};
      const nodes=[...el.querySelectorAll('p,h2,h3,.eyebrow,.primary-btn:not(:disabled),.text-btn,.day-pill.selected small')].filter(e=>e.getClientRects().length&&e.textContent.trim());
      return nodes.map(e=>({text:e.textContent.slice(0,45),ratio:ratio(getComputedStyle(e).color,bg(e))})).filter(x=>x.ratio<4.5);
    });
    assert.deepEqual(contrast,[],id+' '+name+' text contrast below 4.5:1');
   }
   await page.locator('.pair').screenshot({path:path.join(out,'review-'+name+'-light-dark.png'),animations:'disabled'});
   // Full content comparison as well as the first iPhone viewport.
   for(const {id,frame} of frames){const height=await frame.locator('html').evaluate(e=>e.scrollHeight);await page.locator('#'+id).evaluate((e,h)=>e.style.height=h+'px',height);}
   await page.locator('.pair').screenshot({path:path.join(out,'full-'+name+'-light-dark.png'),animations:'disabled'});
   for(const {id} of frames)await page.locator('#'+id).evaluate(e=>e.style.height='844px');
   report.push({screen:name,themes:['light','dark'],overflow:false,contrast:'at least 4.5:1 for checked text',fullContentCaptured:true});
  }
  // Exercise all new local workflows in both independent themes.
  await page.locator('#activity').click();
  for(const {frame} of frames)await frame.locator('#page-activity.active').waitFor();
  for(const tab of ['overview','go','do','nearby','vlog']){
   for(const {frame} of frames){await frame.locator('[data-smart="activity-tab"][data-value="'+tab+'"]').click();assert.equal(await frame.locator('html').evaluate(e=>e.scrollWidth>e.clientWidth+1),false,'Activity '+tab+' overflow');}
   if(tab==='go')for(const {frame} of frames){assert.match(await frame.locator('.recommended').innerText(),/Walk this one/);assert.match(await frame.locator('#activityContent').innerText(),/SIMULATED/);}
   if(tab==='vlog')for(const {frame} of frames){await frame.locator('[data-smart-check="shot"]').first().check();assert.equal(await frame.locator('[data-smart-check="shot"]').first().isChecked(),true);}
   await page.locator('.pair').screenshot({path:path.join(out,'review-activity-'+tab+'-light-dark.png'),animations:'disabled'});
   for(const {id,frame} of frames){const height=await frame.locator('html').evaluate(e=>e.scrollHeight);await page.locator('#'+id).evaluate((e,h)=>e.style.height=h+'px',height);}
   await page.locator('.pair').screenshot({path:path.join(out,'full-activity-'+tab+'-light-dark.png'),animations:'disabled'});
   for(const {id} of frames)await page.locator('#'+id).evaluate(e=>e.style.height='844px');
   report.push({screen:'activity-'+tab,themes:['light','dark'],overflow:false});
  }
  await page.locator('#activity').click();
  for(const {frame} of frames){await frame.locator('#ticketState').selectOption('Paid');await frame.locator('#ticketEvidence').fill('Synthetic receipt reference');await frame.locator('[data-smart="save-ticket"]').click();assert.match(await frame.locator('.ticket-detail').innerText(),/Local declaration/);assert.equal(await frame.locator('#ticketState').inputValue(),'Paid');await frame.locator('[data-smart="refresh-price"]').click();assert.match(await frame.locator('#priceRefreshStatus').innerText(),/No reliable free live provider/);}
  await page.locator('#snowDay').click();
  for(const {frame} of frames){await frame.locator('#page-smart.active').waitFor();await frame.locator('[data-smart="simulate"][data-value="snow"]').click();assert.match(await frame.locator('#smartPlanContent').innerText(),/Plan A · Fairy Mountain/);}
  await page.locator('.pair').screenshot({path:path.join(out,'review-snow-plan-a-light-dark.png'),animations:'disabled'});
  for(const {frame} of frames){await frame.locator('[data-smart="simulate"][data-value="none"]').click();assert.match(await frame.locator('#smartPlanContent').innerText(),/Plan B · Chongqing city/);await frame.locator('[data-smart="prepare-plan"][data-value="B"]').click();await frame.locator('#planConfirm[open]').waitFor();}
  await page.locator('.pair').screenshot({path:path.join(out,'review-plan-confirm-light-dark.png'),animations:'disabled'});
  for(const {frame} of frames){await frame.locator('[data-smart="cancel-plan"]').click();assert.match(await frame.locator('#smartPlanContent').innerText(),/None; master itinerary unchanged/);await frame.locator('[data-smart="prepare-plan"][data-value="B"]').click();await frame.locator('[data-smart="confirm-plan"]').click();assert.match(await frame.locator('#smartPlanContent').innerText(),/Current local selection: B/);await frame.locator('[data-smart="simulate"][data-value="unknown"]').click();assert.match(await frame.locator('#smartPlanContent').innerText(),/Plan C · Conditions uncertain/);}
  await page.locator('[data-page="itinerary"]').click();for(const {frame} of frames){assert.match(await frame.locator('#itineraryList').innerText(),/Shibati/);assert.ok(!(await frame.locator('#itineraryList').innerText()).includes('Fairy Mountain'));}
  await page.locator('.pair').screenshot({path:path.join(out,'review-applied-city-plan-light-dark.png'),animations:'disabled'});
  await page.locator('[data-page="home"]').click();
  for(const {frame} of frames){await frame.locator('#openMenu').click();await frame.locator('#menuDialog[open]').waitFor();}
  await page.locator('.pair').screenshot({path:path.join(out,'review-menu-light-dark.png'),animations:'disabled'});
  for(const {frame} of frames){await frame.locator('#closeMenu').click();assert.equal(await frame.locator('#openMenu').evaluate(e=>document.activeElement===e),true);}
  await page.locator('#address').click();
  for(const {frame} of frames){await frame.locator('#addressDialog[open]').waitFor();assert.match(await frame.locator('#addressChinese').innerText(),/云舍/);}
  await page.locator('.pair').screenshot({path:path.join(out,'review-chinese-address-light-dark.png'),animations:'disabled'});
  await page.locator('[data-state="countdown"]').click();
  for(const {id,frame} of frames){await frame.locator('html[data-theme="'+id+'"]').waitFor();await frame.locator('#tripCountdown').filter({hasText:'76 days to go'}).waitFor();}
  await page.locator('.pair').screenshot({path:path.join(out,'review-countdown-light-dark.png'),animations:'disabled'});
  await page.locator('[data-state="offline"]').click();
  for(const {id,frame} of frames){await frame.locator('html[data-theme="'+id+'"]').waitFor();await frame.locator('#networkIndicator').filter({hasText:'Offline'}).waitFor();await frame.locator('.offline-card').waitFor();}
  await page.locator('.pair').screenshot({path:path.join(out,'review-offline-light-dark.png'),animations:'disabled'});
  await page.locator('[data-state="trip"]').click();
  for(const {id,frame} of frames)await frame.locator('html[data-theme="'+id+'"]').waitFor();
  for(const width of [320,390,768,1040]){await page.setViewportSize({width,height:1000});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'Review wrapper '+width+'px overflows');}
  assert.deepEqual(errors,[]);
  const result={passed:true,checks:report,extraStates:['large Chinese address','76-day departure countdown on 27 Oct 2026','simulated offline quick access'],wrapperWidths:[320,390,768,1040],externalRequestsAllowed:false};
  fs.writeFileSync(path.join(out,'design-review-results.json'),JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify(result,null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

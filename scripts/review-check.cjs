const {chromium}=require('playwright'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch();
 try{
  const page=await browser.newPage({viewport:{width:1100,height:1100},reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',r=>new URL(r.request().url()).protocol==='file:'?r.continue():r.abort());
  await page.goto('file://'+path.resolve('docs/previews/review.html'));
  const before=page.frameLocator('#before'),after=page.frameLocator('#after');
  await before.locator('#page-home.active').waitFor();await after.locator('#page-home.active').waitFor();
  await page.locator('[data-theme="dark"]').click();await after.locator('html[data-theme="dark"]').waitFor();
  await page.locator('[data-page="bookings"]').click();await after.locator('#page-bookings.active').waitFor();
  await after.locator('#showHotels').click();await after.locator('#hotelReferences:not([hidden])').waitFor();
  assert.equal(await after.locator('#googleConnect').isEnabled(),false);
  await page.locator('[data-page="home"]').click();await after.locator('#page-home.active').waitFor();
  await page.screenshot({path:'docs/previews/comparison-desktop.png',fullPage:true,animations:'disabled'});
  assert.deepEqual(errors,[]);console.log('Self-contained review: both versions render, theme/page/hotel controls work, Google disabled, no script errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

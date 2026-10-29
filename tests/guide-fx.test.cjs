const {test}=require('node:test'),assert=require('node:assert/strict');
const FX=require('../fx-rates.js'),Guide=require('../trip-guide.js'),S=require('../smart-travel.js');

test('Eleven payment methods are separate, PHP-only and have correctly bounded wallet fees',()=>{
 assert.equal(FX.METHODS.length,11);
 assert.notEqual(FX.method('alipay-physical').id,FX.method('alipay-virtual').id);
 assert.equal(FX.fees('gcash',500).issuer,0);
 assert.equal(FX.fees('alipay-physical',200).platform,0);
 assert.equal(FX.fees('alipay-physical',200.01).platform,3);
 assert.equal(FX.fees('alipay-virtual',500).issuer,1.70);
 assert.equal(FX.fees('visa-direct',500).platform,0);
 assert.equal(FX.fees('unionpay-direct',500).issuer,1.65);
 assert.equal(FX.fees('unionpay-alipay',500).conditional,true);
 assert.equal(FX.fees('wechat-visa',500).platform,3);
});
test('Reference FX fetch is keyless, strict, dated and cached; never an actual card/GCash quote',async()=>{
 const storage=new Map(),store={getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)};
 const fetcher=async(uri,options)=>{assert.ok(uri.startsWith(FX.SOURCE));assert.equal(options.credentials,'omit');return {ok:true,json:async()=>({date:'2026-10-29',base:'CNY',quote:'PHP',rate:8.123456})};};
 const result=await FX.refresh({store,fetcher});assert.equal(result.rate,8.123456);assert.equal(FX.cached(store).date,'2026-10-29');
 const compare=FX.compare(500,result.rate);assert.ok(compare.every(x=>x.notProviderQuote));assert.ok(compare.find(x=>x.id==='alipay-physical').estimatePHP>compare.find(x=>x.id==='gcash').estimatePHP);
 await assert.rejects(FX.refresh({store,fetcher:async()=>({ok:true,json:async()=>({date:'2026-10-29',base:'USD',quote:'PHP',rate:1})})}),/Unexpected/);
 assert.equal(FX.cached(store).rate,result.rate);
});
test('Four cities have meaningful Discover More and curated food ideas, not phantom restaurants',()=>{
 for(const city of ['Shanghai','Chongqing','Chengdu','Beijing']){
  assert.ok(Guide.ideasFor(city).length>=6,city);
  assert.ok(Guide.foodsFor(city).length>=4,city);
  assert.ok(S.discoveries(city).length>=6,city);
  assert.ok(Guide.foodsFor(city).every(x=>/Curated dish idea/.test(x.source)));
 }
});
test('Source-backed Taglish guides, Chinese-only story and personal journal merge are stable',()=>{
 const a={id:'a',activity:'Mutianyu Great Wall',city:'Beijing'};
 assert.match(S.scripts(a).history,/Ming/);
 assert.match(S.scripts(a).voiceover,/ito|natin|dito/);
 assert.match(S.scripts(a).chinese.caption,/[\p{Script=Han}]/u);
 assert.equal(/[A-Za-z]/.test(S.scripts(a).chinese.caption),false);
 assert.ok(S.scripts(a).source.startsWith('https:'));
 const unknown=S.scripts({activity:'Unknown',city:'Unknown'});
 assert.match(unknown.history,/No researched history/);
 const merged=S.mergeState({experiences:{a:{what:'original'},b:{what:'backup'}}},{experiences:{a:{what:'latest'}}});
 assert.equal(merged.experiences.a.what,'latest');
 assert.equal(merged.experiences.b.what,'backup');
});

const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {JSDOM}=require('jsdom'),{IDBFactory}=require('fake-indexeddb');
const flush=()=>new Promise(r=>setTimeout(r,30));
async function waitFor(predicate){const until=Date.now()+3000;do{if(await predicate())return;await new Promise(r=>setTimeout(r,10));}while(Date.now()<until);assert.fail('Expected asynchronous operation to complete within 3 seconds');}
function start({offline=true,seed={},speechFails=false,noReceiptStorage=false}={}){const dom=new JSDOM(fs.readFileSync('index.html','utf8'),{url:'https://example.test/china/',runScripts:'outside-only'}),w=dom.window;w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.fetch=async()=>{throw Error('network inaccessible')};w.indexedDB=noReceiptStorage?undefined:new IDBFactory();w.Blob=Blob;w.File=File;w.AbortController=AbortController;w.TextEncoder=TextEncoder;w.confirm=()=>true;Object.defineProperty(w.navigator,'onLine',{value:!offline,configurable:true});Object.defineProperty(w.document,'visibilityState',{value:'visible',configurable:true});for(const [k,v]of Object.entries(seed))w.localStorage.setItem(k,typeof v==='string'?v:JSON.stringify(v));const audio=[];w.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};w.speechSynthesis={getVoices:()=>[],cancel(){},speak(a){audio.push(a);queueMicrotask(()=>speechFails?a.onerror?.():a.onend?.());}};for(const f of ['jade-ui.js','receipt-store.js','travel-data.js','sheet-sync.js','receipts.js','app.js'])w.eval(fs.readFileSync(f,'utf8'));return {w,dom,audio,close:()=>w.close(),el:id=>w.document.getElementById(id),set:(id,val)=>{w.document.getElementById(id).value=val;},click:id=>w.document.getElementById(id).click(),expenses:()=>JSON.parse(w.localStorage.getItem('chinaCompanionExpensesV1')||'[]')};}
function fill(app){app.set('expenseDateTime','2027-01-12T19:30');app.set('expenseDesc','Synthetic test meal');app.set('expenseAmount','120');}
test('offline app starts, saves and edits local expenses, no Sheet writes, old entries preserved',async()=>{const old={id:'legacy',date:'2027-01-11',desc:'Existing charge',amount:50,method:'Cash',city:'Shanghai'};const app=start({seed:{chinaCompanionExpensesV1:[old]}});try{assert.match(app.el('networkIndicator').textContent,/Offline/);fill(app);app.click('saveExpense');await flush();assert.equal(app.expenses().length,2);assert.deepEqual(app.expenses()[0],old);const id=app.expenses()[1].id;app.w.document.querySelector(`[data-edit-expense="${id}"]`).click();app.set('expenseAmount','130');app.click('saveExpense');await flush();assert.equal(app.expenses().length,2);assert.equal(app.expenses().find(e=>e.id===id).amount,130);assert.match(app.el('totalSpent').textContent,/180.00/);}finally{app.close();}});
test('offline receipt is durable and expense remains saved after upload failure',async()=>{const app=start();try{fill(app);const file=new File(['synthetic pdf'],'test.pdf',{type:'application/pdf'});Object.defineProperty(app.el('expenseReceiptFile'),'files',{value:[file],configurable:true});app.click('saveExpense');await waitFor(async()=>{const e=app.expenses()[0];return e&&!app.el('saveExpense').disabled&&await app.w.ChinaReceipts.store().get(e.id);});const [e]=app.expenses();assert.ok(e);assert.equal(e.receiptStatus,'pending');const queued=await app.w.ChinaReceipts.store().get(e.id);assert.equal(await queued.blob.text(),'synthetic pdf');app.w.document.querySelector(`[data-retry-receipt="${e.id}"]`).click();await flush();assert.equal(app.expenses().length,1);assert.equal(app.expenses()[0].receiptStatus,'pending');assert.ok(await app.w.ChinaReceipts.store().get(e.id));}finally{app.close();}});
test('storage quota failure does not falsely claim expense save',async()=>{const app=start();try{fill(app);const prototype=Object.getPrototypeOf(app.w.localStorage),original=prototype.setItem;prototype.setItem=function(k,v){if(k==='chinaCompanionExpensesV1')throw Error('quota');return original.call(this,k,v);};app.click('saveExpense');await flush();assert.equal(app.expenses().length,0);assert.match(app.el('expenseReceiptStatus').textContent,/not saved/);prototype.setItem=original;}finally{app.close();}});
test('unknown receipt status recovers interrupted uploads on boot',()=>{const app=start({seed:{chinaCompanionExpensesV1:[{id:'x',desc:'Saved charge',date:'2027-01-12',amount:99,receiptStatus:'uploading'}]}});try{assert.equal(app.expenses()[0].receiptStatus,'pending');assert.match(app.el('expenseList').textContent,/Pending/);}finally{app.close();}});
test('same converter and expense form distinguish issuer fees, platform fees and actual amount',()=>{const app=start();try{app.set('paymentMethod','union');app.el('paymentMethod').dispatchEvent(new app.w.Event('input'));assert.equal(app.el('extraFee').value,'1.65');app.set('walletActual','999');app.el('walletActual').dispatchEvent(new app.w.Event('input'));assert.match(app.el('walletTotal').textContent,/Actual total charged.*999.00/);app.set('paymentMethod','visa');app.set('cnyInput','201');app.el('paymentMethod').dispatchEvent(new app.w.Event('input'));assert.equal(app.el('platformFee').value,'3');}finally{app.close();}});
test('saved phrasebook works in both directions and respects saved slow speech speed',async()=>{const app=start({seed:{chinaCompanionSpeechRateV1:'0.55'}});try{app.set('translateInput','How much is this?');app.click('translateBtn');await flush();assert.match(app.el('translateResult').textContent,/这个多少钱/);assert.equal(app.audio.at(-1).rate,.55);assert.equal(app.audio.at(-1).lang,'zh-CN');app.click('toEnglishBtn');app.set('translateInput','这个多少钱？');app.click('translateBtn');await flush();assert.equal(app.audio.at(-1).lang,'en-US');assert.match(app.el('translationSource').textContent,/中文/);}finally{app.close();}});
test('blocked spoken output pauses voice turn instead of restarting microphone',async()=>{const app=start({speechFails:true});try{let starts=0,instance;app.w.SpeechRecognition=class{constructor(){instance=this;}start(){starts++;this.onstart?.();}stop(){}abort(){}};app.w.document.querySelector('[data-nav="translate"]').click();app.click('voiceBtn');instance.onresult({results:[{isFinal:true,0:{transcript:'How much is this?'}}]});await flush();assert.equal(starts,1);assert.match(app.el('voiceStatus').textContent,/Playback was interrupted or blocked/);assert.match(app.el('voiceBtn').textContent,/Start/);}finally{app.close();}});
test('offline map opens itinerary address without requesting street tiles; local checkmarks retained',()=>{const trip={schemaVersion:2,trip:{budgetPHP:150000},itinerary:[{id:'activity',date:'2027-01-11',city:'Shanghai',activity:'Synthetic hotel',addressCN:'测试地址',transport:'Walk 1 km'}],hotels:[],bookings:[]};const app=start({seed:{chinaCompanionPrivateV2:trip,chinaCompanionDoneV1:{activity:true}}});try{app.w.document.querySelector('[data-map-activity="activity"]').click();assert.match(app.el('mapMessage').textContent,/测试地址/);assert.match(app.el('mapMessage').textContent,/Walk 1 km/);assert.match(app.el('mapCanvas').textContent,/Offline/);assert.equal(app.el('mapCanvas').querySelectorAll('iframe').length,0);assert.equal(JSON.parse(app.w.localStorage.getItem('chinaCompanionDoneV1')).activity,true);}finally{app.close();}});
test('complete backup round-trips pending receipt bytes and reserved ID without OAuth settings',async()=>{const app=start(),restored=start({seed:{chinaCompanionExpensesV1:[{id:'kept',date:'2027-01-10',desc:'Keep existing',amount:10}]}});try{fill(app);const file=new File(['private synthetic bytes'],'test.pdf',{type:'application/pdf'});Object.defineProperty(app.el('expenseReceiptFile'),'files',{value:[file],configurable:true});app.click('saveExpense');await flush();const [e]=app.expenses();await app.w.ChinaReceipts.store().reserve(e.id,'reserved_test_0001');app.w.localStorage.setItem('chinaCompanionPickerApiKeyV1','DO_NOT_EXPORT_TEST_CONFIG');let exported;app.w.URL.createObjectURL=blob=>{exported=blob;return 'blob:test';};app.w.URL.revokeObjectURL=()=>{};app.w.HTMLAnchorElement.prototype.click=()=>{};app.w.FileReader=class{readAsDataURL(blob){blob.arrayBuffer().then(buffer=>{this.result='data:'+blob.type+';base64,'+Buffer.from(buffer).toString('base64');this.onload();});}};app.click('exportBackup');await flush();assert.ok(exported);const raw=await exported.text();assert.ok(!raw.includes('DO_NOT_EXPORT'));const backup=JSON.parse(raw);assert.equal(backup.receipts.length,1);assert.equal(backup.receipts[0].driveFileId,'reserved_test_0001');assert.ok(backup.receipts[0].filename.includes('_Synthetic-test-meal_CNY-NA_GCash-AlipayPlus_'));assert.equal(backup.receipts[0].filename,(await app.w.ChinaReceipts.store().get(e.id)).filename);const backupFile=new File([raw],'backup.json',{type:'application/json'});Object.defineProperty(restored.el('restoreBackup'),'files',{value:[backupFile],configurable:true});restored.el('restoreBackup').dispatchEvent(new restored.w.Event('change'));await flush();assert.equal(restored.expenses().length,2);assert.ok(restored.expenses().find(x=>x.id==='kept'));const queued=await restored.w.ChinaReceipts.store().get(e.id);assert.equal(await queued.blob.text(),'private synthetic bytes');assert.equal(queued.driveFileId,'reserved_test_0001');assert.equal(queued.filename,backup.receipts[0].filename);}finally{app.close();restored.close();}});
test('delete removes only the synthetic local record and outbox file',async()=>{const app=start();try{fill(app);Object.defineProperty(app.el('expenseReceiptFile'),'files',{value:[new File(['test'],'test.pdf',{type:'application/pdf'})],configurable:true});app.click('saveExpense');await flush();const [e]=app.expenses();app.w.document.querySelector(`[data-remove-expense="${e.id}"]`).click();await flush();assert.equal(app.expenses().length,0);assert.equal(await app.w.ChinaReceipts.store().get(e.id),null);}finally{app.close();}});
test('receipt OAuth keeps the public client ID and Picker uses the matching project and origin', async () => {
 const app = start({offline:false});
 try {
  let authRequests=0, origin, project, callback;
  const clientId='1234567-test-client.apps.googleusercontent.com';
  app.set('googleClientId',clientId);
  app.set('receiptApiKey','AIza'+'x'.repeat(32));
  app.set('receiptProjectNumber','1234567');
  class DocsView {
   setIncludeFolders(){return this;} setSelectFolderEnabled(){return this;}
   setMode(){return this;} setQuery(){return this;}
  }
  class PickerBuilder {
   addView(){return this;} setOAuthToken(){return this;} setDeveloperKey(){return this;}
   setAppId(n){project=n;return this;} setOrigin(o){origin=o;return this;}
   setCallback(cb){callback=cb;return this;}
   build(){return {setVisible(){queueMicrotask(()=>callback({action:'cancel'}));}};}
  }
  app.w.google={
   accounts:{oauth2:{initTokenClient:opts=>({requestAccessToken(){
    authRequests++;
    queueMicrotask(()=>opts.callback({access_token:'TEST_ONLY_SESSION',expires_in:3600,scope:'https://www.googleapis.com/auth/drive.file'}));
   }})}},
   picker:{DocsView,ViewId:{FOLDERS:'folders'},DocsViewMode:{LIST:'list'},Response:{ACTION:'action'},Action:{CANCEL:'cancel'},PickerBuilder}
  };
  const first=app.w.ChinaReceipts.connect(),second=app.w.ChinaReceipts.connect();
  assert.equal(first,second); await first; assert.equal(authRequests,1);
  assert.equal(app.w.localStorage.getItem('chinaCompanionGoogleClientIdV1'),clientId);
  await app.w.ChinaReceipts.chooseFolder();
  assert.equal(project,'1234567'); assert.equal(origin,'https://example.test');
  const stored=[...Array(app.w.localStorage.length)].map((_,i)=>app.w.localStorage.getItem(app.w.localStorage.key(i))).join('');
  assert.ok(!stored.includes('TEST_ONLY_SESSION'));
 } finally {app.close();}
});

function attach(app,file){
 const input=app.el('expenseReceiptFile'),descriptor=Object.getOwnPropertyDescriptor(app.w.HTMLInputElement.prototype,'value');let files=[file];
 Object.defineProperty(input,'files',{configurable:true,get:()=>files});
 Object.defineProperty(input,'value',{configurable:true,get:()=>descriptor.get.call(input),set:value=>{if(value==='')files=[];descriptor.set.call(input,value);}});
 input.dispatchEvent(new app.w.Event('change'));
}
test('receipt-free expenses save, edit and delete without Google settings, internet or IndexedDB',async()=>{
 const app=start({noReceiptStorage:true});try{let fetches=0;app.w.fetch=async()=>{fetches++;throw Error('not connected');};fill(app);app.click('saveExpense');await flush();
 const [expense]=app.expenses();assert.ok(expense);assert.equal(expense.receipt,undefined);assert.equal(expense.receiptStatus,undefined);assert.match(app.el('expenseReceiptStatus').textContent,/Expense saved locally/);
 app.w.document.querySelector(`[data-edit-expense="${expense.id}"]`).click();app.set('expenseAmount','125');app.click('saveExpense');await flush();assert.equal(app.expenses()[0].amount,125);
 app.w.document.querySelector(`[data-remove-expense="${expense.id}"]`).click();await flush();assert.equal(app.expenses().length,0);assert.match(app.el('expenseList').textContent,/No new expenses/);assert.equal(fetches,0);
 }finally{app.close();}
});
test('a selected attachment can be removed without clearing the transaction',async()=>{
 const app=start({noReceiptStorage:true});try{fill(app);attach(app,new File(['unsupported'],'sample.txt',{type:'text/plain'}));assert.equal(app.el('removeExpenseReceipt').hidden,false);
 app.click('removeExpenseReceipt');assert.equal(app.el('removeExpenseReceipt').hidden,true);assert.equal(app.el('expenseDesc').value,'Synthetic test meal');assert.equal(app.el('expenseReceiptFile').files.length,0);
 app.click('saveExpense');await flush();assert.equal(app.expenses().length,1);assert.equal(app.expenses()[0].receiptStatus,undefined);
 }finally{app.close();}
});
test('backups without receipt files restore and export even when IndexedDB is unavailable',async()=>{
 const app=start({noReceiptStorage:true});try{const backup={backupVersion:1,data:{schemaVersion:2,trip:{budgetPHP:150000},itinerary:[],bookings:[]},expenses:[{id:'restored-without-receipt',desc:'Synthetic restored charge',amount:30,date:'2027-01-12'}],done:{preserved:true},receipts:[]};
 Object.defineProperty(app.el('restoreBackup'),'files',{value:[new File([JSON.stringify(backup)],'backup.json',{type:'application/json'})],configurable:true});app.el('restoreBackup').dispatchEvent(new app.w.Event('change'));await flush();assert.equal(app.expenses().length,1);assert.equal(app.expenses()[0].id,'restored-without-receipt');assert.equal(JSON.parse(app.w.localStorage.getItem('chinaCompanionDoneV1')).preserved,true);
 let exported;app.w.URL.createObjectURL=blob=>{exported=blob;return 'blob:test';};app.w.URL.revokeObjectURL=()=>{};app.w.HTMLAnchorElement.prototype.click=()=>{};app.click('exportBackup');await flush();assert.ok(exported);const result=JSON.parse(await exported.text());assert.equal(result.expenses.length,1);assert.equal(result.receipts.length,0);
 }finally{app.close();}
});
test('pending receipts use current expense details before upload, while reserved names remain unchanged',async()=>{
 for(const reserved of [false,true]){const app=start();try{fill(app);app.set('expenseCNY','25.5');attach(app,new File(['test pdf'],'receipt.pdf',{type:'application/pdf'}));app.click('saveExpense');await flush();const [expense]=app.expenses(),store=app.w.ChinaReceipts.store(),initial=await store.get(expense.id);
 assert.ok(initial.filename.includes('_Synthetic-test-meal_CNY25.50_GCash-AlipayPlus_'));
 if(reserved)await store.reserve(expense.id,'reserved_receipt_001');else await store.update(expense.id,{filename:'legacy-date-and-id'});
 app.w.document.querySelector(`[data-edit-expense="${expense.id}"]`).click();app.set('expenseDesc','Updated merchant');app.set('expenseCNY','30');app.set('expenseMethod','Cash');app.click('saveExpense');await flush();
 let actual;app.w.ChinaReceipts.connect=()=>Promise.resolve();app.w.ChinaReceipts.upload=async id=>{actual=await store.get(id);throw new app.w.ChinaReceipts.ReceiptError('offline','Synthetic offline test');};
 app.w.document.querySelector(`[data-retry-receipt="${expense.id}"]`).click();await flush();assert.ok(actual);
 if(reserved){assert.equal(actual.filename,initial.filename);assert.equal(actual.driveFileId,'reserved_receipt_001');}else assert.ok(actual.filename.includes('_Updated-merchant_CNY30.00_Cash_'));
 assert.equal(app.expenses().length,1);assert.equal(app.expenses()[0].receiptStatus,'pending');assert.equal(await actual.blob.text(),'test pdf');
 }finally{app.close();}}
});
test('local cleanup failure does not turn a verified Drive receipt into a failed upload',async()=>{
 const app=start();try{fill(app);attach(app,new File(['test pdf'],'receipt.pdf',{type:'application/pdf'}));app.click('saveExpense');await flush();const [expense]=app.expenses(),store=app.w.ChinaReceipts.store();
 app.w.ChinaReceipts.connect=()=>Promise.resolve();app.w.ChinaReceipts.upload=async()=>({id:'verified_test_receipt',verified:true,name:'mock.pdf'});store.remove=async()=>{throw Error('Synthetic IndexedDB cleanup failure');};
 app.w.document.querySelector(`[data-retry-receipt="${expense.id}"]`).click();await flush();const saved=app.expenses()[0];assert.equal(saved.receiptStatus,'uploaded');assert.equal(saved.receipt.verified,true);assert.match(saved.receiptError,/Local queued copy/);assert.match(app.el('expenseReceiptStatus').textContent,/Receipt verified in Drive/);assert.ok(await store.get(expense.id));assert.equal(app.w.document.querySelectorAll('[data-retry-receipt]').length,0);
 }finally{app.close();}
});

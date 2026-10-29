const {test}=require('node:test'),assert=require('node:assert/strict');
const {IDBFactory}=require('fake-indexeddb');
const {create:storeFactory}=require('../receipt-store');
const {create,validate,mimeFor,settings,SCOPE}=require('../receipts');
const folder={id:'folder_test_0001',name:'China Trip 2027 - Receipts',mimeType:'application/vnd.google-apps.folder',shared:false,capabilities:{canAddChildren:true}};
const auth={access_token:'TEST_ONLY_RECEIPT_TOKEN',scope:SCOPE,expires_in:3600};
const file=new File(['synthetic receipt'],'sample.pdf',{type:'application/pdf'});
const response=(body,status=200)=>({status,ok:status<400,json:async()=>body});
async function setup(overrides={}){const queue=storeFactory(new IDBFactory());await queue.put({expenseId:'expense-001',blob:file,originalName:file.name,filename:'synthetic'});const calls=[];let uploaded=false;const metadata={id:'drive_test_0001',name:'synthetic.pdf',mimeType:'application/pdf',parents:[folder.id],shared:false,size:String(file.size),appProperties:{expenseId:'expense-001'}};const fetcher=async(u,o)=>{calls.push([u,o]);if(u.includes('/files/'+folder.id))return response(folder);if(u.includes('generateIds'))return response({ids:[metadata.id]});if(u.includes('/upload/')){uploaded=true;return response({id:metadata.id});}if(u.includes('/files/'+metadata.id))return response(metadata,uploaded?200:404);throw Error('Unexpected URL');};const client=create({queue,getFolder:()=>folder,online:()=>true,fetcher,...overrides});client.authorize(auth);return {client,queue,calls,metadata};}
test('outbox preserves real file bytes across store instances and ID reservation is atomic',async()=>{const db=new IDBFactory(),one=storeFactory(db),two=storeFactory(db);await one.put({expenseId:'x',blob:file});const row=await two.get('x');assert.equal(await row.blob.text(),await file.text());const results=await Promise.all([one.reserve('x','first'),two.reserve('x','second')]);assert.ok(results.every(r=>r.driveFileId===results[0].driveFileId));await one.remove('x');assert.equal(await two.get('x'),null);});
test('photo, screenshot, HEIC and PDF validation with size and type rejection',()=>{for(const [name,type] of [['p.jpg','image/jpeg'],['s.png','image/png'],['p.heic','image/heic'],['p.heif','image/heif'],['p.webp','image/webp'],['p.pdf','application/pdf'],['p.PDF','']]){const f=new File(['x'],name,{type});assert.doesNotThrow(()=>validate(f));assert.ok(mimeFor(f));}assert.throws(()=>validate(new File(['x'],'x.html',{type:'text/html'})));assert.throws(()=>validate(new File([],'x.pdf',{type:'application/pdf'})));assert.throws(()=>validate({type:'application/pdf',size:6*1024*1024}));});
test('reject mismatched OAuth project number before opening Picker',()=>{const key='AIza'+'x'.repeat(30);assert.throws(()=>settings(key,'123456','654321-test.apps.googleusercontent.com'));assert.deepEqual(settings(key,'123456','123456-test.apps.googleusercontent.com'),{key,number:'123456'});});
test('upload uses existing private folder, reserved ID, bearer header, and verified GET',async()=>{const {client,queue,calls}=await setup();const receipt=await client.upload('expense-001');assert.equal(receipt.verified,true);assert.ok(receipt.url.startsWith('https://drive.google.com/file/d/'));const posts=calls.filter(([u,o])=>o.method==='POST');assert.equal(posts.length,1);const body=await posts[0][1].body.text();assert.ok(body.includes('"id":"drive_test_0001"'));assert.ok(body.includes('"parents":["folder_test_0001"]'));assert.ok(!body.includes(auth.access_token));for(const [url,opts] of calls){assert.ok(url.startsWith('https://www.googleapis.com/'));assert.ok(!url.includes(auth.access_token));assert.equal(opts.headers.Authorization,'Bearer '+auth.access_token);}assert.equal((await queue.get('expense-001')).driveFileId,'drive_test_0001');assert.equal(await (await queue.get('expense-001')).blob.text(),await file.text());});
test('coalesces double click and retries success without uploading a second file',async()=>{const {client,calls}=await setup();const a=client.upload('expense-001'),b=client.upload('expense-001');assert.equal(a,b);await a;await client.upload('expense-001');assert.equal(calls.filter(([,o])=>o.method==='POST').length,1);});
test('ambiguous network result recovers the same remote ID on retry',async()=>{let remote=false,posts=0;const queue=storeFactory(new IDBFactory());await queue.put({expenseId:'expense-001',blob:file});const meta={id:'drive_test_0001',name:'test.pdf',parents:[folder.id],size:String(file.size),shared:false,appProperties:{expenseId:'expense-001'}};const client=create({queue,getFolder:()=>folder,online:()=>true,fetcher:async(u,o)=>{if(u.includes(folder.id))return response(folder);if(u.includes('generateIds'))return response({ids:[meta.id]});if(o.method==='POST'){posts++;remote=true;throw Error('lost response');}return response(meta,remote?200:404);}});client.authorize(auth);await assert.rejects(client.upload('expense-001'),e=>e.code==='network');assert.equal((await queue.get('expense-001')).driveFileId,meta.id);assert.equal((await client.upload('expense-001')).verified,true);assert.equal(posts,1);});
test('offline and expired access preserve receipt without any fetch',async()=>{let fetched=0,t=1000000;const {queue}=await setup();const client=create({queue,getFolder:()=>folder,online:()=>false,now:()=>t,fetcher:async()=>{fetched++;}});client.authorize(auth);await assert.rejects(client.upload('expense-001'),e=>e.code==='offline');assert.ok(await queue.get('expense-001'));assert.equal(fetched,0);t+=3600000;assert.equal(client.authorized(),false);});
test('shared/wrong folder and malformed remote metadata are rejected',async()=>{for(const changed of [{...folder,shared:true},{...folder,name:'Wrong folder'}]){const {client,queue}=await setup({fetcher:async()=>response(changed)});await assert.rejects(client.upload('expense-001'),e=>e.code==='folder');assert.ok(await queue.get('expense-001'));}const {client}=await setup({fetcher:async(u,o)=>u.includes(folder.id)?response(folder):u.includes('generateIds')?response({ids:['drive_test_0001']}):response({id:'drive_test_0001',parents:['wrong'],size:'1'})});await assert.rejects(client.upload('expense-001'),e=>e.code==='verify');});
test('Drive permission denial and 401 expiration keep the outbox',async()=>{for(const status of [401,403,429,503]){const {client,queue}=await setup({fetcher:async()=>response({},status)});await assert.rejects(client.upload('expense-001'));assert.ok(await queue.get('expense-001'));if(status===401)assert.equal(client.authorized(),false);}});
test('denied scope never stores a usable session',()=>{const client=create({getFolder:()=>folder});assert.throws(()=>client.authorize({...auth,scope:'https://www.googleapis.com/auth/drive.readonly'}));assert.equal(client.authorized(),false);});

test('disconnect during receipt readback decoding rejects the stale result and preserves retry identity',async()=>{
 let release,decoding;const entered=new Promise(resolve=>decoding=resolve),held=new Promise(resolve=>release=resolve);
 const metadata={id:'drive_test_0001',name:'synthetic.pdf',parents:[folder.id],shared:false,size:String(file.size),appProperties:{expenseId:'expense-001'}};
 const {client,queue}=await setup({fetcher:async u=>u.includes('/files/'+folder.id)?response(folder):u.includes('generateIds')?response({ids:[metadata.id]}):{status:200,ok:true,json:async()=>{decoding();await held;return metadata;}}});
 const upload=client.upload('expense-001');await entered;client.disconnect();release();
 await assert.rejects(upload,e=>e.code==='auth');
 const pending=await queue.get('expense-001');assert.equal(pending.driveFileId,metadata.id);assert.equal(await pending.blob.text(),await file.text());
});

test('receipt filename includes date, city, merchant, CNY, payment method and the saved expense ID',()=>{
 const {filenameForExpense,safeFilename}=require('../receipts');
 const expense={id:'94a23b10-26df-4daa-9ba2-40fe8729e117',date:'2027-01-12',city:'Shanghai',desc:'Test Tea Shop',amountCNY:28.5,method:'GCash Global Pay via Alipay+'};
 const name=filenameForExpense(expense,file);
 assert.equal(name,'2027-01-12_Shanghai_Test-Tea-Shop_CNY28.50_GCash-AlipayPlus_94a23b10-26df-4daa-9ba2-40fe8729e117.pdf');
 assert.equal(safeFilename(file,name),name,'upload must not append a second extension');
 assert.equal(filenameForExpense(expense,file),name,'retry must generate the same name');
 assert.notEqual(filenameForExpense({...expense,id:'different-expense-id'},file),name);
});
test('all supported methods and legacy payment labels get readable filename tags',()=>{
 const {filenameForExpense}=require('../receipts');
 for(const [method,tag] of [['GCash via Alipay+','GCash-AlipayPlus'],['Alipay using BDO Visa Signature virtual card','Alipay-BDO-Visa-Virtual'],['Alipay + BDO Visa Virtual','Alipay-BDO-Visa-Virtual'],['BDO UnionPay Diamond','BDO-UnionPay-Diamond'],['WeChat Pay using linked Visa','WeChat-Visa'],['Cash','Cash']]){
  const name=filenameForExpense({id:'unique-expense',date:'2027-01-12',city:'Test city',desc:'Test shop',amountCNY:12,method},file);
  assert.ok(name.includes('_'+tag+'_'),name);
 }
});
test('long Chinese and unsafe merchant text stays byte-bounded without removing the unique suffix',()=>{
 const {filenameForExpense}=require('../receipts'),id='c491535c-8b7a-4cdd-85b8-f36ccb8c00c1';
 const name=filenameForExpense({id,date:'2027-01-12',city:'上海'.repeat(80),desc:'../\\'+('测试商店😀 / :\n'.repeat(60)),amountCNY:123.45,method:'Alipay using BDO Visa Signature virtual card'},file);
 assert.ok(Buffer.byteLength(name,'utf8')<=224);
 assert.ok(name.endsWith('_'+id+'.pdf'));
 assert.ok(!/[\/\\:\n\r\u0000]/.test(name));
 assert.ok(!name.includes('..'));
 assert.ok(name.includes('测试商店'));
});
test('missing CNY remains explicitly unknown and existing image/PDF extensions are supported',()=>{
 const {filenameForExpense}=require('../receipts');
 for(const cny of [undefined,null,0,''])assert.ok(filenameForExpense({id:'stable-id',date:'2027-01-12',amountCNY:cny},file).includes('_CNY-NA_'));
 for(const [name,type,extension] of [['x.png','image/png','png'],['x.jpg','image/jpeg','jpg'],['x.heic','image/heic','heic'],['x.pdf','application/pdf','pdf']])assert.ok(filenameForExpense({id:'stable-id',date:'2027-01-12'},new File(['x'],name,{type})).endsWith('.'+extension));
 assert.throws(()=>filenameForExpense({date:'2027-01-12'},file));
});
test('queued names can change before reservation, but never after a Drive ID is reserved',async()=>{
 const queue=storeFactory(new IDBFactory());await queue.put({expenseId:'saved',blob:file,filename:'old-name'});
 assert.equal((await queue.renameIfUnreserved('saved','descriptive.pdf')).filename,'descriptive.pdf');
 await queue.reserve('saved','reserved_drive_001');
 const row=await queue.renameIfUnreserved('saved','changed-after-edit.pdf');
 assert.equal(row.filename,'descriptive.pdf');assert.equal(row.driveFileId,'reserved_drive_001');assert.equal(await row.blob.text(),await file.text());
});
test('descriptive filenames are used in upload metadata with one POST across retries',async()=>{
 const {filenameForExpense}=require('../receipts');
 const {client,queue,calls}=await setup();
 const expected=filenameForExpense({id:'expense-001',date:'2027-01-12',city:'Shanghai',desc:'Test merchant',amountCNY:50,method:'Cash'},file);
 await queue.renameIfUnreserved('expense-001',expected);
 await client.upload('expense-001');await client.upload('expense-001');
 const posts=calls.filter(([,opts])=>opts.method==='POST');assert.equal(posts.length,1);
 assert.ok((await posts[0][1].body.text()).includes('"name":"'+expected+'"'));
 assert.equal((await queue.get('expense-001')).filename,expected);
});

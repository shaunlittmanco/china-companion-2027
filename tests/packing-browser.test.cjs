const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),P=require('../packing'),S=require('../packing-sync');
test('offline edit after a successful packing sync is labeled pending even after sign-out',()=>{
 const row={'Record Type':'ITEM','Item / Task':'Fictional QA scarf',Bag:'Unassigned',Category:'QA',Quantity:1,Status:'Active','Item ID':'qa-scarf','Record ID':'qa-record'};
 const records=S.parse([[],[],S.HEADERS,S.HEADERS.map(h=>row[h]??'')]);
 let data=S.ingest({trip:{},hotels:[],smartState:{packing:{}}},records);
 data={...data,smartState:{...data.smartState,packing:{...data.smartState.packing,sync:{...data.smartState.packing.sync,lastSuccess:'2026-10-30T00:00:00.000Z'}}}};
 const before=JSON.stringify(data.smartState.packing.sessions||{});
 data={...data,smartState:S.queued(data,{...data.smartState,packing:P.updateItem(data,'qa-scarf',{notes:'Retain offline proposal'})})};
 assert.equal(Object.keys(P.state(data).sync.pending).length,1);
 assert.equal(JSON.stringify(data.smartState.packing.sessions||{}),before);
 const sandbox={module:{exports:{}},require:()=>P,globalThis:null};sandbox.globalThis=sandbox;
 vm.runInNewContext(fs.readFileSync('packing-sync.js','utf8'),sandbox);
 const panel=sandbox.module.exports.panel(data);
 assert.match(panel,/Unified Packing Auto Sync · Needs Sign-in · Pending Sync/);
 assert.match(panel,/1 pending/);
 assert.doesNotMatch(panel,/Packing records refreshed\./,'Old successful sync must not describe newer offline edit.');
 assert.equal(P.state(data).sync.pending['qa-record'].draft.Notes,'Retain offline proposal');
});

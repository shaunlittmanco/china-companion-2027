/* Private, device-local receipt outbox. No OAuth credentials are stored here. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ChinaReceiptStore=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
'use strict';
function create(indexedDB=globalThis.indexedDB){
 let opened;
 function open(){if(!indexedDB)return Promise.reject(Error('Receipt storage unavailable. Keep the original photo or PDF.'));if(!opened)opened=new Promise((resolve,reject)=>{const req=indexedDB.open('chinaCompanionReceiptOutbox',1);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('receipts'))req.result.createObjectStore('receipts',{keyPath:'expenseId'});};req.onsuccess=()=>{req.result.onversionchange=()=>{req.result.close();opened=null;};resolve(req.result);};req.onerror=()=>{opened=null;reject(Error('Receipt storage could not open. Keep the original file.'));};req.onblocked=()=>{opened=null;reject(Error('Close other app tabs to update receipt storage.'));};});return opened;}
 async function transaction(mode,run){const db=await open();return new Promise((resolve,reject)=>{const tx=db.transaction('receipts',mode),store=tx.objectStore('receipts');let value;tx.oncomplete=()=>resolve(value);tx.onerror=tx.onabort=()=>reject(Error('Receipt could not be saved on this device. Keep the original file.'));run(store,v=>value=v);});}
 const get=id=>transaction('readonly',(s,done)=>{const r=s.get(id);r.onsuccess=()=>done(r.result||null);});
 const all=()=>transaction('readonly',(s,done)=>{const r=s.getAll();r.onsuccess=()=>done(r.result||[]);});
 const put=row=>transaction('readwrite',(s,done)=>{s.put(row);done(row);});
 const remove=id=>transaction('readwrite',(s)=>s.delete(id));
 const update=(id,patch)=>transaction('readwrite',(s,done)=>{const r=s.get(id);r.onsuccess=()=>{if(!r.result){done(null);return;}const row={...r.result,...patch,expenseId:id};s.put(row);done(row);};});
 const reserve=(id,fileId)=>transaction('readwrite',(s,done)=>{const r=s.get(id);r.onsuccess=()=>{if(!r.result){done(null);return;}const row={...r.result,driveFileId:r.result.driveFileId||fileId};s.put(row);done(row);};});
 const putAll=rows=>transaction('readwrite',s=>{for(const row of rows)s.put(row);});
 // Once a Drive ID is reserved, retain its original name for uncertain-upload recovery.
 const renameIfUnreserved=(id,filename)=>transaction('readwrite',(s,done)=>{const r=s.get(id);r.onsuccess=()=>{const row=r.result;if(!row){done(null);return;}if(!row.driveFileId){row.filename=filename;s.put(row);}done(row);};});
 const clear=()=>transaction('readwrite',s=>s.clear());
 return {get,all,put,remove,update,reserve,clear,putAll,renameIfUnreserved};
}
return {create};
});

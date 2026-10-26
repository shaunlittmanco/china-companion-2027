/* User-authorized Drive file access. Tokens stay in closure memory; files upload directly to Google. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ChinaReceipts=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
'use strict';
const SCOPE='https://www.googleapis.com/auth/drive.file',API_KEY='chinaCompanionPickerApiKeyV1',PROJECT_NUMBER='chinaCompanionProjectNumberV1',FOLDER='chinaCompanionReceiptsFolderV1',EXPECTED_NAME='China Trip 2027 - Receipts';
const text=v=>String(v??'').trim(),validId=id=>/^[\w-]{10,}$/.test(text(id));
class ReceiptError extends Error{constructor(code,message){super(message);this.code=code;}}
function mimeFor(file){if(['image/jpeg','image/png','image/webp','image/heic','image/heif','application/pdf'].includes(file.type))return file.type;return ({jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp',heic:'image/heic',heif:'image/heif',pdf:'application/pdf'})[text(file.name).split('.').pop().toLowerCase()]||'';}
function validate(file){if(!file||!mimeFor(file))throw new ReceiptError('file','Choose a JPG, PNG, WEBP, HEIC/HEIF image or PDF.');if(file.size<=0||file.size>5*1024*1024)throw new ReceiptError('file','Receipt must be between 1 byte and 5 MB. Compress large photos first.');}
function filenamePart(value,limit,fallback=''){
 const clean=text(value).normalize('NFKC').replace(/[^\p{L}\p{N}._-]+/gu,'-').replace(/\.{2,}/g,'-').replace(/[-_]{2,}/g,'-').replace(/^[._-]+|[._-]+$/g,'');
 let result='',bytes=0;
 for(const character of clean){const size=new TextEncoder().encode(character).length;if(bytes+size>limit)break;result+=character;bytes+=size;}
 return result.replace(/[._-]+$/g,'')||fallback;
}
function safeFilename(file,prefix){
 validate(file);
 const ext=({'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/heic':'heic','image/heif':'heif','application/pdf':'pdf'})[mimeFor(file)];
 const stem=text(prefix).replace(new RegExp('\\.'+ext+'$','i'),'');
 return filenamePart(stem,220,'receipt')+'.'+ext;
}
function paymentFilenameTag(method){
 const value=text(method);
 if(/gcash/i.test(value))return 'GCash-AlipayPlus';
 if(/wechat|weixin/i.test(value))return 'WeChat-Visa';
 if(/unionpay/i.test(value))return 'BDO-UnionPay-Diamond';
 if(/alipay/i.test(value))return 'Alipay-BDO-Visa-Virtual';
 if(/cash/i.test(value))return 'Cash';
 return filenamePart(value,28,'Other');
}
function filenameForExpense(expense,file){
 const id=filenamePart(expense.id,48);
 if(!id)throw new ReceiptError('file','Save the expense before naming its receipt.');
 const candidate=text(expense.localDateTime||expense.date).slice(0,10);
 const date=/^\d{4}-\d{2}-\d{2}$/.test(candidate)?candidate:'undated';
 const cny=Number(expense.amountCNY);
 const amount=Number.isFinite(cny)&&cny>0?'CNY'+cny.toFixed(2):'CNY-NA';
 const parts=[date,filenamePart(expense.city,24,'City-NA'),filenamePart(expense.desc,64,'Merchant-NA'),filenamePart(amount,28),paymentFilenameTag(expense.method),id];
 return safeFilename(file,parts.join('_'));
}
function settings(key,number,clientId){if(!/^AIza[A-Za-z0-9_-]{20,}$/.test(key))throw new ReceiptError('setup','Enter your restricted Google Picker API key in More.');if(!/^\d{5,25}$/.test(number))throw new ReceiptError('setup','Enter the numeric Cloud project number in More.');const prefix=clientId.match(/^(\d+)-[\w-]+\.apps\.googleusercontent\.com$/)?.[1];if(!prefix||prefix!==number)throw new ReceiptError('setup','Project number must match the project number at the start of your OAuth web client ID.');return {key,number};}
function create({fetcher=fetch,now=()=>Date.now(),onState=()=>{},getFolder,queue,revoke,online=()=>navigator.onLine,locks=globalThis.navigator?.locks}={}){
 let token='',expires=0;const active=new Map();let epoch=0;
 const authorized=()=>!!token&&now()<expires-60000;
 function authorize(r){if(!r.access_token||!text(r.scope).split(/\s+/).includes(SCOPE))throw new ReceiptError('auth','Google Drive file permission was not granted. Expense and receipt remain on this device.');token=r.access_token;expires=now()+1000*Math.max(0,Number(r.expires_in)||0);epoch++;}
 function disconnect(){token='';expires=0;epoch++;onState('Drive disconnected. Local expenses and receipts are kept.');}
 async function request(path,init={},allowMissing=false){if(!authorized())throw new ReceiptError('auth','Connect receipt uploads to Google Drive, then tap Retry.');const session=epoch,controller=new AbortController(),timer=setTimeout(()=>controller.abort(),30000);try{const r=await fetcher('https://www.googleapis.com/'+path,{...init,headers:{...init.headers,Authorization:'Bearer '+token},credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',signal:controller.signal});if(session!==epoch)throw new ReceiptError('auth','Drive session changed. Retry after connecting.');if(r.status===401){disconnect();throw new ReceiptError('auth','Drive authorization expired. Connect receipt uploads again.');}if(r.status===403)throw new ReceiptError('permission','Drive access denied. Check drive.file consent, selected folder, APIs, and account.');if(r.status===404&&allowMissing)return null;if(!r.ok)throw new ReceiptError(r.status===409?'conflict':'http','Drive returned HTTP '+r.status+'. Receipt kept for retry.');return await r.json();}catch(e){if(e instanceof ReceiptError)throw e;throw new ReceiptError('network','Upload could not be confirmed. Receipt is kept; Retry checks Drive before uploading again.');}finally{clearTimeout(timer);}}
 async function verifyFolder(id){const f=await request('drive/v3/files/'+encodeURIComponent(id)+'?fields=id,name,mimeType,shared,trashed,capabilities(canAddChildren)');if(f.id!==id||f.name!==EXPECTED_NAME||f.mimeType!=='application/vnd.google-apps.folder'||f.trashed||f.shared!==false||f.capabilities?.canAddChildren===false)throw new ReceiptError('folder','Select the existing private China Trip 2027 - Receipts folder. Shared, deleted, or read-only folders are not accepted.');return f;}
 function verified(f,row,folder){if(f.id!==row.driveFileId||!f.parents?.includes(folder.id)||f.trashed||f.shared!==false||Number(f.size)!==row.blob.size||f.appProperties?.expenseId!==row.expenseId)throw new ReceiptError('verify','Drive file verification failed. Keep the local receipt and check your selected folder before retrying.');return {id:f.id,name:f.name,url:'https://drive.google.com/file/d/'+encodeURIComponent(f.id)+'/view',uploadedAt:new Date(now()).toISOString(),verified:true};}
 async function perform(expenseId){if(!online())throw new ReceiptError('offline','Offline. Expense saved; receipt is pending on this device.');if(!authorized())throw new ReceiptError('auth','Expense saved. Connect receipt uploads, then Retry.');let row=await queue.get(expenseId);if(!row)throw new ReceiptError('file','Receipt file is not stored on this device. Edit the expense to attach it again.');validate(row.blob);const f=getFolder();if(!f||!validId(f.id)||f.name!==EXPECTED_NAME)throw new ReceiptError('folder','Choose the existing receipts folder in More first. Expense and file remain saved.');await verifyFolder(f.id);
  if(!row.driveFileId){const ids=await request('drive/v3/files/generateIds?count=1&space=drive&type=files');if(!validId(ids.ids?.[0]))throw new ReceiptError('verify','Drive did not allocate a receipt ID. Retry later.');row=await queue.reserve(expenseId,ids.ids[0]);if(!row)throw new ReceiptError('file','Receipt was removed before uploading.');}
  const path='drive/v3/files/'+encodeURIComponent(row.driveFileId)+'?fields=id,name,mimeType,parents,size,trashed,shared,appProperties,webViewLink';
  const existing=await request(path,{},true);if(existing)return verified(existing,row,f);
  const boundary='chinareceipt_'+row.driveFileId;const meta={id:row.driveFileId,name:safeFilename(row.blob,row.filename||expenseId),mimeType:mimeFor(row.blob),parents:[f.id],appProperties:{expenseId}};
  const payload=new Blob(['--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n',JSON.stringify(meta),'\r\n--'+boundary+'\r\nContent-Type: '+mimeFor(row.blob)+'\r\n\r\n',row.blob,'\r\n--'+boundary+'--\r\n'],{type:'multipart/related; boundary='+boundary});
  try{await request('upload/drive/v3/files?uploadType=multipart&fields=id',{method:'POST',headers:{'Content-Type':'multipart/related; boundary='+boundary},body:payload});}catch(e){if(e.code!=='conflict')throw e;}
  const uploaded=await request(path);return verified(uploaded,row,f);
 }
 function upload(expenseId){if(active.has(expenseId))return active.get(expenseId);const job=(locks?locks.request('china-receipt-'+expenseId,()=>perform(expenseId)):perform(expenseId)).finally(()=>active.delete(expenseId));active.set(expenseId,job);return job;}
 return {authorize,authorized,request,verifyFolder,upload,disconnect,revoke(){const t=token;disconnect();if(t&&revoke)revoke(t);}};
}
let client,queue,pickerPromise,connectionPromise,folderBusy=false;
const byId=id=>document.getElementById(id),state=s=>{const el=byId('receiptDriveStatus');if(el)el.textContent=s;};
function folder(){try{const f=JSON.parse(localStorage.getItem(FOLDER));return validId(f?.id)&&f.name===EXPECTED_NAME?f:null;}catch{return null;}}
function getClientId(){return text(byId('googleClientId')?.value||localStorage.getItem('chinaCompanionGoogleClientIdV1'));}
function saveSettings(){const c=settings(text(byId('receiptApiKey')?.value),text(byId('receiptProjectNumber')?.value),getClientId());localStorage.setItem(API_KEY,c.key);localStorage.setItem(PROJECT_NUMBER,c.number);localStorage.setItem('chinaCompanionGoogleClientIdV1',getClientId());return c;}
// Must be called synchronously from a click, before IndexedDB, hashing or other awaits (Safari popup rule).
function beginConnect(){if(client.authorized())return Promise.resolve(true);if(!navigator.onLine)return Promise.reject(new ReceiptError('offline','Offline. Your expense and receipt remain saved.'));if(!window.google?.accounts?.oauth2)return Promise.reject(new ReceiptError('auth','Google sign-in is unavailable. Check internet and reload when online.'));const id=getClientId();if(!/^\d+-[\w-]+\.apps\.googleusercontent\.com$/.test(id))return Promise.reject(new ReceiptError('setup','Enter the existing OAuth web client ID in More.'));try{localStorage.setItem('chinaCompanionGoogleClientIdV1',id);}catch{}return new Promise((resolve,reject)=>{let timer;const fail=message=>{clearTimeout(timer);reject(new ReceiptError('auth',message));};timer=setTimeout(()=>fail('Google sign-in did not finish. Tap Connect again.'),120000);try{window.google.accounts.oauth2.initTokenClient({client_id:id,scope:SCOPE,include_granted_scopes:false,callback:r=>{clearTimeout(timer);try{client.authorize(r);state('Receipt uploads connected. Choose the existing folder or retry a pending receipt.');resolve(true);}catch(e){reject(e);}},error_callback:()=>fail('Google sign-in was closed or blocked. Allow popups for this app, then tap Connect again.')}).requestAccessToken({prompt:''});}catch{fail('Could not start Google Drive sign-in. Check your client configuration.');}});}
function connect(){if(connectionPromise)return connectionPromise;connectionPromise=beginConnect().finally(()=>{connectionPromise=null;});return connectionPromise;}
function loadPicker(){if(window.google?.picker)return Promise.resolve();if(pickerPromise)return pickerPromise;pickerPromise=new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new ReceiptError('picker','Picker timed out. Check connectivity and key restrictions.')),20000);const fail=()=>{clearTimeout(timer);reject(new ReceiptError('picker','Picker unavailable. Check that the key permits this site and docs.google.com, and enables Picker API.'));};const go=()=>{try{window.gapi.load('picker',{callback:()=>{clearTimeout(timer);window.google?.picker?resolve():fail();},onerror:fail,timeout:15000,ontimeout:fail});}catch{fail();}};if(window.gapi)go();else{const script=document.createElement('script');script.src='https://apis.google.com/js/api.js';script.async=true;script.onload=go;script.onerror=fail;document.head.appendChild(script);}}).catch(e=>{pickerPromise=null;throw e;});return pickerPromise;}
async function chooseFolder(){if(folderBusy)return false;folderBusy=true;try{const {key,number}=saveSettings();await connect();await loadPicker();state('Select only the existing '+EXPECTED_NAME+' folder.');return await new Promise((resolve,reject)=>{let settled=false;const done=(value,error)=>{if(settled)return;settled=true;clearTimeout(timer);error?reject(error):resolve(value);};const timer=setTimeout(()=>done(false,new ReceiptError('picker','Folder selection timed out. Open it again when ready.')),180000);try{const pickerApi=window.google.picker;const view=new pickerApi.DocsView(pickerApi.ViewId.FOLDERS).setIncludeFolders(true).setSelectFolderEnabled(true).setMode(pickerApi.DocsViewMode.LIST).setQuery(EXPECTED_NAME);
 // OAuth token is supplied only to Picker and Google requests, never persisted.
 // The SDK requires the token here; keep it in this closure through withToken.
 withToken(token=>{const picker=new pickerApi.PickerBuilder().addView(view).setOAuthToken(token).setDeveloperKey(key).setAppId(number).setOrigin(window.location.origin).setCallback(async result=>{if(settled)return;const action=result[pickerApi.Response.ACTION];if(action===pickerApi.Action.CANCEL){state('Folder selection cancelled. Local data kept.');done(false);return;}if(action!==pickerApi.Action.PICKED)return;const id=text(result[pickerApi.Response.DOCUMENTS]?.[0]?.[pickerApi.Document.ID]);try{if(!validId(id))throw new ReceiptError('folder','Picker did not return a valid folder.');const f=await client.verifyFolder(id);localStorage.setItem(FOLDER,JSON.stringify({id:f.id,name:f.name}));state('Existing private receipts folder selected.');done(true);}catch(e){done(false,e);}}).build();picker.setVisible(true);});}catch(e){done(false,e);}});}catch(e){state(e.message);return false;}finally{folderBusy=false;}}
// Keep Picker token plumbing private to the module; not on any exported browser object.
let pickerToken='';function withToken(callback){if(!client.authorized())throw new ReceiptError('auth','Reconnect receipt uploads before opening Picker.');callback(pickerToken);}
function init(){queue=globalThis.ChinaReceiptStore.create();const core=create({queue,getFolder:folder,onState:state,revoke:t=>window.google?.accounts?.oauth2?.revoke(t,()=>{})});const grant=core.authorize;core.authorize=r=>{grant(r);pickerToken=r.access_token;};const off=core.disconnect;core.disconnect=()=>{pickerToken='';off();};client=core;try{byId('receiptApiKey').value=localStorage.getItem(API_KEY)||'';byId('receiptProjectNumber').value=localStorage.getItem(PROJECT_NUMBER)||'';state(folder()?'Existing receipts folder selected. Connect uploads when ready.':'Choose your existing private receipts folder to enable uploads.');}catch{state('Receipt settings are unavailable in this browser.');}byId('chooseReceiptFolder')?.addEventListener('click',chooseFolder);byId('connectReceiptDrive')?.addEventListener('click',()=>connect().catch(e=>state(e.message)));byId('disconnectReceiptDrive')?.addEventListener('click',()=>client.disconnect());}
return {init,chooseFolder,connect,upload:id=>client.upload(id),authorized:()=>!!client?.authorized(),store:()=>queue,disconnect:()=>client?.disconnect(),folder,validate,mimeFor,safeFilename,filenameForExpense,settings,create,SCOPE,ReceiptError};
});

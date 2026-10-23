/* China Companion receipts: explicit user-authorized Google Drive folder only.
   Tokens and receipt bytes remain in memory and are never sent to our static host. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ChinaReceipts=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
'use strict';
const SCOPE='https://www.googleapis.com/auth/drive.file';
const API_KEY='chinaCompanionPickerApiKeyV1';
const PROJECT_NUMBER='chinaCompanionProjectNumberV1';
const FOLDER='chinaCompanionReceiptsFolderV1';
const EXPECTED_NAME='China Trip 2027 - Receipts';
let accessToken='',expires=0,folderId='',folderName='',busy=false;
const text=v=>String(v??'').trim();
const byId=id=>document.getElementById(id);
const state=s=>{const el=byId('receiptDriveStatus');if(el)el.textContent=s};
const authorized=()=>!!accessToken&&Date.now()<expires-60000;
function saveSettings(){
 const key=text(byId('receiptApiKey')?.value),number=text(byId('receiptProjectNumber')?.value);
 if(!/^AIza[A-Za-z0-9_-]{20,}$/.test(key))throw new Error('Enter the Google Picker API key from your Cloud project.');
 if(!/^\d{5,25}$/.test(number))throw new Error('Enter the numeric Google Cloud project number (not the project ID).');
 localStorage.setItem(API_KEY,key);localStorage.setItem(PROJECT_NUMBER,number);
 return {key,number};
}
function folder(){
 const val=localStorage.getItem(FOLDER);
 if(!val)return null;
 try{const x=JSON.parse(val);if(/^[\w-]{10,}$/.test(x.id)&&x.name===EXPECTED_NAME)return x}catch{}
 return null;
}
function setFolder(f){
 folderId=f.id;folderName=f.name;
 localStorage.setItem(FOLDER,JSON.stringify({id:folderId,name:folderName}));
 state('Receipt folder selected: '+folderName+'. Attach an image/PDF in Wallet → Expense log.');
}
function loadPicker(){
 if(window.google?.picker)return Promise.resolve();
 return new Promise((resolve,reject)=>{
  const go=()=>{
   try{gapi.load('picker',{callback:()=>window.google?.picker?resolve():reject(new Error('Picker could not load.')),onerror:()=>reject(new Error('Picker service unavailable.')),timeout:15000,ontimeout:()=>reject(new Error('Picker timed out.'))});}
   catch{reject(new Error('Could not initialize Google Picker.'))}
  };
  if(window.gapi){go();return}
  const script=document.createElement('script');script.src='https://apis.google.com/js/api.js';script.async=true;
  script.onload=go;script.onerror=()=>reject(new Error('Google Picker script unavailable. Check connectivity.'));
  document.head.appendChild(script);
 });
}
function authorize(){
 return new Promise((resolve,reject)=>{
  if(authorized()){resolve();return}
  const clientId=text(byId('googleClientId')?.value||localStorage.getItem('chinaCompanionGoogleClientIdV1'));
  if(!/^[\w-]+\.apps\.googleusercontent\.com$/.test(clientId)){reject(new Error('Set up and connect your Google OAuth web client in More first.'));return}
  if(!window.google?.accounts?.oauth2){reject(new Error('Google sign-in is not available. Check internet and retry.'));return}
  try{
   google.accounts.oauth2.initTokenClient({
    client_id:clientId,scope:SCOPE,include_granted_scopes:false,
    callback:response=>{
     if(response.error||!response.access_token||!text(response.scope).split(/\s+/).includes(SCOPE)){
      reject(new Error('Drive file access was not granted. Choose Allow in Google consent.'));return
     }
     accessToken=response.access_token;expires=Date.now()+1000*Math.max(0,Number(response.expires_in)||0);resolve()
    },
    error_callback:()=>reject(new Error('Google authorization was dismissed or blocked.'))
   }).requestAccessToken({prompt:'consent'});
  }catch{reject(new Error('Unable to start Drive authorization.'))}
 });
}
async function request(url,init={}){
 const r=await fetch(url,{...init,headers:{...init.headers,Authorization:'Bearer '+accessToken},credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer'});
 if(r.status===401){accessToken='';expires=0;throw new Error('Drive authorization expired. Try again.')}
 if(r.status===403)throw new Error('Drive denied access. Enable Google Drive API, Picker API, and the drive.file scope in Cloud.');
 if(!r.ok){if(r.status===404)throw new Error('Folder access not granted. Choose the folder again using Google Picker.');throw new Error('Google Drive returned HTTP '+r.status);}
 return r;
}
async function chooseFolder(){
 if(busy)return false;
 busy=true;state('Connecting to Google Drive…');
 try{
  saveSettings();
  await authorize();
  await loadPicker();
  const {key,number}=saveSettings();
  state('Choose the folder named "'+EXPECTED_NAME+'" in Google Picker.');
  return await new Promise((resolve,reject)=>{
   try{
    const view=new google.picker.DocsView(google.picker.ViewId.FOLDERS)
     .setIncludeFolders(true).setSelectFolderEnabled(true)
     .setMode(google.picker.DocsViewMode.LIST).setQuery(EXPECTED_NAME);
    const picker=new google.picker.PickerBuilder().addView(view).setOAuthToken(accessToken)
     .setDeveloperKey(key).setAppId(number).setCallback(async data=>{
      const action=data[google.picker.Response.ACTION];
      if(action===google.picker.Action.CANCEL){state('Folder selection cancelled. No data changed.');resolve(false);return}
      if(action!==google.picker.Action.PICKED)return;
      const d=data[google.picker.Response.DOCUMENTS]?.[0]||{};
      const id=text(d[google.picker.Document.ID]);
      if(!/^[\w-]{10,}$/.test(id)){reject(new Error('Google Picker did not return a folder ID.'));return}
      try{
       const res=await request('https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(id)+'?fields=id,name,mimeType');
       const f=await res.json();
       if(f.mimeType!=='application/vnd.google-apps.folder'||f.name!==EXPECTED_NAME)throw new Error('Please select the exact "'+EXPECTED_NAME+'" folder.');
       setFolder(f);resolve(true);
      }catch(e){reject(e)}
     }).build();
    picker.setVisible(true);
   }catch(e){reject(e)}
  });
 }catch(e){state(e.message);return false}
 finally{busy=false}
}
function mimeFor(file){
 if(['image/jpeg','image/png','image/webp','image/heic','image/heif','application/pdf'].includes(file.type))return file.type;
 const ext=text(file.name).split('.').pop()?.toLowerCase();
 return ({jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp',heic:'image/heic',heif:'image/heif',pdf:'application/pdf'})[ext]||'';
}
function validate(file){
 if(!file)throw new Error('Choose a receipt image or PDF.');
 if(!mimeFor(file))throw new Error('Only JPG, PNG, WEBP, HEIC and PDF receipts are accepted.');
 if(file.size<=0||file.size>5*1024*1024)throw new Error('Receipt must be 5 MB or smaller. Compress large photos before uploading.');
}
function safeFilename(file,prefix){
 const ext=(text(file.name).split('.').pop()||'jpg').replace(/[^a-z0-9]/gi,'').slice(0,5);
 const stem=text(prefix).replace(/[^\p{L}\p{N}_-]/gu,'_').slice(0,85);
 return stem+'.'+ext;
}
async function upload(file,prefix){
 validate(file);
 if(!navigator.onLine)throw new Error('Offline. Receipt not uploaded. Remove the file to save expense locally, or retry online.');
 const f=folder();if(!f)throw new Error('Choose the Google Drive receipts folder in More → Settings first.');
 if(busy)throw new Error('Another Drive operation is still in progress.');
 busy=true;state('Uploading receipt to your private Drive folder…');
 try{
  await authorize();
  const boundary='chinareceipt_'+Date.now().toString(36);
  const meta={name:safeFilename(file,prefix),mimeType:mimeFor(file),parents:[f.id]};
  const payload=new Blob(['--'+boundary+'\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n',
   JSON.stringify(meta),'\r\n--'+boundary+'\r\nContent-Type: '+mimeFor(file)+'\r\n\r\n',
   file,'\r\n--'+boundary+'--\r\n'],{type:'multipart/related; boundary='+boundary});
  const response=await request('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,parents,webViewLink',
   {method:'POST',headers:{'Content-Type':'multipart/related; boundary='+boundary},body:payload});
  const uploaded=await response.json();
  if(!/^[\w-]{10,}$/.test(text(uploaded.id))||!uploaded.parents?.includes(f.id))throw new Error('Drive returned an unexpected upload response. Check your folder before retrying to avoid a duplicate.');
  const receipt={id:uploaded.id,name:uploaded.name||meta.name,url:'https://drive.google.com/file/d/'+encodeURIComponent(uploaded.id)+'/view',uploadedAt:new Date().toISOString()};
  state('Receipt uploaded successfully to "'+EXPECTED_NAME+'".');
  return receipt;
 }catch(e){state(e.message);throw e}
 finally{busy=false}
}
function init(){
 try{
  const key=localStorage.getItem(API_KEY)||'',num=localStorage.getItem(PROJECT_NUMBER)||'',f=folder();
  if(byId('receiptApiKey'))byId('receiptApiKey').value=key;
  if(byId('receiptProjectNumber'))byId('receiptProjectNumber').value=num;
  if(f){folderId=f.id;folderName=f.name;state('Selected folder: '+f.name+'. Drive authorization may be required when uploading.')}
  else state('Setup needed: enable Google Drive and Picker APIs; enter key and project number; choose your receipts folder.');
 }catch{state('Drive receipt configuration is unavailable on this browser.')}
 byId('chooseReceiptFolder')?.addEventListener('click',chooseFolder);
}
return {init,chooseFolder,upload,validate,folder,mimeFor,SCOPE};
});
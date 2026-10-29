/* Public daily central-bank reference only. Never represents a bank/GCash checkout FX quote. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ChinaFX=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
'use strict';
const KEY='chinaCompanionCnyPhpReferenceV1';
const SOURCE='https://api.frankfurter.dev/v2/rate/CNY/PHP';
const METHODS=[
 {id:'gcash',label:'GCash Global Pay via Alipay+',issuer:0,wallet:false,detail:'Primary. GCash uses its own checkout exchange rate; 0% separately charged service fee.'},
 {id:'alipay-physical',label:'Alipay + BDO Visa Signature (Physical)',issuer:1.70,wallet:true,detail:'Physical Visa linked to Alipay. Visa/BDO posting rate plus bank fee and applicable 3% wallet fee.'},
 {id:'alipay-virtual',label:'Alipay + BDO Visa Signature (Virtual)',issuer:1.70,wallet:true,detail:'Virtual Visa linked to Alipay. Separate payment instrument; same published BDO Visa bank rate.'},
 {id:'visa-direct',label:'BDO Visa Signature (Direct card)',issuer:1.70,wallet:false,detail:'Direct card merchant payment; Visa/BDO posting conversion and bank fee.'},
 {id:'wechat-visa',label:'WeChat Pay + linked BDO Visa',issuer:1.70,wallet:true,detail:'WeChat linked card; confirm selected Visa and any introductory waiver at checkout.'},
 {id:'unionpay-direct',label:'BDO UnionPay Diamond (Direct card)',issuer:1.65,wallet:false,detail:'Backup direct card terminal; UnionPay network and BDO conversion.'},
 {id:'unionpay-alipay',label:'Alipay + BDO UnionPay Diamond (if supported)',issuer:1.65,wallet:true,conditional:true,detail:'Only if linked and accepted; January 2027 waiver not confirmed.'},
 {id:'unionpay-wechat',label:'WeChat Pay + BDO UnionPay Diamond (if supported)',issuer:1.65,wallet:true,conditional:true,detail:'Only if linked and accepted; January 2027 waiver not confirmed.'},
 {id:'didi-alipay',label:'DiDi paid through Alipay + BDO Visa',issuer:1.70,wallet:true,conditional:true,detail:'Estimated only; DiDi checkout payment channel and waiver control actual fees.'},
 {id:'didi-wechat',label:'DiDi paid through WeChat + BDO Visa',issuer:1.70,wallet:true,conditional:true,detail:'Estimated only; verify actual DiDi payment method and charged amount.'},
 {id:'cash',label:'RMB Cash / money changer',issuer:0,wallet:false,detail:'Use the exchange rate actually obtained when buying RMB, including any changer spread.'}
];
const method=id=>METHODS.find(m=>m.id===id)||METHODS[0];
const fees=(id,amount)=>{const m=method(id),cny=Number(amount)||0;return {issuer:m.issuer,platform:m.wallet&&cny>200?3:0,conditional:!!m.conditional,description:m.detail};};
const safe=v=>v&&Number.isFinite(Number(v.rate))&&Number(v.rate)>0&&/^\d{4}-\d{2}-\d{2}$/.test(v.date||'')?{rate:Number(v.rate),date:v.date,source:SOURCE,savedAt:v.savedAt||0}:null;
function cached(store){try{return safe(JSON.parse(store?.getItem(KEY)||'null'));}catch{return null;}}
function buildUrl(date=''){return SOURCE+(date?'?date='+encodeURIComponent(date):'');}
async function refresh({date='',store=typeof localStorage!=='undefined'?localStorage:null,fetcher=typeof fetch!=='undefined'?fetch:null,timeout=9000}={}){
 if(date&&!/^\d{4}-\d{2}-\d{2}$/.test(date))throw Error('Invalid reference date');
 if(!fetcher)throw Error('No FX reference provider available');
 const controller=typeof AbortController!=='undefined'?new AbortController():null;
 const t=controller?setTimeout(()=>controller.abort(),timeout):null;
 try{
  const r=await fetcher(buildUrl(date),{method:'GET',credentials:'omit',cache:'no-store',signal:controller?.signal});
  if(!r.ok)throw Error('Daily FX reference unavailable');
  const j=await r.json();
  const value=safe({rate:j.rate,date:j.date,savedAt:Date.now()});
  if(!value||j.base!=='CNY'||j.quote!=='PHP')throw Error('Unexpected FX reference response');
  if(!date)try{store?.setItem(KEY,JSON.stringify(value));}catch{}
  return value;
 }finally{if(t!==null)clearTimeout(t);}
}
function compare(cny,rate){const amount=Number(cny),r=Number(rate);if(!Number.isFinite(amount)||amount<0||!Number.isFinite(r)||r<=0)return [];
 return METHODS.filter(m=>!m.conditional).map(m=>{const f=fees(m.id,amount),estimated=amount*r*(1+f.platform/100)*(1+f.issuer/100);return {id:m.id,label:m.label,estimatePHP:Math.round(estimated*100)/100,fees:f,notProviderQuote:true};});
}
return {KEY,SOURCE,METHODS,method,fees,cached,refresh,compare,buildUrl};
});
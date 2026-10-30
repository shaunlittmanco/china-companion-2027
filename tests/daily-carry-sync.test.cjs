const {test}=require('node:test'),assert=require('node:assert/strict');
const M=require('../daily-carry-sync.js'),D=require('../daily-carry.js');
const workbook='1Pvy6BIZJL_hLxP8td-HKdoEg2NuZ2b1LaWnz98GpFhs';
function make(d={itinerary:[],smartState:{}}){
 let data=structuredClone(d),writeRequests=[],rows=[M.HEADERS.slice()],calls=[],status=[];
 const fetcher=async(raw,opts={})=>{
  const url=decodeURIComponent(raw),body=opts.body?JSON.parse(opts.body):null;calls.push({url,method:opts.method||'GET'});
  if(url.endsWith('?fields=spreadsheetId,properties(title),sheets(properties(sheetId,title,gridProperties))'))
   return {ok:true,status:200,json:async()=>({spreadsheetId:workbook,properties:{title:'China Trip Command Center 2027'},sheets:[{properties:{title:'Daily Carry',gridProperties:{columnCount:11,rowCount:500}}}]})};
  if(url.includes('/values:batchUpdate')){writeRequests.push(body);for(const entry of body.data){const line=Number(entry.range.match(/!A(\d+):K/)[1])-1;rows[line]=entry.values[0];}return{ok:true,status:200,json:async()=>({})};}
  if(url.includes(':append?')){writeRequests.push(body);rows.push(...body.values);return{ok:true,status:200,json:async()=>({})};}
  if(url.includes('/values/'))return{ok:true,status:200,json:async()=>({values:structuredClone(rows)})};
  throw Error('Unexpected URL '+url);
 };
 const client=M.create({sheetId:()=>workbook,getData:()=>data,saveData:async v=>{data=v},fetcher,onState:s=>status.push(s),now:()=>10000});
 return {client,get data(){return data},get rows(){return rows},writeRequests,calls,status};
}
function authorize(m){m.client.authorize({access_token:'synthetic-only',expires_in:3600,scope:'https://www.googleapis.com/auth/drive.file'},workbook);}
test('Daily Carry tab has stable row fields and separate rows for every trip day',()=>{
 const values=M.encode({itinerary:[],smartState:{}});
 assert.equal(Object.keys(values).length,11);
 assert.deepEqual(M.HEADERS,['Record ID','Date','Record Type','Item ID','Item / Day','Status','Bag','Notes','Updated At','Revision','Source']);
 for(const [date,rows] of Object.entries(values)){assert.equal(rows[0][0],'DAY-'+date);assert.ok(rows.some(x=>x[2]==='ITEM'));assert.equal(rows[0][6],'Ulanzi PB038 10L sling');}
});
test('read-only preflight makes no Google Sheet writes, and no token means no sync',async()=>{
 const m=make();assert.equal(await m.client.run(),false);assert.equal(m.writeRequests.length,0);
 authorize(m);const v=await m.client.run({readOnly:true,force:true});assert.deepEqual(v,{write:11,pull:0,conflicts:0});assert.equal(m.writeRequests.length,0);
 assert.equal(m.rows.length,1);assert.ok(m.calls.every(x=>!x.url.includes('Packing & Bags')),'Daily client never writes permanent Packing tab');
});
test('first authorized sync writes daily rows, reads back and keeps itinerary/packing unchanged',async()=>{
 const source={itinerary:[{id:'park',date:'2027-01-14',city:'Shanghai',activity:'Shanghai Disneyland'}],smartState:{packing:{items:{safe:{id:'safe',name:'Phone'}}}}},m=make(source);
 authorize(m);assert.equal(await m.client.run({force:true}),true);assert.ok(m.rows.length>100);assert.equal(m.data.smartState.dailyCarry.sync.lastSuccess!==undefined,true);
 assert.deepEqual(m.data.itinerary,source.itinerary);assert.deepEqual(m.data.smartState.packing,source.smartState.packing);
 assert.equal(m.rows.filter(r=>r[2]==='DAY').length,11);
 assert.ok(m.rows.some(r=>r[4].includes('Disney')&&r[1]==='2027-01-14'));
});
test('a day check syncs to the Sheet, and a direct Sheet status edit comes back into app',async()=>{
 const m=make();authorize(m);assert.equal(await m.client.run({force:true}),true);
 const date='2027-01-12',id='rec:phone';
 const changed=D.changed(m.data,date,{type:'check',id,value:true});m.data.smartState.dailyCarry=changed;
 assert.equal(await m.client.run({force:true}),true);
 let row=m.rows.find(r=>r[0]==='ITEM-'+date+'-'+id);assert.equal(row[5],'Ready');
 row=m.rows.find(r=>r[0]==='ITEM-'+date+'-rec:payment');row[5]='Ready';
 assert.equal(await m.client.run({force:true}),true);
 assert.equal(m.data.smartState.dailyCarry.days[date].checks['rec:payment'],true);
 assert.equal(m.data.smartState.dailyCarry.days[date].checks[id],true);
});
test('manual Sheet changes competing with unsynced device changes block writes',async()=>{
 const m=make();authorize(m);await m.client.run({force:true});
 const date='2027-01-12';const changed=D.changed(m.data,date,{type:'check',id:'rec:water',value:true});m.data.smartState.dailyCarry=changed;
 m.rows.find(r=>r[0]==='ITEM-'+date+'-rec:phone')[5]='Ready';
 const before=m.writeRequests.length;
 assert.equal(await m.client.run({force:true}),false);assert.equal(m.writeRequests.length,before);
 assert.ok(m.data.smartState.dailyCarry.sync.conflicts[date]);assert.match(m.status.at(-1).status,/Conflict/);
});
test('parse rejects wrong headers, duplicate ids and unrecognized statuses before any write',()=>{
 assert.throws(()=>M.parse([['Name']]),/headers/);
 const basic=[M.HEADERS.slice(),['DAY-2027-01-11','2027-01-11','DAY','','Day','Planned','','','','','']];
 assert.equal(M.parse(basic)['2027-01-11'].length,1);
 assert.throws(()=>M.parse([...basic,basic[1]]),/identity/);
 assert.throws(()=>M.parse([basic[0],['ITEM-2027-01-11-rec:phone','2027-01-11','ITEM','rec:phone','Phone','PACKED','','','','','']]),/status/);
});
test('disconnect invalidates token without deleting saved day records',async()=>{
 const m=make();authorize(m);await m.client.run({force:true});const copy=JSON.stringify(m.data);
 m.client.disconnect();assert.equal(m.client.hasToken(),false);assert.equal(await m.client.run({force:true}),false);assert.equal(JSON.stringify(m.data),copy);
});

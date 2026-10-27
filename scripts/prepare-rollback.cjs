/* Reproducible source rollback to v1.6.1 behavior, preserving device-only tracker configuration. */
const cp=require('node:child_process'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),baseline='89ab875d8d4f51286b1fd024cb2293c02f40c536';
const git=(args,input)=>cp.execFileSync('git',args,{cwd:root,input,maxBuffer:32*1024*1024});
const changes={};
for(const name of ['app.js','index.html']){let content=git(['show',baseline+':'+name]).toString();if(name==='app.js')content=content.replace(/sheetId:'[\w-]{20,}'/g,"sheetId:localStorage.getItem('chinaCompanionSheetIdV1')||''");else content=content.replace(/href="https:\/\/docs\.google\.com\/spreadsheets\/d\/[\w-]+\/edit"/g,'href="https://docs.google.com/spreadsheets/"');changes[name]=git(['hash-object','-w','--stdin'],content).toString().trim();}
const entries=git(['ls-tree','-z',baseline]).toString().split('\0').filter(Boolean).map(entry=>{const [info,name]=entry.split('\t');return changes[name]?info.replace(/[a-f0-9]{40}$/,changes[name])+'\t'+name:entry;});
const tree=git(['mktree','-z'],entries.join('\0')+'\0').toString().trim();
const files=['index.html','styles.css','app.js','sheet-sync.js','receipts.js','receipt-store.js','travel-data.js','sw.js','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/favicon.png','package.json','package-lock.json','.github/workflows/test.yml','tests'];
fs.writeFileSync(path.join(root,'docs/qa/rollback-v1.6.1.patch'),git(['diff','--binary','HEAD',tree,'--',...files]));
console.log('Prepared v1.6.1 behavior rollback; the private workbook ID is read from existing device configuration. No data/receipt/config clearing.');

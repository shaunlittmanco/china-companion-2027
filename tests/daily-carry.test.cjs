const {test}=require('node:test'),assert=require('node:assert/strict');
const D=require('../daily-carry.js'),P=require('../packing.js'),S=require('../smart-travel.js');
const fixture=()=>structuredClone(require('../scripts/preview-fixture.cjs').chinaCompanionPrivateV2);
test('daily carry suggests cold-weather and attraction-specific gear for actual travel day',()=>{
 const d=fixture();d.itinerary.push(
  {id:'c-disney',date:'2027-01-14',city:'Shanghai',activity:'Shanghai Disneyland full day',time:'08:30'},
  {id:'c-snow',date:'2027-01-16',city:'Chongqing',activity:'Fairy Mountain Wulong snow day trip',time:'07:00'},
  {id:'c-wall',date:'2027-01-20',city:'Beijing',activity:'Mutianyu Great Wall',time:'07:00'},
  {id:'c-transit',date:'2027-01-18',city:'Chengdu',activity:'Fly Chengdu to Beijing',time:'Afternoon'});
 const names=date=>D.plan(d,date).items.map(x=>x.title).join('|');
 assert.match(names('2027-01-14'),/Disney booking|DJI Osmo Pocket/);
 assert.match(names('2027-01-16'),/Hand warmers|Grippy water/);
 assert.match(names('2027-01-20'),/Warm hat|Camera spare battery/);
 assert.match(names('2027-01-18'),/Passport|HSR \/ flight boarding details/);
 assert.doesNotMatch(names('2027-01-12'),/Snow day gear|Disney booking/);
});
test('one attraction filter stays within the selected itinerary day and never imports another date',()=>{
 const d=fixture();d.itinerary=[{id:'test-walk',date:'2027-01-12',city:'Shanghai',activity:'The Bund walk'},
 {id:'test-rail',date:'2027-01-12',city:'Shanghai',activity:'Flight to Chongqing'},
 {id:'other',date:'2027-01-14',city:'Shanghai',activity:'Shanghai Disneyland'}];
 const walk=D.plan(d,'2027-01-12',{activityId:'test-walk'});
 assert.equal(walk.activities.length,2);
 assert.equal(walk.filteredActivities.length,1);
 assert.ok(!walk.flags.transit);
 assert.ok(D.plan(d,'2027-01-12',{activityId:'test-rail'}).flags.transit);
 assert.throws(()=>D.plan(d,'2027-01-22'),/trip date/);
});
test('opening a day or computing suggestions cannot modify packing inventory or queue sync changes',()=>{
 const d=fixture(),before=JSON.stringify(d),p=D.plan(d,'2027-01-12');
 assert.ok(p.items.length>0);
 assert.equal(JSON.stringify(d),before);
 assert.ok(!d.smartState?.dailyCarry);
 const original=JSON.stringify(P.inventory(d));
 const next=D.changed(d,'2027-01-12',{type:'check',id:p.items[0].id,value:true});
 const cloned={...d,smartState:{...d.smartState,dailyCarry:next}};
 assert.equal(JSON.stringify(P.inventory(cloned)),original);
 assert.equal(JSON.stringify(cloned.smartState.packing),JSON.stringify(d.smartState.packing));
 assert.deepEqual(cloned.smartState.packing.sync.pending,d.smartState.packing.sync.pending);
});
test('daily checks stay independent per date, and reset does not erase personal packing or another day',()=>{
 const d=fixture(),id=D.plan(d,'2027-01-12').items[0].id;
 let daily=D.changed(d,'2027-01-12',{type:'check',id,value:true});
 d.smartState.dailyCarry=daily;
 daily=D.changed(d,'2027-01-13',{type:'check',id,value:false});
 d.smartState.dailyCarry=daily;
 assert.equal(D.plan(d,'2027-01-12').items.find(x=>x.id===id).checked,true);
 assert.equal(D.plan(d,'2027-01-13').items.find(x=>x.id===id).checked,false);
 daily=D.changed(d,'2027-01-12',{type:'reset-checks'});
 d.smartState.dailyCarry=daily;
 assert.equal(D.plan(d,'2027-01-12').stats.checked,0);
 assert.ok(daily.days['2027-01-13']);
});
test('custom item, skip, notes and backup merge never erase matching data',()=>{
 let d=fixture(),date='2027-01-12';
 d.smartState.dailyCarry=D.changed(d,date,{type:'add',title:'Cable pouch'});
 let x=d.smartState.dailyCarry.days[date].custom[0];
 assert.ok(D.plan(d,date).items.some(r=>r.id===x.id));
 d.smartState.dailyCarry=D.changed(d,date,{type:'check',id:x.id,value:true});
 d.smartState.dailyCarry=D.changed(d,date,{type:'notes',value:'Leave iPad in hotel.'});
 d.smartState.dailyCarry=D.changed(d,date,{type:'exclude',id:'rec:water'});
 assert.ok(!D.plan(d,date).items.some(r=>r.id==='rec:water'));
 assert.match(D.plan(d,date).notes,/iPad/);
 const merged=S.mergeState({dailyCarry:{days:{[date]:{custom:[{id:'custom:older',title:'Older'}],checks:{'rec:phone':true}}}}},d.smartState);
 assert.equal(merged.dailyCarry.days[date].custom.length,2);
 assert.equal(merged.dailyCarry.days[date].checks[x.id],true);
 assert.equal(merged.dailyCarry.days[date].checks['rec:phone'],true);
 d.smartState.dailyCarry=merged.dailyCarry;
 d.smartState.dailyCarry=D.changed(d,date,{type:'restore'});
 assert.ok(D.plan(d,date).items.some(r=>r.id==='rec:water'));
});

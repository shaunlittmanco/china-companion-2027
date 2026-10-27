// FICTIONAL preview data only. Never use a private tracker export for screenshots.
module.exports={
 chinaCompanionPrivateV2:{schemaVersion:2,source:'Fictional design preview',sourceDate:'2027-01-12T00:00:00Z',sync:{lastSuccess:'2027-01-12T00:00:00Z'},trip:{title:'Design preview',budgetPHP:150000,baselineSpentPHP:4200,estimatedTotalPHP:92000,dailyAllowancePHP:8000},
 itinerary:[
 {id:'preview-arrival',date:'2027-01-11',time:'22:00',city:'Shanghai',activity:'Arrive in Shanghai · preview',area:'Airport',status:'Planned'},
 {id:'preview-garden',date:'2027-01-12',time:'09:00',city:'Shanghai',activity:'Wander through Yu Garden',area:'Old City',chineseName:'豫园',addressCN:'仅供界面演示，请核实目的地',transport:'Metro + a short walk',status:'Must do',notes:'An unhurried morning among courtyards and tea houses.'},
 {id:'preview-lunch',date:'2027-01-12',time:'12:00',city:'Shanghai',activity:'Lunch in the old city',area:'Old City',status:'Planned',transport:'Walk'},
 {id:'preview-bund',date:'2027-01-12',time:'17:00',city:'Shanghai',activity:'Golden hour on The Bund',chineseName:'外滩',area:'Huangpu riverside',transport:'Metro',status:'Planned'},
 {id:'preview-next',date:'2027-01-15',time:'10:00',city:'Chongqing',activity:'Explore the riverside · preview',status:'Planned'}],
 bookings:[{Type:'Flight',Booking:'Shanghai → Chongqing · preview',City:'Shanghai',Date:'2027-01-15','Payment Status':'Confirmed','Amount PHP':2200,Notes:'Fictional reservation. No real confirmation or ticket.'},{Type:'Rail',Booking:'Chongqing → Chengdu · preview',City:'Chongqing',Date:'2027-01-17','Payment Status':'Planned','Amount PHP':950}],
 hotels:[{City:'Shanghai',Hotel:'Jade House · fictional hotel','Chinese Name':'云舍 · 演示酒店','Chinese Address':'示例路88号（演示地址，请勿导航）','Check-in':'2027-01-12','Check-out':'2027-01-15',Area:'Riverside district',Notes:'Fictional design preview. Not a real hotel reservation.'}],transport:[],attractions:[],mapSaved:[]},
 chinaCompanionExpensesV1:[{id:'preview-expense-1',date:'2027-01-12',localDateTime:'2027-01-12T07:30',city:'Shanghai',desc:'Morning coffee · preview',method:'Cash',category:'Food & drinks',amountCNY:28.5,actualPHP:228,amount:228,basis:'actual',receiptStatus:'pending'},{id:'preview-expense-2',date:'2027-01-11',localDateTime:'2027-01-11T23:00',city:'Shanghai',desc:'Airport metro · preview',method:'GCash Global Pay via Alipay+',category:'Transport',amountCNY:8,actualPHP:64,amount:64,basis:'actual'}],
 chinaCompanionDoneV1:{'preview-arrival':true},chinaCompanionSpeechRateV1:'0.55'
};
// Additional smart-travel records are synthetic examples, never copied from the private Sheet.
const d=module.exports.chinaCompanionPrivateV2;
d.itinerary.push(
{id:'preview-snow-train',date:'2027-01-16',time:'06:00',city:'Chongqing',activity:'HSR to Wulong South · example',area:'Wulong',transport:'HSR + local transfer',status:'Planned'},
{id:'preview-fairy',date:'2027-01-16',time:'09:00–12:00',city:'Chongqing',activity:'Fairy Mountain snow landscape · example',area:'Fairy Mountain',transport:'Tourist bus + walk',status:'Conditional'},
{id:'preview-mixue',date:'2027-01-16',time:'17:00',city:'Chongqing',activity:'Mixue + Danzishi riverfront · example',status:'Optional'},
{id:'preview-drone',date:'2027-01-16',time:'20:30',city:'Chongqing',activity:'Drone show · only if officially confirmed',status:'Unconfirmed'},
{id:'preview-hongya',date:'2027-01-16',time:'21:00',city:'Chongqing',activity:'Hongyadong night photography · example',status:'Planned'},
{id:'preview-liziba',date:'2027-01-17',time:'09:00',city:'Chongqing',activity:'Liziba viewpoint · example',status:'Planned'});
d.attractions=[{City:'Shanghai','Attraction / Activity':'Yu Garden','Entrance Fee CNY':30,'Price Status':'SAMPLE PRICE · not a verified ticket quote',Duration:'Suggested 90 minutes',Notes:'Synthetic price for interaction testing only.'},{City:'Chongqing','Attraction / Activity':'Shibati · example',Notes:'Sample saved city walk. Route distance unverified.'},{City:'Chongqing','Attraction / Activity':'Mountain City Trail · example',Notes:'Sample saved option. Hills and stairs require checks.'},{City:'Chongqing','Attraction / Activity':'Liziba viewpoint · example',Notes:'Already scheduled January 17; do not duplicate.'}];
d.food=[{City:'Shanghai','Restaurant / Food':'Old City Beef Noodles · fictional restaurant','Dish / Order':'Beef noodles; ask for no vegetables','Est. CNY':35,'Nearby Attraction':'Yu Garden',Notes:'Fictional example; hours and walking distance unverified. Not a restaurant recommendation.'}];
d.savedOptions=[
{Decision:'Example hotel choice',City:'Chongqing',Category:'Hotel',Option:'River House · fictional working stay','Est. PHP':6000,'Use in Budget?':'Yes',Status:'Booked','Δ vs Working':0,Pros:'Example river view',Cons:'Payment still due','Price Status':'SAMPLE · Pay Later',Notes:'Not an actual booking; Booked is not Paid.'},
{Decision:'Example hotel choice',City:'Chongqing',Category:'Hotel',Option:'Sky House · fictional backup','Est. PHP':5200,'Use in Budget?':'No',Status:'Backup','Δ vs Working':-800,Pros:'Lower saved example price',Cons:'Dates must be repriced','Price Status':'SAMPLE · Historical quote',Notes:'Demo comparison only. Never replaces a confirmed choice.'},
{Decision:'Example Wulong format',City:'Chongqing',Category:'Transportation',Option:'Fairy Mountain DIY · example','Est. PHP':null,'Use in Budget?':'No',Status:'Working',Pros:'Flexible snow-dependent day',Cons:'Exact transport and price unverified','Price Status':'SAMPLE · Needs verification'}];
d.socialMedia=[{Platform:'Instagram','Post / Deliverable':'Example trip carousel','Slide / Order':'1 · cover',City:'Beijing','Location / Moment':'Great Wall portrait','Media Type':'Photo','Shot / Content':'Portrait with the wall trailing behind','Role':'Cover','Status':'Idea',Notes:'Synthetic example concept.'},{Platform:'Instagram','Post / Deliverable':'Example alternate cover','Slide / Order':'1 · alternate',City:'Chongqing','Location / Moment':'Night skyline','Media Type':'Photo','Shot / Content':'Portrait against layered city lights',Role:'Alternate','Status':'Option',Notes:'Synthetic example concept.'}];
d.cityPlans={Chongqing:[]};d.wulong=[{'Step':'1','Approx Time':'Before leaving',From:'Hotel',To:'Mountain access decision',Transport:'Check official notices','Est. Duration':'10 min',Notes:'Synthetic logistics. Actual timetables and snow must be verified.'}];
d.smartState={routes:{'preview-garden|hotel':[
{mode:'Walking',km:1.4,minutes:22,fareCNY:0,transfers:0,walkKm:1.4,distanceType:'walking-route',safe:true,scenic:true,weatherOK:true,practical:true,source:'SIMULATED walking route · not an AMap result',updatedAt:'2027-01-12T00:00:00Z',sample:true},
{mode:'Metro',km:2.2,minutes:18,fareCNY:3,transfers:0,walkKm:.6,source:'SIMULATED transport estimate',updatedAt:'2027-01-12T00:00:00Z',sample:true},
{mode:'DiDi',km:2.5,minutes:12,fareCNY:null,source:'SAMPLE drive time; actual fare must be checked in DiDi',updatedAt:'2027-01-12T00:00:00Z',sample:true}]}};

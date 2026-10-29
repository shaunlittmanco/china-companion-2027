/* Source-labeled, offline text guide. No booking claims, network keys or private data. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ChinaTripGuide=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
'use strict';
const norm=s=>String(s||'').toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}]/gu,'');
const rec=(city,names,cn,description,facts,source,photo,expect,shots)=>({city,names,cn,description,facts,source,photo,expect,shots});
const GUIDE=[
 rec('Shanghai',['The Bund','Waitan','外滩'],'外滩','Sa waterfront ng Huangpu River, magkaharap ang historic Bund buildings at futuristic Pudong skyline. Best itong i-explore on foot, then compare the view in daylight and after dark.',['The Bund developed as Shanghai’s famous waterfront during the city’s treaty-port era.','Across the river, the Pudong skyline represents the city’s modern transformation.','The promenade and historic façades make two very different architectural stories in one frame.'],'https://english.shanghai.gov.cn/','The Bund Shanghai Huangpu River skyline','Riverside promenade, skyline viewpoints, busy evening crowds and wind near the water.',['Wide river-to-skyline establishing shot','Architectural details on the historic bank','Night reflections and ambient waterfront sound']),
 rec('Shanghai',['Yu Garden','Yuyuan','豫园'],'豫园','Classical Chinese garden sa Old City ng Shanghai. Inside, mas intimate ang scale: pavilions, rocks, ponds at courtyards. Hiwalay ang ticketed garden sa commercial bazaar sa labas.',['Begun in 1559 by Pan Yunduan during the Ming dynasty.','Originally conceived as a private retreat for his father.','Traditional garden design uses rocks, ponds and framed views to make a compact landscape feel larger.'],'https://www.meet-in-shanghai.net/en/huangpu-district/yu-garden-182016/','Yu Garden Shanghai traditional garden','A garden inside a larger busy bazaar district; allow time for both areas separately.',['Gate reveal into the garden','Rockery and reflection close-ups','Wide traditional-roof composition']),
 rec('Shanghai',['Shanghai Disneyland','Disneyland','迪士尼'],'上海迪士尼乐园','Theme park experience sa Shanghai Disney Resort. Maganda ang mix ng attractions, themed lands, character details, food at nighttime entertainment; subject to your exact visit date.',['Shanghai Disney Resort opened in 2016.','Its attractions and entertainment mix classic Disney storytelling with features designed for Shanghai.','Shows, ride operations and fireworks can change with weather and park schedules.'],'https://www.shanghaidisneyresort.com/','Shanghai Disneyland Enchanted Storybook Castle','Timed entry, queues, photo spots and changing show schedules; verify in the official app.',['Arrival and castle reveal','Attraction reaction without filming restricted rides','Nighttime castle and wide crowd-safe view']),
 rec('Shanghai',['Starbucks Reserve Roastery','Starbucks Roastery'],'星巴克臻选上海烘焙工坊','A coffee-focused stop where the roasting displays and industrial interior are the main visual story, not just the drink.',['Shanghai’s Starbucks Reserve Roastery opened in 2017.','The space combines roasting equipment, coffee service and retail experiences.'],'https://www.starbucks.com.cn/','Starbucks Reserve Roastery Shanghai','Coffee counters and an expansive interior; confirm current menu and filming policy.',['Wide interior reveal','Roasting equipment textures','Drink close-up and taste reaction']),
 rec('Chongqing',['Hongyadong','Hongya Cave','洪崖洞'],'洪崖洞','Layered riverside architecture sa Yuzhong District. Dramatic ito after dark, pero busy ang access streets at viewing points. The best photo can be from a respectful distance rather than the busiest entrance.',['Hongyadong is known for its multi-level stilt-house-inspired architecture.','Chongqing sits at the confluence of the Yangtze and Jialing rivers.','The city’s steep topography means one building can connect to very different street levels.'],'https://english.cq.gov.cn/','Chongqing Hongyadong night Hongya Cave','Illuminated façade, crowds, bridges, riverside views, steep walkways.',['Wide night skyline from a legal public viewpoint','Lantern and façade details','Bridge-to-building reveal']),
 rec('Chongqing',['Kuixing Tower','Kuixinglou','魁星楼'],'魁星楼','Famous Chongqing multi-level city perspective: street level, elevated plaza and high-rise surroundings can feel unexpectedly connected.',['Chongqing’s hills create multi-level street networks and unusual ground-floor perspectives.','The attraction is popular for showing how urban levels overlap.'],'https://english.cq.gov.cn/','Chongqing Kuixing Tower Kuixinglou','Elevated walkways and layered views; check safe access and avoid leaning over edges.',['Walkway level reveal','Wide city-depth perspective','POV entering from a different level']),
 rec('Chongqing',['Liziba','李子坝'],'李子坝','Monorail line 2 passes through a residential building at this famous Chongqing viewpoint.',['The stop is part of Chongqing Rail Transit Line 2.','The striking design works with the city’s unusually steep urban terrain.'],'https://english.cq.gov.cn/','Liziba monorail through building Chongqing','Designated observation points and short train windows; keep clear of sidewalks.',['Locked-off approaching train shot','Train passing through the building','Wide shot showing surrounding slopes']),
 rec('Chongqing',['Fairy Mountain','Wulong','仙女山','武隆'],'仙女山','Mountain scenery outside central Chongqing. January conditions can be cold and variable, so access, visibility and transport need fresh verification.',['Fairy Mountain National Forest Park is in the Wulong area.','Wulong’s karst landscapes are different from dense central Chongqing.','Snow cover and road conditions cannot be inferred from a city forecast.'],'https://english.cq.gov.cn/','Wulong Fairy Mountain Chongqing winter','Rural mountain views, weather exposure and travel time from the city.',['Wide winter landscape','Texture of grass or snow if present','Quiet ambient audio with weather protection']),
 rec('Chongqing',['Shibati','十八梯'],'十八梯','Restored traditional streets on Chongqing’s sloping Yuzhong terrain with stairs, eateries and old-city atmosphere.',['The area is associated with Chongqing’s historic hillside streets.','The steps and elevation changes are an important part of its character.'],'https://english.cq.gov.cn/','Chongqing Shibati traditional street','Sloping lanes, steps, street shops and photo corners.',['Descending stairs POV','Shopfront detail','Street-to-skyline frame']),
 rec('Chongqing',['Xiahaoli','Longmenhao','下浩里','龙门浩'],'下浩里','Heritage-flavored streets on the south bank with older façades and riverside-city contrast.',['These areas sit in the historic Nan’an side of Chongqing.','The historic street fabric contrasts with the city’s modern river skyline.'],'https://english.cq.gov.cn/','Chongqing Xiahaoli Longmenhao old street','Narrow alleys, stair changes, scenic city views and cafés.',['Wide alley-to-river reveal','Historic façade detail','Street ambience and café scene']),
 rec('Chengdu',['Panda Base','Giant Panda','大熊猫繁育研究基地'],'成都大熊猫繁育研究基地','Conservation, breeding and public education site. Panda sightings vary with animal activity and temperature; follow staff directions and viewing rules.',['The Chengdu Research Base of Giant Panda Breeding supports conservation and scientific research.','The facility also provides public education about giant pandas and other wildlife.','Animal behavior, enclosure access and viewing conditions vary day to day.'],'https://www.panda.org.cn/en/about/introduction/','Chengdu Research Base giant panda','Outdoor habitats, educational displays and variable viewing opportunities.',['Wide quiet habitat composition','Panda behavior from designated area','Interpretive displays; no flash']),
 rec('Chengdu',['Jinli','锦里'],'锦里','Traditional-style pedestrian street near Wuhou Shrine, with local snacks, crafts, lanterns and a theatrical old-Chengdu atmosphere.',['Jinli is closely associated with the Wuhou Shrine area and Three Kingdoms culture.','Its contemporary commercial streets evoke historic architectural styles.'],'https://www.chengdu.gov.cn/','Chengdu Jinli ancient street night lantern','Pedestrian lanes, lantern details, snack stalls, evening crowds.',['Lantern-lined entrance','Snack close-up','Evening walking POV']),
 rec('Chengdu',['Anshun Bridge','安顺廊桥'],'安顺廊桥','Recognizable bridge and riverside night-view stop in central Chengdu.',['The bridge is a modern reconstruction that references traditional covered-bridge architecture.','Night illumination makes it a popular Jinjiang River photo composition.'],'https://www.chengdu.gov.cn/','Chengdu Anshun Bridge night river','Illuminated bridge, water reflections and riverside pedestrian paths.',['Bridge wide at dusk','Water reflection detail','Safe riverside establishing shot']),
 rec('Beijing',['Mutianyu','慕田峪'],'慕田峪长城','Mountain-section Great Wall with restored watchtowers and winding ridgelines. Plan realistically for cold January weather, possible wind and transport access.',['Mutianyu is a Ming-era section of the Great Wall north of Beijing.','Watchtowers and battlements were built for defense and surveillance.','The mountain alignment makes the wall’s scale easier to appreciate from a wide viewpoint.'],'https://english.beijing.gov.cn/travellinginbeijing/attractions/','Mutianyu Great Wall Beijing aerial winter','Steep paths, watchtower viewpoints, winter wind and changing access rules.',['Wall trailing along mountain ridges','Texture of brick and watchtowers','Wide panorama with careful footing']),
 rec('Beijing',['Summer Palace','颐和园'],'颐和园','Extensive imperial garden centered on Longevity Hill and Kunming Lake. Landscape, architecture and frozen-water conditions can vary in January.',['The garden originated as Qingyiyuan in 1750 and was later rebuilt as the Summer Palace.','Longevity Hill and Kunming Lake define its landscape composition.','It was inscribed on the UNESCO World Heritage List in 1998.'],'https://english.beijing.gov.cn/specials/parktours/guidevisitors/summerpalace/','Beijing Summer Palace Kunming Lake Longevity Hill','Large walking distances, lake views, royal architecture, cold weather.',['Wide hill-and-lake composition','Long Corridor details','Bridge and pavilion framing']),
 rec('Beijing',['Nanluoguxiang','南锣鼓巷'],'南锣鼓巷','Historic hutong street district with courtyard-lane urban patterns, snacks and specialty shops.',['Nanluoguxiang is part of Beijing’s historic hutong neighborhoods.','A hutong is a traditional lane associated with courtyard housing and neighborhood life.'],'https://english.beijing.gov.cn/','Beijing Nanluoguxiang hutong street','Shop-lined lanes, courtyard edges, pedestrian crowds.',['Hutong vanishing-point shot','Doorway architectural details','Street-food atmosphere']),
 rec('Beijing',['Houhai','Shichahai','后海','什刹海'],'后海','Lakeside area in historic central Beijing with walking paths and adjacent hutong neighborhoods.',['Shichahai is an area of connected historic lakes north-west of the Forbidden City.','The lakeside and nearby hutongs reflect different periods of city life.'],'https://english.beijing.gov.cn/','Beijing Houhai lake Shichahai winter','Lakeside walks, sunset views and hutong access, subject to winter weather.',['Lakeside wide','Quiet pedestrian activity','Twilight skyline']),
];
const IDEAS={
 Shanghai:[
 ['Zhujiajiao Water Town','朱家角','water town','Canals and old-style bridges; far from central Shanghai, reserve a separate half-day.'],
 ['Wukang Road','武康路','architecture','Historic leafy streets and classic architecture.'],
 ['Tianzifang','田子坊','streets','Narrow commercial lanes and artsy details; check crowd density.'],
 ['Yuyuan Bazaar','豫园商城','food','Traditional-style streets and snacks around the garden; garden admission separate.'],
 ['Xintiandi','新天地','streets','Restored shikumen-inspired lanes and cafés.'],
 ['Shanghai Museum','上海博物馆','indoor','Museum option; verify exhibit location and reservation.'],
 ['Lujiazui Riverside','陆家嘴滨江','photo','Pudong-side skyline and river views.'],
 ['Nanjing Road','南京路','shopping','Busy central shopping street; evening lights.']
 ],
 Chongqing:[
 ['Shibati','十八梯','history','Restored hillside streets and stair views.'],
 ['Mountain City Trail','山城步道','walk','Scenic hillside walking; expect stairs and changes in elevation.'],
 ['Xiahaoli','下浩里','history','Old-street textures and scenic river views.'],
 ['Longmenhao','龙门浩老街','photo','Historic streets on the south bank.'],
 ['Ciqikou','磁器口','history','Traditional-style district with snacks and lanes.'],
 ['Eling Park','鹅岭公园','photo','Elevated greenery and city views.'],
 ['Testbed 2','二厂文创公园','photo','Creative park and urban photography.'],
 ['Danzishi Old Street','弹子石老街','photo','Riverside old-street walk and skyline.'],
 ['Raffles City Chongqing','重庆来福士','view','Modern confluence-area skyline and observation options.']
 ],
 Chengdu:[
 ['Wuhou Shrine','武侯祠','history','Three Kingdoms historical site near Jinli.'],
 ['People’s Park','人民公园','tea','Tea culture and relaxed public spaces.'],
 ['Kuanzhai Alley','宽窄巷子','streets','Traditional-style lanes and cafés.'],
 ['Chunxi Road','春熙路','shopping','Central shopping and modern city views.'],
 ['Taikoo Li','成都远洋太古里','shopping','Contemporary shopping district and architecture.'],
 ['Du Fu Thatched Cottage','杜甫草堂','history','Literary heritage site and garden.'],
 ['Jinjiang Riverside','锦江','photo','Evening riverside and bridge photography.']
 ],
 Beijing:[
 ['Drum and Bell Towers','钟鼓楼','history','Historic city timekeeping landmarks.'],
 ['Shichahai','什刹海','walk','Lakeside historic district.'],
 ['Guijie Food Street','簋街','food','Busy dining street; verify solo menus and prices.'],
 ['Temple of Heaven','天坛','history','Imperial ritual complex and park.'],
 ['Jingshan Park','景山公园','photo','Elevated Forbidden City panorama; weather dependent.'],
 ['Wangfujing','王府井','shopping','Central shopping and food district.'],
 ['798 Art District','798艺术区','art','Converted industrial arts district; farther from the center.'],
 ['Prince Gong’s Mansion','恭王府','history','Historic mansion and garden.']
 ]};
const FOOD={
 Shanghai:[
 ['Pork & crab xiao long bao','蟹粉小笼包','Crab + pork filling, soup inside; avoid very hot first bite.','XLB / dim sum','Ask for no scallion garnish; restaurant and allergen ingredients need checking.'],
 ['Crab roe noodles','蟹黄面','Rich crab-based noodles; seasonal availability and price vary.','Noodles','Check actual crab content and any onion/garlic toppings.'],
 ['Scallion-oil noodles','葱油拌面','Classic Shanghai-style noodle option.','Noodles','Contains scallions; not ideal when avoiding onion bits.'],
 ['White Rabbit dessert','大白兔奶糖风味甜品','Milk-candy flavored sweet treat; verify actual outlet and ingredients.','Dessert','May contain dairy.']
 ],
 Chongqing:[
 ['Beef-only hotpot','牛肉火锅','Order beef cuts in spicy broth, solo portion where offered.','Hotpot','No offal or vegetables; ask about shared pot minimums.'],
 ['Beef skewer hotpot','牛肉串串','Skewers with chosen beef ingredients and spicy broth.','Hotpot','Confirm skewers are beef and avoid mixed offal.'],
 ['Spicy beef noodles','麻辣牛肉面','A casual solo meal; spice and condiments vary.','Noodles','Ask no onion, garlic or vegetables if possible.'],
 ['Chongqing hotpot experience','重庆火锅','Classic spicy hotpot atmosphere, often better with a group.','Hotpot','Check solo-friendly set and transparent pricing.']
 ],
 Chengdu:[
 ['Sichuan beef noodles','川味牛肉面','Numbing-spicy flavors vary by restaurant.','Noodles','Ask about cilantro, scallion and vegetable toppings.'],
 ['Beef hotpot','牛肉火锅','A controllable order for a meat-first preference.','Hotpot','Verify broth, minimum order and meat-only option.'],
 ['Dan dan noodles','担担面','Signature Sichuan noodle dish, commonly includes minced pork.','Noodles','Not beef-only unless the vendor offers a suitable variation.'],
 ['Sichuan sweet dessert','甜品','Dessert break near Jinli or central streets.','Dessert','Check dairy and sugar content.']
 ],
 Beijing:[
 ['Beijing roast duck','北京烤鸭','Famous roast duck with pancakes and condiments.','Duck','Ask for solo portion or half duck; scallion is often served separately.'],
 ['Beef noodle soup','牛肉面','Straightforward meal option for solo dining.','Noodles','Ask no scallions or vegetable garnish.'],
 ['Beijing-style hotpot','老北京涮锅','Traditional hotpot usually based on sliced lamb/beef.','Hotpot','Ask for beef-only order and single-person portions.'],
 ['Tanghulu','糖葫芦','Sugar-coated fruit snack; verify fillings.','Dessert','High sugar; seasonal fruit choices vary.']
 ]};
// Additional dish-oriented options. These are not claims about nearby restaurants or current menus.
FOOD.Shanghai.push(
 ['Shengjianbao pan-fried buns','生煎包','Crisp-bottom soup buns, often pork-filled.','Snack','Check fillings and watch for hot soup; garnish may contain scallions.'],
 ['Pork wonton soup','鲜肉小馄饨','Light dumplings in broth, commonly served solo.','Soup','Ask to omit scallions and vegetables.'],
 ['Beef rice bowl','牛肉盖饭','A simple meat-and-rice option when available.','Rice','Confirm beef-only topping and no onion or garlic garnish.'],
 ['Reserve-style coffee','咖啡','A sit-down coffee break after sightseeing.','Café','Check lactose-free milk availability and caffeine timing.']);
FOOD.Chongqing.push(
 ['Beef barbecue skewers','烤牛肉串','Grilled meat skewers as an alternative to a full hotpot.','BBQ','Confirm beef cuts and any minimum number of skewers.'],
 ['Spicy beef rice bowl','麻辣牛肉盖饭','A one-plate solo meal with spicy beef and rice.','Rice','Ask for no vegetables, scallions or garlic pieces.'],
 ['Beef wontons','牛肉抄手','Wontons with beef filling where available; many shops use pork.','Dumplings','Ask specifically whether the filling is beef.'],
 ['Mixue-style ice cream','冰淇淋','Budget-friendly dessert break.','Dessert','Dairy and sugar content vary by product.']);
FOOD.Chengdu.push(
 ['Spicy grilled beef skewers','香辣牛肉串','Street-style beef skewers with Sichuan seasoning.','BBQ','Ask about chili, oil and non-beef ingredients.'],
 ['Beef rice bowl','牛肉盖饭','Straightforward rice + beef option.','Rice','Confirm no vegetables or offal.'],
 ['Sichuan tea house','盖碗茶','Gaiwan tea and local tea-house atmosphere.','Tea','Not a meal; tea choice and venue prices vary.'],
 ['Chengdu wontons','抄手','Regional wontons often include pork filling.','Dumplings','Ask about filling rather than assuming beef.']);
FOOD.Beijing.push(
 ['Beef dumplings','牛肉饺子','Dumplings with beef filling in shops that offer them.','Dumplings','Confirm filling, scallion and vegetable ingredients.'],
 ['Beef skewers','牛肉串','Grilled skewers found at some barbecue spots.','BBQ','Check the meat type and price per skewer.'],
 ['Zhajiang noodles','炸酱面','Classic Beijing noodles usually based on pork sauce.','Noodles','Not beef-only; contains vegetable garnish by default.'],
 ['Chinese tea stop','中国茶','Warm indoor break between winter attractions.','Tea','Venue and prices should be checked.']);
function guideFor(a){const city=String(a?.city||'');const name=norm(a?.activity||a?.name);return GUIDE.find(g=>city.includes(g.city)&&g.names.some(n=>{const k=norm(n);return k.length>2&&(name.includes(k)||k.includes(name)&&name.length>4)}))||null;}
function ideasFor(city){return (IDEAS[city]||[]).map(([activity,chineseName,category,notes])=>({city,activity,chineseName,category,notes,source:'Curated guide idea · verify current access',suggested:true}));}
function foodsFor(city){return (FOOD[city]||[]).map(([name,cn,description,category,caution])=>({name,cn,description,category,caution,city,source:'Curated dish idea · not a specific restaurant or live menu'}));}
function chineseStory(a){const g=guideFor(a);const dest=g?.cn;return {caption:dest?'今天终于来到'+dest+'了！现场看到的感觉跟照片真的不一样。我要慢慢走，看看这里最特别的细节。':'今天来到一个新的地方。实际走一走、看一看，感觉比看照片更有意思。',pinyin:'',meaning:dest?'Finally visiting '+(a.activity||dest)+'. It feels different in person, so I’m slowing down to notice the details.':'Today I arrived somewhere new and want to explore the details.',captionSource:g?'Curated caption for the place':'Generic Chinese-only template, edit for the real experience'};}
return {GUIDE,IDEAS,FOOD,guideFor,ideasFor,foodsFor,chineseStory};
});
/* Store layout, zones, obstacles, tenants & products (demo data; real data comes from the DB) */
/* ===== ShopPlanet navmesh core: data + navmesh build + A* + funnel ===== */
const START=[560,218], MPP=0.14, WALK=1.25; // px->m, m/s
// walkable zones (hallways) as rects [name,x1,y1,x2,y2]
const ZONES=[['Northwest Hallway',104,98,160,160],['Northwest Hallway',160,142,228,176],['Main Hall',160,176,606,248],['Main Hall',270,248,508,262],
['West Hallway',104,160,131,722],['Cross Hallway A',131,352,270,381],['Cross Hallway B',131,487,270,511],['Central Hallway',270,262,306,722],
['Mid Hall',306,450,481,474],['East Hallway',481,262,509,722],['South Hall',104,722,509,766],['South Hall',306,660,481,722],['South Hall',392,766,580,840],['Exit Corridor',160,766,203,836]];
// static obstacles inside halls (escalators, rest areas, service counter)
const OBS=[[235,192,300,228],[348,203,432,232],[458,198,490,240],[352,688,460,735],[455,795,552,838]];
// stores: name|icon|rect|label|doors|products(name:price:code; o##=offer %, b=best seller, t=trending)
const RAW=`Urban Threads|👕|15,100,97,155|53,128|E128|T-Shirts:499:o30;Slim Jeans:1299:b;Hoodies:1499:t|F
Shoe Studio|👟|15,160,97,250|53,205|E207|Running Shoes:2499:o25;Sneakers:1999:t;Sandals:799:b|F
Mobile World|📱|15,256,97,354|53,310|E303|Smartphones:14999:b;Phone Cases:299:o40;Earbuds:1299:t|E
Fresh Basket|🥬|15,359,97,449|53,405|E405|Fresh Vegetables:60:o10;Organic Milk:70:t;Bakery Bread:45:b|G
Page Turner|📚|15,453,97,546|53,500|E497|Bestselling Novels:349:b;Notebooks:199:o20;Kids Books:249:t|B
Toy Kingdom|🧸|15,551,97,639|53,598|E598|Building Blocks:799:b;Remote Cars:1299:o35;Board Games:899:t|K
Glow Beauty|💄|15,644,97,724|53,682|E685|Face Wash:249:o15;Lipsticks:499:b;Perfumes:1499:t|H
Spice Route|🍛|135,252,266,348|193,296|S190+E297|Biryani Combo:299:b;Veg Thali:199:o15;Masala Dosa:119:t|D
Pizza Piazza|🍕|135,384,266,483|195,432|S190+E435|Margherita Pizza:349:b;Pasta Alfredo:279:t;Garlic Bread:129:o20|D
Dragon Wok|🥡|310,326,418,446|361,382|W382+S368|Noodle Bowl:219:t;Manchurian:189:b;Combo Meal:299:o25|D
Grill House|🍔|310,478,418,602|361,546|N368+W540|Grilled Chicken:399:b;Burgers:229:o20;Milkshakes:149:t|D
Brew & Beans|☕|309,114,413,172|360,137|S360|Cappuccino:149:b;Cold Coffee:129:o10;Brownie:99:t|D
Gadget Galaxy|💻|230,70,303,170|265,118|S258|Laptops:45999:o12;Smartwatch:3999:t;BT Speaker:1999:b|E
Style Avenue|👗|420,114,525,172|470,136|S470|Sarees:2499:o30;Kurtas:999:b;Handbags:1799:t|F
Watch Zone|⌚|135,515,198,568|168,543|W543|Analog Watches:2999:b;Smart Bands:1999:t;Wall Clocks:699:o20|F
Gift Galaxy|🎁|200,515,266,568|231,543|E543|Gift Hampers:1299:o25;Greeting Cards:99:b;Photo Frames:349:t|B
Optical Plus|🕶️|135,572,198,622|170,597|W597|Sunglasses:1499:b;Eyeglass Frames:1999:o30;Contact Lenses:899:t|F
Jewel Box|💍|200,572,266,622|229,597|E597|Silver Rings:1299:t;Earrings:899:b;Bangles:1599:o15|F
Sports Arena|⚽|135,626,198,672|169,647|W647|Yoga Mats:699:t;Cricket Bats:2499:b;Football:899:o20|S
Home Decor|🛋️|200,626,266,672|229,647|E647|Cushion Covers:599:o25;Wall Art:1299:t;Table Lamps:1499:b|L
Little Steps|🍼|135,676,198,716|169,695|W695|Kids Frocks:799:o30;Baby Rompers:499:b;School Bags:999:t|K
Luggage Lane|🧳|200,676,266,716|229,695|E695|Trolley Bags:3499:b;Backpacks:1299:o35;Travel Pouches:299:t|F
SuperMart|🛒|310,264,418,322|364,296|N363|Rice & Pulses:599:b;Snacks:99:o10;Fresh Juice:89:t|G
Pet Paradise|🐶|422,264,477,322|444,293|E294|Dog Food:899:b;Pet Toys:299:o20;Cat Litter:499:t|G
ElectroMax|📺|422,326,477,446|451,389|E389|LED TV 43 inch:22990:o18;Refrigerator:24990:b;Washing Machine:19990:t|E
Kitchen King|🍳|422,478,477,602|451,538|E538|Mixer Grinder:2999:b;Cookware Set:3499:o28;Air Fryer:5999:t|L
Candle Corner|🕯️|310,606,362,658|336,631|S338|Scented Candles:349:o20;Diffusers:699:t;Incense:149:b|L
Stationery Hub|✏️|366,606,416,658|390,631|S390|Pens & Markers:199:b;Art Supplies:649:t;Office Files:149:o15|B
Fit Nutrition|💪|420,606,477,658|442,631|E631|Protein Powder:2499:b;Vitamins:699:o20;Energy Bars:399:t|S
Denim Co|👖|515,270,580,340|549,302|W297|Jeans:1499:o25;Denim Jackets:2499:b;Shirts:999:t|F
Home Essentials|🛏️|515,343,580,415|550,372|W372|Bed Sheets:1299:b;Towels:499:o20;Storage Boxes:399:t|L
Active Wear|🏃|515,418,580,490|551,452|W452|Track Pants:999:t;Sports Bras:699:b;Gym Shorts:599:o30|S
Sneaker Lab|👟|515,493,580,562|551,525|W525|Limited Sneakers:5999:t;Canvas Shoes:1499:b;Socks:199:o15|F
Ethnic Wear|🥻|515,565,580,635|550,597|W597|Lehengas:7999:o30;Sherwanis:5999:b;Dupattas:699:t|F
Gaming Zone|🎮|515,638,580,708|550,669|W669|Gaming Consoles:39990:b;Controllers:4999:o15;Headsets:2999:t|E
Tech Corner|🔌|515,711,580,788|550,741|W741|Chargers:799:o35;Power Banks:1499:b;Smart Plugs:899:t|E
Restrooms / Toilets (North)|🚻|165,66,220,138|192,102|S190||U
Restrooms / Toilets (South)|🚻|15,731,97,788|56,760|E757||U
Elevator / Lift|🛗|132,185,157,240|145,212|W212||U
Emergency Exit (West)|🚪|160,836,203,858|181,847|N181||U
Emergency Exit (East)|🚪|392,840,440,858|416,849|N416||U
Customer Help Desk / Mall Office|ℹ️|207,770,358,858|282,815|N247||U`;
const STORES=RAW.split('\n').map((l,i)=>{const[a,b,c,d,e,f,g]=l.split('|');
 return{id:i,name:a,icon:b,r:c.split(',').map(Number),lab:d.split(',').map(Number),
 doors:e.split('+').map(x=>({s:x[0],p:+x.slice(1)})),
 dept:g,prods:(f||'').split(';').filter(Boolean).map(x=>{const[n,p,c]=x.split(':');return{n,p:+p,b:c[0],o:c[0]=='o'?+c.slice(1):0}}),amenity:!f}});

// multi-level mall: same floor-plate on every level, tenants differ per level (demo data; real data comes from the DB)
const NT=36,LEVELS=3;
const OVR={},BLK=[]; // OVR = live shop/product edits per (level:slot); BLK = blocked aisle rectangles
const TODAY=()=>window.SIMDAY||new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD (can be previewed from Staff console)
const act=p=>(!p.from||p.from<=TODAY())&&(!p.to||p.to>=TODAY()); // a placement is live between its start and end dates
const tenantRaw=(l,i)=>OVR[l+':'+i]||tenant0(l,i); // everything, including scheduled / expired placements
const tenant=(l,i)=>{const t=tenantRaw(l,i);return t.prods.some(p=>p.from||p.to)?{...t,prods:t.prods.filter(act)}:t}; // only what is live today
const tenant0=(l,i)=>{const b=STORES[i<NT?(i+12*l)%NT:i];return{name:b.name,icon:b.icon,dept:b.dept,prods:b.prods,amenity:b.amenity}};

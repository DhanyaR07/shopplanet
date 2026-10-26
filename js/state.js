/* State, constants (departments, strings/i18n, levels) and DOM helpers */
/* ===== ShopPlanet UI: QR flow, 2D navmesh map, 3D planet, multi-level routing, API sim ===== */
const $=s=>document.querySelector(s),NS='http://www.w3.org/2000/svg';
const el=(t,a={},p)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);p&&p.appendChild(e);return e};
const DEPT={F:['Fashion','#e85d75'],E:['Electronics','#4c7ef3'],G:['Grocery & Pets','#3fa796'],D:['Food & Dining','#f5a623'],L:['Home & Living','#b88bff'],S:['Sports & Fitness','#38bdf8'],K:['Kids & Toys','#ff8a5c'],H:['Beauty','#ec70c4'],B:['Books & Gifts','#8bd450'],U:['Facilities','#98a0c4']};
const VAR={F:'S · M · L · XL',E:'Black · White · Blue',G:'500 g · 1 kg · 2 kg',D:'Regular · Large · Combo',L:'Set of 2 · Set of 4',S:'Junior · Adult',K:'3–5 yrs · 6–9 yrs',H:'Mini · Regular · Gift pack',B:'Paperback · Hardcover'};
const LVN=['Ground Floor','First Floor','Second Floor'],BD={o:{l:'Offer',c:'#ff8a5c',ic:'🏷️'},b:{l:'Best Seller',c:'#ffc94d',ic:'⭐'},t:{l:'Trending',c:'#b88bff',ic:'📈'}};
const STR={en:{st:['Scan QR','3D Store','Search','Navigate','Product & Offers'],ph:'Search a product or store — e.g. “sneakers”, “biryani”',all:'All',o:'Offers',b:'Best sellers',t:'Trending',loc:'📍 Set my location',pop:'Popular & deals near you',res:'Results',list:'My list',plan:'Plan trip',clr:'Clear',arr:'You have arrived — see products & offers ↓'},
ta:{st:['QR ஸ்கேன்','3D கடை','தேடல்','வழிகாட்டி','பொருள் & சலுகை'],ph:'பொருள் அல்லது கடையைத் தேடுங்கள் — “shoes”, “biryani”',all:'அனைத்தும்',o:'சலுகைகள்',b:'அதிகம் விற்பனை',t:'டிரெண்டிங்',loc:'📍 என் இடம்',pop:'அருகிலுள்ள சலுகைகள்',res:'முடிவுகள்',mylist:'என் பட்டியல்',plan:'பயணம் திட்டமிடு',clr:'அழி',arr:'வந்துவிட்டீர்கள் — பொருட்கள் & சலுகைகள் ↓'}};
let lng='en';const tt=k=>STR[lng][k];
const LIFT=STORES.findIndex(s=>/Elevator/.test(s.name)),LP=STORES[LIFT].lab,LIFTCOST=150;
let follow=true,me={l:0,p:START.slice()},vl=0,is3=false,sel=null,mylist=[],route=null,arrived=false,flt='',dep='',qs='',pick=false,trip=false,res=[],step=1,dc={};

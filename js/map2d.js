/* 2D SVG map, distance helpers, level drawing */
/* ---------- distance helpers (navmesh) ---------- */
const lenAB=(a,b)=>a.l===b.l?findPath(a.p,b.p).len:findPath(a.p,LP).len+LIFTCOST+findPath(LP,b.p).len;
const D=(l,i)=>{const k=l+':'+i;return dc[k]??(dc[k]=lenAB(me,{l,p:STORES[i].lab})*MPP)};
const mins=m=>Math.max(1,Math.round(m/WALK/60)),money=n=>'₹'+n.toLocaleString('en-IN'),old=p=>Math.round(p.p/(1-p.o/100));
const away=(l,i)=>`${Math.round(D(l,i))} m · ${mins(D(l,i))} min${l!==me.l?' · via lift':''}`;
/* ---------- 2D map (SVG over the supplied floor plan) ---------- */
const svg=$('#map'),G=n=>el('g',{id:n},svg);el('image',{href:IMG,width:650,height:904},svg);
const gN=G('nm'),gL=G('lb'),gP=G('pin'),gR=G('rt'),gM=G('me');
const nmR=POLYS.map(p=>{const r=p.r;return el('rect',{x:r[0],y:r[1],width:r[2]-r[0],height:r[3]-r[1],class:p.door?'nd':p.store!==undefined?'ns':'nz'},gN)});
PORTALS.forEach(([a,b])=>el('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],class:'np'},gN));
let hit=[],pins=[];
const dimmed=(l,i)=>{const t=tenant(l,i);return(dep&&t.dept!==dep)||(flt&&!t.prods.some(p=>p.b===flt))};
function drawLevel(){gL.innerHTML='';gP.innerHTML='';pins=[];hit=[];
 STORES.forEach((s,i)=>{const t=tenant(vl,i),r=s.r,w=r[2]-r[0];
  el('rect',{x:r[0],y:r[1],width:w,height:r[3]-r[1],fill:DEPT[t.dept][1],'fill-opacity':t.amenity?0:.17},gL);
  if(t.amenity)el('text',{x:s.lab[0],y:s.lab[1]+4,'text-anchor':'middle','font-size':13},gL).textContent=t.icon;
  else{const cw=w>100?58:32;el('rect',{x:s.lab[0]-cw/2,y:s.lab[1]-6,width:cw,height:12,fill:'#fff'},gL);
   el('text',{x:s.lab[0],y:s.lab[1]+2.5,'text-anchor':'middle','font-size':t.name.length>11?5.6:6.6,class:'nm'},gL).textContent=t.name}
  hit[i]=el('rect',{x:r[0],y:r[1],width:w,height:r[3]-r[1],class:'st'+(dimmed(vl,i)?' dim':'')+(sel&&sel.l===vl&&sel.i===i?' sel':'')},gL);
  [...new Set(t.prods.map(p=>p.b))].forEach((b,k,a)=>el('circle',{cx:s.lab[0]+(k-(a.length-1)/2)*7,cy:s.lab[1]+10,r:2.8,fill:BD[b].c,stroke:'#fff','stroke-width':.8,opacity:!flt||flt===b?1:.15},gP))})}
function drawMe(){gM.innerHTML='';if(me.l!==vl)return;const p=me.p;el('circle',{cx:p[0],cy:p[1],r:9,class:'mep'},gM);el('circle',{cx:p[0],cy:p[1],r:4.5,class:'med'},gM);el('text',{x:p[0],y:p[1]-9,'text-anchor':'middle','font-size':7,class:'met'},gM).textContent='You'}
const pl=(a,c)=>el('polyline',{points:a.map(p=>p.join(',')).join(' '),class:c},gR);
function drawRoute(){gR.innerHTML='';nmR.forEach(e=>e.classList.remove('cor'));if(!route)return;
 route.legs.forEach(L=>{if(L.l!==vl)return;L.f.polys.forEach(i=>nmR[i].classList.add('cor'));if($('#raw').checked)pl(L.f.raw,'raw');pl(L.f.pts,'pc');pl(L.f.pts,'pl')});
 route.wps.slice(1).forEach((w,k)=>{if(w.l===vl){el('circle',{cx:w.p[0],cy:w.p[1],r:6,class:'dst'},gR);if(route.wps.length>2)el('text',{x:w.p[0],y:w.p[1]+2.5,'text-anchor':'middle','font-size':7,class:'dn'},gR).textContent=k+1}});
 walkDot=el('circle',{r:3.6,class:'wk'},gR)}
let walkDot=null;

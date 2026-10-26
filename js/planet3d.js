/* ---------- 3D "Shopping Planet" (Three.js): walled rooms, glass, badges, avatar, beacon, flow arrows ---------- */
let T3=null;const GAP=150,CX=325,CZ=452;
function sprite(txt,sc=.3){const c=document.createElement('canvas'),x=c.getContext('2d');x.font='600 30px Segoe UI,sans-serif';const w=x.measureText(txt).width+20;c.width=w;c.height=52;x.font='600 30px Segoe UI,sans-serif';x.fillStyle='#fff';x.strokeStyle='rgba(8,10,25,.9)';x.lineWidth=6;x.textBaseline='middle';x.strokeText(txt,10,27);x.fillText(txt,10,27);
 const t=new THREE.CanvasTexture(c);t.minFilter=THREE.LinearFilter;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthTest:false}));s.scale.set(w*sc,52*sc,1);s.renderOrder=9;return s}
function badgeSprite(e,col){const c=document.createElement('canvas'),x=c.getContext('2d');c.width=c.height=64;x.fillStyle=col;x.beginPath();x.arc(32,32,29,0,6.3);x.fill();x.strokeStyle='#fff';x.lineWidth=4;x.stroke();x.font='30px Segoe UI Emoji,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(e,32,35);
 const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthTest:false}));s.scale.set(12,12,1);s.renderOrder=10;return s}
function wallsFor(s,h,mat,g,ud){const r=s.r,T=2.4,gp={N:[],S:[],E:[],W:[]},out=[];s.doors.forEach(d=>gp[d.s].push(d.p));
 const run=(a,b,gl,f)=>{const c=[a];gl.sort((p,q)=>p-q).forEach(p=>c.push(p-8,p+8));c.push(b);for(let k=0;k<c.length;k+=2)if(c[k+1]-c[k]>1)f(c[k],c[k+1])};
 [['N',r[1]],['S',r[3]]].forEach(([k,z])=>run(r[0],r[2],gp[k],(u,v)=>out.push([v-u,T,(u+v)/2-CX,z-CZ])));
 [['W',r[0]],['E',r[2]]].forEach(([k,x])=>run(r[1],r[3],gp[k],(u,v)=>out.push([T,v-u,x-CX,(u+v)/2-CZ])));
 return out.map(([w,d,x,z])=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,h/2,z);m.userData=ud;g.add(m);return m})}
/* ---------- realistic shelves: racks + product boxes generated from the live product data (instanced = fast on phones) ---------- */
const BOXG=new THREE.BoxGeometry(1,1,1),hue=n=>{let h=0;for(const c of n)h=(h*31+c.charCodeAt(0))%360;return h/360};
function racks3(l,g){const rk=[],pm=[],pc=[],rr={},pr={},pp={};
 STORES.forEach((s,i)=>{const t=tenant(l,i);if(t.amenity||!t.prods.length)return;
  const r=s.r,w=r[2]-r[0],h=r[3]-r[1],H=w>=h,L0=(H?w:h)-18,S0=(H?h:w)-14;if(L0<26||S0<9)return;
  const rows=Math.max(1,Math.min(3,Math.floor(S0/17))),cx=(r[0]+r[2])/2-CX,cz=(r[1]+r[3])/2-CZ,a0=rk.length,b0=pm.length;
  const put=(arr,off,sx,sy,sz,px,py,pz)=>arr.push(H?[[sx,sy,sz],[cx+px,py,cz+off+pz]]:[[sz,sy,sx],[cx+off+pz,py,cz+px]]);
  const slots=[];for(let k=0;k<rows;k++){const off=(k-(rows-1)/2)*(S0/rows);
   put(rk,off,L0,15,.8,0,7.5,-3.2);[3,8.5,14].forEach(y=>put(rk,off,L0,.8,7,0,y,0));put(rk,off,.8,15,7,-L0/2,7.5,0);put(rk,off,.8,15,7,L0/2,7.5,0);
   for(let lv=0;lv<2;lv++)slots.push({off,y:lv?8.9+2.1:3.4+2.1,cur:-L0/2+3})}
  rr[i]=[a0,rk.length];const rec=[];
  const nf=Math.max(1,Math.floor((L0-6)/4.6)),np=t.prods.length,blk=Math.max(1,Math.floor(nf/np)),seen={},cols=t.prods.map(p=>new THREE.Color().setHSL(hue(p.n),p.o?.72:.5,.55));
  slots.forEach((sl,si)=>{for(let f=0;f<nf;f++){const k=(si+Math.floor(f/blk))%np,x=-L0/2+3+f*4.6;put(pm,sl.off,4,4.2,4.4,x,sl.y,.4);pc.push(cols[k]);
   if(!seen[k]){seen[k]=1;rec.push({n:t.prods[k].n,x:x+(blk-1)*2.3,off:sl.off,y:sl.y,H,cx,cz,k})}}});
  pr[i]=[b0,pm.length];pp[i]=rec});
 const mk=(list,mat,cols)=>{if(!list.length)return null;const m=new THREE.InstancedMesh(BOXG,mat,list.length),o=new THREE.Object3D();
  list.forEach(([S,P],n)=>{o.position.set(P[0],P[1],P[2]);o.scale.set(S[0],S[1],S[2]);o.updateMatrix();m.setMatrixAt(n,o.matrix);if(cols)m.setColorAt(n,cols[n])});
  m.instanceMatrix.needsUpdate=true;if(cols)m.instanceColor.needsUpdate=true;m.frustumCulled=false;m.userData.base=m.instanceMatrix.array.slice();g.add(m);return m};
 return{rk:mk(rk,new THREE.MeshLambertMaterial({color:0x8f9cc4})),pm:mk(pm,new THREE.MeshLambertMaterial({color:0xffffff}),pc),rr,pr,pp,hid:{}}}
function hide3(o,i,hide){[['rk','rr'],['pm','pr']].forEach(([mk,rg])=>{const m=o[mk],R=o[rg]&&o[rg][i];if(!m||!R||R[0]===R[1])return;const key=mk+i;if(!!o.hid[key]===hide)return;o.hid[key]=hide;
  const a=m.instanceMatrix.array,b=m.userData.base;for(let n=R[0];n<R[1];n++)for(const e of[0,1,2,4,5,6,8,9,10])a[n*16+e]=hide?0:b[n*16+e];m.instanceMatrix.needsUpdate=true})}
function prod3(){if(!T3)return;const G=T3.pg;while(G.children.length){const c=G.children[0];G.remove(c);c.material&&c.material.map&&c.material.map.dispose()}T3.hm=null;
 if(!sel||sel.l!==vl)return;const o=T3.lv[sel.l];(o.pp[sel.i]||[]).forEach(q=>{const x=q.H?q.cx+q.x:q.cx+q.off,z=q.H?q.cz+q.off:q.cz+q.x,y=sel.l*GAP+q.y+9,hi=sel.hl===q.n;
  const sp=sprite(q.n+(hi?' ◀ here':''),hi?.26:.18);sp.position.set(x,y+(q.k%2)*7+(hi?6:0),z);G.add(sp);
  if(hi){const c=new THREE.Mesh(new THREE.ConeGeometry(3.2,8,12),new THREE.MeshBasicMaterial({color:0xffc94d}));c.rotation.x=Math.PI;c.position.set(x,y-1,z);c.userData.y=y-1;G.add(c);T3.hm=c}})}
function fillLevel3(l,g,wm){const bl=[],wl=[],lb=[],bg=[],bk=[];
  STORES.forEach((s,i)=>{const t=tenant(l,i),r=s.r,h=t.amenity?6:18,ud={l,i};
   const tile=new THREE.Mesh(new THREE.BoxGeometry(r[2]-r[0]-3,2,r[3]-r[1]-3),new THREE.MeshLambertMaterial({color:DEPT[t.dept][1],transparent:true,opacity:.5,emissive:0x000000}));
   tile.position.set((r[0]+r[2])/2-CX,1.6,(r[1]+r[3])/2-CZ);tile.userData=ud;g.add(tile);bl.push(tile);
   wl.push(wallsFor(s,h,wm,g,ud));
   const nm=sprite(t.name);nm.position.set(s.lab[0]-CX,h+9,s.lab[1]-CZ);nm.userData={big:(r[2]-r[0])*(r[3]-r[1])>=4500};g.add(nm);lb.push(nm);
   [...new Set(t.prods.map(p=>p.b))].forEach((b,k,a)=>{const e=badgeSprite(BD[b].ic,BD[b].c);e.userData={b,l,i};e.position.set(s.lab[0]-CX+(k-(a.length-1)/2)*16,h+30,s.lab[1]-CZ);g.add(e);bg.push(e)})});
 BLK.forEach(b=>{const m=new THREE.Mesh(new THREE.BoxGeometry(b[2]-b[0],14,b[3]-b[1]),new THREE.MeshLambertMaterial({color:0xff5c3a,transparent:true,opacity:.75}));m.position.set((b[0]+b[2])/2-CX,7,(b[1]+b[3])/2-CZ);g.add(m);bk.push(m)});
 return{bl,wl,lb,bg,bk,...racks3(l,g)}}
function rebuild3D(){T3.lv.forEach((o,l)=>{[...o.bl,...o.lb,...o.bg,...o.bk,...o.wl.flat(),o.rk,o.pm].forEach(m=>{if(!m)return;o.g.remove(m);if(m.isInstancedMesh)m.dispose()});Object.assign(o,fillLevel3(l,o.g,o.wm))});lv3();hl3()}
function init3D(){const cv=$('#c3'),R=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true});R.setPixelRatio(Math.min(devicePixelRatio||1,2));
 const S=new THREE.Scene(),C=new THREE.PerspectiveCamera(45,1,1,9000);
 S.add(new THREE.HemisphereLight(0xdfe9ff,0x1a2040,.85));const dl=new THREE.DirectionalLight(0xffffff,.6);dl.position.set(300,900,400);S.add(dl);
 const sg=new THREE.BufferGeometry(),sp=[];for(let k=0;k<320;k++){const r=2600+Math.random()*1800,a=Math.random()*6.28,b=Math.acos(Math.random()*2-1);sp.push(r*Math.sin(b)*Math.cos(a),r*Math.cos(b),r*Math.sin(b)*Math.sin(a))}
 sg.setAttribute('position',new THREE.Float32BufferAttribute(sp,3));S.add(new THREE.Points(sg,new THREE.PointsMaterial({color:0x9fb0ff,size:3,transparent:true,opacity:.35,sizeAttenuation:false})));
 const tex=new THREE.TextureLoader().load(IMG3),lv=[];
 for(let l=0;l<LEVELS;l++){const g=new THREE.Group();g.position.y=l*GAP;S.add(g);
  const pl=new THREE.Mesh(new THREE.PlaneGeometry(650,904),new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false}));pl.rotation.x=-Math.PI/2;pl.position.y=.6;g.add(pl);
  const slab=new THREE.Mesh(new THREE.BoxGeometry(662,6,916),new THREE.MeshBasicMaterial({color:0x161d3d,transparent:true,opacity:.95}));slab.position.y=-3.5;g.add(slab);
  const edge=new THREE.LineSegments(new THREE.EdgesGeometry(slab.geometry),new THREE.LineBasicMaterial({color:0x2ee6c8,transparent:true,opacity:.45}));edge.position.copy(slab.position);g.add(edge);
  const wm=new THREE.MeshLambertMaterial({color:0xcfd9ff,transparent:true,opacity:.38});
  const F=fillLevel3(l,g,wm);
  lv.push({g,pl,slab,edge,wm,...F})}
 const lr=STORES[LIFT].r,lh=(LEVELS-1)*GAP+30,shaft=new THREE.Mesh(new THREE.BoxGeometry(lr[2]-lr[0],lh,lr[3]-lr[1]),new THREE.MeshBasicMaterial({color:0x2ee6c8,transparent:true,opacity:.22,depthWrite:false}));
 shaft.position.set((lr[0]+lr[2])/2-CX,lh/2-4,(lr[1]+lr[3])/2-CZ);S.add(shaft);
 const rg=new THREE.Group(),cg=new THREE.Group();S.add(rg,cg);
 const av=new THREE.Group(),bd=new THREE.Mesh(new THREE.CylinderGeometry(3,4,13,12),new THREE.MeshBasicMaterial({color:0x2ee6c8})),hd=new THREE.Mesh(new THREE.SphereGeometry(3.8,12,12),new THREE.MeshBasicMaterial({color:0xffffff}));
 bd.position.y=7;hd.position.y=16;av.add(bd,hd);S.add(av);
 const mk=new THREE.Group(),cone=new THREE.Mesh(new THREE.ConeGeometry(6,16,16),new THREE.MeshBasicMaterial({color:0x3b82f6}));cone.rotation.x=Math.PI;cone.position.y=26;mk.add(cone);const mr=new THREE.Mesh(new THREE.RingGeometry(9,12,32),new THREE.MeshBasicMaterial({color:0x3b82f6,side:THREE.DoubleSide}));mr.rotation.x=-Math.PI/2;mr.position.y=2;mk.add(mr);S.add(mk);
 const bc=new THREE.Group(),beam=new THREE.Mesh(new THREE.CylinderGeometry(5,5,260,16,1,true),new THREE.MeshBasicMaterial({color:0xff5c3a,transparent:true,opacity:.35,side:THREE.DoubleSide,depthWrite:false}));beam.position.y=130;
 const ring=new THREE.Mesh(new THREE.RingGeometry(14,18,32),new THREE.MeshBasicMaterial({color:0xff5c3a,side:THREE.DoubleSide,transparent:true}));ring.rotation.x=-Math.PI/2;ring.position.y=3;bc.add(beam,ring);bc.visible=false;S.add(bc);
 const cam={t:new THREE.Vector3(0,GAP,0),r:1450,th:.9,ph:.85,tt:new THREE.Vector3(0,GAP,0),tr:1450,tth:.9,tph:.85,auto:true};
 const pg=new THREE.Group();S.add(pg);
 T3={R,S,C,lv,rg,cg,av,mk,bc,ring,cam,chev:[],follow:false,hov:null,pg,hm:null};
 let dn=null,mv=0;cv.addEventListener('pointerdown',e=>{dn=[e.clientX,e.clientY];mv=0;cam.auto=false});
 addEventListener('pointerup',e=>{if(dn&&mv<5&&is3)pick3(e);dn=null});
 addEventListener('pointermove',e=>{if(!dn){if(is3&&e.target===cv)hover3(e);return}const dx=e.clientX-dn[0],dy=e.clientY-dn[1];mv+=Math.abs(dx)+Math.abs(dy);dn=[e.clientX,e.clientY];cam.tth-=dx*.006;cam.tph=Math.max(.15,Math.min(1.45,cam.tph-dy*.005))});
 cv.addEventListener('wheel',e=>{e.preventDefault();cam.tr=Math.max(250,Math.min(3000,cam.tr+e.deltaY*1.2))},{passive:false});
 lv3();draw3DRoute()}
const ray=()=>T3.ray||(T3.ray=new THREE.Raycaster());
function hit3(e){const cv=$('#c3'),b=cv.getBoundingClientRect(),r=ray();r.setFromCamera(new THREE.Vector2((e.clientX-b.left)/b.width*2-1,-(e.clientY-b.top)/b.height*2+1),T3.C);
 const o=T3.lv[vl],h=r.intersectObjects([...o.bl,...o.wl.flat()],false);return h.length?h[0].object.userData:null}
function pick3(e){const u=hit3(e);if(u)choose(u.l,u.i)}
function hover3(e){const u=hit3(e),tp=$('#tip');if(!u){tp.style.display='none';if(T3.hov!==null){T3.hov=null;hl3()}return}
 if(!T3.hov||T3.hov.i!==u.i){T3.hov=u;hl3()}const t=tenant(u.l,u.i),of=t.prods.filter(p=>p.o).length;
 tp.innerHTML=`<b>${t.icon} ${t.name}</b>${DEPT[t.dept][0]}${t.amenity?'':` · ${t.prods.length} products${of?` · 🏷️ ${of} offer${of>1?'s':''}`:''}`}`;tp.style.left=e.clientX+14+'px';tp.style.top=e.clientY+14+'px';tp.style.display='block'}
function lv3(){T3.lv.forEach((o,l)=>{const on=l===vl;o.pl.material.opacity=on?.85:.12;o.slab.material.opacity=on?.95:.18;o.edge.material.opacity=on?.6:.15;o.wm.opacity=on?.38:.05;o.lb.forEach(s=>s.visible=on&&s.userData.big);o.bg.forEach(s=>s.visible=false);[o.rk,o.pm].forEach(m=>m&&(m.visible=on))});hl3()}
function hl3(){T3&&T3.lv.forEach((o,l)=>o.bl.forEach((b,i)=>{const s=sel&&sel.l===l&&sel.i===i,hv=T3.hov&&T3.hov.l===l&&T3.hov.i===i,d=dimmed(l,i)&&l===vl,k=s?1.7:hv?1.25:1;
 b.material.emissive.setHex(s?0x2ee6c8:hv?0x335555:0);b.material.opacity=l!==vl?.05:d?.08:s?.95:hv?.75:.5;
 o.wl[i].forEach(w=>{w.scale.y=k;w.position.y=w.geometry.parameters.height*k/2;w.visible=!d&&l===vl});
 o.lb[i].visible=!!(l===vl&&!d&&(o.lb[i].userData.big||s||hv));hide3(o,i,d);
 o.bg.forEach(e=>{if(e.userData.i===i)e.visible=!!(l===vl&&!d&&(s||hv||flt||dep)&&(!flt||flt===e.userData.b)&&(!dep||tenant(l,i).dept===dep))})}));prod3()}
const V3=(l,p,y=6)=>new THREE.Vector3(p[0]-CX,l*GAP+y,p[1]-CZ);
function seg(a,b,r=2.2){const d=b.clone().sub(a),m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,d.length()||.01,8),new THREE.MeshBasicMaterial({color:0x14d6b5}));
 m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.clone().normalize());return m}
function draw3DRoute(){if(!T3)return;const{rg,cg}=T3;while(rg.children.length)rg.remove(rg.children[0]);while(cg.children.length)cg.remove(cg.children[0]);T3.chev=[];T3.bc.visible=false;if(!route)return;let prev=null;
 const mat=new THREE.MeshBasicMaterial({color:0xffffff}),geo=new THREE.ConeGeometry(4,10,6);
 const arrows=(a,b)=>{const d=b.clone().sub(a),n=Math.floor(d.length()/20);for(let k=0;k<=n;k++){const c=new THREE.Mesh(geo,mat);c.position.copy(a).addScaledVector(d,n?k/n:0).add(new THREE.Vector3(0,3,0));c.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.clone().normalize());cg.add(c);T3.chev.push(c)}};
 route.legs.forEach(L=>{const P=L.f.pts.map(p=>V3(L.l,p));if(prev){rg.add(seg(prev,P[0],2.2))}for(let k=1;k<P.length;k++){rg.add(seg(P[k-1],P[k]));arrows(P[k-1],P[k])}prev=P.at(-1)});
 const w=route.wps.at(-1);T3.bc.position.copy(V3(w.l,w.p,0));T3.bc.visible=true}
function fly3(w){if(!T3)return;const c=T3.cam,p=V3(w.l,w.p,0);c.auto=false;c.tt.set(p.x,w.l*GAP,p.z);c.tr=520;c.tph=.9;c.tth=Math.atan2(p.z,p.x)+.7}
$('#fl').onclick=()=>{if(!T3)return;T3.follow=!T3.follow;$('#fl').classList.toggle('on',T3.follow)};
$('#rs').onclick=()=>{if(!T3)return;const c=T3.cam;T3.follow=false;$('#fl').classList.remove('on');c.tt.set(0,GAP,0);c.tr=1700;c.tth=.9;c.tph=.85;c.auto=true};
function setView(on){if(on&&!T3){try{init3D()}catch(e){notify('3D needs WebGL — showing 2D map');on=false;T3=null}}is3=on;$('#c3').style.display=on?'block':'none';svg.style.display=on?'none':'block';levelUI()}
function tick(t){let pos=null;if(route){const s=((t-route.t0)/1000*70)%(route.tot+90);pos=posAt(Math.min(s,route.tot));
  if(follow&&pos.l!==vl&&!pick)setLevel(pos.l);
  if(walkDot&&pos.l===vl){walkDot.setAttribute('cx',pos.p[0]);walkDot.setAttribute('cy',pos.p[1])}
  if(s>=route.tot&&!arrived){arrived=true;setStep(5);notify(tt('arr'),'#2ee6c8');$('#prods')&&$('#prods').scrollIntoView({behavior:'smooth'})}
  STORES.forEach((st,i)=>{if(st.amenity||route.seen.has(i)||(sel&&sel.i===i&&sel.l===pos.l))return;
   const ten=tenant(pos.l,i),of=ten.prods.find(p=>p.o);if(of&&dist(pos.p,st.lab)<30){route.seen.add(i);notify(`<b>🏷️ Offer on your way</b>${of.o}% off ${of.n} at ${ten.name}`,'#ff8a5c')}})}
 if(T3&&is3){const{R,C,cam,mk,bc,ring,av,chev}=T3,cv=$('#c3'),w=cv.clientWidth,h=cv.clientHeight;if(cv.width!==Math.round(w*R.getPixelRatio())){R.setSize(w,h,false);C.aspect=w/h;C.updateProjectionMatrix()}
  av.visible=!!pos;if(pos){av.position.copy(V3(pos.l,pos.p,Math.abs(Math.sin(t/160))*1.5));if(T3.follow){cam.auto=false;cam.tt.copy(av.position);cam.tr=Math.min(cam.tr,420)}}
  T3.S.scale.y+=((window.EXP?1.9:1)-T3.S.scale.y)*.08;if(!T3.follow)cam.tt.y=GAP*T3.S.scale.y;if(cam.auto)cam.tth+=.0025;cam.t.lerp(cam.tt,.07);cam.r+=(cam.tr-cam.r)*.07;cam.th+=(cam.tth-cam.th)*.07;cam.ph+=(cam.tph-cam.ph)*.07;
  C.position.set(cam.t.x+cam.r*Math.sin(cam.ph)*Math.cos(cam.th),cam.t.y+cam.r*Math.cos(cam.ph),cam.t.z+cam.r*Math.sin(cam.ph)*Math.sin(cam.th));C.lookAt(cam.t);
  if(T3.hm)T3.hm.position.y=T3.hm.userData.y+Math.sin(t/200)*2.5;mk.position.copy(V3(me.l,me.p,0));mk.children[0].position.y=26+Math.sin(t/300)*3;
  const k=1+((t/700)%1)*.9;ring.scale.set(k,k,1);ring.material.opacity=1-((t/700)%1);
  chev.forEach((c,i)=>{const s=.55+.9*Math.max(0,Math.sin(i*.6-t/180));c.scale.set(s,s,s)});
  T3.lv.forEach(o=>o.bg.forEach(e=>{if(e.visible)e.position.y=e.position.y*.9+(56+Math.sin(t/400+e.userData.i)*3)*.1}));
  R.render(T3.S,C)}
 requestAnimationFrame(tick)}

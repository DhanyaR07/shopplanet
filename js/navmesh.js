/* ---- build navmesh ---- */
const sub=(r,o)=>{const x1=Math.max(r[0],o[0]),y1=Math.max(r[1],o[1]),x2=Math.min(r[2],o[2]),y2=Math.min(r[3],o[3]);
 if(x1>=x2||y1>=y2)return[r];
 return[[r[0],r[1],r[2],y1],[r[0],y2,r[2],r[3]],[r[0],y1,x1,y2],[x2,y1,r[2],y2]].filter(p=>p[2]-p[0]>3&&p[3]-p[1]>3)};
const POLYS=[],ADJ=[],PORTALS=[],M=6; // M = agent clearance (wall erosion, px)
let cells=[],NZ=0;
const cen=i=>{const r=POLYS[i].r;return[(r[0]+r[2])/2,(r[1]+r[3])/2]};
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const inR=(p,r,e=0)=>p[0]>=r[0]-e&&p[0]<=r[2]+e&&p[1]>=r[1]-e&&p[1]<=r[3]+e;
function link(a,b,p,q){ // orient portal as [left,right] when travelling a->b
 const ca=cen(a),cb=cen(b),d=[cb[0]-ca[0],cb[1]-ca[1]];
 const cr=d[0]*(p[1]-ca[1])-d[1]*(p[0]-ca[0]);
 const L=cr>0?q:p,R=cr>0?p:q; // screen coords (y down)
 const m=[(p[0]+q[0])/2,(p[1]+q[1])/2];
 ADJ[a].push({to:b,L,R,cost:dist(ca,m)+dist(m,cb)});
 ADJ[b].push({to:a,L:R,R:L,cost:dist(ca,m)+dist(m,cb)});PORTALS.push([p,q])}
const near=(p)=>{let best=-1,bd=1e9;for(let i=0;i<NZ;i++){const r=POLYS[i].raw,c=[Math.min(Math.max(p[0],r[0]),r[2]),Math.min(Math.max(p[1],r[1]),r[3])],d=dist(c,p);if(d<bd){bd=d;best=i}}return best};
/* rebuild the whole navmesh from ZONES - OBS - BLK + STORES (called at load and whenever the layout changes) */
function buildNav(){POLYS.length=0;ADJ.length=0;PORTALS.length=0;cells=[];
ZONES.forEach(z=>{let pcs=[z.slice(1)];OBS.concat(BLK).forEach(o=>pcs=pcs.flatMap(p=>sub(p,o)));pcs.forEach(r=>cells.push({r,name:z[0]}))});
for(let it=0;it<8;it++){let ch=false,nx=[]; // split cells at T-junctions so every side is fully shared or fully exposed
 for(const a of cells){const xs=new Set(),ys=new Set(),A=a.r;
  for(const b of cells){if(a===b)continue;const B=b.r;
   if((B[2]===A[0]||B[0]===A[2])&&Math.min(A[3],B[3])>Math.max(A[1],B[1]))[B[1],B[3]].forEach(y=>y>A[1]&&y<A[3]&&ys.add(y));
   if((B[3]===A[1]||B[1]===A[3])&&Math.min(A[2],B[2])>Math.max(A[0],B[0]))[B[0],B[2]].forEach(x=>x>A[0]&&x<A[2]&&xs.add(x))}
  const X=[A[0],...[...xs].sort((p,q)=>p-q),A[2]],Y=[A[1],...[...ys].sort((p,q)=>p-q),A[3]];
  if(X.length>2||Y.length>2)ch=true;
  for(let i=0;i<X.length-1;i++)for(let j=0;j<Y.length-1;j++)nx.push({r:[X[i],Y[j],X[i+1],Y[j+1]],name:a.name})}
 cells=nx;if(!ch)break}
cells.forEach(a=>{const A=a.r,has=f=>cells.some(b=>b!==a&&f(b.r));
 const L=has(B=>B[2]===A[0]&&Math.min(A[3],B[3])>Math.max(A[1],B[1])),R=has(B=>B[0]===A[2]&&Math.min(A[3],B[3])>Math.max(A[1],B[1])),
 T=has(B=>B[3]===A[1]&&Math.min(A[2],B[2])>Math.max(A[0],B[0])),Bo=has(B=>B[1]===A[3]&&Math.min(A[2],B[2])>Math.max(A[0],B[0]));
 const r=[A[0]+(L?0:M),A[1]+(T?0:M),A[2]-(R?0:M),A[3]-(Bo?0:M)];
 POLYS.push({r:r[2]-r[0]>1&&r[3]-r[1]>1?r:A,raw:A,name:a.name})});
NZ=POLYS.length;
STORES.forEach(s=>POLYS.push({r:s.r,raw:s.r,name:s.name,store:s.id}));
POLYS.forEach(()=>ADJ.push([]));
for(let i=0;i<NZ;i++)for(let j=i+1;j<NZ;j++){const a=POLYS[i].r,b=POLYS[j].r;
 for(const[A,B]of[[a,b],[b,a]]){
  if(A[2]===B[0]){const y1=Math.max(A[1],B[1]),y2=Math.min(A[3],B[3]);if(y2-y1>2)link(i,j,[A[2],y1],[A[2],y2])}
  if(A[3]===B[1]){const x1=Math.max(A[0],B[0]),x2=Math.min(A[2],B[2]);if(x2-x1>2)link(i,j,[x1,A[3]],[x2,A[3]])}}}
STORES.forEach(s=>s.doors.forEach(d=>{const r=s.r,k=8,H=d.s=='E'||d.s=='W';
 const probe={E:[r[2]+k,d.p],W:[r[0]-k,d.p],N:[d.p,r[1]-k],S:[d.p,r[3]+k]}[d.s];
 const ci=near(probe),c=POLYS[ci].r;
 d.pt=H?[d.s=='E'?r[2]:r[0],d.p]:[d.p,d.s=='N'?r[1]:r[3]];
 // doorway cell bridges the wall gap between the store edge and the eroded hallway edge
 const v=H?(d.s=='E'?[r[2],d.p-7,c[0],d.p+7]:[c[2],d.p-7,r[0],d.p+7]):(d.s=='N'?[d.p-7,c[3],d.p+7,r[1]]:[d.p-7,r[3],d.p+7,c[1]]);
 const vi=POLYS.length;POLYS.push({r:v,raw:v,name:'Doorway',door:1});ADJ.push([]);
 link(NZ+s.id,vi,H?[d.pt[0],d.p-7]:[d.p-7,d.pt[1]],H?[d.pt[0],d.p+7]:[d.p+7,d.pt[1]]);
 const e=H?(d.s=='E'?c[0]:c[2]):(d.s=='N'?c[3]:c[1]);
 link(vi,ci,H?[e,Math.max(d.p-7,c[1])]:[Math.max(d.p-7,c[0]),e],H?[e,Math.min(d.p+7,c[3])]:[Math.min(d.p+7,c[2]),e])}));
}
buildNav();

/* ---- locate / A* / funnel ---- */
function locate(p){let i=POLYS.findIndex(q=>inR(p,q.raw));if(i<0)i=near(p);const r=POLYS[i].r;
 return{poly:i,pt:[Math.min(Math.max(p[0],r[0]),r[2]),Math.min(Math.max(p[1],r[1]),r[3])]}}
function astar(s,t){const g={[s]:0},prev={},open=new Set([s]),done=new Set();let exp=0;
 const h=n=>dist(cen(n),cen(t));
 while(open.size){let c=-1,bf=1e18;for(const n of open){const f=g[n]+h(n);if(f<bf){bf=f;c=n}}
  if(c===t)break;open.delete(c);done.add(c);exp++;
  for(const e of ADJ[c]){if(done.has(e.to)||(POLYS[e.to].store!==undefined&&e.to!==t))continue; // stores are never pass-through
  const ng=g[c]+e.cost;if(g[e.to]===undefined||ng<g[e.to]){g[e.to]=ng;prev[e.to]={c,e};open.add(e.to)}}}
 if(g[t]===undefined)return null;const edges=[],polys=[t];
 for(let n=t;n!==s;n=prev[n].c){edges.unshift(prev[n].e);polys.unshift(prev[n].c)}
 return{edges,polys,exp}}
const tri=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(c[0]-a[0])*(b[1]-a[1]);
const eq=(a,b)=>a[0]===b[0]&&a[1]===b[1];
function funnel(P){const out=[P[0][0]];let ap=P[0][0],L=ap,R=ap,li=0,ri=0;
 for(let i=1;i<P.length;i++){const l=P[i][0],r=P[i][1];
  if(tri(ap,R,r)<=0){if(eq(ap,R)||tri(ap,L,r)>0){R=r;ri=i}else{out.push(L);ap=L;const k=li;L=R=ap;li=ri=k;i=k;continue}}
  if(tri(ap,L,l)>=0){if(eq(ap,L)||tri(ap,R,l)<0){L=l;li=i}else{out.push(R);ap=R;const k=ri;L=R=ap;li=ri=k;i=k;continue}}}
 out.push(P[P.length-1][0]);return out.filter((p,i)=>i==0||!eq(p,out[i-1]))}
function findPath(a,b){const A=locate(a),B=locate(b);if(A.poly===B.poly)return{pts:[A.pt,B.pt],raw:[A.pt,B.pt],polys:[A.poly],exp:0,len:dist(A.pt,B.pt)};
 const r=astar(A.poly,B.poly);if(!r)return null;
 const P=[[A.pt,A.pt],...r.edges.map(e=>[e.L,e.R]),[B.pt,B.pt]];
 const pts=funnel(P),raw=[A.pt,...r.edges.map(e=>[(e.L[0]+e.R[0])/2,(e.L[1]+e.R[1])/2]),B.pt];
 let len=0;for(let i=1;i<pts.length;i++)len+=dist(pts[i-1],pts[i]);return{pts,raw,polys:r.polys,exp:r.exp,len}}

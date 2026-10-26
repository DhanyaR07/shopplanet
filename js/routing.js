/* ---------- routing across levels (lift is the connector) ---------- */
function legsFor(a,b){if(a.l===b.l)return[{l:a.l,f:findPath(a.p,b.p)}];
 return[{l:a.l,f:findPath(a.p,LP),lift:b.l},{l:b.l,f:findPath(LP,b.p)}]}
function mkRoute(wps){const legs=wps.slice(1).flatMap((w,k)=>legsFor(wps[k],w));let t=0;legs.forEach(L=>{L.s0=t;t+=L.f.len+(L.lift!==undefined?LIFTCOST*.3:0);L.s1=t});
 return{legs,tot:t,wps,t0:performance.now(),seen:new Set(),exp:legs.reduce((a,L)=>a+L.f.exp,0),len:legs.reduce((a,L)=>a+L.f.len,0)*MPP}}
function posAt(s){for(const L of route.legs)if(s<L.s1||L===route.legs.at(-1)){const x=Math.max(0,s-L.s0),pts=L.f.pts;if(x>=L.f.len)return{l:L.l,p:pts.at(-1),lift:L.lift};
  let a=x,i=1;while(i<pts.length-1&&a>dist(pts[i-1],pts[i])){a-=dist(pts[i-1],pts[i]);i++}
  const p=pts[i-1],n=pts[i],d=dist(p,n)||1,f=Math.min(1,a/d);return{l:L.l,p:[p[0]+(n[0]-p[0])*f,p[1]+(n[1]-p[1])*f]}}}
function go(wps,tripMode){route=mkRoute(wps);setTimeout(()=>window.speakRoute&&speakRoute(),50);arrived=false;follow=true;trip=!!tripMode;
 API.call('POST','/api/route',`navmesh A* over ${POLYS.length} cells · expanded ${route.exp} · ${route.legs.length} leg(s)`,()=>0);
 vl=wps[0].l;setStep(4);drawLevel();drawMe();drawRoute();levelUI();if(T3){lv3();draw3DRoute();fly3(wps[1])}render()}
function choose(l,i,hl){sel=i===null?null:{l,i,hl};trip=false;$('#sv').style.display='none';
 if(sel){API.call('GET','/api/stores/'+i,`db.stores.findOne({slot:${i},level:${l}}) + products.find()`,()=>0);go([me,{l,p:STORES[i].lab}])}
 else{route=null;walkDot=null;setStep(qs?3:2);drawLevel();drawRoute();if(T3){draw3DRoute();hl3()}render()}}
function planTrip(){let cur=me,rest=mylist.map(x=>({...x,l:x.l,p:STORES[x.i].lab})),ord=[];
 while(rest.length){let b=0,bd=1e9;rest.forEach((r,k)=>{const d=lenAB(cur,r);if(d<bd){bd=d;b=k}});cur=rest.splice(b,1)[0];ord.push(cur)}
 sel=null;const nv=mkRoute([me,...mylist.map(x=>({l:x.l,p:STORES[x.i].lab}))]).len;go([me,...ord],true);const sv=Math.max(0,Math.round(nv-route.len)),pc=nv?Math.round(sv/nv*100):0;
 $('#sv').innerHTML=`<b>🧭 Smart trip order</b><br>${mylist.length} stops · ${Math.round(route.len)} m<br>Saves <b>${sv} m</b> (${pc}%) vs. your list order`;$('#sv').style.display='block'}

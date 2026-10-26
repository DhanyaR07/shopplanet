/* Live layout editor ("staff mode"): edit shops/products/blocked aisles -> navmesh rebuild -> 2D + 3D + routes refresh, saved & synced */
const KEY='shopplanet.layout',esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let MAPVER=1,EL=0,ES=0;const BC=typeof BroadcastChannel!=='undefined'?new BroadcastChannel('shopplanet'):null;
const LOG=[],unesc=x=>String(x).replace(/<[^>]*>/g,'').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&amp;/g,'&');
const snap=()=>({v:MAPVER,ovr:OVR,blk:BLK,log:LOG});
function apply(d){Object.keys(OVR).forEach(k=>delete OVR[k]);Object.assign(OVR,d.ovr||{});BLK.length=0;(d.blk||[]).forEach(b=>BLK.push(b));MAPVER=d.v||1;LOG.length=0;(d.log||[]).forEach(x=>LOG.push(x))}
const _dl=drawLevel;drawLevel=function(){_dl();BLK.forEach(b=>el('rect',{x:b[0],y:b[1],width:b[2]-b[0],height:b[3]-b[1],fill:'#ff5c3a','fill-opacity':.55,stroke:'#ff5c3a','stroke-dasharray':'4 3',rx:3},gL))};
const _go=go;go=function(w,t){window.LW=[w,t];return _go(w,t)};
function refreshAll(){buildNav();gN.innerHTML='';nmR.length=0;
 POLYS.forEach(p=>{const r=p.r;nmR.push(el('rect',{x:r[0],y:r[1],width:r[2]-r[0],height:r[3]-r[1],class:p.door?'nd':p.store!==undefined?'ns':'nz'},gN))});
 PORTALS.forEach(([a,b])=>el('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],class:'np'},gN));
 try{if(T3)rebuild3D()}catch(e){}
 try{drawLevel();runSearch();render()}catch(e){}
 try{if(route&&window.LW)_go(...LW)}catch(e){route=null;try{drawRoute()}catch(x){}}}
function commit(msg,api){MAPVER++;LOG.unshift({t:Date.now(),m:unesc(msg)});LOG.length=Math.min(LOG.length,30);try{localStorage.setItem(KEY,JSON.stringify(snap()))}catch(e){}BC&&BC.postMessage(snap());
 API.call('PUT',api,'map v'+MAPVER+' published · navmesh '+POLYS.length+' cells',()=>0);refreshAll();ui();notify('<b>✅ Map v'+MAPVER+' live</b>'+msg,'#2ee6c8')}
BC&&(BC.onmessage=e=>{apply(e.data);refreshAll();if($('#ed').classList.contains('on'))ui();notify('<b>🔄 Store map updated</b>Map v'+MAPVER+' pushed live by staff','#2ee6c8')});
try{const d=JSON.parse(localStorage.getItem(KEY));if(d){apply(d);refreshAll()}}catch(e){}
const own=(l,i)=>{const k=l+':'+i;if(!OVR[k]){const t=tenantRaw(l,i);OVR[k]={...t,prods:t.prods.map(p=>({...p}))}}return OVR[k]};
const repHtml=()=>{const r=LS('reports'),k=Object.keys(r);return`<hr><h4>Customer reports (${k.length})</h4>`+(k.map(x=>{const[l,i]=x.split(':');return`<div class="er"><span>${r[x]>=3?'🚩':'⚠'} L${+l+1} · ${esc(tenant(+l,+i).name)} — ${r[x]}×</span><button data-a="rr" data-k="${x}">✓</button></div>`}).join('')||'<div class="er">No reports</div>')};
const logHtml=()=>'<hr><h4>Change log</h4>'+(LOG.slice(0,6).map(x=>`<div class="er"><span>${new Date(x.t).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})} · ${esc(x.m)}</span></div>`).join('')||'<div class="er">No changes yet</div>');
const cl=t=>({...t,prods:t.prods.map(p=>({...p}))}),vac=t=>t.name==='Vacant unit';
function ui(){const t=tenant(EL,ES),raw=tenantRaw(EL,ES),live=raw.prods.filter(act).length,slots=STORES.map((_,i)=>i).filter(i=>i!==LIFT),zn=[...new Set(ZONES.map(z=>z[0]))];
 $('#edc').innerHTML=`<h3>🛠 Staff console</h3><small style="color:var(--lo)">Map v${MAPVER} · changes rebuild the navmesh and update 2D, 3D and routes live (open a 2nd tab to watch it sync)</small>
 <h4>Level &amp; shop</h4><div class="ef"><select id="edl">${[...Array(LEVELS).keys()].map(l=>`<option value="${l}"${l==EL?' selected':''}>Level ${l+1}</option>`).join('')}</select>
 <select id="eds">${slots.map(i=>{const x=tenant(EL,i);return`<option value="${i}"${i==ES?' selected':''}>${x.icon} ${esc(x.name)}</option>`}).join('')}</select></div>
 <h4>Products here (${live} live${raw.prods.length>live?' · '+(raw.prods.length-live)+' scheduled/expired':''})</h4>${raw.prods.map((p,k)=>{const st=act(p)?'':(p.from&&p.from>TODAY()?'scheduled':'expired');return`<div class="er"${st?' style="opacity:.65"':''}><span>${esc(p.n)} · ₹${p.p} · ${p.o?p.o+'% off':p.b=='b'?'best seller':'trending'}${p.from||p.to?' · '+(p.from||'…')+' → '+(p.to||'…'):''}${st?' · <b>'+st+'</b>':''} · <i style="color:var(--lo)">${p.ts?'✓ '+agoTxt(p.ts):'not confirmed'}</i></span><span><button class="ok" data-a="rc" data-k="${k}" title="Location confirmed today">✓</button><button data-a="rp" data-k="${k}">✕</button></span></div>`}).join('')||'<div class="er">No products</div>'}
 <div class="ef"><input id="pn" placeholder="New product e.g. Mango"><input id="pp" type="number" placeholder="₹ price"><select id="pb"><option value="b">Best seller</option><option value="t">Trending</option><option value="o10">10% off</option><option value="o20">20% off</option><option value="o30">30% off</option></select></div>
 <div class="ef"><input id="pdf" type="date" title="Show from (optional)"><input id="pdt" type="date" title="Show until (optional)"></div><small style="color:var(--lo)">Optional dates: the product appears only between them (e.g. a weekly front-section promo).</small>
 <button class="bs" data-a="ap">➕ Add product</button>
 <hr><h4>Shop</h4>${vac(t)?`<div class="ef"><input id="sn" placeholder="New shop name"><input id="si" placeholder="Icon" value="🏪" style="max-width:60px"><select id="sd">${Object.keys(DEPT).map(k=>`<option value="${k}">${DEPT[k][0]}</option>`).join('')}</select></div><button class="bs" data-a="as">🏬 Open new shop here</button>`:`<div class="ef"><input id="rn" value="${esc(t.name)}"><select id="rd">${Object.keys(DEPT).map(k=>`<option value="${k}"${k==t.dept?' selected':''}>${DEPT[k][0]}</option>`).join('')}</select></div><button class="bs g" data-a="rt">✏️ Rename / change type</button><button class="bs g" data-a="rs">🗑 Remove this shop (leave vacant)</button>`}
 <div class="ef" style="margin-top:6px"><select id="mv">${slots.filter(i=>i!=ES).map(i=>{const x=tenant(EL,i);return`<option value="${i}">${x.icon} ${esc(x.name)}</option>`}).join('')}</select><button class="bs g" data-a="mv" style="margin:0">⇄ Move / swap with</button></div>
 <hr><h4>Weekly planogram import (CSV)</h4><small style="color:var(--lo)">Columns: level, shop, product, price, tag, start, end · tag = b, t, o10…o90 or <b>remove</b> · dates optional (YYYY-MM-DD)</small>
 <textarea id="pgcsv" rows="5" placeholder="level,shop,product,price,tag,start,end">${esc(window.PGTXT||'')}</textarea>
 <div class="ef"><input id="pgf" type="file" accept=".csv,text/csv"></div>${(window.PERR||[]).map(x=>`<div class="er" style="color:#ff8a5c">⚠ ${esc(x)}</div>`).join('')}
 <div class="ef"><button class="bs g" data-a="pgs">Load sample</button><button class="bs" data-a="pgi">⬆ Import planogram</button></div>
 <hr><h4>Preview a date</h4><div class="ef"><input id="simd" type="date" value="${TODAY()}"></div><small style="color:var(--lo)">See which placements are live on any day, without changing data.</small>
 <hr><h4>Blocked aisle (${BLK.length})</h4><div class="ef"><select id="bz">${zn.map(z=>`<option>${esc(z)}</option>`).join('')}</select><button class="bs g" data-a="bk" style="margin:0">🚧 Block part of it</button></div>
 <button class="bs g" data-a="cb">Clear all blockers</button>${repHtml()}${logHtml()}<hr><div class="ef"><button class="bs g" data-a="ex">📋 Export JSON</button><button class="bs g" data-a="rs0">↺ Reset demo data</button></div>`}
$('#edc').addEventListener('change',e=>{if(e.target.id=='edl'){EL=+e.target.value;ui()}if(e.target.id=='eds'){ES=+e.target.value;ui()}});

/* weekly planogram import: one CSV = a whole shelf reset (add / update / remove, with optional start & end dates) */
function csvRow(s){const o=[];let c='',q=false;for(const ch of s){if(ch=='"')q=!q;else if(ch==','&&!q){o.push(c.trim());c=''}else c+=ch}o.push(c.trim());return o}
function importPlano(txt){const lines=txt.split(/\r?\n/).map(x=>x.trim()).filter(Boolean),err=[],iso=/^\d{4}-\d{2}-\d{2}$/;let add=0,upd=0,rem=0;
 lines.forEach((ln,n)=>{const c=csvRow(ln);if(/^level$/i.test(c[0]))return;const[lv,shop,prod,price,tag,from,to]=c,L=(+lv)-1,R=`row ${n+1}: `;
  if(!(L>=0&&L<LEVELS))return err.push(R+'level must be 1–'+LEVELS);
  const i=STORES.findIndex((_,k)=>k!==LIFT&&!tenantRaw(L,k).amenity&&tenantRaw(L,k).name.toLowerCase()===String(shop||'').toLowerCase());
  if(i<0)return err.push(R+'shop "'+shop+'" not found on level '+lv);
  if(!prod)return err.push(R+'product name missing');
  const tg=(tag||'t').toLowerCase(),o=own(L,i),ix=o.prods.findIndex(p=>p.n.toLowerCase()===prod.toLowerCase());
  if(tg==='remove'){if(ix<0)return err.push(R+'"'+prod+'" is not in '+shop);o.prods.splice(ix,1);return rem++}
  if(!(+price>0))return err.push(R+'price must be above 0');
  if(!/^(b|t|o\d{1,2})$/.test(tg))return err.push(R+'tag must be b, t, o10…o90 or remove');
  if((from&&!iso.test(from))||(to&&!iso.test(to)))return err.push(R+'dates must be YYYY-MM-DD');
  if(from&&to&&from>to)return err.push(R+'end date is before start date');
  const rec={n:ix>=0?o.prods[ix].n:prod,p:+price,b:tg[0],o:tg[0]=='o'?+tg.slice(1):0,ts:Date.now()};if(from)rec.from=from;if(to)rec.to=to;
  if(ix>=0){o.prods[ix]=rec;upd++}else{o.prods.push(rec);add++}});
 return{add,upd,rem,err}}
function samplePlano(){const L=EL,sl=STORES.map((_,i)=>i).filter(i=>i!==LIFT&&!tenantRaw(L,i).amenity&&tenantRaw(L,i).prods.length),A=tenantRaw(L,sl[0]),B=tenantRaw(L,sl[1]),d=n=>new Date(Date.now()+n*864e5).toLocaleDateString('en-CA');
 return['level,shop,product,price,tag,start,end',`${L+1},${A.name},Festival Mango Box,199,o20,${d(0)},${d(6)}`,`${L+1},${A.name},Diwali Gift Hamper,899,t,${d(3)},${d(9)}`,`${L+1},${A.name},${A.prods[0].n},${A.prods[0].p+20},b,,`,`${L+1},${B.name},${B.prods.at(-1).n},0,remove,,`].join('\n')}
$('#edc').addEventListener('input',e=>{if(e.target.id=='pgcsv')window.PGTXT=e.target.value});
$('#edc').addEventListener('change',e=>{if(e.target.id=='pgf'&&e.target.files[0]){const fr=new FileReader();fr.onload=()=>{window.PGTXT=String(fr.result);window.PERR=[];ui()};fr.readAsText(e.target.files[0])}
 if(e.target.id=='simd'){window.SIMDAY=e.target.value&&e.target.value!==new Date().toLocaleDateString('en-CA')?e.target.value:'';refreshAll();ui()}});
$('#edc').addEventListener('click',e=>{const a=e.target.dataset.a;if(!a)return;const L=EL,i=ES,t=tenant(L,i),v=id=>$('#'+id).value;
 if(a=='ap'){const n=v('pn').trim(),pr=+v('pp'),c=v('pb');if(!n||!(pr>0))return notify('<b>Enter a name and price</b>','#ff5c3a');{const f=v('pdf'),e2=v('pdt');if(f&&e2&&f>e2)return notify('<b>End date is before start date</b>','#ff5c3a');const rec={n,p:pr,b:c[0],o:c[0]=='o'?+c.slice(1):0,ts:Date.now()};if(f)rec.from=f;if(e2)rec.to=e2;own(L,i).prods.push(rec)}return commit(`${esc(n)} added to ${esc(t.name)}`,'/api/slots/'+L+'-'+i+'/products')}
 if(a=='rp'){const[x]=own(L,i).prods.splice(+e.target.dataset.k,1);return commit(`${esc(x.n)} removed`,'/api/slots/'+L+'-'+i+'/products')}
 if(a=='rs'){OVR[L+':'+i]={name:'Vacant unit',icon:'▫️',dept:t.dept,prods:[],amenity:true};return commit(`${esc(t.name)} removed — unit vacant`,'/api/slots/'+L+'-'+i)}
 if(a=='as'){const n=v('sn').trim();if(!n)return notify('<b>Enter a shop name</b>','#ff5c3a');OVR[L+':'+i]={name:n,icon:v('si')||'🏪',dept:v('sd'),prods:[],amenity:false};return commit(`${esc(n)} opened — now add its products`,'/api/slots/'+L+'-'+i)}
 if(a=='mv'){const j=+v('mv'),A=cl(tenantRaw(L,i)),B=cl(tenantRaw(L,j));OVR[L+':'+i]=B;OVR[L+':'+j]=A;ES=j;return commit(`${esc(A.name)} moved`,'/api/slots/'+L+'-'+i+'/move')}
 if(a=='bk'){const z=ZONES.filter(q=>q[0]==v('bz')).sort((p,q)=>(q[3]-q[1])*(q[4]-q[2])-(p[3]-p[1])*(p[4]-p[2]))[0],w=z[3]-z[1],h=z[4]-z[2],cx=(z[1]+z[3])/2,cy=(z[2]+z[4])/2;
  const b=h>w?[cx-w*.28,cy-20,cx+w*.28,cy+20]:[cx-20,cy-h*.28,cx+20,cy+h*.28];BLK.push(b.map(Math.round));buildNav();
  if(!findPath(START,LP)||!findPath(START,[300,700])){BLK.pop();buildNav();return notify('<b>Blocker rejected</b>It would cut off part of the store','#ff5c3a')}return commit('Aisle partly blocked — routes avoid it','/api/blockers')}
 if(a=='rc'){const p=own(L,i).prods[+e.target.dataset.k];p.ts=Date.now();return commit(`${esc(p.n)} location confirmed`,'/api/slots/'+L+'-'+i+'/confirm')}
 if(a=='rt'){const nm=v('rn').trim();if(!nm)return notify('<b>Enter a name</b>','#ff5c3a');const o=own(L,i),was=t.name;o.name=nm;o.dept=v('rd');return commit(`${esc(was)} is now “${esc(nm)}” · ${DEPT[o.dept][0]}`,'/api/slots/'+L+'-'+i+'/type')}
 if(a=='dt'){window.SIMDAY='';refreshAll();return ui()}
 if(a=='pgs'){window.PGTXT=samplePlano();window.PERR=[];return ui()}
 if(a=='pgi'){const txt=($('#pgcsv').value||'').trim();window.PGTXT=txt;if(!txt){window.PERR=['Paste a CSV or choose a file first'];return ui()}const r=importPlano(txt);window.PERR=r.err;if(!(r.add+r.upd+r.rem)){return ui()}return commit(`Planogram imported: ${r.add} added, ${r.upd} updated, ${r.rem} removed${r.err.length?', '+r.err.length+' rows skipped':''}`,'/api/planogram')}
 if(a=='rr'){const r=LS('reports');delete r[e.target.dataset.k];LS('reports',r);return ui()}
 if(a=='cb'){BLK.length=0;return commit('Blockers cleared','/api/blockers')}
 if(a=='ex'){try{navigator.clipboard.writeText(JSON.stringify(snap(),null,1))}catch(x){}return notify('<b>Layout JSON copied</b>This is what the database would store','#2ee6c8')}
 if(a=='rs0'){apply({v:MAPVER});return commit('Demo data restored','/api/reset')}});
$('#edb').onclick=()=>{EL=vl;ES=STORES.findIndex((s,i)=>i!==LIFT&&!tenant(EL,i).amenity);ui();$('#ed').classList.add('on')};$('#edx').onclick=()=>$('#ed').classList.remove('on');

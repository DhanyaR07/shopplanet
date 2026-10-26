/* UX features: toolbar menu, "Where am I?" checkpoint scan, offline pill, footfall heatmap, WhatsApp share, "not here?" reports, mobile sheet */
const CP=[['Entrance gate',[560,218]],['Main hall · pillar M1',[330,185]],['Main hall · pillar M2',[520,190]],['West aisle · pillar W1',[117,400]],['Central aisle · pillar C1',[288,600]],['Mid hall · pillar H1',[390,462]],['East aisle · pillar E1',[495,500]],['South hall · pillar S1',[250,745]]];
const LS=(k,v)=>{try{if(v===undefined)return JSON.parse(localStorage.getItem('shopplanet.'+k))||{};localStorage.setItem('shopplanet.'+k,JSON.stringify(v))}catch(e){return{}}};
let HEAT=false;
/* --- toolbar: keep the primary controls, tuck the rest into a menu --- */
const bar=$('#th').parentElement,mb=document.createElement('button'),mn=document.createElement('div');mb.id='mbtn';mb.textContent='⋯ More';mn.id='menu';bar.appendChild(mb);document.body.appendChild(mn);
const hb=Object.assign(document.createElement('button'),{id:'hm',textContent:'🔥 Footfall heatmap'}),wb=Object.assign(document.createElement('button'),{id:'wa',textContent:'💬 Share list on WhatsApp'});
['th','ex','vc','hm','wa','dbb','edb'].forEach(id=>mn.appendChild($('#'+id)||(id=='hm'?hb:wb)));
mb.onclick=e=>{const r=mb.getBoundingClientRect();mn.style.left=Math.min(r.left,innerWidth-230)+'px';mn.style.top=r.bottom+8+'px';mn.classList.toggle('on');e.stopPropagation()};
document.addEventListener('click',e=>{if(!mn.contains(e.target))mn.classList.remove('on')});
/* --- where am I? --- */
const lbar=document.createElement('div');lbar.id='locbar';document.body.appendChild(lbar);
const sc=document.createElement('div');sc.id='sc';sc.innerHTML='<div class="bx"><button class="x">✕</button><h3 style="margin:0">📍 Scan a checkpoint QR</h3><small style="color:var(--lo)">Small QR stickers on pillars and aisle ends tell the app exactly where you stand. The real build reads them with the phone camera; here, tap one to simulate a scan.</small><div class="lv2"></div><div class="g"></div></div>';document.body.appendChild(sc);
let SL=0;
function scUI(){sc.querySelector('.lv2').innerHTML=[0,1,2].map(l=>`<button class="${l==SL?'on':''}" data-l="${l}">Level ${l+1}</button>`).join('');sc.querySelector('.g').innerHTML=CP.map((c,k)=>`<button data-k="${k}">📷 ${c[0]}</button>`).join('')}
sc.onclick=e=>{const b=e.target.closest('button');if(e.target===sc||(b&&b.className=='x'))return sc.classList.remove('on');if(!b)return;
 if(b.dataset.l!==undefined){SL=+b.dataset.l;return scUI()}
 if(b.dataset.k!==undefined){const c=CP[+b.dataset.k];me={l:SL,p:locate(c[1]).pt};dc={};vl=SL;drawLevel();drawMe();levelUI();if(T3){lv3();hl3()}
  try{if(sel)choose(sel.l,sel.i,sel.hl);else if(route&&window.LW)go(...LW)}catch(x){}
  sc.classList.remove('on');API.call('POST','/api/checkpoint','position fixed at "'+c[0]+'" · L'+(SL+1),()=>0);notify('<b>📍 Location fixed</b>'+c[0]+' · Level '+(SL+1),'#2ee6c8')}};
function pill(){const b=CP.map(c=>({n:c[0],d:dist(c[1],me.p)})).sort((a,b)=>a.d-b.d)[0];
 lbar.innerHTML=`<div>📍 ${b.d<70?b.n:'Custom spot'} · L${me.l+1}<small>${navigator.onLine?(window.SP_STATUS||'🟢 Online'):'✈️ Offline'} · ${window.SP_STATUS?'':'saved '}map v${typeof MAPVER!=='undefined'?MAPVER:1}</small></div><button id="scb">Scan checkpoint</button>`;$('#scb').onclick=()=>{SL=me.l;scUI();sc.classList.add('on')}}
const _dm=drawMe;drawMe=function(){_dm();pill()};addEventListener('online',pill);addEventListener('offline',()=>{pill();notify('<b>✈️ You are offline</b>Map and search keep working from saved data','#ff8a5c')});
/* --- footfall heatmap (simulated base + real taps on this device) --- */
const heat=(l,i)=>{const r=Math.abs(Math.sin((i+1)*12.9898+l*78.233)*43758.5453)%1;return Math.min(1,r*.7+(LS('heat')[l+':'+i]||0)*.12)},hc=v=>`hsl(${Math.round(120-120*v)},85%,50%)`;
const _ch=choose;choose=function(l,i,hl){if(i!==null&&i!==undefined){const h=LS('heat');h[l+':'+i]=(h[l+':'+i]||0)+1;LS('heat',h)}return _ch(l,i,hl)};
const _dl2=drawLevel;drawLevel=function(){_dl2();if(HEAT)STORES.forEach((s,i)=>{if(tenant(vl,i).amenity)return;const r=s.r;el('rect',{x:r[0],y:r[1],width:r[2]-r[0],height:r[3]-r[1],fill:hc(heat(vl,i)),'fill-opacity':.6,'pointer-events':'none'},gL)})};
function heat3(){if(!T3)return;T3.lv.forEach((o,l)=>o.bl.forEach((b,i)=>b.material.color.set(HEAT&&!tenant(l,i).amenity?hc(heat(l,i)):DEPT[tenant(l,i).dept][1])))}
const _rb=rebuild3D;rebuild3D=function(){_rb();heat3()};
hb.onclick=()=>{HEAT=!HEAT;hb.classList.toggle('on',HEAT);$('#hl')||document.body.insertAdjacentHTML('beforeend','<div id="hl"><span>Quiet</span><i></i><span>Busy</span></div>');$('#hl').classList.toggle('on',HEAT);drawLevel();heat3();mn.classList.remove('on');if(HEAT)notify('<b>🔥 Footfall heatmap</b>Manager view: busier shops glow red','#ff8a5c')};
/* --- WhatsApp share --- */
wb.onclick=()=>{if(!mylist.length)return notify('<b>Your list is empty</b>Add products with “+ List” first','#ff5c3a');
 const t='🛒 My ShopPlanet shopping list\n'+mylist.map((x,k)=>`${k+1}. ${x.n} — ${tenant(x.l,x.i).name} (L${x.l+1})`).join('\n')+(route&&trip?`\n🧭 Smart route: ${Math.round(route.len)} m`:'')+'\nOpen the store map: '+location.href;
 window.open('https://wa.me/?text='+encodeURIComponent(t),'_blank');mn.classList.remove('on')};
/* --- "not here?" customer reports --- */
const _rd=render;render=function(){_rd();if(!sel)return;const L=$('#list');if(!L||L.querySelector('.rpt'))return;const b=document.createElement('button');b.className='rpt';b.textContent='⚠ Something not here? Tell staff';
 b.onclick=()=>{const r=LS('reports'),k=sel.l+':'+sel.i;r[k]=(r[k]||0)+1;LS('reports',r);b.textContent=r[k]>=3?'🚩 Staff alerted — thank you':'✓ Thanks, reported ('+r[k]+')';b.disabled=true;API.call('POST','/api/reports','slot '+k+' reported ×'+r[k],()=>0)};L.appendChild(b)};
/* --- mobile bottom sheet --- */
const g=document.createElement('div');g.id='grab';document.querySelector('aside').prepend(g);g.onclick=()=>document.querySelector('aside').classList.toggle('min');
pill();

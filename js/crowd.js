/* Crowd-verified live updates (simulated, browser-only):
   1) shoppers flag a product "not here"; 3 flags => product becomes UNVERIFIED (hidden from search, greyed on the shelf list, staff alerted)
   2) a shopper can re-confirm it by "scanning" the product barcode and the rack QR (camera scan is simulated) and earns 10 coins
   3) staff console can simulate a handheld-scanner webhook (product + rack) that moves a product with no manual editing */
const UNV=()=>LS('unv'),PREP=()=>LS('prep'),COINS=()=>+(LS('coins').n||0),pk=(l,i,n)=>l+':'+i+':'+n;
const barcode=n=>'EAN-89'+[...n].reduce((a,c)=>(a*31+c.charCodeAt(0))%1e9,7).toString().padStart(9,'0');
const rackQR=(l,i)=>'RACK-L'+(l+1)+'-S'+i;
/* hide unverified products from search results */
const _si=searchItems;searchItems=function(k){const u=UNV();return _si(k).filter(x=>!(x.p&&u[pk(x.l,x.i,x.p.n)]))};
/* add buttons to product cards */
const _rc=render;render=function(){_rc();if(!sel||trip)return;const u=UNV();
 document.querySelectorAll('#prods .card').forEach(c=>{const a=c.querySelector('.ad');if(!a)return;const[l,i,n]=a.dataset.a.split(':'),k=pk(+l,+i,n),pb=c.querySelector('.pb');if(!pb||pb.querySelector('.cw'))return;
  const d=document.createElement('div');d.className='cw';
  if(u[k]){c.classList.add('unv');d.innerHTML='<span class="uw">⚠ Location unverified · staff alerted</span><button class="fb">🪙 Found it? Earn 10 coins</button>';d.querySelector('.fb').onclick=()=>foundIt(+l,+i,n)}
  else{d.innerHTML='<button class="nh">Not here?</button>';d.querySelector('.nh').onclick=e=>{e.target.disabled=true;notHere(+l,+i,n)}}
  pb.appendChild(d)})};
function notHere(l,i,n){const r=PREP(),k=pk(l,i,n);r[k]=(r[k]||0)+1;LS('prep',r);
 API.call('POST','/api/products/report',`db.products.updateOne({name:"${n}"},{$inc:{errorCount:1}}) → count ${r[k]}`,()=>0);
 if(r[k]>=3){const u=UNV();u[k]=1;LS('unv',u);commit(`${esc(n)} flagged UNVERIFIED after 3 shopper reports`,'/api/products/state');runSearch();render();notify('<b>🚩 Marked unverified</b>3 reports: hidden from search, staff alerted','#ff5c3a')}
 else{notify('<b>Thanks, reported</b>'+r[k]+' of 3 reports needed to flag it','#2ee6c8');render()}}
/* shopper re-confirmation (simulated scan) */
function foundIt(l,i,n){let s1=false,s2=false;const m=document.createElement('div');m.className='fm';
 m.innerHTML=`<div class="bx"><button class="x">✕</button><h3>🪙 Found ${esc(n)}?</h3><p class="sm">Camera scanning is simulated in this prototype.</p>
 <div class="st"><span>1. Product barcode</span><button id="s1">Scan</button><code id="c1">—</code></div>
 <div class="st"><span>2. Rack QR code</span><button id="s2">Scan</button><code id="c2">—</code></div>
 <button id="ok" disabled>Confirm location (+10 coins)</button><p class="sm">Your coins: <b id="cn">${COINS()}</b></p></div>`;document.body.appendChild(m);
 const chk=()=>m.querySelector('#ok').disabled=!(s1&&s2);
 m.querySelector('.x').onclick=()=>m.remove();
 m.querySelector('#s1').onclick=()=>{s1=true;m.querySelector('#c1').textContent=barcode(n);chk()};
 m.querySelector('#s2').onclick=()=>{s2=true;m.querySelector('#c2').textContent=rackQR(l,i);chk()};
 m.querySelector('#ok').onclick=()=>{const o=own(l,i),p=o.prods.find(x=>x.n===n);if(p)p.ts=Date.now();const u=UNV(),r=PREP(),k=pk(l,i,n);delete u[k];delete r[k];LS('unv',u);LS('prep',r);LS('coins',{n:COINS()+10});
  API.call('POST','/api/products/confirm',`db.products.updateOne({name:"${n}"},{$set:{state:"verified",slot:"${rackQR(l,i)}"}}) · +10 coins`,()=>0);
  m.remove();commit(`${esc(n)} re-confirmed by a shopper (+10 coins)`,'/api/products/state');render();notify('<b>🪙 +10 coins · '+COINS()+' total</b>Thanks, '+esc(n)+' is back on the map','#2ee6c8')}}
/* staff console additions: unverified list + scanner webhook simulator */
const _ui=ui;ui=function(){_ui();const c=$('#edc');if(!c)return;const u=UNV(),ks=Object.keys(u);
 const sl=[];for(let l=0;l<LEVELS;l++)STORES.forEach((_,i)=>{if(i!==LIFT&&!tenantRaw(l,i).amenity&&tenantRaw(l,i).name!=='Vacant unit')sl.push([l,i])});
 const h=document.createElement('div');h.id='crowd';
 h.innerHTML=`<hr><h4>Unverified products (${ks.length})</h4>`+(ks.map(k=>{const[l,i,n]=k.split(':');return`<div class="er"><span>🚩 L${+l+1} · ${esc(tenant(+l,+i).name)} · ${esc(n)}</span><button data-k="${esc(k)}" class="vv">✓ verified</button></div>`}).join('')||'<div class="er">None</div>')+
 `<h4>Simulate handheld scanner webhook</h4><div class="ef"><input id="wh_p" placeholder="Product e.g. Jeans" list="wh_l"><datalist id="wh_l">${[...new Set(sl.flatMap(([l,i])=>tenantRaw(l,i).prods.map(p=>p.n)))].map(n=>`<option value="${esc(n)}">`).join('')}</datalist>
 <select id="wh_r">${sl.map(([l,i])=>`<option value="${l}:${i}">${rackQR(l,i)} · L${l+1} ${esc(tenantRaw(l,i).name)}</option>`).join('')}</select><button class="bs" id="wh_go">Send webhook</button></div><small id="wh_o" style="color:var(--lo)"></small>`;
 c.appendChild(h);
 h.querySelectorAll('.vv').forEach(b=>b.onclick=()=>{const k=b.dataset.k,u2=UNV(),r=PREP();delete u2[k];delete r[k];LS('unv',u2);LS('prep',r);commit('Staff marked '+esc(k.split(':')[2])+' verified','/api/products/state')});
 $('#wh_go').onclick=()=>{const q=$('#wh_p').value.trim().toLowerCase(),[tl,ti]=$('#wh_r').value.split(':').map(Number);if(!q)return notify('<b>Enter a product</b>','#ff5c3a');
  let src=null;for(const[l,i]of sl){const ix=tenantRaw(l,i).prods.findIndex(p=>p.n.toLowerCase()===q);if(ix>=0&&!(l===tl&&i===ti)){src=[l,i,ix];break}}
  if(!src)return notify('<b>Not found elsewhere</b>No product named "'+esc(q)+'" outside that rack','#ff5c3a');
  const[sl_,si,ix]=src,so=own(sl_,si),p=so.prods.splice(ix,1)[0];p.ts=Date.now();own(tl,ti).prods.push(p);
  const u3=UNV(),r2=PREP();[pk(sl_,si,p.n)].forEach(k=>{delete u3[k];delete r2[k]});LS('unv',u3);LS('prep',r2);
  const body={sku:barcode(p.n),rack:rackQR(tl,ti),event:'MOVE',source:'handheld-scanner'};
  API.call('POST','/api/webhooks/ims',JSON.stringify(body),()=>0);
  commit(`Scanner webhook: ${esc(p.n)} moved to ${rackQR(tl,ti)}`,'/api/webhooks/ims');
  const o=$('#wh_o');if(o)o.textContent='Payload sent: '+JSON.stringify(body)}};

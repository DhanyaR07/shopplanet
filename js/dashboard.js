/* Store-owner dashboard (simulated analytics) */
const dbs=$('#dbs');dbs.innerHTML=STORES.map((s,i)=>s.amenity?'':`<option value="${i}">${s.icon} ${s.name}</option>`).join('');
function dash(){const i=+dbs.value,s=STORES[i],r=n=>{const x=Math.sin(n*12.9898+i*78.233)*43758.5453;return x-Math.floor(x)},
 se=Math.round(180+r(1)*620),vi=Math.round(se*(.35+r(2)*.3)),ov=Math.round(vi*(.5+r(3)*.4)),cv=(8+r(4)*14).toFixed(1),d=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],v=d.map((_,k)=>.35+r(10+k)*.65*(k>=4?1.4:1)),mx=Math.max(...v);
 const top=s.prods.slice().sort((a,b)=>r(a.p)-r(b.p)).map(p=>`${p.n}`).slice(0,3).join(', ');
 $('#dbc').innerHTML=`<div class="kp"><div><b>${se}</b><span>Searches (7d)</span></div><div><b>${vi}</b><span>Navigations to store</span></div><div><b>${ov}</b><span>Offer views</span></div><div><b>${cv}%</b><span>Search→visit</span></div></div>
 <div class="bars">${v.map((x,k)=>`<i style="height:${x/mx*100}%"><u>${d[k]}</u></i>`).join('')}</div>
 <div class="tp">Most searched here: <b>${top}</b><br>Peak hours: <b>${r(5)>.5?'5–8 pm':'12–3 pm'}</b> · Footfall from L${1+Math.floor(r(6)*3)} is highest</div>
 <button class="bs" id="bst">🚀 Boost an offer on ShopPlanet (₹${Math.round(200+r(7)*800)}/week)</button>`;
 $('#bst').onclick=()=>{$('#db').classList.remove('on');notify(`<b>🚀 Offer boosted</b>${s.name} now shows first for matching searches (demo)`,'#ff8a5c')}}
dbs.onchange=dash;$('#dbb').onclick=()=>{$('#db').classList.add('on');dash()};$('#dbx').onclick=()=>$('#db').classList.remove('on');

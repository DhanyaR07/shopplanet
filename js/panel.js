/* ---------- panel rendering ---------- */
const tag=(p,l,i)=>`<span class="tag" style="--c:${BD[p.b].c}" data-k="${l}:${i}:${p.n}">${BD[p.b].ic} ${p.o?p.o+'% OFF':BD[p.b].l}</span>`;
const agoTxt=ts=>{const m=Math.round((Date.now()-ts)/6e4);return m<1?'just now':m<60?m+' min ago':m<1440?Math.round(m/60)+' h ago':Math.round(m/1440)+' d ago'};
const meta=p=>(p.ts?` · ✓ location confirmed ${agoTxt(p.ts)}`:'')+(p.to?` · until ${p.to}`:'');
const inList=(l,i,n)=>mylist.some(x=>x.l===l&&x.i===i&&x.n===n);
function render(){const L=$('#list'),H=$('#h'),B=$('#lb');
 B.innerHTML=mylist.length?`<div class="lbar">🛒 ${tt('list')} (${mylist.length}) <button id="pt">${tt('plan')}</button><button id="cl">${tt('clr')}</button></div>`:'';
 if(mylist.length){$('#pt').onclick=planTrip;$('#cl').onclick=()=>{mylist=[];render()}}
 if(trip&&route){H.style.display='none';const stops=route.wps.slice(1);
  L.innerHTML=`<div class="det"><div class="hd"><span class="ic">🧭</span><div><h2>Your trip · ${stops.length} stops</h2><p>Order optimised with navmesh distances</p></div><button id="bk">✕</button></div>
  <div class="sum"><div><b>${Math.round(route.len)} m</b><span>total</span></div><div><b>${mins(route.len)} min</b><span>walk</span></div><div><b>${route.legs.some(x=>x.lift!==undefined)?'Lift':'Same floor'}</b><span>levels</span></div></div>
  ${stops.map((w,k)=>{const t=tenant(w.l,w.i);return`<div class="res"><span class="ri">${k+1}</span><div class="rb"><div class="rn">${t.name}</div><div class="rs">${LVN[w.l]} · ${w.n||''}</div></div></div>`}).join('')}</div>`;
  $('#bk').onclick=()=>{trip=false;route=null;mylist=[];choose(0,null);}
  return}
 if(sel){H.style.display='none';const{l,i}=sel,t=tenant(l,i),m=D(l,i),zs=route?route.legs.flatMap(x=>x.f.polys.map(k=>POLYS[k].name)).filter(n=>n!=='Doorway'&&n!==STORES[i].name&&n!==STORES[LIFT].name).filter((n,k,a)=>n!==a[k-1]):[];
  const lift=l!==me.l;
  L.innerHTML=`<div class="det"><div class="hd"><span class="ic" style="background:${DEPT[t.dept][1]}33">${t.icon}</span><div><h2>${t.name}</h2><p><i class="dp" style="background:${DEPT[t.dept][1]}"></i>${DEPT[t.dept][0]} · ${LVN[l]}</p></div><button id="bk">✕</button></div>
  <div class="sum"><div><b>${Math.round(m)} m</b><span>distance</span></div><div><b>${mins(m)} min</b><span>walk</span></div><div><b>${LVN[l].split(' ')[0]}</b><span>floor</span></div></div>
  <div class="via">You ${lift?'→ Lift (to '+LVN[l]+') ':''}${zs.map(z=>'→ '+z).join(' ')} → <b>${t.name}</b></div>
  <div id="prods">${t.prods.map(p=>`<div class="card${sel.hl===p.n?' hl':''}"><span class="pi" style="background:linear-gradient(135deg,${DEPT[t.dept][1]}55,${DEPT[t.dept][1]}11)">${t.icon}</span><div class="pb"><div class="pn">${p.n}</div><div class="pv">${VAR[t.dept]||''}${meta(p)}</div><div class="pr"><b>${money(p.p)}</b>${p.o?` <s>${money(old(p))}</s>`:''}</div></div><div class="pa">${tag(p,l,i)}<button class="ad${inList(l,i,p.n)?' on':''}" data-a="${l}:${i}:${p.n}">${inList(l,i,p.n)?'✓ In list':'＋ List'}</button></div></div>`).join('')||'<p class="via">Facility — no products.</p>'}</div></div>`;
  $('#bk').onclick=()=>choose(0,null);L.querySelectorAll('.tag').forEach(x=>x.onclick=()=>info(x));
  L.querySelectorAll('.ad').forEach(b=>b.onclick=()=>{const[a,c,n]=b.dataset.a.split(':');inList(+a,+c,n)?mylist=mylist.filter(x=>!(x.l===+a&&x.i===+c&&x.n===n)):mylist.push({l:+a,i:+c,n});render()});return}
 H.style.display='block';H.textContent=qs?(res.length?tt('res'):'No match — try “shoes”, “pizza”, “toilet”'):(flt?BD[flt].l+'s':tt('pop'));
 L.innerHTML=res.slice(0,10).map((x,k)=>`<div class="res" data-k="${k}"><span class="ri">${tenant(x.l,x.i).icon}</span><div class="rb"><div class="rn">${x.t}</div><div class="rs">${x.sub} · ${LVN[x.l].split(' ')[0]} · ${away(x.l,x.i)}</div></div>${x.p?tag(x.p,x.l,x.i):''}</div>`).join('');
 L.querySelectorAll('.res').forEach(r=>r.onclick=e=>{if(e.target.closest('.tag'))return info(e.target.closest('.tag'));const x=res[+r.dataset.k];choose(x.l,x.i,x.p&&x.p.n)});
 L.querySelectorAll('.tag').forEach(x=>x.onclick=e=>{e.stopPropagation();info(x)})}
function info(t){const[l,i,n]=t.dataset.k.split(':'),T=tenant(+l,+i),p=T.prods.find(x=>x.n===n);
 const m={o:`${p.o}% off today — save ${money(old(p)-p.p)} at ${T.name}.`,b:`One of the top-selling items at ${T.name} this month.`,t:`Demand for ${p.n} is rising fast this week.`}[p.b];notify(`<b>${BD[p.b].ic} ${BD[p.b].l} · ${p.n}</b>${m}`,BD[p.b].c)}
function notify(h,c){const T=$('#toast');T.style.setProperty('--c',c||'#2ee6c8');T.innerHTML=h;T.classList.add('on');clearTimeout(T.t);T.t=setTimeout(()=>T.classList.remove('on'),3800)}

/* ---------- events ---------- */
svg.addEventListener('click',e=>{const P=svg.createSVGPoint();P.x=e.clientX;P.y=e.clientY;const p=P.matrixTransform(svg.getScreenCTM().inverse()),pt=[p.x,p.y];
 if(pick){me={l:vl,p:locate(pt).pt};dc={};pick=false;svg.classList.remove('pick');$('#loc').classList.remove('on');drawMe();if(sel)choose(sel.l,sel.i,sel.hl);else render();return}
 const i=STORES.findIndex(s=>inR(pt,s.r));if(i>=0)choose(vl,i)});
$('#loc').onclick=()=>{if(is3)return notify('Switch to 2D map to set your location');pick=!pick;svg.classList.toggle('pick',pick);$('#loc').classList.toggle('on',pick)};
$('#q').oninput=e=>{qs=e.target.value;if(sel||trip){sel=null;trip=false;route=null;drawRoute();if(T3){draw3DRoute();hl3()}}setStep(qs?3:2);runSearch()};
document.querySelectorAll('.chip').forEach(c=>c.onclick=()=>{flt=c.dataset.f;document.querySelectorAll('.chip').forEach(x=>x.classList.toggle('on',x===c));drawLevel();runSearch();if(T3)hl3()});
document.querySelectorAll('.lv').forEach(b=>b.onclick=()=>{follow=false;setLevel(+b.dataset.l)});
$('#v2').onclick=()=>setView(false);$('#v3').onclick=()=>setView(true);
$('#nav').onchange=e=>gN.style.display=e.target.checked?'block':'none';$('#raw').onchange=drawRoute;
$('#leg').innerHTML=Object.entries(DEPT).filter(e=>e[0]!=='U').map(([k,[n,c]])=>`<button data-d="${k}"><i style="background:${c}"></i>${n}</button>`).join('');
$('#leg').querySelectorAll('button').forEach(b=>b.onclick=()=>{dep=dep===b.dataset.d?'':b.dataset.d;$('#leg').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x.dataset.d===dep));drawLevel();if(T3)hl3()});

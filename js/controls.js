/* ===== prototype extras: theme, explode view, voice, store dashboard ===== */
function applyTheme3(){if(!T3)return;const L=document.body.classList.contains('light');T3.S.children.forEach(c=>{if(c.isPoints)c.visible=!L});
 T3.lv.forEach(o=>{o.slab.material.color.set(L?0xe6d9b8:0x161d3d);o.pl.material.color.set(L?0x6e5a28:0xffffff);o.edge.material.color.set(L?0xc9962b:0x2ee6c8);o.wm.color.set(L?0x8c7c55:0xcfd9ff)})}
const _i3=init3D;init3D=function(){_i3();applyTheme3()};
$('#th').onclick=()=>{document.body.classList.toggle('light');applyTheme3()};
$('#ex').onclick=e=>{window.EXP=!window.EXP;e.target.classList.toggle('on',window.EXP);if(window.EXP&&!is3)setView(true)};
window.VOICE=false;$('#vc').onclick=e=>{VOICE=!VOICE;e.target.textContent=VOICE?'🔊 Voice':'🔇 Voice';e.target.classList.toggle('on',VOICE);if(!VOICE)speechSynthesis.cancel();else speakText('Voice guidance on')};
function speakText(t){try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='en-IN';speechSynthesis.speak(u)}catch(e){}}
window.speakRoute=()=>{if(!VOICE||!route)return;const w=route.wps.at(-1),n=sel?tenant(sel.l,sel.i).name:'your last stop',m=Math.round(route.len);speakText(trip?`Smart trip started. ${route.wps.length-1} stops, ${m} metres.`:`Heading to ${n}. ${m} metres, about ${Math.max(1,Math.round(m/80))} minute walk${w.l!==me.l?', via the lift':''}.`)};

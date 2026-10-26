/* ---------- flow stepper, levels, i18n, voice ---------- */
function setStep(n){step=n;$('#steps').innerHTML=tt('st').map((s,k)=>`<span class="${k+1<n?'dn':k+1===n?'on':''}"><i>${k+1}</i>${s}</span>`).join('')}
function levelUI(){document.querySelectorAll('.lv').forEach(b=>b.classList.toggle('on',+b.dataset.l===vl));$('#v2').classList.toggle('on',!is3);$('#v3').classList.toggle('on',is3)}
function setLevel(l){vl=l;drawLevel();drawMe();drawRoute();levelUI();if(T3)lv3()}
function i18n(){$('#q').placeholder=tt('ph');$('#loc').textContent=tt('loc');document.querySelectorAll('.chip').forEach(c=>c.textContent=tt(c.dataset.f||'all'));setStep(step);render()}
$('#lang').onclick=()=>{lng=lng==='en'?'ta':'en';$('#lang').textContent=lng==='en'?'தமிழ்':'EN';i18n()};
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
if(SR){$('#mic').onclick=()=>{const r=new SR();r.lang=lng==='ta'?'ta-IN':'en-IN';r.onresult=e=>{$('#q').value=qs=e.results[0][0].transcript;sel=null;trip=false;runSearch();setStep(3)};r.start();$('#mic').classList.add('on');r.onend=()=>$('#mic').classList.remove('on')}}else $('#mic').style.display='none';

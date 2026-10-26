/* Live sync with server.js (falls back to local-only mode if no server answers).
   - every commit PUTs the shared state; every other open phone receives it over Server-Sent Events
   - real inventory webhook: POST /api/webhooks/ims {sku, rack, event:"MOVE"} moves the product on every phone */
(function(){
const CID=Math.random().toString(36).slice(2,8);let LIVE=false;
const pillEl=document.createElement('div');pillEl.id='livepill';document.body.appendChild(pillEl);
const setPill=(t,c)=>{pillEl.textContent=t;pillEl.className=c||'';window.SP_STATUS=c==='on'?'🟢 '+t.replace('● ',''):'';try{window.pill&&window.pill()}catch(e){}};setPill('Local mode · no server','off');
const full=()=>Object.assign(snap(),{unv:UNV(),prep:PREP(),reports:LS('reports')});
async function push(){if(!LIVE)return;try{const r=await fetch('/api/state',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({from:CID,state:full()})});if(!r.ok)throw 0}catch(e){LIVE=false;setPill('Server lost · working locally','off')}}
function remote(d){apply(d);LS('unv',d.unv||{});LS('prep',d.prep||{});LS('reports',d.reports||{});try{localStorage.setItem(KEY,JSON.stringify(snap()))}catch(e){}refreshAll();ui();try{pill()}catch(e){}}
const _c=commit;commit=function(m,a){_c(m,a);push()};
const _nh=notHere;notHere=function(l,i,n){_nh(l,i,n);push()};
const _ac=API.call;API.call=function(m,u,db,f){if(!LIVE)return _ac.call(API,m,u,db,f);const t=performance.now();
 return fetch('/api/trace',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({m,u})}).then(()=>{API.push(`${m} ${u}\n  ↳ ${db}  → 200 · ${Math.round(performance.now()-t)} ms · live server`);return f()}).catch(()=>_ac.call(API,m,u,db,f))};
function findProd(sku){for(let l=0;l<LEVELS;l++)for(let i=0;i<STORES.length;i++){if(i===LIFT)continue;const r=tenantRaw(l,i);const ix=r.prods.findIndex(p=>barcode(p.n)===sku);if(ix>=0)return[l,i,ix]}return null}
async function ack(id,result){try{await fetch('/api/webhooks/ack',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,result})})}catch(e){}}
function applyHook(h){const m=/^RACK-L(\d)-S(\d+)$/.exec(h.rack);if(!m)return ack(h.id,'not-found');const tl=+m[1]-1,ti=+m[2];
 if(tl<0||tl>=LEVELS||ti>=STORES.length||ti===LIFT)return ack(h.id,'not-found');
 let src=null;for(let l=0;l<LEVELS;l++)for(let i=0;i<STORES.length;i++){if(i===LIFT)continue;const ix=tenantRaw(l,i).prods.findIndex(p=>barcode(p.n)===h.sku);if(ix>=0&&!src&&!(l===tl&&i===ti))src=[l,i,ix]}
 if(!src)return ack(h.id,'not-found');
 const so=own(src[0],src[1]),p=so.prods.splice(src[2],1)[0];p.ts=Date.now();own(tl,ti).prods.push(p);
 const u=UNV(),r=PREP(),k=pk(src[0],src[1],p.n);delete u[k];delete r[k];LS('unv',u);LS('prep',r);
 commit(`Inventory webhook: ${esc(p.n)} moved to ${h.rack}`,'/api/webhooks/ims');ack(h.id,'moved')}
const _ui=ui;ui=function(){_ui();if(!LIVE)return;const b=$('#wh_go');if(!b)return;
 b.onclick=async()=>{const q=$('#wh_p').value.trim().toLowerCase();if(!q)return notify('<b>Enter a product</b>','#ff5c3a');
  let f=null;for(let l=0;l<LEVELS&&!f;l++)for(let i=0;i<STORES.length&&!f;i++){if(i===LIFT)continue;const p=tenantRaw(l,i).prods.find(x=>x.n.toLowerCase()===q);if(p)f=p}
  if(!f)return notify('<b>Not found</b>No product named "'+esc(q)+'"','#ff5c3a');
  const [tl,ti]=$('#wh_r').value.split(':').map(Number),body={event:'MOVE',sku:barcode(f.n),rack:rackQR(tl,ti),source:'handheld-scanner'};
  const r=await fetch('/api/webhooks/ims',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}),j=await r.json();
  const o=$('#wh_o');if(o)o.textContent='Real POST /api/webhooks/ims → '+r.status+' '+JSON.stringify(j)+' · payload '+JSON.stringify(body)}};
(async function init(){
 try{const r=await fetch('/api/state',{cache:'no-store'});if(!r.ok)throw 0;const j=await r.json();LIVE=true;
  if(j.state&&j.state.v>=MAPVER)remote(j.state);else await push();
  const es=new EventSource('/api/events?cid='+CID);
  es.addEventListener('hello',e=>{setPill('● Live · connected','on');JSON.parse(e.data).pending.forEach(applyHook)});
  es.addEventListener('clients',e=>setPill('● Live · '+JSON.parse(e.data).n+' device'+(JSON.parse(e.data).n===1?'':'s'),'on'));
  es.addEventListener('state',e=>{const m=JSON.parse(e.data);if(m.from===CID||m.state.v<=MAPVER)return;remote(m.state);notify('<b>🔄 Updated live</b>'+esc((m.state.log[0]||{}).m||'The store changed'),'#2ee6c8')});
  es.addEventListener('webhook',e=>{const h=JSON.parse(e.data);if(h.to===CID)applyHook(h)});
  es.onerror=()=>setPill('Reconnecting…','off');
 }catch(e){LIVE=false}
})();
window.SP_LIVE=()=>LIVE;
})();

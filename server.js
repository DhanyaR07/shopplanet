/* ShopPlanet live server: zero dependencies (Node 18+).
   Run:  node server.js   then open http://localhost:3000
   - serves the app
   - GET/PUT /api/state       shared map + data state (saved to data/db.json)
   - GET     /api/events      Server-Sent Events: live push of every change to every open phone
   - POST    /api/webhooks/ims   real inventory/scanner webhook {sku, rack, event:"MOVE"}
   - GET     /api/webhooks    webhook history · GET /api/health · POST /api/trace (API log line) */
const http=require('http'),fs=require('fs'),path=require('path');
const ROOT=__dirname,PORT=+process.env.PORT||3000,DBF=path.join(ROOT,'data','db.json');
let db={rev:0,state:null,hooks:[],seq:0,trace:[]};
try{db=Object.assign(db,JSON.parse(fs.readFileSync(DBF,'utf8')))}catch(e){}
const save=()=>{try{fs.writeFileSync(DBF+'.tmp',JSON.stringify(db));fs.renameSync(DBF+'.tmp',DBF)}catch(e){console.error('save failed',e.message)}};
const clients=new Map(); // cid -> res
const send=(res,ev,d)=>res.write(`event: ${ev}\ndata: ${JSON.stringify(d)}\n\n`);
const all=(ev,d)=>clients.forEach(r=>send(r,ev,d));
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.csv':'text/csv','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.json':'application/json'};
const body=req=>new Promise((ok,no)=>{let s='';req.on('data',c=>{s+=c;if(s.length>2e6){no(new Error('too large'));req.destroy()}});req.on('end',()=>{try{ok(s?JSON.parse(s):{})}catch(e){no(e)}})});
const json=(res,code,o)=>{res.writeHead(code,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(o))};
const firstClient=()=>clients.keys().next().value;
http.createServer(async(req,res)=>{
 const u=new URL(req.url,'http://x'),p=u.pathname;
 try{
 if(p==='/api/health')return json(res,200,{ok:true,rev:db.rev,clients:clients.size});
 if(p==='/api/state'&&req.method==='GET')return json(res,200,{rev:db.rev,state:db.state});
 if(p==='/api/state'&&req.method==='PUT'){const b=await body(req);
  if(!b.state||typeof b.state!=='object'||typeof b.state.v!=='number')return json(res,400,{error:'state with numeric v required'});
  db.state=b.state;db.rev++;save();all('state',{rev:db.rev,from:b.from,state:db.state});return json(res,200,{rev:db.rev})}
 if(p==='/api/trace'&&req.method==='POST'){const b=await body(req);db.trace.unshift({t:Date.now(),m:b.m,u:b.u});db.trace.length=Math.min(db.trace.length,50);console.log(new Date().toISOString().slice(11,19),b.m,b.u);return json(res,200,{ok:true})}
 if(p==='/api/webhooks/ims'&&req.method==='POST'){const b=await body(req);
  if(b.event!=='MOVE'||typeof b.sku!=='string'||!/^EAN-89\d{9}$/.test(b.sku)||typeof b.rack!=='string'||!/^RACK-L\d-S\d+$/.test(b.rack))
   return json(res,400,{error:'expected {event:"MOVE", sku:"EAN-89#########", rack:"RACK-L1-S12"}'});
  const h={id:++db.seq,sku:b.sku,rack:b.rack,event:'MOVE',source:b.source||'webhook',at:Date.now(),status:'pending'};db.hooks.unshift(h);db.hooks.length=Math.min(db.hooks.length,50);save();
  const to=firstClient();if(to)send(clients.get(to),'webhook',Object.assign({to},h));
  console.log('webhook',h.sku,'->',h.rack,to?'(sent to a live phone)':'(queued, no phone connected)');return json(res,202,{id:h.id,status:'pending',delivered:!!to})}
 if(p==='/api/webhooks/ack'&&req.method==='POST'){const b=await body(req),h=db.hooks.find(x=>x.id===b.id);if(h){h.status=b.result==='moved'?'applied':'not-found';save();all('hooks',db.hooks.slice(0,10))}return json(res,200,{ok:!!h})}
 if(p==='/api/webhooks'&&req.method==='GET')return json(res,200,db.hooks);
 if(p==='/api/events'){const cid=u.searchParams.get('cid')||('c'+Math.random());
  res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache',Connection:'keep-alive'});
  clients.set(cid,res);send(res,'hello',{rev:db.rev,pending:db.hooks.filter(h=>h.status==='pending').reverse()});all('clients',{n:clients.size});
  const ka=setInterval(()=>res.write(': keepalive\n\n'),20000);
  req.on('close',()=>{clearInterval(ka);clients.delete(cid);all('clients',{n:clients.size})});return}
 // static files
 let f=p==='/'?'/index.html':decodeURIComponent(p);const fp=path.normalize(path.join(ROOT,f));
 if(!fp.startsWith(ROOT)||/db\.json|server\.js/.test(fp)){res.writeHead(403);return res.end('forbidden')}
 fs.readFile(fp,(e,d)=>{if(e){res.writeHead(404);return res.end('not found')}res.writeHead(200,{'Content-Type':MIME[path.extname(fp)]||'application/octet-stream'});res.end(d)});
 }catch(e){json(res,400,{error:String(e.message||e)})}
}).listen(PORT,()=>console.log('ShopPlanet live server on http://localhost:'+PORT));

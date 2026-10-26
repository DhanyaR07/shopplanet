/* ---------- search ---------- */
function searchItems(k){const out=[];k=k.trim().toLowerCase();
 for(let l=0;l<LEVELS;l++)STORES.forEach((s,i)=>{const t=tenant(l,i);
  if(k){if(t.name.toLowerCase().includes(k))out.push({l,i,t:t.name,sub:t.amenity?'Facility':DEPT[t.dept][0]});t.prods.forEach(p=>{if(p.n.toLowerCase().includes(k))out.push({l,i,p,t:p.n,sub:t.name})})}
  else t.prods.forEach(p=>{if(flt?p.b===flt:p.b==='o'||p.b==='b')out.push({l,i,p,t:p.n,sub:t.name})})});
 return out.sort((a,b)=>D(a.l,a.i)-D(b.l,b.i))}
function runSearch(){const k=qs;API.call('GET','/api/search?q='+encodeURIComponent(k||'*')+(flt?'&badge='+flt:''),k?`db.products.find({name:/${k}/i}).sort({distance:1})`:`db.products.find({badge:{$in:['offer','best']}})`,()=>searchItems(k)).then(r=>{if(k!==qs)return;res=r;render()})}

/* ---------- simulated backend (Express + MongoDB in the real build) ---------- */
const API={log:[],push(s){this.log.unshift(s);this.log.length=Math.min(this.log.length,6);$('#api').textContent=this.log.join('\n')},
 call(m,u,db,f){const t=performance.now();return new Promise(r=>setTimeout(()=>{const x=f();this.push(`${m} ${u}\n  ↳ ${db}  → 200 · ${Math.round(performance.now()-t)} ms`);r(x)},30+Math.random()*40))}};

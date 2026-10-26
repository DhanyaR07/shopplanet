/* ---------- boot: QR landing -> 3D store ---------- */
function start(){$('#land').classList.add('hide');setStep(2);setView(true);api0()}
function api0(){API.push('GET /s/erode-pilot (QR)\n  ↳ db.stores.findOne({qr:"erode-pilot"})  → 200 · layout + 126 products')}
$('#scan').onclick=start;
setStep(1);drawLevel();drawMe();levelUI();runSearch();requestAnimationFrame(tick);

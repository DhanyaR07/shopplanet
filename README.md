# ShopPlanet - 3D Spatial Navigation System
Open `index.html` in Chrome/Edge (internet needed once for Three.js r128 from cdnjs). No build step.

```
index.html          page markup (landing QR + app shell)
css/main.css        base layout & components
css/ux.css          glass UI, mobile bottom sheet, location pill
css/extras.css      light theme, trip-savings chip, dashboard
assets/images.js    embedded floor-plan + 3D walls images (data URIs, work from file://)
assets/*.jpg|png    the same images as normal files
js/data.js          zones, obstacles, stores, products (demo data)
js/navmesh.js       navmesh build, A*, funnel smoothing
js/state.js         constants, departments, EN/Tamil strings, helpers
js/api.js           simulated Express + MongoDB backend log
js/map2d.js         2D SVG map & distance helpers
js/routing.js       multi-level routing (lift connector), trip planner
js/search.js        product / store search
js/panel.js         side-panel rendering
js/ui-flow.js       stepper, levels, language
js/events.js        UI event wiring
js/planet3d.js      Three.js 3D planet, camera, labels, route
js/editor.js        staff mode: add/remove/move shops & products, block aisles -> rebuild + sync
js/controls.js      theme, explode view, voice guidance
js/dashboard.js     store-owner dashboard
js/ux.js            menu, checkpoint-QR location, offline pill, heatmap, WhatsApp share, reports
js/boot.js          QR landing -> app start
```
Scripts are classic (not ES modules) and share one global scope, so keep the load order in `index.html`.

## New in this version
- **Realistic 3D shelves** (`js/planet3d.js` -> `racks3`): racks and product boxes are generated from the live product data using instanced meshes (fast on phones). Select a shop to see its product labels; the product you searched for is marked with a bouncing arrow.
- **Weekly planogram import** (Staff mode): paste or upload a CSV (see `data/sample-planogram.csv`). Columns: `level,shop,product,price,tag,start,end`. `tag` = `b` (best seller), `t` (trending), `o10`...`o90` (offer %), or `remove`. Dates are optional (YYYY-MM-DD).
- **Dated placements**: a product with a start/end date is live only between those dates (weekly front-section promos expire by themselves). Use *Preview a date* in Staff mode to see any day.
- **Last-confirmed labels**: staff tap the tick next to a product to confirm its location; shoppers see "location confirmed 2 d ago".
- **Rename / change type**: change what a space is (e.g. a room becomes a medical room) without touching geometry.
- **Change log**: every staff change is recorded with time and description.

## New: real backend with live push (server.js)

Run `node server.js` (Node 18+, no npm install) and open http://localhost:3000. Without the server the app still works in local mode.

- **Live sync:** every staff change, shopper report and re-confirmation is saved on the server (data/db.json) and pushed instantly to every open phone (Server-Sent Events). The status line under "Where am I" shows "Live · N devices".
- **Real inventory webhook:** `curl -X POST localhost:3000/api/webhooks/ims -H 'Content-Type: application/json' -d '{"event":"MOVE","sku":"EAN-89430206831","rack":"RACK-L1-S1"}'` moves that product on every phone. Bad payloads get HTTP 400. History: GET /api/webhooks. The staff console's "Send webhook" button now calls this real endpoint.
- **Self-healing map:** "Not here?" (3 reports flag a product unverified and hide it from search) and "Found it" (scan product and rack, +10 coins, product restored) now sync across devices.
- **Tested** with two separate browsers: price change, webhook move, flag and restore all appeared on the other device; state survived a server restart.
- **Not done:** one shared store only, last write wins on simultaneous edits, no login on staff or webhook endpoints, coins are per device, camera scan is simulated.

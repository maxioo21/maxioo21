// 1) mój dekoder kafelków vs oficjalna biblioteka, 2) numery OSM z kafelków vs Nominatim
import { VectorTile } from '@mapbox/vector-tile';
import Protobuf from 'pbf';
import fs from 'fs'; import vm from 'vm';
const html = fs.readFileSync('odkrywaj/index.html', 'utf8');
const core = html.match(/<script id="core">([\s\S]*?)<\/script>/)[1];
const ctx = { TextDecoder, console, module: { exports: {} } }; vm.createContext(ctx); vm.runInContext(core, ctx);
const C = ctx.module.exports;
const LAT = 50.2863, LON = 19.1041, z = 14, n = 2 ** z;
const tj = await (await fetch('https://tiles.openfreemap.org/planet')).json();
const x = Math.floor((LON + 180) / 360 * n), y = Math.floor((1 - Math.log(Math.tan(LAT * Math.PI / 180) + 1 / Math.cos(LAT * Math.PI / 180)) / Math.PI) / 2 * n);
const buf = new Uint8Array(await (await fetch(tj.tiles[0].replace('{z}', z).replace('{x}', x).replace('{y}', y))).arrayBuffer());
const mine = C.mvtDecode(buf, x, y, z);
const ref = new VectorTile(new Protobuf(buf)).layers.poi;
let same = 0; for (let i = 0; i < ref.length; i++) { const f = ref.feature(i); const g = f.toGeoJSON(x, y, z).geometry.coordinates; const m = mine[i]; if (m && m.id === f.id && m.p.name === f.properties.name && Math.abs(m.lng - g[0]) < 1e-6 && Math.abs(m.lat - g[1]) < 1e-6) same++; }
console.log(`DEKODER: mój=${mine.length} oficjalny=${ref.length} zgodne=${same}`);
const items = mine.map(C.tileItem).filter(Boolean).filter(i => i.tags.name);
const pick = items.filter(i => /restaurant|fast_food|museum|castle|swimming_pool|park/.test(Object.values(i.tags)[0])).slice(0, 12);
const ids = pick.map(i => ({ node: 'N', way: 'W', relation: 'R' }[i.id.split('/')[0]] + i.id.split('/')[1]));
const lk = await (await fetch(`https://nominatim.openstreetmap.org/lookup?format=jsonv2&osm_ids=${ids.join(',')}&extratags=1`, { headers: { 'User-Agent': 'Odkrywaj-test/1.0' } })).json();
const byId = new Map(lk.map(o => [o.osm_type + '/' + o.osm_id, o]));
let ok = 0; for (const i of pick) { const o = byId.get(i.id); const good = o && o.name === i.tags.name; if (good) ok++; console.log(`  ${good ? 'OK ' : '?? '} ${i.id} ${JSON.stringify(i.tags)} -> ${o ? o.name + ' [' + o.category + '=' + o.type + '] ' + JSON.stringify(o.extratags || {}).slice(0, 80) : 'brak'}`); }
console.log(`NUMERY OSM: ${ok}/${pick.length} zgodne`);

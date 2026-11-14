import { VectorTile } from '@mapbox/vector-tile';
import Protobuf from 'pbf';
const LAT = 50.2863, LON = 19.1041;
const tj = await (await fetch('https://tiles.openfreemap.org/planet')).json();
console.log('tilejson tiles:', tj.tiles, 'maxzoom', tj.maxzoom);
const z = 14, n = 2 ** z;
const x0 = Math.floor((LON + 180) / 360 * n), y0 = Math.floor((1 - Math.log(Math.tan(LAT * Math.PI / 180) + 1 / Math.cos(LAT * Math.PI / 180)) / Math.PI) / 2 * n);
const byClass = {}; let total = 0, food = 0, named = 0; const samples = []; let bytes = 0; const t0 = Date.now();
const FOODV = new Set(['restaurant', 'fast_food', 'cafe']);
await Promise.all([-1, 0, 1].flatMap(dy => [-1, 0, 1].map(async dx => {
  const url = tj.tiles[0].replace('{z}', z).replace('{x}', x0 + dx).replace('{y}', y0 + dy);
  const buf = Buffer.from(await (await fetch(url)).arrayBuffer()); bytes += buf.length;
  const vt = new VectorTile(new Protobuf(buf));
  if (dx === 0 && dy === 0) console.log('layers:', Object.keys(vt.layers).join(','));
  const L = vt.layers.poi; if (!L) return;
  for (let i = 0; i < L.length; i++) {
    const f = L.feature(i); const p = f.properties; total++; if (p.name) named++;
    byClass[p.class] = (byClass[p.class] || 0) + 1;
    const g = f.toGeoJSON(x0 + dx, y0 + dy, z); const [lo, la] = g.geometry.coordinates;
    const d = Math.hypot((lo - LON) * 71500, (la - LAT) * 111320);
    if (FOODV.has(p.subclass) && d < 2000) food++;
    if (samples.length < 8 && FOODV.has(p.subclass)) samples.push({ id: f.id, ...p });
  }
})));
console.log(`9 kafelków z14: ${(bytes / 1024).toFixed(0)} KB w ${Date.now() - t0} ms; poi=${total} (z nazwą ${named}); jedzenie <2km: ${food}`);
console.log('klasy:', Object.entries(byClass).sort((a, b) => b[1] - a[1]).slice(0, 30).map(([k, v]) => k + ':' + v).join(' '));
console.log('próbki:', JSON.stringify(samples));

const LAT = 50.2863, LON = 19.1041;
const H = { 'User-Agent': 'Mozilla/5.0 (Linux; Android 14; wv) AppleWebKit/537.36 Chrome/130 Mobile Safari/537.36', Origin: 'https://appassets.androidplatform.net' };
async function j(url, opt = {}) { const t = Date.now(); try { const c = new AbortController(); setTimeout(() => c.abort(), 20000); const r = await fetch(url, { ...opt, headers: { ...H, ...(opt.headers || {}) }, signal: c.signal }); const b = await r.json(); return [b, Date.now() - t, r.status]; } catch (e) { return [null, Date.now() - t, e.message]; } }
const FOOD = ['amenity:restaurant', 'amenity:fast_food', 'amenity:cafe'].map(t => 'osm_tag=' + t).join('&');
for (const lim of [50, 100, 200, 500]) { const [b, ms, st] = await j(`https://photon.komoot.io/reverse?lat=${LAT}&lon=${LON}&radius=2&limit=${lim}&${FOOD}`); console.log(`photon reverse limit=${lim}: ${b?.features?.length} (${ms}ms, ${st}) max dist ${b?.features?.length ? 'ok' : ''}`); }
// siatka 3x3
const R = 2000, pts = []; for (const dy of [-1, 0, 1]) for (const dx of [-1, 0, 1]) pts.push([LAT + dy * R * 0.66 / 111320, LON + dx * R * 0.66 / (111320 * Math.cos(LAT * Math.PI / 180))]);
const t0 = Date.now(); const all = new Map();
await Promise.all(pts.map(async ([la, lo]) => { const [b] = await j(`https://photon.komoot.io/reverse?lat=${la}&lon=${lo}&radius=0.95&limit=50&${FOOD}`); for (const f of b?.features || []) all.set(f.properties.osm_type + f.properties.osm_id, f); }));
console.log(`photon grid 3x3 (r=2km): ${all.size} unikalnych (${Date.now() - t0}ms)`);
const q = `[out:json][timeout:20];nwr["amenity"~"^(restaurant|fast_food|cafe)$"](around:2000,${LAT},${LON});out center 1000;`;
for (const u of ['https://overpass-api.de/api/interpreter', 'https://overpass.private.coffee/api/interpreter', 'https://overpass.kumi.systems/api/interpreter', 'https://maps.mail.ru/osm/tools/overpass/api/interpreter']) {
  const [b, ms, st] = await j(u, { method: 'POST', body: 'data=' + encodeURIComponent(q), headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
  console.log(`overpass ${new URL(u).host}: ${b?.elements?.length ?? '-'} (${ms}ms, ${st})`);
}
// Nominatim strony
let ex = [], tot = 0; const vb = `${LON - 0.028},${LAT + 0.018},${LON + 0.028},${LAT - 0.018}`;
for (let i = 0; i < 3; i++) { const [b, ms] = await j(`https://nominatim.openstreetmap.org/search?format=jsonv2&amenity=restaurant&viewbox=${vb}&bounded=1&limit=40${ex.length ? '&exclude_place_ids=' + ex.join(',') : ''}`); const n = b?.length || 0; tot += n; ex.push(...(b || []).map(x => x.place_id)); console.log(`nominatim restaurant page ${i + 1}: ${n} (${ms}ms)`); if (n < 40) break; await new Promise(r => setTimeout(r, 1100)); }

const ORIGIN = 'https://appassets.androidplatform.net';
const UA = 'Mozilla/5.0 (Linux; Android 14; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/130.0 Mobile Safari/537.36';
const LAT = 50.2863, LON = 19.1041;
async function t(name, url, opt = {}, show) {
  const t0 = Date.now();
  try {
    const c = new AbortController(); const to = setTimeout(() => c.abort(), 15000);
    const r = await fetch(url, { ...opt, signal: c.signal, headers: { 'User-Agent': UA, Origin: ORIGIN, Referer: ORIGIN + '/', ...(opt.headers || {}) } });
    const body = await r.text(); clearTimeout(to);
    let extra = '';
    try { const j = JSON.parse(body);
      if (j.elements) extra = `elements=${j.elements.length} ${j.remark || ''}`;
      else if (j.features) extra = `features=${j.features.length} :: ` + j.features.slice(0, 6).map(f => `${f.properties.name}[${f.properties.osm_key}=${f.properties.osm_value}]`).join(' | ');
      else if (Array.isArray(j)) extra = `items=${j.length} :: ` + j.slice(0, 5).map(x => `${x.name}[${x.category}=${x.type}]${x.extratags ? ' xt:' + Object.keys(x.extratags).slice(0,4).join(',') : ''}`).join(' | ');
      else extra = body.slice(0, 150);
    } catch { extra = 'body: ' + body.slice(0, 150).replace(/\s+/g, ' '); }
    console.log(`${r.ok ? 'OK ' : 'ERR'} ${r.status} ${String(Date.now() - t0).padStart(6)}ms ACAO=${r.headers.get('access-control-allow-origin')} | ${name} | ${extra}`);
  } catch (e) { console.log(`ERR ---- ${String(Date.now() - t0).padStart(6)}ms | ${name} | ${e.name}: ${e.message}`); }
}
const tiny = '[out:json][timeout:10];node(around:300,50.2863,19.1041)["amenity"="restaurant"];out 5;';
for (const u of ['https://overpass-api.de/api/status', 'https://overpass.private.coffee/api/status', 'https://overpass.kumi.systems/api/status']) await t('status ' + new URL(u).host, u);
for (const u of ['https://overpass-api.de/api/interpreter', 'https://overpass.private.coffee/api/interpreter', 'https://overpass.kumi.systems/api/interpreter', 'https://maps.mail.ru/osm/tools/overpass/api/interpreter'])
  await t('tiny ' + new URL(u).host, u + '?data=' + encodeURIComponent(tiny));
const vb = `${LON - 0.025},${LAT + 0.016},${LON + 0.025},${LAT - 0.016}`;
await t('nominatim [restaurant] viewbox', `https://nominatim.openstreetmap.org/search?format=jsonv2&q=restaurant&viewbox=${vb}&bounded=1&limit=40&extratags=1&addressdetails=1`);
await new Promise(r => setTimeout(r, 1100));
await t('nominatim amenity=restaurant (structured)', `https://nominatim.openstreetmap.org/search?format=jsonv2&amenity=restaurant&viewbox=${vb}&bounded=1&limit=40&extratags=1`);
await new Promise(r => setTimeout(r, 1100));
await t('nominatim q=[amenity=fast_food]', `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent('[amenity=fast_food]')}&viewbox=${vb}&bounded=1&limit=40&extratags=1`);
await new Promise(r => setTimeout(r, 1100));
await t('nominatim kebab', `https://nominatim.openstreetmap.org/search?format=jsonv2&q=kebab&viewbox=${vb}&bounded=1&limit=40&extratags=1`);
await new Promise(r => setTimeout(r, 1100));
await t('nominatim basen (swimming pool)', `https://nominatim.openstreetmap.org/search?format=jsonv2&q=swimming+pool&viewbox=${LON-0.08},${LAT+0.05},${LON+0.08},${LAT-0.05}&bounded=1&limit=40&extratags=1`);
await t('photon reverse radius osm_tag', `https://photon.komoot.io/reverse?lat=${LAT}&lon=${LON}&radius=2&limit=50&osm_tag=amenity:restaurant`);
await t('photon api q=restaurant osm_tag', `https://photon.komoot.io/api/?q=restaurant&lat=${LAT}&lon=${LON}&limit=50&osm_tag=amenity:restaurant&bbox=${LON-0.025},${LAT-0.016},${LON+0.025},${LAT+0.016}`);
await t('photon api q=kebab', `https://photon.komoot.io/api/?q=kebab&lat=${LAT}&lon=${LON}&limit=30&bbox=${LON-0.03},${LAT-0.02},${LON+0.03},${LAT+0.02}`);
await t('photon api q=museum osm_tag', `https://photon.komoot.io/api/?q=museum&lat=${LAT}&lon=${LON}&limit=30&osm_tag=tourism:museum`);

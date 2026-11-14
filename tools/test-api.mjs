// Diagnostyka: czy serwery map/wyszukiwania odpowiadają dla aplikacji (WebView Android)
const ORIGIN = 'https://appassets.androidplatform.net';
const UA = 'Mozilla/5.0 (Linux; Android 14; 23078PND5G Build/UKQ1.230804.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/130.0.6723.107 Mobile Safari/537.36';
const Q = '[out:json][timeout:25];(nwr["amenity"~"^(restaurant|fast_food|food_court|cafe)$"](around:1800,50.2863,19.1041););out center 250;';
const OVERPASS = ['https://overpass-api.de/api/interpreter','https://overpass.private.coffee/api/interpreter','https://maps.mail.ru/osm/tools/overpass/api/interpreter','https://overpass.kumi.systems/api/interpreter','https://overpass.osm.jp/api/interpreter'];
async function t(name, url, opt = {}) {
  const t0 = Date.now();
  try {
    const c = new AbortController(); const to = setTimeout(() => c.abort(), 30000);
    const r = await fetch(url, { ...opt, signal: c.signal, headers: { 'User-Agent': UA, Origin: ORIGIN, Referer: ORIGIN + '/', ...(opt.headers || {}) } });
    const body = await r.text(); clearTimeout(to);
    let extra = '';
    try { const j = JSON.parse(body); if (j.elements) extra = `elements=${j.elements.length}${j.remark ? ' remark=' + j.remark.slice(0, 80) : ''}`; else if (Array.isArray(j)) extra = `items=${j.length}`; else if (j.code) extra = 'code=' + j.code; else if (j.version) extra = 'style v' + j.version; } catch { extra = 'body: ' + body.slice(0, 120).replace(/\s+/g, ' '); }
    console.log(`${r.ok ? 'OK ' : 'ERR'} ${r.status} ${String(Date.now() - t0).padStart(6)}ms  ACAO=${r.headers.get('access-control-allow-origin')}  ${name}  ${extra}`);
  } catch (e) { console.log(`ERR ---- ${String(Date.now() - t0).padStart(6)}ms  ${name}  ${e.name}: ${e.message}`); }
}
for (const u of OVERPASS) await t('overpass ' + new URL(u).host, u, { method: 'POST', body: 'data=' + encodeURIComponent(Q), headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
for (const u of OVERPASS.slice(0, 3)) await t('overpass GET ' + new URL(u).host, u + '?data=' + encodeURIComponent(Q));
await t('nominatim reverse', 'https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=50.2863&lon=19.1041&zoom=10&accept-language=pl');
await t('nominatim search', 'https://nominatim.openstreetmap.org/search?format=jsonv2&q=Sosnowiec&countrycodes=pl&featureType=settlement&limit=5&accept-language=pl');
await t('osrm foot', 'https://routing.openstreetmap.de/routed-foot/route/v1/driving/19.1041,50.2863;19.12,50.29?overview=full&geometries=geojson&steps=true');
await t('osrm car', 'https://routing.openstreetmap.de/routed-car/route/v1/driving/19.1041,50.2863;19.12,50.29?overview=false');
await t('openfreemap style liberty', 'https://tiles.openfreemap.org/styles/liberty');
await t('openfreemap style bright', 'https://tiles.openfreemap.org/styles/bright');
await t('osm raster tile', 'https://tile.openstreetmap.org/14/9060/5552.png');
await t('carto tile', 'https://a.basemaps.cartocdn.com/rastertiles/voyager/14/9060/5552.png');
await t('wikidata', 'https://www.wikidata.org/w/api.php?action=wbgetentities&ids=Q190077&props=sitelinks&sitefilter=plwiki&format=json&origin=*');
await t('wikipedia summary', 'https://pl.wikipedia.org/api/rest_v1/page/summary/Sosnowiec');
await t('unpkg maplibre 4', 'https://unpkg.com/maplibre-gl@4/dist/maplibre-gl.js');
await t('unpkg maplibre-leaflet', 'https://unpkg.com/@maplibre/maplibre-gl-leaflet/leaflet-maplibre-gl.js');

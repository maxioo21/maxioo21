// Test na żywo: prawdziwa aplikacja, prawdziwe serwery, lokalizacja: Sosnowiec
import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
const ctx = await b.newContext({ viewport: { width: 400, height: 860 }, deviceScaleFactor: 2, geolocation: { latitude: 50.2863, longitude: 19.1041 }, permissions: ['geolocation'], isMobile: true, hasTouch: true, locale: 'pl-PL' });
const page = await ctx.newPage();
const errs = []; page.on('pageerror', e => errs.push(String(e)));
const t0 = Date.now();
await page.goto('http://localhost:8080/odkrywaj/');
const ms = () => ((Date.now() - t0) / 1000).toFixed(1) + 's';
async function waitCards(label, max = 20000) {
  const s = Date.now();
  while (Date.now() - s < max) { const n = await page.locator('.card').count(); if (n) { console.log(`${label}: ${n} wyników po ${((Date.now() - s) / 1000).toFixed(1)} s`); return n; } await page.waitForTimeout(200); }
  console.log(`${label}: BRAK wyników po ${max / 1000} s — ` + await page.textContent('#sheetBody')); return 0;
}
await waitCards('start (atrakcje wokół)', 25000);
console.log('miasto:', await page.textContent('#pillTxt'), '| mapa GL:', await page.evaluate(() => !!(window.maplibregl && document.querySelector('.leaflet-gl-layer, canvas.maplibregl-canvas'))));
await page.waitForTimeout(2500); await page.screenshot({ path: 'shot-start.png' });
for (const q of ['jedzenie', 'kebab', 'basen', 'pizza', 'muzeum', 'żabka']) {
  await page.fill('#q', q); const s = Date.now(); await page.press('#q', 'Enter');
  await page.waitForTimeout(150);
  await waitCards(`„${q}”`);
  await page.waitForTimeout(1500);
  const names = await page.$$eval('.card b', els => els.slice(0, 5).map(e => e.textContent));
  const subs = await page.$$eval('.card .mini-tags', els => els.slice(0, 5).map(e => e.textContent));
  console.log('   ', names.join(' | '), ' || tagi:', subs.join(' / '));
  if (q === 'kebab') await page.screenshot({ path: 'shot-kebab.png' });
}
await page.locator('.card').first().click(); await page.waitForTimeout(2500);
console.log('karta:', await page.textContent('.d-title'), '|', (await page.textContent('#desc')).slice(0, 100));
await page.click('#routeBtn'); await page.waitForTimeout(3000);
console.log('trasa:', await page.textContent('#sheetBody .r-sum').catch(() => 'brak'));
await page.screenshot({ path: 'shot-route.png' });
console.log('błędy JS:', errs.length ? errs : 'brak', '| łącznie', ms());
await b.close();

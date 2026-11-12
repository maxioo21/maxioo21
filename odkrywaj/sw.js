// Odkrywaj – service worker: aplikacja otwiera się szybko i działa jak natywna.
const CACHE = 'odkrywaj-v1';
const SHELL = ['./', './index.html', './manifest.webmanifest', './privacy.html',
  './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png', './icons/favicon-48.png',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Strona aplikacji: najpierw sieć (świeża wersja), bez sieci – z pamięci
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put('./index.html', cp)); return r; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  // Biblioteka mapy, czcionki, ikony: z pamięci, w tle odświeżane
  if (url.origin === location.origin || /unpkg\.com|fonts\.(googleapis|gstatic)\.com/.test(url.host)) {
    e.respondWith(caches.match(req).then(hit => {
      const net = fetch(req).then(r => { if (r.ok || r.type === 'opaque') { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return r; }).catch(() => hit);
      return hit || net;
    }));
  }
  // Wszystko inne (mapy, wyszukiwanie, trasy) – zawsze z internetu
});

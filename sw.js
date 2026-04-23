const CACHE = 'lugat-v1';
const ASSETS = [
  '/Lugat/',
  '/Lugat/index.html',
  '/Lugat/dictionary_enriched.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Network first for JSON (always fresh), cache first for HTML/assets
  const url = new URL(e.request.url);
  if (url.pathname.endsWith('.json')) {
    e.respondWith(
      fetch(e.request)
        .then(r => { caches.open(CACHE).then(c => c.put(e.request, r.clone())); return r; })
        .catch(() => caches.match(e.request))
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request)
        .then(r => { caches.open(CACHE).then(c => c.put(e.request, r.clone())); return r; })
      )
    );
  }
});

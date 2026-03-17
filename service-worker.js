const CACHE_NAME = 'live-clock-v8';

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './fonts/BebasNeue-Regular-subset.woff2',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// ── Install: precache all assets ─────────────────────────────────────────────

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(PRECACHE_URLS);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

// ── Activate: clean up old caches ────────────────────────────────────────────

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function (name) { return name !== CACHE_NAME; })
          .map(function (name) { return caches.delete(name); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

// ── Fetch: cache-first strategy ──────────────────────────────────────────────

self.addEventListener('fetch', function (event) {
  // Only handle same-origin GET requests
  if (event.request.method !== 'GET') return;

  // Never intercept the service worker itself — the browser must always
  // fetch it fresh from the network to detect updates
  if (event.request.url.includes('service-worker.js')) return;

  event.respondWith(
    caches.match(event.request).then(function (cached) {
      if (cached) return cached;

      return fetch(event.request).then(function (response) {
        // Cache successful responses for same-origin requests
        if (response && response.status === 200 && response.type === 'basic') {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, cloned);
          });
        }
        return response;
      });
    })
  );
});

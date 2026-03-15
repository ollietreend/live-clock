const CACHE_NAME = 'live-clock-v6';

const PRECACHE_URLS = [
  './index.html',
  './manifest.json',
  './fonts/Figtree-Bold.woff2',
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

// ── Fetch strategy ────────────────────────────────────────────────────────────
//
// HTML (index.html / navigate requests): network-first, fall back to cache.
//   Always fetching HTML fresh ensures the browser picks up a new service
//   worker registration on every page load, without needing to clear cache.
//
// Everything else (fonts, icons, manifest): cache-first.
//   These assets are versioned by the cache name and don't change between
//   deploys, so serving from cache is safe and fast.

self.addEventListener('fetch', function (event) {
  // Only handle same-origin GET requests
  if (event.request.method !== 'GET') return;

  // Never intercept the service worker itself
  if (event.request.url.includes('service-worker.js')) return;

  const isHTML = event.request.mode === 'navigate' ||
    event.request.destination === 'document';

  if (isHTML) {
    // Network-first for HTML
    event.respondWith(
      fetch(event.request).then(function (response) {
        if (response && response.status === 200) {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, cloned);
          });
        }
        return response;
      }).catch(function () {
        // Offline fallback
        return caches.match('./index.html');
      })
    );
  } else {
    // Cache-first for all other assets
    event.respondWith(
      caches.match(event.request).then(function (cached) {
        if (cached) return cached;

        return fetch(event.request).then(function (response) {
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
  }
});

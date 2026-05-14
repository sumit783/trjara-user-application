const CACHE_NAME = 'stylehub-pwa-cache-v1';

const INITIAL_CACHED_RESOURCES = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/icon-light-32x32.png',
  '/icon-dark-32x32.png',
  '/icon.svg',
  '/apple-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(INITIAL_CACHED_RESOURCES);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only intercept GET requests
  if (event.request.method !== 'GET') return;
  // Ignore chrome extensions or external schemas
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          // Check if valid response before caching
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === 'basic'
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If network fails and not in cache, return cached home page if navigation request
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
          return null;
        });

      return cachedResponse || fetchPromise;
    })
  );
});

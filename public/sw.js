const CACHE_NAME = 'trjara-user-application-cache-v1';

const INITIAL_CACHED_RESOURCES = [
  '/',
  '/manifest.json',
  '/icon-light-32x32.png',
  '/icon-dark-32x32.png',
  '/icon.svg',
  '/apple-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        INITIAL_CACHED_RESOURCES.map((url) => {
          return fetch(url).then((response) => {
            if (response.ok) {
              return cache.put(url, response);
            }
            throw new Error(`Failed to fetch ${url} (status: ${response.status})`);
          });
        })
      ).then((results) => {
        results.forEach((result, idx) => {
          if (result.status === 'rejected') {
            console.warn(`App Service Worker failed to cache resource: ${INITIAL_CACHED_RESOURCES[idx]}`, result.reason);
          }
        });
      });
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

  const url = new URL(event.request.url);
  // Bypass caching in development for hot reloads, Next.js assets, and API endpoints
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.includes('webpack') ||
    url.pathname.includes('hot-update')
  ) {
    return;
  }

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

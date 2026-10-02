const CACHE_NAME = 'premium-techs-cache-v1';
const ASSETS_TO_CACHE = [
  '/Premium-Tech-appstore/',
  '/Premium-Tech-appstore/index.html',
  '/Premium-Tech-appstore/css/style.css',
  '/Premium-Tech-appstore/js/app.js',
  '/Premium-Tech-appstore/manifest.json',
  '/Premium-Tech-appstore/assets/logo.jpg'
];

// Install Event: Cache essential static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event: Cleanup old caches if any
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event: Stale-While-Revalidate Strategy
self.addEventListener('fetch', (event) => {
  // We only want to handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        // Fetch fresh data in the background (Revalidate)
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          // If the fetch was successful, update the cache
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch((err) => {
          // Ignore network errors in background fetch
          console.warn('Background fetch failed:', err);
        });

        // Return the cached response immediately if it exists (Stale),
        // otherwise wait for the network response.
        return cachedResponse || fetchPromise;
      });
    })
  );
});

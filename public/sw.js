
const CACHE_NAME = 'foam-pro-desktop-v8-install-fix';
// Only cache local critical files during install. 
// External CDNs are cached at runtime to prevent install failures if they flake.
const URLS_TO_CACHE = [
  './index.html',
  './manifest.json',
  './'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(URLS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // For navigation requests (loading the page), try network first, then cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match('./index.html');
        })
    );
    return;
  }

  // For all other requests: Cache First/Stale-While-Revalidate pattern
  // This ensures assets like images/scripts load fast from cache if available,
  // but updates in background.
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached response if found
        if (response) {
            // Optional: Update cache in background here if needed (Stale-while-revalidate)
            // For now, Cache First is robust.
            return response;
        }

        // Clone request stream
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          (response) => {
            // Check if valid response
            if(!response || response.status !== 200) {
              return response;
            }

            // Don't cache chrome-extensions or non-http
            if (!event.request.url.startsWith('http')) return response;

            // Clone response stream
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// Service Worker for Weather 98 PWA
const CACHE_NAME = 'weather98-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/_favicon.ico',
  '/apple-touch-icon.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cache opened');
        // Try to cache resources, but don't fail if some are missing
        return Promise.allSettled(
          urlsToCache.map((url) =>
            cache.add(url).catch((err) => {
              console.warn(`Service Worker: Failed to cache ${url}:`, err);
            })
          )
        );
      })
      .catch((error) => {
        console.error('Service Worker: Cache install failed:', error);
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all pages immediately
  return self.clients.claim();
});

// Helper function to check if a request is for an external API
function isExternalAPI(url) {
  try {
    const urlObj = new URL(url);
    // Don't cache weather API calls or other external APIs
    return (
      urlObj.hostname.includes('api.weather.gov') ||
      urlObj.hostname.includes('geocoding-api') ||
      (urlObj.origin !== self.location.origin && urlObj.protocol.startsWith('http'))
    );
  } catch {
    return false;
  }
}

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // For external APIs, always fetch from network (no caching)
  if (isExternalAPI(request.url)) {
    event.respondWith(fetch(request));
    return;
  }

  // For app resources, use cache-first strategy
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then((response) => {
          // Don't cache if not a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // If both cache and network fail, return offline page for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
    })
  );
});

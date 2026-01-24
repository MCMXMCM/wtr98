// Service Worker for Weather 98 PWA
// Update version number when you want to force a cache refresh
const CACHE_VERSION = 'v2';
const CACHE_NAME = `weather98-${CACHE_VERSION}`;
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
      .then(() => {
        // Check if this is first install or update
        // If there are no clients with controllers, this is first install - activate immediately
        // Otherwise, wait for user confirmation
        return self.clients.matchAll({ includeUncontrolled: true });
      })
      .then((clients) => {
        const hasController = clients.some(client => client.controller !== null);
        if (!hasController) {
          // First install - no existing controller, activate immediately
          console.log('Service Worker: First install - activating immediately');
          return self.skipWaiting();
        }
        // Update - wait for user confirmation
        console.log('Service Worker: Update available - waiting for user confirmation');
      })
      .catch((error) => {
        console.error('Service Worker: Cache install failed:', error);
        // On error, assume first install and activate
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete all old caches (including previous versions)
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all pages
      return self.clients.claim();
    })
  );
});

// Listen for messages from the app to skip waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('Service Worker: Received SKIP_WAITING message');
    self.skipWaiting();
  }
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

// Helper function to check if a request is for a JavaScript/TypeScript file
function isJavaScriptFile(url) {
  try {
    const urlObj = new URL(url);
    // Check if it's a JS/TS file or Vite HMR related
    return (
      urlObj.pathname.endsWith('.js') ||
      urlObj.pathname.endsWith('.mjs') ||
      urlObj.pathname.endsWith('.ts') ||
      urlObj.pathname.endsWith('.tsx') ||
      urlObj.pathname.includes('/@vite/') ||
      urlObj.pathname.includes('/node_modules/') ||
      urlObj.searchParams.has('t') // Vite cache busting parameter
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

  // For JavaScript files, use network-first strategy to avoid stale code
  // This is especially important after service worker updates
  if (isJavaScriptFile(request.url)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Don't cache JavaScript files - always get fresh versions
          return response;
        })
        .catch(() => {
          // If network fails, try cache as fallback
          return caches.match(request);
        })
    );
    return;
  }

  // For app resources (HTML, images, etc.), use cache-first strategy
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

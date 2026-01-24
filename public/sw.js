// Self-destructing service worker to remove old PWA installations
// Inspired from https://github.com/NekR/self-destroying-sw
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    self.registration
      .unregister()
      .then(() => {
        // Clear all caches
        return caches.keys();
      })
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
      .then(() => {
        // Force all clients to reload
        return self.clients.matchAll();
      })
      .then((clients) => {
        clients.forEach((client) => {
          if (client.url && "navigate" in client) {
            client.navigate(client.url);
          }
        });
      })
  );
});

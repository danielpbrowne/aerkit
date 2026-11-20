// Keep PWA installation support while removing the previous offline reference cache.
self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  // Keep the PWA lifecycle without deleting unrelated origin-wide caches.
  event.waitUntil(self.clients.claim());
});

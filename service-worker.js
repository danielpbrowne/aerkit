const CACHE_NAME = 'aerkit-reference-v1-20261127-r17';
const SHELL = [
  './', './index.html', './styles.css', './app.js', './reference-data.js',
  './manifest.webmanifest', './icon.svg', './assets/AerKit.png',
  './assets/fonts/urbanist-latin.woff2', './assets/fonts/outfit-latin.woff2'
];
const SYNC_KEY = new URL('./__aerkit_last_sync__', self.location).href;

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(SHELL);
    await cache.put(SYNC_KEY, new Response(new Date().toISOString()));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('aerkit-reference-') && key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const response = await fetch(request);
      if (response.ok) {
        await cache.put(request, response.clone());
        await cache.put(SYNC_KEY, new Response(new Date().toISOString()));
      }
      return response;
    } catch {
      return (await cache.match(request, { ignoreSearch: true })) || (request.mode === 'navigate' ? await cache.match('./index.html') : Response.error());
    }
  })());
});

self.addEventListener('message', event => {
  if (event.data !== 'GET_CACHE_STATUS' || !event.source) return;
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    const [syncResponse, referenceData] = await Promise.all([cache.match(SYNC_KEY), cache.match('./reference-data.js', { ignoreSearch: true })]);
    const syncedAt = syncResponse ? await syncResponse.text() : null;
    event.source.postMessage({ type: 'CACHE_STATUS', ready: Boolean(referenceData), syncedAt });
  })());
});

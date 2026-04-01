// Honest Tom's Dashboard — Service Worker
// Minimal SW: activates PWA mode so iOS persists localStorage indefinitely.
// Network-first fetch so you always get fresh content.

var CACHE_NAME = 'honesttom-v1';

self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', function(e) {
  // Only handle GET requests
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .catch(function() {
        return caches.match(e.request);
      })
  );
});

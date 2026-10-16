const CACHE_NAME = 'flow-cache-v4';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './Temple%20bell.mp3'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .catch(err => console.warn('Cache initialization warning:', err))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      return cachedResponse || fetch(event.request);
    })
  );
});

// Immediate notification handler for Android & Windows PWA
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'PHASE_NOTIFICATION') {
    const options = {
      body: event.data.body,
      icon: './icon-192.png',
      badge: './icon-192.png',
      tag: 'flow-phase-alert',
      renotify: true,
      silent: false,
      requireInteraction: true,
      vibrate: [300, 100, 300, 100, 400]
    };

    event.waitUntil(
      self.registration.showNotification('FLOW', options)
    );
  }
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return self.clients.openWindow('./');
    })
  );
});

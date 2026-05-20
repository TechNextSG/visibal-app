const CACHE = 'visibal-v12';
const ASSETS = [
  './',
  './index.html',
  './patient.html',
  './doctor.html',
  './help.html',
  './privacy.html',
  './app.css',
  './app.js',
  './manifest.json',
  './icons/icon.svg'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // API calls: network-first
  if (url.hostname === 'api.anthropic.com') {
    e.respondWith(fetch(e.request).catch(() => new Response('Offline')));
    return;
  }
  // App assets: cache-first
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
      const clone = resp.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return resp;
    }))
  );
});

// Push notifications
self.addEventListener('push', e => {
  const data = e.data?.json() || { title: 'VISIBAL', body: 'Erinnerung: 22h Tragezeit beachten' };
  e.waitUntil(self.registration.showNotification(data.title, {
    body: data.body,
    icon: 'icons/icon.svg',
    badge: 'icons/icon.svg',
    vibrate: [200, 100, 200],
    tag: 'visibal-reminder'
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow('./patient.html'));
});

// Service Worker
const cacheName = 'calc-v1';
const assets = ['./', './index.html', './app.js', './styles.css'];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(cacheName).then(cache => cache.addAll(assets)));
});

self.addEventListener('fetch', e => {
    e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});
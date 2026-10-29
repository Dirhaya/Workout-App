/* A release is installed as one cache. Never mix old scripts with a new shell. */
const CACHE = 'arise-app-v7';
const ROOT = new URL('./', self.location.href).href;
const ASSETS = ['./','./index.html','./styles.css','./system.css','./storage.js','./app.js','./catalog.js','./text-import.js','./muscles.js','./body-map.js','./drafts.js','./updates.js','./program.js','./bootstrap.js','./image-import.js','./assistant.js','./assistant-worker.js','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS.map(path => new Request(path, {cache:'reload'})))));
});
self.addEventListener('message', event => {
  if (event.data?.type === 'ACTIVATE_UPDATE') self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(k => k.startsWith('arise-app-') && k !== CACHE).map(k => caches.delete(k))
  )).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET' || !event.request.url.startsWith(ROOT)) return;
  event.respondWith(caches.open(CACHE).then(async cache => {
    const url = new URL(event.request.url);
    // Query strings do not change the versioned app shell.
    url.search='';
    const cached = await cache.match(event.request.mode === 'navigate' ? new URL('index.html',ROOT).href : url.href);
    return cached || fetch(event.request);
  }));
});

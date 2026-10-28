const CACHE = 'arise-app-v5';
const ROOT = new URL('./', self.location.href).href;
const ASSETS = ['./','./index.html','./upgrade.js','./image-import.js','./assistant.js','./assistant-worker.js','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});
self.addEventListener('message', event => { if(event.data?.type === 'ACTIVATE_UPDATE') self.skipWaiting(); });
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('arise-app-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET' || !event.request.url.startsWith(ROOT)) return;
  event.respondWith(fetch(event.request).then(response => {
    if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(event.request,copy)));}
    return response;
  }).catch(async()=>{
    const cached=await caches.match(event.request);
    if(cached)return cached;
    if(event.request.mode==='navigate')return caches.match(new URL('index.html',ROOT).href);
    return new Response('Unavailable offline',{status:503});
  }));
});

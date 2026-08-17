const CACHE_NAME = "powerlog-shell-v1";
self.addEventListener("install", event => { event.waitUntil(caches.open(CACHE_NAME)); self.skipWaiting(); });
self.addEventListener("activate", event => { event.waitUntil(self.clients.claim()); });
self.addEventListener("fetch", event => { if (event.request.method !== "GET" || !event.request.url.startsWith(self.location.origin)) return; event.respondWith(fetch(event.request).catch(() => caches.match(event.request).then(response => response ?? new Response("Offline", { status: 503 })))); });

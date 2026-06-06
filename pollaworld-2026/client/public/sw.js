// La Polla del Ponce — Service Worker
// Cache strategy: Cache First for static assets, Network First for API calls

const CACHE_NAME = "pollaworld-v1";

// Assets to pre-cache on install
const PRECACHE_URLS = [
  "/",
  "/manifest.json",
];

// Install: pre-cache critical assets
self.addEventListener("install", (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch: cache-first for static, network-first for API
self.addEventListener("fetch", (event: FetchEvent) => {
  const requestUrl = new URL(event.request.url);

  // API calls: network first, fallback to cache
  if (requestUrl.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful API responses
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, cloned);
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cached) => {
            return cached || new Response(JSON.stringify({ error: "Sin conexión" }), {
              status: 503,
              headers: { "Content-Type": "application/json" },
            });
          });
        })
    );
    return;
  }

  // Static assets: cache first
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        const cloned = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, cloned);
        });
        return response;
      });
    })
  );
});

// TypeScript types for ServiceWorker
interface ExtendableEvent extends Event {
  waitUntil(fn: Promise<unknown>): void;
}

interface FetchEvent extends Event {
  request: Request;
  respondWith(response: Promise<Response> | Response): void;
}

const CACHE_NAME = "projectflow-v1";
const OFFLINE_URL = "/offline";

const STATIC_ASSETS = [
  "/",
  "/offline",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// Install — cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — network first, fallback to cache, fallback to offline page
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Skip non-GET and API requests
  if (request.method !== "GET") return;
  if (request.url.includes("/api/")) return;
  if (request.url.includes("localhost:4000")) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses for static assets
        if (response.ok && !request.url.includes("_next/webpack")) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(async () => {
        // Try cache
        const cached = await caches.match(request);
        if (cached) return cached;
        // Fall back to offline page for navigation requests
        if (request.mode === "navigate") {
          return caches.match(OFFLINE_URL);
        }
      })
  );
});

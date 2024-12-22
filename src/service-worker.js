const CACHE_NAME = "drawing-app-cache-v1";
const urlsToCache = [
  "/index.html",
  "/style.css",
  "/index.js",
  "/public/squirrel-3.png",
  "/public/king-david.png",
  "/public/david-and-goliath.png",
  "/public/noahs-ark.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.destination === "image") {
    // Cache on demand for images
    event.respondWith(
      caches.match(event.request).then((response) => {
        return (
          response ||
          fetch(event.request).then((fetchedResponse) => {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, fetchedResponse.clone());
              return fetchedResponse;
            });
          })
        );
      })
    );
  } else {
    // Handle other requests normally
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});
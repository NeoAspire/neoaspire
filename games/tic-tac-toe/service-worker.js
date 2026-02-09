const CACHE_NAME = "tic-tac-toe-v1";

const FILES_TO_CACHE = [
  "/games/tic-tac-toe/",
  "/games/tic-tac-toe/index.html",
  "/games/tic-tac-toe/manifest.json",
  "/games/tic-tac-toe/images/icon-192.png",
  "/games/tic-tac-toe/images/icon-512.png",
  "/games/tic-tac-toe/images/apple-touch-icon.png"
];

/* INSTALL */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

/* ACTIVATE */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

/* FETCH */
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

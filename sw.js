const CACHE = "paizomath-portable-v65";
const CORE = [
  "./",
  "./index.html",
  "./terms.html",
  "./css/styles.css",
  "./css/terms.css",
  "./css/intro-topics.css",
  "./css/intro-safe.css",
  "./js/app.js",
  "./js/child-game-mode.js",
  "./js/pwa-install.js",
  "./js/pin-screen-guard.js",
  "./js/parent-stats.js",
  "./js/answer-feedback.js",
  "./js/lifecycle-recovery.js",
  "./js/protection.js",
  "./js/update-manager.js",
  "./js/update-notice.js",
  "./manifest.webmanifest",
  "./audio/paizomath-presentation-bed.mp3",
  "./images/paizo-logo.png",
  "./images/paizo-logo-192.png",
  "./images/paizo-logo-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(CORE)),
  );
  // Keep the worker waiting until update-manager.js decides it is safe.
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith("paizomath-portable-") && key !== CACHE)
          .map((key) => caches.delete(key)),
      ),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkRequest = fetch(event.request).then((response) => {
        if (response.ok && new URL(event.request.url).origin === self.location.origin) {
          event.waitUntil(
            caches.open(CACHE).then((cache) => cache.put(event.request, response.clone())),
          );
        }
        return response;
      });

      return cached || networkRequest;
    }).catch(() => caches.match("./index.html")),
  );
});

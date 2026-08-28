const CACHE = "paizomath-portable-v27";
const CORE = ["./", "./index.html", "./terms.html", "./css/styles.css", "./css/terms.css", "./css/intro-topics.css", "./css/intro-safe.css", "./js/app.js", "./js/protection.js", "./js/update-manager.js", "./manifest.webmanifest", "./audio/paizomath-presentation-bed.mp3"];
self.addEventListener("install", event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE))));
self.addEventListener("activate", event => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response.ok && new URL(event.request.url).origin === self.location.origin) caches.open(CACHE).then(cache => cache.put(event.request, response.clone()));
    return response;
  }).catch(() => caches.match("./index.html"))));
});

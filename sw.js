// Service worker of the public player (S-016). Caches the app shell so the player opens offline; the cache name is a hash of
// the shell (vite.player.config.ts fills CACHE and SHELL). It never stores a pack or a save: those live in device storage
// (OPFS / IndexedDB) and are never fetched. Non-GET and Range requests pass straight through.
const CACHE = "monengine-player-3d979e91fd39";
const SHELL = ["./","assets/index-BduUKY-Y.js","icons/icon-192.png","icons/icon-512.png","icons/icon-maskable-512.png","index.html","manifest.webmanifest"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k.startsWith("monengine-player-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const r = e.request;
  if (r.method !== "GET" || r.headers.has("range")) return;
  if (new URL(r.url).origin !== self.location.origin) return;
  e.respondWith(caches.match(r, { ignoreSearch: r.mode === "navigate" }).then((hit) => hit || fetch(r)));
});

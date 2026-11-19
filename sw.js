/* NextStop service worker
   - 頁面（index.html）：先抓網路，抓不到才用快取。上線新版後一打開就是新版，離線時仍能開啟介面。
   - 圖示、manifest、MapLibre：先用快取（內容固定，MapLibre 有指定版本）。
   - 地圖（OpenFreeMap 的樣式、向量圖磚、字型、圖示）：先用快取並在背景更新，最多保留 TILE_MAX 筆，離線時看得到常去區域的地圖。
   - TDX API、token、Google Fonts 一律不攔截，直接走網路，避免拿到過期的到站時間。
   改了這個檔案的快取清單或策略時，把 VERSION 加一，舊快取會在啟用時清掉。 */
const VERSION = "v3";
const SHELL = "nextstop-shell-" + VERSION;
const TILES = "nextstop-tiles-" + VERSION;
const TILE_MAX = 300;   /* 向量圖磚一張約數十 KB，比點陣圖磚大，上限比照調低 */
const LIB = [
  "https://unpkg.com/maplibre-gl@5.24.1/dist/maplibre-gl.js",
  "https://unpkg.com/maplibre-gl@5.24.1/dist/maplibre-gl.css"
];
const LOCAL = ["./", "./manifest.webmanifest", "./icon.svg", "./icons/icon-180.png", "./icons/icon-192.png", "./icons/icon-512.png"];

self.addEventListener("install", ev => {
  ev.waitUntil((async () => {
    const c = await caches.open(SHELL);
    await c.addAll(LOCAL);
    /* CDN 抓不到不影響安裝，之後第一次載入時再補進快取 */
    await Promise.all(LIB.map(u => fetch(u, { mode: "cors" }).then(r => r.ok && c.put(u, r)).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", ev => {
  ev.waitUntil((async () => {
    for (const k of await caches.keys())
      if (k.startsWith("nextstop-") && k !== SHELL && k !== TILES) await caches.delete(k);
    await self.clients.claim();
  })());
});

async function networkFirst(req) {
  const c = await caches.open(SHELL);
  try {
    /* GitHub Pages 回 max-age=600：直接 fetch 可能拿到瀏覽器 10 分鐘內的舊頁面。
       cache:"no-cache" 每次向伺服器確認（沒變時只回 304，很省），剛上線的新版馬上看得到 */
    const r = await fetch(req, { cache: "no-cache" });
    if (r.ok) c.put("./", r.clone());
    return r;
  } catch (e) {
    return (await c.match("./")) || Response.error();
  }
}

async function cacheFirst(req) {
  const c = await caches.open(SHELL);
  const hit = await c.match(req, { ignoreSearch: true });
  if (hit) return hit;
  const r = await fetch(req);
  if (r.ok) c.put(req, r.clone());
  return r;
}

async function trimTiles(c) {
  const keys = await c.keys();
  for (let i = 0; i < keys.length - TILE_MAX; i++) await c.delete(keys[i]);
}

async function tile(req, ev) {
  const c = await caches.open(TILES);
  const hit = await c.match(req);
  const update = fetch(req).then(async r => {
    if (r.ok) { await c.put(req, r.clone()); await trimTiles(c); }
    return r;
  });
  if (hit) { ev.waitUntil(update.catch(() => {})); return hit; }
  return update;
}

self.addEventListener("fetch", ev => {
  const req = ev.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (req.mode === "navigate" && url.origin === location.origin) return ev.respondWith(networkFirst(req));
  if (url.origin === location.origin && /\.(png|svg|webmanifest)$/.test(url.pathname)) return ev.respondWith(cacheFirst(req));
  if (LIB.includes(url.origin + url.pathname)) return ev.respondWith(cacheFirst(req));
  if (url.hostname === "tiles.openfreemap.org") return ev.respondWith(tile(req, ev));
  /* 其他（TDX、Google Fonts）不處理，交給瀏覽器 */
});

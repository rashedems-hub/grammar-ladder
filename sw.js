const CACHE="sullam-v1";
const CORE=["./","./index.html","./manifest.json","./icon-192.png","./icon-512.png","./apple-touch-icon.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET")return;
  const u=new URL(e.request.url);
  if(e.request.mode==="navigate"||u.pathname.endsWith("index.html")){
    // network first for the app page so updates arrive, cache fallback offline
    e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put("./index.html",cp));return r}).catch(()=>caches.match("./index.html")));
    return;
  }
  // cache first for everything else (icons, fonts)
  e.respondWith(caches.match(e.request).then(m=>m||fetch(e.request).then(r=>{if(r.ok||r.type==="opaque"){const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp))}return r})));
});

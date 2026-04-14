const CACHE_NAME = 'zyntracare-v2';
const STATIC_CACHE = 'zyntracare-static-v2';
const DYNAMIC_CACHE = 'zyntracare-dynamic-v2';
const MAP_TILE_CACHE = 'zyntracare-map-tiles-v2';

const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/images/publiczyntracare-logo.png'
];

const EXTERNAL_ASSETS = [
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Sora:wght@400;600;700;800&display=swap'
];

const MAP_TILE_PATTERNS = [
  'basemaps.cartocdn.com',
  'tile.openstreetmap.org',
  'unpkg.com/leaflet'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS.filter(url => !url.startsWith('http')));
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => {
        return Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE && key !== MAP_TILE_CACHE)
            .map((key) => caches.delete(key))
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;

  const isMapTile = MAP_TILE_PATTERNS.some(pattern => url.hostname.includes(pattern));
  if (isMapTile) {
    event.respondWith(
      caches.open(MAP_TILE_CACHE)
        .then((cache) => {
          return cache.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) return cachedResponse;
              
              return fetch(request)
                .then((response) => {
                  if (response.ok) {
                    cache.put(request, response.clone());
                  }
                  return response;
                })
                .catch(() => new Response('', { status: 200 }));
            });
        })
    );
    return;
  }

  // Use StaleWhileRevalidate for faster response
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.open(DYNAMIC_CACHE)
        .then((cache) => {
          return cache.match(request)
            .then((cachedResponse) => {
              const fetchPromise = fetch(request)
                .then((response) => {
                  if (response.ok) {
                    cache.put(request, response.clone());
                  }
                  return response;
                })
                .catch(() => caches.match('/offline'));
              
              return cachedResponse || fetchPromise;
            })
        })
    );
    return;
  }

  if (url.origin === location.origin) {
    event.respondWith(
      caches.open(DYNAMIC_CACHE)
        .then((cache) => {
          return cache.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                fetch(request)
                  .then((response) => {
                    if (response.ok) cache.put(request, response.clone());
                  })
                  .catch(() => {});
                return cachedResponse;
              }
              return fetch(request)
                .then((response) => {
                  const responseClone = response.clone();
                  cache.put(request, responseClone);
                  return response;
                });
            })
        })
    );
    return;
  }

  if (url.origin === 'https://fonts.googleapis.com' || 
      url.origin === 'https://fonts.gstatic.com') {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          return cachedResponse || fetch(request)
            .then((response) => {
              const responseClone = response.clone();
              caches.open(STATIC_CACHE)
                .then((cache) => cache.put(request, responseClone));
              return response;
            });
        })
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(DYNAMIC_CACHE)
          .then((cache) => cache.put(request, responseClone));
        return response;
      })
      .catch(() => caches.match(request))
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
  
  // Pre-cache map tiles for offline use
  if (event.data === 'cacheMapTiles') {
    const tileUrls = [];
    // Pre-cache tiles for Delhi area at zoom levels 10-15
    const baseLat = 28.6139;
    const baseLng = 77.2090;
    for (let z = 10; z <= 15; z++) {
      for (let x = -2; x <= 2; x++) {
        for (let y = -2; y <= 2; y++) {
          tileUrls.push(
            `https://tile.openstreetmap.org/${z}/${x}/${y}.png`
          );
        }
      }
    }
    
    caches.open(MAP_TILE_CACHE)
      .then((cache) => {
        return Promise.all(
          tileUrls.slice(0, 100).map(url => 
            fetch(url)
              .then((response) => {
                if (response.ok) cache.put(url, response);
              })
              .catch(() => {})
          )
        );
      });
  }
});

// service-worker.js

const CACHE_NAME = 'lockietasks-v1';
// These are the essential files that make up the "app shell".
const APP_SHELL_URLS = [
    '/mobile.html',
    '/mobile_main.js',
    '/store.js',
    '/eventBus.js',
    '/loggingService.js',
    '/utils.js',
    '/taskService.js' // Needed for filtering logic if we use it on mobile
];

// The install event fires when the service worker is first installed.
self.addEventListener('install', event => {
  console.log('[Service Worker] Install');
  // We don't let the install event finish until we have cached our app shell.
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    console.log('[Service Worker] Caching all: app shell and content');
    await cache.addAll(APP_SHELL_URLS);
  })());
});

// The activate event fires when the service worker is activated.
// This is a good place to clean up old, unused caches.
self.addEventListener('activate', event => {
    console.log('[Service Worker] Activate');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});


// The fetch event fires every time the app makes a network request.
self.addEventListener('fetch', event => {
    // We only want to cache GET requests.
    if (event.request.method !== 'GET') {
        return;
    }
    
    // For API calls for data, we always want to hit the network first.
    // We do not want to cache our data here; that will be handled by IndexedDB.
    if (event.request.url.includes('/api/data')) {
        event.respondWith(fetch(event.request));
        return;
    }

    // For all other requests (our app shell files), use a cache-first strategy.
    event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);
        // Try to get the response from the cache.
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
            // If we found it in the cache, return it.
            console.log('[Service Worker] Returning from Cache:', event.request.url);
            return cachedResponse;
        }
        
        // If it's not in the cache, try to fetch it from the network.
        console.log('[Service Worker] Not in Cache, FETCHING:', event.request.url);
        return fetch(event.request);
    })());
});
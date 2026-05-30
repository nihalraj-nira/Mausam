// service-worker.js
const VERSION_TAG = 'mausamai-v2.1-clean-ui';
const PRE_CACHE_RESOURCES = [
    './',
    './index.html',
    './style.css',
    './main.js',
    './animations.js',
    './assistants.js',
    './chatbot.js',
    './script.js',
    './manifest.json',
    './assets/logo.png',
    './assets/icons/icon-192.png',
    './assets/icons/icon-512.png'
];

// Event Loop: Lifecycle Caching Initialization Step
self.addEventListener('install', (evt) => {
    evt.waitUntil(
        caches.open(VERSION_TAG).then((cache) => {
            console.log('Caching new MausamAI UI assets...');
            return cache.addAll(PRE_CACHE_RESOURCES);
        }).then(() => self.skipWaiting())
    );
});

// Event Loop: Expiration Cache Eviction Management (Clears the old theme)
self.addEventListener('activate', (evt) => {
    evt.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((k) => {
                    if (k !== VERSION_TAG) {
                        console.log('Deleting old cache:', k);
                        return caches.delete(k);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Event Loop: Network Intercept with Cache Rollback fallback
self.addEventListener('fetch', (evt) => {
    // Bypass caching for live API calls and External CDNs (FontAwesome/ChartJS)
    if (evt.request.url.includes('api.open-meteo.com') ||
        evt.request.url.includes('air-quality-api') ||
        evt.request.url.includes('bigdatacloud.net') ||
        evt.request.url.includes('cdnjs.cloudflare.com')) {
        return;
    }

    evt.respondWith(
        fetch(evt.request).catch(() => {
            return caches.match(evt.request);
        })
    );
});
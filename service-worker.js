const CACHE_NAME = 'dnd-platform-v1';

self.addEventListener('install', event => {
    console.log('Service Worker instalando...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll([
                    '/',
                    '/index.html',
                    '/css/style.css',
                    '/js/app.js',
                    '/js/api-service.js',
                    '/js/character-sheet.js',
                    '/js/dice-roller.js',
                    '/js/journal.js',
                    '/js/chat.js'
                ]);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});

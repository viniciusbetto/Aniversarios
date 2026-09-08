// =====================================================
// Aniversariantes - Service Worker
// =====================================================

const CACHE_NAME = "Aniversariantes-v1.0.1";

const APP_ASSETS = [
    "./",
    "./index.html",
    "./manifest.json",
    "./style.css",
    "./app.js",
    "./img/bolo.png"
];

// =====================================================
// INSTALAÇÃO
// =====================================================

self.addEventListener("install", event => {
    console.log("Instalando nova versão...");
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(APP_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// =====================================================
// ATIVAÇÃO
// =====================================================

self.addEventListener("activate", event => {
    console.log("Ativando nova versão...");
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

// =====================================================
// INTERCEPTA REQUISIÇÕES
// =====================================================

self.addEventListener("fetch", event => {
    if (event.request.method !== "GET") {
        return;
    }
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request)
                    .then(networkResponse => {
                        return caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(
                                    event.request,
                                    networkResponse.clone()
                                );
                                return networkResponse;
                            });
                    });
            })
    );
});
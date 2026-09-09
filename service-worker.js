// =====================================================
// Aniversariantes - Service Worker
// =====================================================

const CACHE_NAME = "Aniversariantes-v1.0.2";

const APP_ASSETS = [
    "./",
    "./index.html",
    "./manifest.json",
    "./style.css",
    "./app.js",
    "./img/bolo.png",
    "./dados/Aniversariantes_Backup.json"
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
                    // Atualiza o cache em segundo plano
                    fetch(event.request)
                        .then(networkResponse => {
                            if (networkResponse && networkResponse.ok) {
                                caches.open(CACHE_NAME)
                                    .then(cache => {
                                        cache.put(
                                            event.request,
                                            networkResponse.clone()
                                        );
                                    });
                            }
                        })
                        .catch(() => {});
                    return response;
                }
                // Não está no cache
                return fetch(event.request);
            })
    );
});
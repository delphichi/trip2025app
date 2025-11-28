// sw.js

const CACHE_NAME = 'family-trip-cache-v1'; // <--- 保持靜態 v1 即可
// ... (urlsToCache 保持不變) ...

// 1. 安裝階段 (Installation)
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                // ... (快取核心資源) ...
                return cache.addAll(urlsToCache);
            })
            // *** 新增這一行：跳過等待，立即啟用新的 Service Worker ***
            .then(() => self.skipWaiting()) 
    );
});

// 2. 啟動階段 (Activation)
self.addEventListener('activate', event => {
    // *** 新增這一行：立即接管客戶端，確保更新生效 ***
    event.waitUntil(self.clients.claim().then(() => {
        // ... (清理舊快取的邏輯保持不變) ...
        const cacheWhitelist = [CACHE_NAME];
        return caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        });
    }));
});

// ... (fetch 程式碼保持不變) ...

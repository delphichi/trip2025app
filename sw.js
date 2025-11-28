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

// 擷取階段 (Fetch)
self.addEventListener('fetch', event => {
    // *** 確保 Apps Script API 連結永遠走網路，不被靜態快取 ***
    // 您的 Apps Script 連結通常是 'https://script.google.com/macros/s/...'
    if (event.request.url.includes('script.google.com/macros/s')) {
        // 直接返回網路請求，不進行快取
        return event.respondWith(fetch(event.request));
    } 
    
    // 否則，使用快取優先的策略處理靜態資源 (HTML/CSS/JS/圖片)
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});


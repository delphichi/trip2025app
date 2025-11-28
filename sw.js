const CACHE_NAME = 'family-trip-cache-v1'; // 靜態快取名稱，只用於核心檔案
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png'
];

// 1. 安裝階段 (Installation)
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache and cached core assets');
                return cache.addAll(urlsToCache);
            })
            // *** 關鍵：立即啟用新的 Service Worker (解決更新延遲) ***
            .then(() => self.skipWaiting()) 
    );
});

// 2. 啟動階段 (Activation)
self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim().then(() => {
        // 清理舊版本的快取
        const cacheWhitelist = [CACHE_NAME];
        return caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        });
    }));
});

// 3. 擷取階段 (Fetch)
self.addEventListener('fetch', event => {
    // *** 關鍵：排除 Apps Script URL 的靜態快取 ***
    // Apps Script URL 必須永遠從網路獲取最新資料
    if (event.request.url.includes('script.google.com/macros/s')) {
        return event.respondWith(fetch(event.request));
    } 
    
    // 靜態檔案（HTML/CSS/JS/圖片）使用快取優先策略
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});

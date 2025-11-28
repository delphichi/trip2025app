// sw.js (只顯示 fetch 階段的修改)

// ... 其他 install / activate 階段保持不變 ...

// 3. 擷取階段 (Fetch)
self.addEventListener('fetch', event => {
    // 檢查是否為我們的 Apps Script API 請求
    if (event.request.url.startsWith('YOUR_APPS_SCRIPT_WEB_APP_URL_HERE')) {
        event.respondWith(
            caches.open(CACHE_NAME).then(cache => {
                return fetch(event.request)
                    .then(response => {
                        // 網路成功，將新的資料存入快取並回傳
                        cache.put(event.request, response.clone());
                        return response;
                    })
                    .catch(() => {
                        // 網路失敗，從快取中尋找舊的 API 資料
                        return cache.match(event.request);
                    });
            })
        );
    } else {
        // 靜態檔案（HTML/CSS/JS/圖片）的快取邏輯保持不變
        event.respondWith(
            caches.match(event.request).then(response => {
                return response || fetch(event.request);
            })
        );
    }
});

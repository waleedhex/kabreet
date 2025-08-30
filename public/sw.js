const CACHE_NAME = 'matchstick-game-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa-icon-192.png',
  '/pwa-icon-512.png',
  '/apple-touch-icon.png',
  '/puzzles/puzzles-index.json',
  '/puzzles/puzzle-1.json',
  '/puzzles/puzzle-2.json',
  '/puzzles/puzzle-3.json'
];

// تثبيت Service Worker وحفظ الملفات في الكاش
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: All files cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache files', error);
      })
  );
});

// تفعيل Service Worker وحذف الكاش القديم
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activated');
      return self.clients.claim();
    })
  );
});

// استراتيجية Cache First للسرعة القصوى
self.addEventListener('fetch', (event) => {
  // تخطي الطلبات غير HTTP/HTTPS
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // إرجاع من الكاش إذا وُجد (Cache First)
        if (response) {
          console.log('Service Worker: Serving from cache', event.request.url);
          return response;
        }

        // إذا لم يوجد في الكاش، جلب من الشبكة
        console.log('Service Worker: Fetching from network', event.request.url);
        return fetch(event.request)
          .then((response) => {
            // التأكد من أن الاستجابة صحيحة
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // حفظ نسخة في الكاش للمرات القادمة
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // في حالة عدم توفر الإنترنت، أرجع صفحة خطأ من الكاش
            if (event.request.destination === 'document') {
              return caches.match('/');
            }
          });
      })
  );
});

// تحديث الكاش عند وجود نسخة جديدة من Service Worker
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// إضافة محتوى جديد للكاش ديناميكياً
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_URLS') {
    const { urls } = event.data;
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urls);
      })
      .then(() => {
        console.log('Service Worker: New URLs cached successfully');
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache new URLs', error);
      });
  }
});
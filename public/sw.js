const CACHE_NAME = 'matchstick-game-v1.0.0';
const STATIC_CACHE = 'static-v1.0.0';
const PUZZLES_CACHE = 'puzzles-v1.0.0';

// ملفات التطبيق الأساسية
const CORE_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/code.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// ملفات الألغاز (سيتم تحديثها ديناميكياً)
const PUZZLE_FILES = [];
for (let i = 1; i <= 56; i++) {
  PUZZLE_FILES.push(`/puzzles/puzzle${i}.json`);
}

// استراتيجية التخزين المؤقت
const CACHE_STRATEGIES = {
  // ملفات التطبيق الأساسية - Cache First
  CORE: 'cache-first',
  // ملفات الألغاز - Stale While Revalidate
  PUZZLES: 'stale-while-revalidate',
  // المحتوى الديناميكي - Network First
  DYNAMIC: 'network-first'
};

// تثبيت Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker');
  
  event.waitUntil(
    Promise.all([
      // تخزين الملفات الأساسية
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('[SW] Caching core files');
        return cache.addAll(CORE_FILES);
      }),
      
      // تخزين ملفات الألغاز
      caches.open(PUZZLES_CACHE).then((cache) => {
        console.log('[SW] Caching puzzle files');
        return cache.addAll(PUZZLE_FILES).catch(err => {
          console.warn('[SW] Some puzzle files failed to cache:', err);
        });
      })
    ]).then(() => {
      console.log('[SW] Installation complete');
      // فرض تفعيل Service Worker الجديد فوراً
      return self.skipWaiting();
    })
  );
});

// تفعيل Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker');
  
  event.waitUntil(
    // تنظيف الـ caches القديمة
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (![STATIC_CACHE, PUZZLES_CACHE, CACHE_NAME].includes(cacheName)) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Activation complete');
      // السيطرة على جميع الصفحات المفتوحة
      return self.clients.claim();
    })
  );
});

// اعتراض طلبات الشبكة
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // تجاهل الطلبات غير HTTP/HTTPS
  if (!event.request.url.startsWith('http')) {
    return;
  }
  
  // تجاهل طلبات POST وغيرها
  if (event.request.method !== 'GET') {
    return;
  }
  
  // تحديد استراتيجية التخزين المؤقت
  let strategy = CACHE_STRATEGIES.DYNAMIC;
  let cacheName = CACHE_NAME;
  
  if (CORE_FILES.some(file => url.pathname === file || url.pathname.includes(file))) {
    strategy = CACHE_STRATEGIES.CORE;
    cacheName = STATIC_CACHE;
  } else if (url.pathname.includes('/puzzles/')) {
    strategy = CACHE_STRATEGIES.PUZZLES;
    cacheName = PUZZLES_CACHE;
  }
  
  event.respondWith(handleRequest(event.request, strategy, cacheName));
});

// معالجة الطلبات حسب الاستراتيجية
async function handleRequest(request, strategy, cacheName) {
  const cache = await caches.open(cacheName);
  
  switch (strategy) {
    case 'cache-first':
      return cacheFirst(request, cache);
    
    case 'stale-while-revalidate':
      return staleWhileRevalidate(request, cache);
    
    case 'network-first':
    default:
      return networkFirst(request, cache);
  }
}

// Cache First: جرب الـ cache أولاً، ثم الشبكة
async function cacheFirst(request, cache) {
  try {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.warn('[SW] Cache first failed:', error);
    return new Response('غير متصل', { status: 503 });
  }
}

// Network First: جرب الشبكة أولاً، ثم الـ cache
async function networkFirst(request, cache) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response('غير متصل', { status: 503 });
  }
}

// Stale While Revalidate: أرجع من الـ cache وحدث في الخلفية
async function staleWhileRevalidate(request, cache) {
  const cachedResponse = await cache.match(request);
  
  // تحديث في الخلفية (بدون انتظار)
  const networkPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(error => {
    console.warn('[SW] Network update failed:', error);
  });
  
  // أرجع النسخة المحفوظة فوراً إن وجدت
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // إذا لم توجد نسخة محفوظة، انتظر الشبكة
  return networkPromise;
}

// معالجة رسائل من التطبيق الرئيسي
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_CACHE_STATUS') {
    // إرجاع حالة الـ cache
    Promise.all([
      caches.has(STATIC_CACHE),
      caches.has(PUZZLES_CACHE)
    ]).then(([hasStatic, hasPuzzles]) => {
      event.ports[0].postMessage({
        staticCached: hasStatic,
        puzzlesCached: hasPuzzles
      });
    });
  }
});

// التعامل مع أخطاء غير متوقعة
self.addEventListener('error', (event) => {
  console.error('[SW] Error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('[SW] Unhandled rejection:', event.reason);
});
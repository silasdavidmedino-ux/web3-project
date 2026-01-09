/**
 * BJ Probability Engine - Service Worker
 * Version: 1.3.0
 * Tech Hive Corporation
 *
 * Provides offline capability and caching for the PWA
 */

const CACHE_NAME = 'bj-engine-v3.7.0';
const STATIC_CACHE = 'bj-static-v3.7.0';
const DYNAMIC_CACHE = 'bj-dynamic-v3.7.0';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/styles.css',
  '/js/app.js',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS.map(url => {
          return new Request(url, { cache: 'reload' });
        })).catch((error) => {
          console.warn('[SW] Some assets failed to cache:', error);
          // Continue even if some assets fail
          return Promise.resolve();
        });
      })
      .then(() => {
        console.log('[SW] Static assets cached');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              return name !== STATIC_CACHE && name !== DYNAMIC_CACHE;
            })
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Cache-first strategy for static assets
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Network-first strategy for dynamic content
  event.respondWith(networkFirst(request));
});

// Check if URL is a static asset
function isStaticAsset(pathname) {
  const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2'];
  return staticExtensions.some(ext => pathname.endsWith(ext)) ||
         pathname === '/' ||
         pathname === '/index.html' ||
         pathname === '/manifest.json';
}

// Cache-first strategy
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache-first failed:', error);
    return createOfflineResponse();
  }
}

// Network-first strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return createOfflineResponse();
  }
}

// Create offline fallback response
function createOfflineResponse() {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BJ Probability Engine - Offline</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0d1117;
      color: #e6edf3;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .offline-container {
      text-align: center;
      max-width: 400px;
    }
    .offline-icon {
      width: 80px;
      height: 80px;
      margin-bottom: 24px;
      opacity: 0.6;
    }
    h1 {
      font-size: 24px;
      margin-bottom: 12px;
    }
    p {
      color: #8b949e;
      margin-bottom: 24px;
    }
    button {
      padding: 12px 24px;
      font-size: 14px;
      font-weight: 500;
      background: #238636;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }
    button:hover {
      background: #2ea043;
    }
  </style>
</head>
<body>
  <div class="offline-container">
    <svg class="offline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="1" y1="1" x2="23" y2="23"></line>
      <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
      <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
      <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
      <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
      <line x1="12" y1="20" x2="12.01" y2="20"></line>
    </svg>
    <h1>You're Offline</h1>
    <p>BJ Probability Engine requires an internet connection to load. Please check your connection and try again.</p>
    <button onclick="location.reload()">Try Again</button>
  </div>
</body>
</html>
  `;

  return new Response(html, {
    status: 503,
    statusText: 'Service Unavailable',
    headers: {
      'Content-Type': 'text/html; charset=utf-8'
    }
  });
}

// Handle messages from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name));
    });
  }
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-snapshots') {
    event.waitUntil(syncSnapshots());
  }
});

async function syncSnapshots() {
  // Placeholder for future cloud sync functionality
  console.log('[SW] Syncing snapshots...');
}

console.log('[SW] Service worker loaded');

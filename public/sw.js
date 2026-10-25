/**
 * SecondMind Standalone Offline Service Worker
 * Provides resilient offline caching, app shell navigation, and asset caching.
 */

const CACHE_VERSION = 'secondmind-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const PAGES_CACHE = `${CACHE_VERSION}-pages`;
const ASSETS_CACHE = `${CACHE_VERSION}-assets`;

const PRECACHE_URLS = [
  '/app',
  '/login',
  '/offline',
  '/manifest.json',
  '/favicon.ico',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/logo.png',
];

// 1. Install Event: Precache App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(async (cache) => {
      // Precache critical resources with individual error resilience
      await Promise.allSettled(
        PRECACHE_URLS.map(async (url) => {
          try {
            const res = await fetch(url, { cache: 'no-cache' });
            if (res && res.status === 200) {
              await cache.put(url, res);
            }
          } catch (err) {
            console.warn('[SW] Could not precache:', url, err);
          }
        })
      );
    })
  );
  self.skipWaiting();
});

// 2. Activate Event: Clean up stale caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (!key.startsWith(CACHE_VERSION)) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Helper to determine request type
function isNavigationRequest(request) {
  return request.mode === 'navigate' || request.destination === 'document';
}

function isStaticAsset(url) {
  return (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.match(/\.(?:js|css|woff2?|ttf|otf|png|jpg|jpeg|svg|webp|ico)$/) ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('fonts.googleapis.com')
  );
}

function isBypassed(url) {
  return (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/__clerk/') ||
    url.hostname.includes('clerk.accounts.dev') ||
    url.hostname.includes('clerk.com') ||
    url.hostname.includes('neon.tech') ||
    url.hostname.includes('supabase.co')
  );
}

// 3. Fetch Event: Intelligent Offline Caching Strategy
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Bypass dynamic APIs & external auth services
  if (isBypassed(url)) {
    return;
  }

  // Strategy A: HTML Navigation (Network First, Cache Fallback, Offline Page Fallback)
  if (isNavigationRequest(request)) {
    event.respondWith(
      (async () => {
        try {
          // Attempt network fetch with a 3.5s timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3500);

          const response = await fetch(request, { signal: controller.signal });
          clearTimeout(timeoutId);

          if (response && response.status === 200) {
            const cache = await caches.open(PAGES_CACHE);
            cache.put(request, response.clone());
            return response;
          }
        } catch (_) {
          // Network failed or timed out (offline)
        }

        // Try exact URL match in cache
        const cachedPage = await caches.match(request);
        if (cachedPage) {
          return cachedPage;
        }

        // Fallback: If requesting /app or any sub-route, try serving cached /app
        if (url.pathname.startsWith('/app')) {
          const appShell = await caches.match('/app');
          if (appShell) return appShell;
        }

        // Ultimate fallback: Dedicated offline page
        const offlinePage = await caches.match('/offline');
        if (offlinePage) {
          return offlinePage;
        }

        // Inline minimal fallback if even /offline wasn't cached yet
        return new Response(
          `<!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>SecondMind — Offline</title>
            <style>
              body { background: #040408; color: #fff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; text-align: center; padding: 20px; }
              .card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 32px 24px; max-width: 440px; }
              h1 { font-size: 20px; margin: 0 0 10px; color: #38bdf8; }
              p { font-size: 14px; color: rgba(255,255,255,0.7); line-height: 1.5; margin: 0 0 20px; }
              a, button { display: inline-block; background: #06b6d4; color: #000; font-weight: 600; font-size: 13px; text-decoration: none; padding: 10px 18px; border-radius: 8px; border: none; cursor: pointer; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>SecondMind Offline</h1>
              <p>You are currently offline. Your saved memories in local browser storage remain secure.</p>
              <a href="/app">Launch Offline Dashboard</a>
            </div>
          </body>
          </html>`,
          { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
      })()
    );
    return;
  }

  // Strategy B: Static Assets & Fonts (Cache First, Network Fallback)
  if (isStaticAsset(url)) {
    event.respondWith(
      (async () => {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }

        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(ASSETS_CACHE);
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (_) {
          return cachedResponse || new Response('', { status: 408 });
        }
      })()
    );
    return;
  }

  // Default: Network with Cache Fallback
  event.respondWith(
    caches.match(request).then((cached) => {
      return (
        cached ||
        fetch(request).catch(() => {
          return new Response('', { status: 504, statusText: 'Gateway Timeout' });
        })
      );
    })
  );
});

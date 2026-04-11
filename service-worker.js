// ECO Service Worker — Offline-first mode (OFF-01)
// Cache strategy: Network-first for API calls, Cache-first for static assets
const CACHE_NAME = 'eco-v1';
const CACHE_VERSION = '1.0.0';

const STATIC_ASSETS = [
  '/', '/home.html', '/user.html', '/enter.html', '/member.html',
  '/network.html', '/confluence.html', '/tree.html', '/view-currents.html',
  '/view-pro.html', '/visual-river.html', '/map-pins.html', '/photos.html',
  '/globe.html', '/language.html', '/milestone.html', '/join.html',
  '/claim.html', '/household.html', '/pet.html', '/tribe.html',
  '/org-admin.html', '/gedcom-export.html',
  '/config.js', '/eco-client.js', '/header.js', '/theme-selector.js',
  '/filter-panel.js', '/theme.css'
];

// Install — cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS).catch(err => {
        // Partial failure OK — cache what we can
        console.warn('[SW] Some assets failed to cache:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — network-first for Supabase/API, cache-first for static
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Always network-first for Supabase and external APIs
  if (url.hostname.includes('supabase.co') ||
      url.hostname.includes('anthropic.com') ||
      url.hostname.includes('stripe.com') ||
      url.hostname.includes('googleapis.com')) {
    event.respondWith(
      fetch(event.request).catch(() =>
        new Response(JSON.stringify({ error: 'offline' }), {
          headers: { 'Content-Type': 'application/json' }
        })
      )
    );
    return;
  }

  // Cache-first for static assets
  if (event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          // Cache successful GET responses for static files
          if (response.ok && !url.pathname.includes('admin')) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => {
          // Offline fallback — return cached home page
          return caches.match('/home.html');
        });
      })
    );
  }
});

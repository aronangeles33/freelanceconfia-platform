// Service Worker for advanced caching strategies v1.2.0 - FORCE UPDATE
const CACHE_NAME = 'freelance-confia-v1.2.0-' + Date.now(); // Force new cache
const API_CACHE = 'api-cache-v2-' + Date.now();
const STATIC_CACHE = 'static-cache-v1';
const IMAGE_CACHE = 'image-cache-v1';
const OFFLINE_URL = '/offline.html';

// URLs críticas que se cachean inmediatamente
const PRECACHE_URLS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Estrategias de cache mejoradas
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  CACHE_ONLY: 'cache-only',
  NETWORK_ONLY: 'network-only',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

// Configuración de rutas y estrategias
const ROUTE_CACHE_CONFIG = [
  // Archivos estáticos - Cache First
  {
    pattern: /\.(js|css|woff2?|ttf|eot)$/,
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    cacheName: STATIC_CACHE,
    options: {
      maxEntries: 150,
      maxAgeSeconds: 30 * 24 * 60 * 60, // 30 días
      cacheableResponse: { statuses: [0, 200] }
    }
  },
  // Imágenes - Stale While Revalidate
  {
    pattern: /\.(png|jpg|jpeg|webp|avif|gif|svg|ico)$/,
    strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
    cacheName: IMAGE_CACHE,
    options: {
      maxEntries: 200,
      maxAgeSeconds: 7 * 24 * 60 * 60, // 7 días
      cacheableResponse: { statuses: [0, 200] }
    }
  },
  // API calls - Network First con timeout
  {
    pattern: /\/api\//,
    strategy: CACHE_STRATEGIES.NETWORK_FIRST,
    cacheName: API_CACHE,
    options: {
      maxEntries: 100,
      maxAgeSeconds: 5 * 60, // 5 minutos
      networkTimeoutSeconds: 3,
      cacheableResponse: { statuses: [200] }
    }
  },
  // Páginas HTML - Network First
  {
    pattern: /\/$/,
    strategy: CACHE_STRATEGIES.NETWORK_FIRST,
    cacheName: CACHE_NAME,
    options: {
      maxEntries: 50,
      maxAgeSeconds: 24 * 60 * 60, // 24 horas
      networkTimeoutSeconds: 3
    }
  }
];

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing v1.2.0 - FORCE UPDATE');
  // Skip waiting para forzar activación inmediata
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    }).then(() => {
      console.log('Service Worker: Precache successful');
      return self.skipWaiting();
    }).catch((error) => {
      console.error('Service Worker: Precache failed', error);
    })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating v1.2.0 - FORCE UPDATE');
  
  event.waitUntil(
    (async () => {
      try {
        // Tomar control inmediatamente
        await self.clients.claim();
        
        // FORZAR ELIMINACIÓN DE TODOS LOS CACHES VIEJOS
        const cacheNames = await caches.keys();
        const deletePromises = cacheNames
          .filter(cacheName => !cacheName.includes('v1.2.0'))
          .map(cacheName => {
            console.log('🗑️ Eliminando cache viejo:', cacheName);
            return caches.delete(cacheName);
          });
        
        await Promise.all(deletePromises);
        console.log('✅ Todos los caches viejos eliminados');
        
        // Tomar control de todas las pestañas
        console.log('Service Worker: Clients claimed');
      } catch (error) {
        console.error('Service Worker: Activation failed', error);
      }
    })()
  );
});

// Interceptar fetch requests con estrategias mejoradas
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Solo manejar requests HTTP(S)
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Skip chrome-extension y otros protocolos especiales
  if (url.protocol.startsWith('chrome-extension:') || 
      url.protocol.startsWith('moz-extension:')) {
    return;
  }

  // Ignorar rutas de API que no existen en el frontend demo
  if (url.pathname.startsWith('/api/')) {
    console.log('🚫 Skipping API route (frontend demo):', url.pathname);
    return; // No interceptar requests de API
  }

  // Encontrar configuración de ruta matching
  const routeConfig = ROUTE_CACHE_CONFIG.find(config => 
    config.pattern.test(url.pathname + url.search)
  );

  if (routeConfig) {
    event.respondWith(handleRequest(request, routeConfig));
  } else if (request.destination === 'document') {
    event.respondWith(handlePageRequest(request));
  } else {
    // Estrategia por defecto: Network First
    event.respondWith(handleRequest(request, {
      strategy: CACHE_STRATEGIES.NETWORK_FIRST,
      cacheName: CACHE_NAME,
      options: { maxAgeSeconds: 60 * 60 } // 1 hora
    }));
  }
});

// Manejador principal de requests con diferentes estrategias
async function handleRequest(request, config) {
  const { strategy, cacheName, options = {} } = config;

  switch (strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      return cacheFirstStrategy(request, cacheName, options);
    
    case CACHE_STRATEGIES.NETWORK_FIRST:
      return networkFirstStrategy(request, cacheName, options);
    
    case CACHE_STRATEGIES.CACHE_ONLY:
      return cacheOnlyStrategy(request, cacheName);
    
    case CACHE_STRATEGIES.NETWORK_ONLY:
      return networkOnlyStrategy(request);
    
    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      return staleWhileRevalidateStrategy(request, cacheName, options);
    
    default:
      return fetch(request);
  }
}

// Cache First Strategy - Intenta cache primero, luego red
async function cacheFirstStrategy(request, cacheName, options) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  if (cachedResponse && isCacheValid(cachedResponse, options.maxAgeSeconds)) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    
    if (shouldCache(networkResponse, options)) {
      cache.put(request, networkResponse.clone());
      await maintainCacheSize(cache, options.maxEntries);
    }
    
    return networkResponse;
  } catch (error) {
    // Devolver cache stale si la red falla
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Network First Strategy - Intenta red primero con timeout
async function networkFirstStrategy(request, cacheName, options) {
  const cache = await caches.open(cacheName);
  
  try {
    // Intentar red con timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Network timeout')), 
        (options.networkTimeoutSeconds || 3) * 1000)
    );
    
    const networkResponse = await Promise.race([
      fetch(request),
      timeoutPromise
    ]);

    if (shouldCache(networkResponse, options)) {
      cache.put(request, networkResponse.clone());
      await maintainCacheSize(cache, options.maxEntries);
    }
    
    return networkResponse;
  } catch (error) {
    // Fallback a cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Cache Only Strategy
async function cacheOnlyStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  throw new Error('No cached response available');
}

// Network Only Strategy
async function networkOnlyStrategy(request) {
  return fetch(request);
}

// Stale While Revalidate Strategy - Cache rápido, actualización en background
async function staleWhileRevalidateStrategy(request, cacheName, options) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  // Iniciar request de red inmediatamente
  const networkResponsePromise = fetch(request)
    .then(async response => {
      if (shouldCache(response, options)) {
        cache.put(request, response.clone());
        await maintainCacheSize(cache, options.maxEntries);
      }
      return response;
    })
    .catch(() => null); // Ignorar errores de red en background

  // Devolver respuesta cacheada si está disponible
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Si no hay cache, esperar por la red
  return networkResponsePromise;
}

// Utilidades para validación y mantenimiento de cache
function isCacheValid(response, maxAgeSeconds) {
  if (!maxAgeSeconds) return true;
  
  const dateHeader = response.headers.get('date');
  if (!dateHeader) return false;
  
  const responseTime = new Date(dateHeader).getTime();
  const now = Date.now();
  const maxAge = maxAgeSeconds * 1000;
  
  return (now - responseTime) < maxAge;
}

function shouldCache(response, options = {}) {
  const { cacheableResponse = { statuses: [200] } } = options;
  
  if (!response) return false;
  
  // Verificar códigos de estado
  if (cacheableResponse.statuses && 
      !cacheableResponse.statuses.includes(response.status)) {
    return false;
  }
  
  // No cachear responses con ciertos headers
  if (response.headers.get('cache-control')?.includes('no-store')) {
    return false;
  }
  
  return true;
}

// Mantener tamaño de cache controlado
async function maintainCacheSize(cache, maxEntries) {
  if (!maxEntries) return;
  
  const keys = await cache.keys();
  if (keys.length > maxEntries) {
    // Eliminar las entradas más antiguas
    const entriesToDelete = keys.length - maxEntries;
    for (let i = 0; i < entriesToDelete; i++) {
      await cache.delete(keys[i]);
    }
  }
}

// Manejar requests de páginas HTML (fallback para rutas no específicas)
async function handlePageRequest(request) {
  try {
    // Network First para páginas
    const networkResponse = await Promise.race([
      fetch(request),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Network timeout')), 3000)
      )
    ]);
    
    if (networkResponse.ok) {
      // Cachear página exitosa
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    // Fallback a cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback a página offline para navegación
    if (request.mode === 'navigate') {
      return caches.match(OFFLINE_URL);
    }
    
    return new Response('Page not found', { status: 404 });
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  
  const options = {
    body: data.body || 'Nueva notificación de FreelanceConfía',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    image: data.image,
    data: data.data || {},
    actions: data.actions || [
      {
        action: 'view',
        title: 'Ver',
        icon: '/icons/action-view.png'
      },
      {
        action: 'dismiss',
        title: 'Descartar',
        icon: '/icons/action-dismiss.png'
      }
    ],
    tag: data.tag || 'general',
    renotify: true,
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false,
    vibrate: data.vibrate || [200, 100, 200],
    timestamp: Date.now(),
    dir: 'ltr',
    lang: 'es'
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'FreelanceConfía', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const { action, data } = event;
  let url = '/dashboard';
  
  if (action === 'view' && data?.url) {
    url = data.url;
  } else if (action === 'dismiss') {
    return;
  } else if (data?.type) {
    switch (data.type) {
      case 'new_project':
        url = `/project/${data.projectId}`;
        break;
      case 'new_message':
        url = `/dashboard?tab=messages&chat=${data.chatId}`;
        break;
      case 'project_update':
        url = `/project/${data.projectId}`;
        break;
      case 'payment':
        url = `/dashboard?tab=payments`;
        break;
      default:
        url = '/dashboard';
    }
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.registration.scope) && 'focus' in client) {
            client.focus();
            client.postMessage({ type: 'NAVIGATE', url });
            return;
          }
        }
        
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Background sync
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  } else if (event.tag === 'offline-actions') {
    event.waitUntil(syncOfflineActions());
  }
});

async function doBackgroundSync() {
  try {
    await syncOfflineActions();
    await updateCriticalData();
    console.log('Service Worker: Background sync completed');
  } catch (error) {
    console.error('Service Worker: Background sync failed', error);
  }
}

async function syncOfflineActions() {
  try {
    const db = await openOfflineDB();
    const transaction = db.transaction(['actions'], 'readonly');
    const store = transaction.objectStore('actions');
    const actions = await getAllFromStore(store);
    
    for (const action of actions) {
      try {
        const response = await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body
        });
        
        if (response.ok) {
          const deleteTransaction = db.transaction(['actions'], 'readwrite');
          const deleteStore = deleteTransaction.objectStore('actions');
          await deleteFromStore(deleteStore, action.id);
          
          const clients = await self.clients.matchAll();
          clients.forEach(client => {
            client.postMessage({
              type: 'SYNC_SUCCESS',
              action: action
            });
          });
        }
      } catch (error) {
        console.log('Failed to sync action:', action, error);
      }
    }
  } catch (error) {
    console.error('Offline actions sync failed:', error);
  }
}

async function updateCriticalData() {
  try {
    const criticalUrls = [
      '/api/user/profile',
      '/api/projects/active',
      '/api/notifications/unread'
    ];
    
    const cache = await caches.open(API_CACHE);
    
    for (const url of criticalUrls) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          cache.put(url, response.clone());
        }
      } catch (error) {
        console.log('Failed to update critical data for:', url);
      }
    }
  } catch (error) {
    console.error('Critical data update failed:', error);
  }
}

function openOfflineDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('OfflineActions', 1);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('actions')) {
        db.createObjectStore('actions', { keyPath: 'id', autoIncrement: true });
      }
    };
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getAllFromStore(store) {
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function deleteFromStore(store, id) {
  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Message handling para comunicación con main thread
self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CACHE_URLS':
      handleCacheUrls(payload?.urls || []);
      break;
      
    case 'CLEAR_CACHE':
      handleClearCache(payload?.cacheName);
      break;
      
    case 'GET_CACHE_STATS':
      handleGetCacheStats().then(stats => {
        event.ports[0]?.postMessage({ type: 'CACHE_STATS', payload: stats });
      });
      break;
      
    case 'FORCE_UPDATE':
      handleForceUpdate();
      break;
      
    case 'PREFETCH_ROUTES':
      handlePrefetchRoutes(payload?.routes || []);
      break;
      
    default:
      console.log('Unknown message type:', type);
  }
});

async function handleCacheUrls(urls) {
  const cache = await caches.open(CACHE_NAME);
  const failedUrls = [];
  
  for (const url of urls) {
    try {
      await cache.add(url);
    } catch (error) {
      failedUrls.push(url);
    }
  }
  
  if (failedUrls.length > 0) {
    console.warn('Failed to cache URLs:', failedUrls);
  }
}

async function handleClearCache(cacheName) {
  if (cacheName) {
    await caches.delete(cacheName);
  } else {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
  }
}

async function handleGetCacheStats() {
  const cacheNames = await caches.keys();
  const stats = {};
  let totalSize = 0;
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    let cacheSize = 0;
    for (const request of keys) {
      try {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          cacheSize += blob.size;
        }
      } catch (error) {
        // Ignorar errores individuales
      }
    }
    
    stats[cacheName] = {
      count: keys.length,
      size: cacheSize,
      urls: keys.slice(0, 10).map(request => request.url)
    };
    
    totalSize += cacheSize;
  }
  
  return {
    ...stats,
    totalSize,
    totalCaches: cacheNames.length
  };
}

async function handleForceUpdate() {
  await handleClearCache();
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(PRECACHE_URLS);
  
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({ type: 'FORCE_UPDATE_COMPLETE' });
  });
}

async function handlePrefetchRoutes(routes) {
  const cache = await caches.open(CACHE_NAME);
  
  for (const route of routes) {
    try {
      const response = await fetch(route);
      if (response.ok) {
        await cache.put(route, response);
      }
    } catch (error) {
      console.warn('Failed to prefetch route:', route, error);
    }
  }
}

console.log('Service Worker: Loaded successfully v1.2.0 - FORCE UPDATE');
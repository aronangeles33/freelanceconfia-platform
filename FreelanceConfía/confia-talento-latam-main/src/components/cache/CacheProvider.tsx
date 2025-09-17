import React, { createContext, useContext, useEffect, useState } from 'react';
import { useConnectionMonitor } from '../../hooks/use-performance';

// Cache configuration
interface CacheConfig {
  maxSize: number; // MB
  ttl: number; // seconds
  enableCompression: boolean;
  enableServiceWorker: boolean;
}

interface CacheItem {
  data: any;
  timestamp: number;
  size: number;
  compressed?: boolean;
}

interface CacheContextType {
  get: <T>(key: string) => T | null;
  set: <T>(key: string, data: T, ttl?: number) => void;
  delete: (key: string) => void;
  clear: () => void;
  getStats: () => CacheStats;
  config: CacheConfig;
}

interface CacheStats {
  totalSize: number;
  itemCount: number;
  hitRate: number;
  missRate: number;
  compressionRatio: number;
}

const CacheContext = createContext<CacheContextType | null>(null);

// LZ-string based compression utility
const compressionUtils = {
  compress: (data: string): string => {
    // Simple compression algorithm for demo
    // In production, use a proper compression library
    try {
      return btoa(encodeURIComponent(data));
    } catch {
      return data;
    }
  },
  
  decompress: (compressed: string): string => {
    try {
      return decodeURIComponent(atob(compressed));
    } catch {
      return compressed;
    }
  },
  
  getCompressionRatio: (original: string, compressed: string): number => {
    return compressed.length / original.length;
  }
};

// Memory-based cache with IndexedDB fallback
class HybridCache {
  private memoryCache = new Map<string, CacheItem>();
  private config: CacheConfig;
  private stats = {
    hits: 0,
    misses: 0,
    totalOriginalSize: 0,
    totalCompressedSize: 0
  };
  private db: IDBDatabase | null = null;

  constructor(config: CacheConfig) {
    this.config = config;
    this.initIndexedDB();
    this.startCleanupInterval();
  }

  private async initIndexedDB() {
    try {
      const request = indexedDB.open('FreelanceConfiaCache', 1);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' });
        }
      };
      
      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
      };
    } catch (error) {
      console.warn('IndexedDB not available:', error);
    }
  }

  private startCleanupInterval() {
    setInterval(() => {
      this.cleanup();
    }, 60000); // Cleanup every minute
  }

  private cleanup() {
    const now = Date.now();
    const maxSize = this.config.maxSize * 1024 * 1024; // Convert MB to bytes
    let currentSize = 0;

    // Remove expired items
    for (const [key, item] of this.memoryCache.entries()) {
      if (now - item.timestamp > this.config.ttl * 1000) {
        this.memoryCache.delete(key);
        this.removeFromIndexedDB(key);
      } else {
        currentSize += item.size;
      }
    }

    // Remove oldest items if over size limit
    if (currentSize > maxSize) {
      const sortedEntries = Array.from(this.memoryCache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp);

      for (const [key] of sortedEntries) {
        if (currentSize <= maxSize) break;
        const item = this.memoryCache.get(key);
        if (item) {
          currentSize -= item.size;
          this.memoryCache.delete(key);
          this.removeFromIndexedDB(key);
        }
      }
    }
  }

  private calculateSize(data: any): number {
    return new Blob([JSON.stringify(data)]).size;
  }

  private async saveToIndexedDB(key: string, item: CacheItem) {
    if (!this.db) return;

    try {
      const transaction = this.db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      await store.put({ key, ...item });
    } catch (error) {
      console.warn('Failed to save to IndexedDB:', error);
    }
  }

  private async loadFromIndexedDB(key: string): Promise<CacheItem | null> {
    if (!this.db) return null;

    try {
      const transaction = this.db.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.get(key);
      
      return new Promise((resolve) => {
        request.onsuccess = () => {
          const result = request.result;
          if (result) {
            const { key: _, ...item } = result;
            resolve(item as CacheItem);
          } else {
            resolve(null);
          }
        };
        request.onerror = () => resolve(null);
      });
    } catch (error) {
      console.warn('Failed to load from IndexedDB:', error);
      return null;
    }
  }

  private async removeFromIndexedDB(key: string) {
    if (!this.db) return;

    try {
      const transaction = this.db.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      await store.delete(key);
    } catch (error) {
      console.warn('Failed to remove from IndexedDB:', error);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    // Try memory cache first
    let item = this.memoryCache.get(key);
    
    // Fallback to IndexedDB
    if (!item) {
      item = await this.loadFromIndexedDB(key);
      if (item) {
        this.memoryCache.set(key, item);
      }
    }

    if (!item) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    const now = Date.now();
    if (now - item.timestamp > this.config.ttl * 1000) {
      this.memoryCache.delete(key);
      this.removeFromIndexedDB(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;

    // Decompress if needed
    let data = item.data;
    if (item.compressed && typeof data === 'string') {
      data = JSON.parse(compressionUtils.decompress(data));
    }

    return data as T;
  }

  async set<T>(key: string, data: T, customTtl?: number): Promise<void> {
    const timestamp = Date.now();
    const originalData = JSON.stringify(data);
    const originalSize = this.calculateSize(originalData);
    
    let finalData: any = data;
    let compressed = false;
    let finalSize = originalSize;

    // Compress large items if compression is enabled
    if (this.config.enableCompression && originalSize > 1024) { // Compress if > 1KB
      const compressedData = compressionUtils.compress(originalData);
      const compressedSize = this.calculateSize(compressedData);
      
      if (compressedSize < originalSize * 0.9) { // Only if compression saves at least 10%
        finalData = compressedData;
        compressed = true;
        finalSize = compressedSize;
        
        this.stats.totalOriginalSize += originalSize;
        this.stats.totalCompressedSize += compressedSize;
      }
    }

    const item: CacheItem = {
      data: finalData,
      timestamp,
      size: finalSize,
      compressed
    };

    // Store in memory cache
    this.memoryCache.set(key, item);
    
    // Store in IndexedDB
    await this.saveToIndexedDB(key, item);
  }

  delete(key: string): void {
    this.memoryCache.delete(key);
    this.removeFromIndexedDB(key);
  }

  clear(): void {
    this.memoryCache.clear();
    if (this.db) {
      try {
        const transaction = this.db.transaction(['cache'], 'readwrite');
        const store = transaction.objectStore('cache');
        store.clear();
      } catch (error) {
        console.warn('Failed to clear IndexedDB:', error);
      }
    }
  }

  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses;
    const totalSize = Array.from(this.memoryCache.values())
      .reduce((sum, item) => sum + item.size, 0);

    return {
      totalSize: Math.round(totalSize / 1024), // KB
      itemCount: this.memoryCache.size,
      hitRate: totalRequests > 0 ? this.stats.hits / totalRequests : 0,
      missRate: totalRequests > 0 ? this.stats.misses / totalRequests : 0,
      compressionRatio: this.stats.totalOriginalSize > 0 ? 
        this.stats.totalCompressedSize / this.stats.totalOriginalSize : 1
    };
  }
}

// Cache provider component
export const CacheProvider: React.FC<{ 
  children: React.ReactNode;
  config?: Partial<CacheConfig>;
}> = ({ children, config = {} }) => {
  const { isSlowConnection } = useConnectionMonitor();
  
  const defaultConfig: CacheConfig = {
    maxSize: 50, // 50MB
    ttl: 3600, // 1 hour
    enableCompression: true,
    enableServiceWorker: true,
    ...config
  };

  // Adjust cache behavior based on connection
  if (isSlowConnection) {
    defaultConfig.maxSize = Math.min(defaultConfig.maxSize, 20); // Reduce cache size
    defaultConfig.ttl = Math.max(defaultConfig.ttl, 7200); // Increase TTL
  }

  const [cache] = useState(() => new HybridCache(defaultConfig));

  useEffect(() => {
    // Register service worker for advanced caching
    if (defaultConfig.enableServiceWorker && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.warn('Service Worker registration failed:', error);
        });
    }
  }, [defaultConfig.enableServiceWorker]);

  const contextValue: CacheContextType = {
    get: cache.get.bind(cache),
    set: cache.set.bind(cache),
    delete: cache.delete.bind(cache),
    clear: cache.clear.bind(cache),
    getStats: cache.getStats.bind(cache),
    config: defaultConfig
  };

  return (
    <CacheContext.Provider value={contextValue}>
      {children}
    </CacheContext.Provider>
  );
};

// Hook to use cache
export const useCache = () => {
  const context = useContext(CacheContext);
  if (!context) {
    throw new Error('useCache must be used within a CacheProvider');
  }
  return context;
};

// HOC for automatic caching
export const withCache = <P extends object>(
  Component: React.ComponentType<P>,
  cacheKey: (props: P) => string,
  ttl?: number
) => {
  return React.memo((props: P) => {
    const { get, set } = useCache();
    const [cachedProps, setCachedProps] = useState<P | null>(null);
    const key = cacheKey(props);

    useEffect(() => {
      const loadCachedData = async () => {
        const cached = await get<P>(key);
        if (cached) {
          setCachedProps(cached);
        } else {
          setCachedProps(props);
          set(key, props, ttl);
        }
      };

      loadCachedData();
    }, [key, props, get, set, ttl]);

    if (!cachedProps) {
      return <div>Loading...</div>;
    }

    return <Component {...cachedProps} />;
  });
};

// Cache status component for debugging
export const CacheStatus: React.FC = () => {
  const { getStats } = useCache();
  const [stats, setStats] = useState<CacheStats>({
    totalSize: 0,
    itemCount: 0,
    hitRate: 0,
    missRate: 0,
    compressionRatio: 0
  });

  useEffect(() => {
    const updateStats = () => {
      setStats(getStats());
    };

    updateStats();
    const interval = setInterval(updateStats, 5000);

    return () => clearInterval(interval);
  }, [getStats]);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono z-50">
      <h3 className="font-bold mb-2">Cache Stats</h3>
      <div>Size: {stats.totalSize}KB</div>
      <div>Items: {stats.itemCount}</div>
      <div>Hit Rate: {(stats.hitRate * 100).toFixed(1)}%</div>
      <div>Compression: {(stats.compressionRatio * 100).toFixed(1)}%</div>
    </div>
  );
};

// HTTP cache utilities
export const httpCache = {
  // Cache API responses
  cacheResponse: async (url: string, response: Response): Promise<void> => {
    if ('caches' in window) {
      try {
        const cache = await caches.open('api-cache-v1');
        await cache.put(url, response.clone());
      } catch (error) {
        console.warn('Failed to cache response:', error);
      }
    }
  },

  // Get cached response
  getCachedResponse: async (url: string): Promise<Response | null> => {
    if ('caches' in window) {
      try {
        const cache = await caches.open('api-cache-v1');
        return await cache.match(url) || null;
      } catch (error) {
        console.warn('Failed to get cached response:', error);
      }
    }
    return null;
  },

  // Fetch with cache
  fetchWithCache: async (url: string, options?: RequestInit): Promise<Response> => {
    // Try cache first
    const cachedResponse = await httpCache.getCachedResponse(url);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Fetch and cache
    const response = await fetch(url, options);
    if (response.ok) {
      await httpCache.cacheResponse(url, response);
    }
    
    return response;
  }
};
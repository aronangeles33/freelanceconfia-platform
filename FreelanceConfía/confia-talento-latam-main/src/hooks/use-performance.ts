import { useState, useEffect, useRef, useCallback } from 'react';

// Performance monitoring hook
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    FCP: 0, // First Contentful Paint
    LCP: 0, // Largest Contentful Paint
    FID: 0, // First Input Delay
    CLS: 0, // Cumulative Layout Shift
    TTFB: 0, // Time to First Byte
  });

  useEffect(() => {
    // Measure Core Web Vitals
    const measureWebVitals = async () => {
      try {
        // Dynamic import for web-vitals (v5 API)
        const { onCLS, onINP, onFCP, onLCP, onTTFB } = await import('web-vitals');
        
        onCLS((metric) => {
          setMetrics(prev => ({ ...prev, CLS: metric.value }));
          // Send to analytics
          sendToAnalytics('CLS', metric.value);
        });

        onINP((metric) => {
          setMetrics(prev => ({ ...prev, FID: metric.value })); // INP replaces FID
          sendToAnalytics('INP', metric.value);
        });

        onFCP((metric) => {
          setMetrics(prev => ({ ...prev, FCP: metric.value }));
          sendToAnalytics('FCP', metric.value);
        });

        onLCP((metric) => {
          setMetrics(prev => ({ ...prev, LCP: metric.value }));
          sendToAnalytics('LCP', metric.value);
        });

        onTTFB((metric) => {
          setMetrics(prev => ({ ...prev, TTFB: metric.value }));
          sendToAnalytics('TTFB', metric.value);
        });
      } catch (error) {
        console.warn('Web Vitals measurement failed:', error);
      }
    };

    measureWebVitals();
  }, []);

  const sendToAnalytics = (name: string, value: number) => {
    // Send to Google Analytics or other analytics service
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', name, {
        value: Math.round(value),
        metric_id: name,
        custom_parameter_1: 'FreelanceConfia'
      });
    }
    
    // Log to console in development (backend API disabled for frontend-only demo)
    console.log(`📊 Analytics: ${name} = ${value}ms`);
    
    // NO BACKEND API CALLS IN FRONTEND DEMO
    return; // Early return to prevent any API calls
  };

  return metrics;
};

// Intersection Observer hook for lazy loading
export const useIntersectionObserver = (
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
      if (entry.isIntersecting && !hasIntersected) {
        setHasIntersected(true);
      }
    }, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, [elementRef, options, hasIntersected]);

  return { isIntersecting, hasIntersected };
};

// Debounce hook for performance optimization
export const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Throttle hook for performance optimization
export const useThrottle = <T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T => {
  const lastRun = useRef(Date.now());

  return useCallback(
    ((...args) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [callback, delay]
  );
};

// Image lazy loading hook
export const useLazyImage = (src: string, placeholder?: string) => {
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const { isIntersecting } = useIntersectionObserver(imageRef);

  useEffect(() => {
    if (isIntersecting && src && !isLoaded && !isError) {
      const img = new Image();
      
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
      };
      
      img.onerror = () => {
        setIsError(true);
      };
      
      img.src = src;
    }
  }, [isIntersecting, src, isLoaded, isError]);

  return {
    ref: imageRef,
    src: imageSrc,
    isLoaded,
    isError,
    isIntersecting
  };
};

// Component lazy loading hook
export const useLazyComponent = <T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) => {
  const [Component, setComponent] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadComponent = useCallback(async () => {
    if (Component || isLoading) return;
    
    setIsLoading(true);
    try {
      const module = await importFunc();
      setComponent(() => module.default);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [importFunc, Component, isLoading]);

  return {
    Component: Component || fallback,
    isLoading,
    error,
    loadComponent
  };
};

// Memory usage monitoring
export const useMemoryMonitor = () => {
  const [memoryInfo, setMemoryInfo] = useState({
    usedJSHeapSize: 0,
    totalJSHeapSize: 0,
    jsHeapSizeLimit: 0
  });

  useEffect(() => {
    const updateMemoryInfo = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMemoryInfo({
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit
        });
      }
    };

    // Update every 5 seconds
    const interval = setInterval(updateMemoryInfo, 5000);
    updateMemoryInfo(); // Initial call

    return () => clearInterval(interval);
  }, []);

  const getMemoryUsagePercentage = () => {
    if (memoryInfo.jsHeapSizeLimit === 0) return 0;
    return (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100;
  };

  return {
    ...memoryInfo,
    usagePercentage: getMemoryUsagePercentage()
  };
};

// Connection quality monitoring
export const useConnectionMonitor = () => {
  const [connectionInfo, setConnectionInfo] = useState({
    effectiveType: '4g',
    downlink: 0,
    rtt: 0,
    saveData: false
  });

  useEffect(() => {
    const updateConnection = () => {
      if ('connection' in navigator) {
        const conn = (navigator as any).connection;
        setConnectionInfo({
          effectiveType: conn.effectiveType || '4g',
          downlink: conn.downlink || 0,
          rtt: conn.rtt || 0,
          saveData: conn.saveData || false
        });
      }
    };

    updateConnection();

    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      conn.addEventListener('change', updateConnection);
      
      return () => {
        conn.removeEventListener('change', updateConnection);
      };
    }
  }, []);

  const isSlowConnection = () => {
    return connectionInfo.effectiveType === 'slow-2g' || 
           connectionInfo.effectiveType === '2g' ||
           connectionInfo.saveData;
  };

  return {
    ...connectionInfo,
    isSlowConnection: isSlowConnection()
  };
};

// Scroll performance optimization
export const useVirtualScrolling = <T,>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length - 1
  );
  
  const visibleItems = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = useThrottle((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, 16); // ~60fps

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    startIndex,
    endIndex
  };
};

// Bundle analyzer helper
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    console.group('📦 Bundle Analysis');
    
    // Analyze chunks
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    scripts.forEach((script: any) => {
      if (script.src.includes('assets')) {
        console.log(`Script: ${script.src.split('/').pop()}`);
      }
    });
    
    // Analyze CSS
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    styles.forEach((style: any) => {
      if (style.href.includes('assets')) {
        console.log(`Style: ${style.href.split('/').pop()}`);
      }
    });
    
    console.groupEnd();
  }
};

// Performance budget checker
export const usePerformanceBudget = () => {
  const budgets = {
    FCP: 1800, // ms
    LCP: 2500, // ms
    FID: 100,  // ms
    CLS: 0.1,  // score
    bundleSize: 500 // KB
  };

  const metrics = usePerformanceMonitor();

  const checkBudget = () => {
    const violations: string[] = [];
    
    if (metrics.FCP > budgets.FCP) {
      violations.push(`FCP exceeded: ${metrics.FCP}ms > ${budgets.FCP}ms`);
    }
    
    if (metrics.LCP > budgets.LCP) {
      violations.push(`LCP exceeded: ${metrics.LCP}ms > ${budgets.LCP}ms`);
    }
    
    if (metrics.FID > budgets.FID) {
      violations.push(`FID exceeded: ${metrics.FID}ms > ${budgets.FID}ms`);
    }
    
    if (metrics.CLS > budgets.CLS) {
      violations.push(`CLS exceeded: ${metrics.CLS} > ${budgets.CLS}`);
    }

    return {
      passed: violations.length === 0,
      violations,
      metrics,
      budgets
    };
  };

  return { checkBudget, budgets, metrics };
};
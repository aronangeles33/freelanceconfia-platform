import React, { createContext, useContext, useEffect, useCallback, useState } from 'react';
import { usePerformanceMonitor, useConnectionMonitor } from '../../hooks/use-performance';
import { config } from '../../config/environment';

// Types for analytics events
interface AnalyticsEvent {
  name: string;
  category: string;
  properties?: Record<string, any>;
  value?: number;
  timestamp?: number;
}

interface UserProperties {
  userId?: string;
  userType?: 'freelancer' | 'client' | 'admin';
  subscription?: string;
  region?: string;
  language?: string;
}

interface PageViewEvent {
  page: string;
  title: string;
  referrer?: string;
  timestamp?: number;
}

interface PerformanceMetrics {
  FCP: number;
  LCP: number;
  FID: number;
  CLS: number;
  TTFB: number;
  loadTime: number;
  bundle?: {
    totalSize: number;
    chunkCount: number;
    loadTime: number;
  };
}

interface AnalyticsContextType {
  // Event tracking
  track: (event: AnalyticsEvent) => void;
  trackPageView: (event: PageViewEvent) => void;
  trackError: (error: Error, context?: Record<string, any>) => void;
  trackPerformance: (metrics: Partial<PerformanceMetrics>) => void;
  
  // User management
  identify: (userId: string, properties?: UserProperties) => void;
  setUserProperties: (properties: UserProperties) => void;
  
  // Performance monitoring
  startTiming: (name: string) => () => void;
  markFeatureUsage: (feature: string, action: string) => void;
  
  // A/B Testing
  getVariant: (experimentName: string) => string;
  trackConversion: (experimentName: string, variant: string) => void;
  
  // Configuration
  isEnabled: boolean;
  consent: {
    analytics: boolean;
    performance: boolean;
    marketing: boolean;
  };
  updateConsent: (consent: Partial<AnalyticsContextType['consent']>) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

// Analytics provider component
export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const performanceMetrics = usePerformanceMonitor();
  const connectionInfo = useConnectionMonitor();
  
  const [isEnabled, setIsEnabled] = useState(config.analytics.enableGoogleAnalytics);
  const [consent, setConsent] = useState({
    analytics: false,
    performance: false,
    marketing: false
  });
  
  const [userProperties, setUserPropertiesState] = useState<UserProperties>({});
  const [experiments, setExperiments] = useState<Record<string, string>>({});

  // Initialize analytics services
  useEffect(() => {
    initializeAnalytics();
    loadConsentPreferences();
    initializeExperiments();
  }, []);

  // Track performance metrics automatically
  useEffect(() => {
    if (consent.performance && Object.values(performanceMetrics).some(v => typeof v === 'number' && v > 0)) {
      trackPerformance(performanceMetrics);
    }
  }, [performanceMetrics, consent.performance]);

  const initializeAnalytics = () => {
    // Initialize Google Analytics
    if (config.analytics.enableGoogleAnalytics && config.analytics.googleAnalyticsId) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${config.analytics.googleAnalyticsId}`;
      document.head.appendChild(script);

      script.onload = () => {
        (window as any).dataLayer = (window as any).dataLayer || [];
        function gtag(...args: any[]) {
          (window as any).dataLayer.push(args);
        }
        (window as any).gtag = gtag;

        gtag('js', new Date());
        gtag('config', config.analytics.googleAnalyticsId, {
          send_page_view: false, // We'll handle page views manually
          anonymize_ip: true,
          cookie_domain: 'auto',
          cookie_expires: 63072000, // 2 years
          allow_google_signals: false,
          allow_ad_personalization_signals: false
        });
      };
    }

    // Initialize other analytics services
    initializeSentry();
    initializeCustomAnalytics();
  };

  const initializeSentry = () => {
    if (config.monitoring.enableSentry && config.monitoring.sentryDsn) {
      // Dynamic import for Sentry - will be installed separately if needed
      try {
        if (typeof window !== 'undefined' && (window as any).Sentry) {
          (window as any).Sentry.init({
            dsn: config.monitoring.sentryDsn,
            environment: config.isProduction ? 'production' : 'development',
            tracesSampleRate: config.monitoring.performanceSampleRate,
            beforeSend: (event: any) => {
              if (config.isProduction && event.level === 'warning') {
                return null;
              }
              return event;
            }
          });
        }
      } catch (error) {
        console.warn('Sentry initialization failed:', error);
      }
    }
  };

  const initializeCustomAnalytics = () => {
    // Initialize custom analytics endpoint
    if (config.isProduction) {
      navigator.sendBeacon = navigator.sendBeacon || function(url, data) {
        fetch(url, {
          method: 'POST',
          body: data,
          keepalive: true
        }).catch(() => {});
        return true;
      };
    }
  };

  const loadConsentPreferences = () => {
    try {
      const saved = localStorage.getItem('analytics-consent');
      if (saved) {
        const parsed = JSON.parse(saved);
        setConsent(parsed);
        setIsEnabled(parsed.analytics);
      }
    } catch (error) {
      console.warn('Failed to load consent preferences:', error);
    }
  };

  const initializeExperiments = () => {
    // Initialize A/B testing experiments
    const activeExperiments = {
      'homepage-hero': Math.random() > 0.5 ? 'variant-a' : 'variant-b',
      'pricing-display': Math.random() > 0.33 ? (Math.random() > 0.5 ? 'monthly' : 'yearly') : 'lifetime',
      'onboarding-flow': Math.random() > 0.5 ? 'standard' : 'simplified'
    };
    
    setExperiments(activeExperiments);
    
    // Track experiment participation
    Object.entries(activeExperiments).forEach(([experiment, variant]) => {
      track({
        name: 'experiment_participation',
        category: 'ab_testing',
        properties: {
          experiment,
          variant
        }
      });
    });
  };

  const track = useCallback((event: AnalyticsEvent) => {
    if (!isEnabled || !consent.analytics) return;

    const enrichedEvent = {
      ...event,
      timestamp: event.timestamp || Date.now(),
      properties: {
        ...event.properties,
        // Add context data
        user_agent: navigator.userAgent,
        screen_resolution: `${screen.width}x${screen.height}`,
        viewport_size: `${window.innerWidth}x${window.innerHeight}`,
        connection_type: connectionInfo.effectiveType,
        connection_speed: connectionInfo.downlink,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        ...userProperties
      }
    };

    // Send to Google Analytics
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', event.name, {
        event_category: event.category,
        event_label: JSON.stringify(event.properties),
        value: event.value,
        custom_map: {
          custom_parameter_1: 'FreelanceConfia'
        }
      });
    }

    // Send to custom analytics endpoint
    if (config.isProduction) {
      const payload = JSON.stringify(enrichedEvent);
      
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/analytics/events', payload);
      } else {
        fetch('/api/analytics/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true
        }).catch(() => {});
      }
    } else {
      console.log('📊 Analytics Event:', enrichedEvent);
    }
  }, [isEnabled, consent.analytics, connectionInfo, userProperties]);

  const trackPageView = useCallback((event: PageViewEvent) => {
    if (!isEnabled || !consent.analytics) return;

    const pageViewEvent = {
      ...event,
      timestamp: event.timestamp || Date.now()
    };

    // Send to Google Analytics
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('config', config.analytics.googleAnalyticsId, {
        page_title: event.title,
        page_location: window.location.href,
        page_path: event.page
      });
    }

    // Track as custom event
    track({
      name: 'page_view',
      category: 'navigation',
      properties: pageViewEvent
    });
  }, [isEnabled, consent.analytics, track]);

  const trackError = useCallback((error: Error, context?: Record<string, any>) => {
    if (!isEnabled) return;

    const errorEvent = {
      name: 'error',
      category: 'error',
      properties: {
        error_message: error.message,
        error_stack: error.stack,
        error_name: error.name,
        ...context,
        url: window.location.href,
        user_agent: navigator.userAgent,
        timestamp: Date.now()
      }
    };

    // Send to Sentry if available
    if (typeof (window as any).Sentry !== 'undefined') {
      (window as any).Sentry.captureException(error, {
        contexts: { additional_context: context }
      });
    }

    // Track as analytics event
    track(errorEvent);
  }, [isEnabled, track]);

  const trackPerformance = useCallback((metrics: Partial<PerformanceMetrics>) => {
    if (!isEnabled || !consent.performance) return;

    // Send Core Web Vitals to Google Analytics
    Object.entries(metrics).forEach(([name, value]) => {
      if (typeof value === 'number' && value > 0) {
        if (typeof (window as any).gtag === 'function') {
          (window as any).gtag('event', name, {
            event_category: 'performance',
            value: Math.round(value),
            metric_id: name,
            metric_value: value,
            metric_delta: value // For debugging
          });
        }
      }
    });

    // Track as custom event
    track({
      name: 'performance_metrics',
      category: 'performance',
      properties: {
        ...metrics,
        connection_type: connectionInfo.effectiveType,
        connection_speed: connectionInfo.downlink
      }
    });
  }, [isEnabled, consent.performance, connectionInfo, track]);

  const identify = useCallback((userId: string, properties?: UserProperties) => {
    const newProperties = {
      userId,
      ...properties
    };

    setUserPropertiesState(prev => ({ ...prev, ...newProperties }));

    // Send to Google Analytics
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('config', config.analytics.googleAnalyticsId, {
        user_id: userId
      });
    }

    // Send to Sentry
    if (typeof (window as any).Sentry !== 'undefined') {
      (window as any).Sentry.setUser({
        id: userId,
        ...properties
      });
    }

    track({
      name: 'user_identified',
      category: 'user',
      properties: newProperties
    });
  }, [track]);

  const setUserProperties = useCallback((properties: UserProperties) => {
    setUserPropertiesState(prev => ({ ...prev, ...properties }));

    track({
      name: 'user_properties_updated',
      category: 'user',
      properties
    });
  }, [track]);

  const startTiming = useCallback((name: string) => {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      
      track({
        name: 'timing',
        category: 'performance',
        properties: {
          timing_name: name,
          duration
        },
        value: Math.round(duration)
      });
      
      return duration;
    };
  }, [track]);

  const markFeatureUsage = useCallback((feature: string, action: string) => {
    track({
      name: 'feature_usage',
      category: 'engagement',
      properties: {
        feature,
        action,
        timestamp: Date.now()
      }
    });
  }, [track]);

  const getVariant = useCallback((experimentName: string): string => {
    return experiments[experimentName] || 'control';
  }, [experiments]);

  const trackConversion = useCallback((experimentName: string, variant: string) => {
    track({
      name: 'conversion',
      category: 'ab_testing',
      properties: {
        experiment: experimentName,
        variant,
        timestamp: Date.now()
      }
    });
  }, [track]);

  const updateConsent = useCallback((newConsent: Partial<AnalyticsContextType['consent']>) => {
    const updatedConsent = { ...consent, ...newConsent };
    setConsent(updatedConsent);
    setIsEnabled(updatedConsent.analytics);
    
    // Save to localStorage
    try {
      localStorage.setItem('analytics-consent', JSON.stringify(updatedConsent));
    } catch (error) {
      console.warn('Failed to save consent preferences:', error);
    }

    // Track consent change
    track({
      name: 'consent_updated',
      category: 'privacy',
      properties: updatedConsent
    });
  }, [consent, track]);

  const contextValue: AnalyticsContextType = {
    track,
    trackPageView,
    trackError,
    trackPerformance,
    identify,
    setUserProperties,
    startTiming,
    markFeatureUsage,
    getVariant,
    trackConversion,
    isEnabled,
    consent,
    updateConsent
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
};

// Hook to use analytics
export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

// HOC for automatic page view tracking
export const withPageTracking = <P extends object>(
  Component: React.ComponentType<P>,
  pageInfo?: { title?: string; category?: string }
) => {
  return React.memo((props: P) => {
    const { trackPageView } = useAnalytics();
    
    useEffect(() => {
      trackPageView({
        page: window.location.pathname,
        title: pageInfo?.title || document.title,
        referrer: document.referrer
      });
    }, [trackPageView]);

    return <Component {...props} />;
  });
};

// Component for GDPR compliance
export const ConsentBanner: React.FC = () => {
  const { consent, updateConsent, isEnabled } = useAnalytics();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show banner if no consent has been given
    const hasConsent = localStorage.getItem('analytics-consent');
    if (!hasConsent) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    updateConsent({
      analytics: true,
      performance: true,
      marketing: true
    });
    setIsVisible(false);
  };

  const handleAcceptNecessary = () => {
    updateConsent({
      analytics: false,
      performance: false,
      marketing: false
    });
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm text-gray-600">
            Utilizamos cookies y tecnologías similares para mejorar tu experiencia, 
            analizar el tráfico y personalizar el contenido. 
            <a href="/privacy" className="text-blue-600 hover:underline ml-1">
              Política de Privacidad
            </a>
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleAcceptNecessary}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Solo Necesarias
          </button>
          <button
            onClick={handleAcceptAll}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Aceptar Todas
          </button>
        </div>
      </div>
    </div>
  );
};

// Performance monitoring component
export const PerformanceMonitor: React.FC = () => {
  const { trackPerformance } = useAnalytics();
  const [performanceData, setPerformanceData] = useState<any>(null);

  useEffect(() => {
    if (config.isDevelopment) {
      // Monitor performance in development
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const data = {
          navigation: entries.filter(e => e.entryType === 'navigation'),
          paint: entries.filter(e => e.entryType === 'paint'),
          largest_contentful_paint: entries.filter(e => e.entryType === 'largest-contentful-paint'),
          layout_shift: entries.filter(e => e.entryType === 'layout-shift')
        };
        
        setPerformanceData(data);
        console.log('📊 Performance Data:', data);
      });

      try {
        observer.observe({ type: 'navigation', buffered: true });
        observer.observe({ type: 'paint', buffered: true });
        observer.observe({ type: 'largest-contentful-paint', buffered: true });
        observer.observe({ type: 'layout-shift', buffered: true });
      } catch (error) {
        console.warn('Performance Observer not supported:', error);
      }

      return () => observer.disconnect();
    }
  }, [trackPerformance]);

  if (config.isProduction) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50 max-w-xs">
      <h3 className="font-bold mb-2">Performance Monitor</h3>
      {performanceData && (
        <div className="space-y-1">
          <div>Paint: {performanceData.paint?.length || 0}</div>
          <div>LCP: {performanceData.largest_contentful_paint?.length || 0}</div>
          <div>Layout Shifts: {performanceData.layout_shift?.length || 0}</div>
        </div>
      )}
    </div>
  );
};
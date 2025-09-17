// Environment configuration for production optimizations
export const config = {
  // Environment detection
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',

  // API Configuration
  api: {
    baseUrl: process.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
    timeout: process.env.VITE_API_TIMEOUT ? parseInt(process.env.VITE_API_TIMEOUT) : 10000,
    retryAttempts: process.env.VITE_API_RETRY_ATTEMPTS ? parseInt(process.env.VITE_API_RETRY_ATTEMPTS) : 3,
    retryDelay: process.env.VITE_API_RETRY_DELAY ? parseInt(process.env.VITE_API_RETRY_DELAY) : 1000,
  },

  // Performance Configuration
  performance: {
    // Bundle splitting
    chunkSizeWarningLimit: 500, // KB
    
    // Lazy loading
    enableLazyLoading: process.env.VITE_ENABLE_LAZY_LOADING !== 'false',
    lazyLoadingThreshold: process.env.VITE_LAZY_LOADING_THRESHOLD ? parseInt(process.env.VITE_LAZY_LOADING_THRESHOLD) : 100, // px
    
    // Image optimization
    enableImageOptimization: process.env.VITE_ENABLE_IMAGE_OPTIMIZATION !== 'false',
    imageQuality: process.env.VITE_IMAGE_QUALITY ? parseInt(process.env.VITE_IMAGE_QUALITY) : 80,
    
    // Compression
    enableGzip: process.env.VITE_ENABLE_GZIP !== 'false',
    enableBrotli: process.env.VITE_ENABLE_BROTLI !== 'false',
    
    // Cache settings
    enableServiceWorker: process.env.VITE_ENABLE_SERVICE_WORKER !== 'false',
    cacheMaxAge: process.env.VITE_CACHE_MAX_AGE ? parseInt(process.env.VITE_CACHE_MAX_AGE) : 31536000, // 1 year
    
    // Preloading
    enablePreloading: process.env.VITE_ENABLE_PRELOADING !== 'false',
    preloadCriticalRoutes: ['/dashboard', '/projects', '/search'],
    
    // Web Vitals thresholds
    webVitals: {
      FCP: 1800, // First Contentful Paint (ms)
      LCP: 2500, // Largest Contentful Paint (ms)
      FID: 100,  // First Input Delay (ms)
      CLS: 0.1,  // Cumulative Layout Shift (score)
      TTFB: 600  // Time to First Byte (ms)
    }
  },

  // SEO Configuration
  seo: {
    enableMetaTags: process.env.VITE_ENABLE_META_TAGS !== 'false',
    enableStructuredData: process.env.VITE_ENABLE_STRUCTURED_DATA !== 'false',
    enableOpenGraph: process.env.VITE_ENABLE_OPEN_GRAPH !== 'false',
    enableTwitterCards: process.env.VITE_ENABLE_TWITTER_CARDS !== 'false',
    
    defaultMeta: {
      title: 'FreelanceConfía - Plataforma de Freelancers en América Latina',
      description: 'Conecta con los mejores freelancers de América Latina. Pagos seguros, proyectos verificados y soporte 24/7.',
      keywords: 'freelancers, américa latina, trabajo remoto, proyectos, pagos seguros',
      author: 'FreelanceConfía',
      language: 'es',
      region: 'América Latina'
    },
    
    structuredData: {
      organization: {
        name: 'FreelanceConfía',
        url: process.env.VITE_SITE_URL || 'https://freelanceconfia.com',
        logo: process.env.VITE_SITE_URL ? `${process.env.VITE_SITE_URL}/logo.png` : '/logo.png',
        contactPoint: {
          telephone: '+1-800-FREELANCE',
          contactType: 'customer service',
          areaServed: 'Latinoamérica',
          availableLanguage: ['Spanish', 'Portuguese', 'English']
        }
      }
    }
  },

  // Security Configuration
  security: {
    enableCSP: process.env.VITE_ENABLE_CSP !== 'false',
    enableHSTS: process.env.VITE_ENABLE_HSTS !== 'false',
    enableXFrameOptions: process.env.VITE_ENABLE_X_FRAME_OPTIONS !== 'false',
    
    csp: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://www.googletagmanager.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://api.freelanceconfia.com", "wss://api.freelanceconfia.com"],
      mediaSrc: ["'self'", "blob:"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: true
    }
  },

  // Analytics Configuration
  analytics: {
    enableGoogleAnalytics: process.env.VITE_ENABLE_GOOGLE_ANALYTICS !== 'false',
    googleAnalyticsId: process.env.VITE_GOOGLE_ANALYTICS_ID || '',
    
    enableWebVitalsTracking: process.env.VITE_ENABLE_WEB_VITALS_TRACKING !== 'false',
    enableErrorTracking: process.env.VITE_ENABLE_ERROR_TRACKING !== 'false',
    enablePerformanceTracking: process.env.VITE_ENABLE_PERFORMANCE_TRACKING !== 'false',
    
    // Custom events
    trackUserActions: process.env.VITE_TRACK_USER_ACTIONS !== 'false',
    trackPageViews: process.env.VITE_TRACK_PAGE_VIEWS !== 'false',
    trackErrors: process.env.VITE_TRACK_ERRORS !== 'false'
  },

  // Feature Flags
  features: {
    enablePWA: process.env.VITE_ENABLE_PWA !== 'false',
    enableOfflineSupport: process.env.VITE_ENABLE_OFFLINE_SUPPORT !== 'false',
    enablePushNotifications: process.env.VITE_ENABLE_PUSH_NOTIFICATIONS !== 'false',
    enableBackgroundSync: process.env.VITE_ENABLE_BACKGROUND_SYNC !== 'false',
    
    // Beta features
    enableAdvancedSearch: process.env.VITE_ENABLE_ADVANCED_SEARCH === 'true',
    enableAIRecommendations: process.env.VITE_ENABLE_AI_RECOMMENDATIONS === 'true',
    enableVoiceChat: process.env.VITE_ENABLE_VOICE_CHAT === 'true',
    enableVideoCall: process.env.VITE_ENABLE_VIDEO_CALL === 'true'
  },

  // Monitoring Configuration
  monitoring: {
    enableSentry: process.env.VITE_ENABLE_SENTRY !== 'false',
    sentryDsn: process.env.VITE_SENTRY_DSN || '',
    
    enableLogRocket: process.env.VITE_ENABLE_LOGROCKET === 'true',
    logRocketId: process.env.VITE_LOGROCKET_ID || '',
    
    // Performance monitoring
    enablePerformanceMonitoring: process.env.VITE_ENABLE_PERFORMANCE_MONITORING !== 'false',
    performanceSampleRate: process.env.VITE_PERFORMANCE_SAMPLE_RATE ? parseFloat(process.env.VITE_PERFORMANCE_SAMPLE_RATE) : 0.1,
    
    // Error tracking
    errorSampleRate: process.env.VITE_ERROR_SAMPLE_RATE ? parseFloat(process.env.VITE_ERROR_SAMPLE_RATE) : 1.0,
    enableSourceMaps: process.env.VITE_ENABLE_SOURCE_MAPS === 'true' // Only in development
  },

  // CDN Configuration
  cdn: {
    enableCDN: process.env.VITE_ENABLE_CDN === 'true',
    cdnUrl: process.env.VITE_CDN_URL || '',
    
    // Asset optimization
    enableImageCDN: process.env.VITE_ENABLE_IMAGE_CDN === 'true',
    imageCDNUrl: process.env.VITE_IMAGE_CDN_URL || '',
    
    enableFontCDN: process.env.VITE_ENABLE_FONT_CDN !== 'false',
    fontCDNUrl: 'https://fonts.googleapis.com'
  },

  // Build Configuration
  build: {
    enableSourceMaps: process.env.NODE_ENV === 'development' || process.env.VITE_ENABLE_SOURCE_MAPS === 'true',
    enableMinification: process.env.NODE_ENV === 'production',
    enableTreeShaking: process.env.NODE_ENV === 'production',
    enableCodeSplitting: process.env.VITE_ENABLE_CODE_SPLITTING !== 'false',
    
    // Output configuration
    outputDir: process.env.VITE_OUTPUT_DIR || 'dist',
    assetsDir: process.env.VITE_ASSETS_DIR || 'assets',
    
    // Bundle analysis
    enableBundleAnalyzer: process.env.VITE_ENABLE_BUNDLE_ANALYZER === 'true',
    bundleAnalyzerPort: process.env.VITE_BUNDLE_ANALYZER_PORT ? parseInt(process.env.VITE_BUNDLE_ANALYZER_PORT) : 8888
  }
};

// Utility functions for configuration
export const getApiUrl = (endpoint: string): string => {
  return `${config.api.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

export const isFeatureEnabled = (feature: keyof typeof config.features): boolean => {
  return config.features[feature];
};

export const getPerformanceThreshold = (metric: keyof typeof config.performance.webVitals): number => {
  return config.performance.webVitals[metric];
};

export const shouldEnableAnalytics = (): boolean => {
  return config.isProduction && (config.analytics.enableGoogleAnalytics || config.analytics.enableWebVitalsTracking);
};

export const getCDNUrl = (asset: string): string => {
  if (!config.cdn.enableCDN || !config.cdn.cdnUrl) {
    return asset;
  }
  
  return `${config.cdn.cdnUrl}${asset.startsWith('/') ? asset : `/${asset}`}`;
};

export const getImageCDNUrl = (image: string, options?: { width?: number; height?: number; quality?: number; format?: string }): string => {
  if (!config.cdn.enableImageCDN || !config.cdn.imageCDNUrl) {
    return image;
  }
  
  let url = `${config.cdn.imageCDNUrl}${image.startsWith('/') ? image : `/${image}`}`;
  
  if (options) {
    const params = new URLSearchParams();
    if (options.width) params.append('w', options.width.toString());
    if (options.height) params.append('h', options.height.toString());
    if (options.quality) params.append('q', options.quality.toString());
    if (options.format) params.append('f', options.format);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
  }
  
  return url;
};

// Environment-specific configurations
export const getEnvironmentConfig = () => {
  if (config.isDevelopment) {
    return {
      ...config,
      // Development overrides
      security: {
        ...config.security,
        enableCSP: false // Disable CSP in development for easier debugging
      },
      monitoring: {
        ...config.monitoring,
        enableSentry: false,
        performanceSampleRate: 1.0 // Full sampling in development
      }
    };
  }
  
  if (config.isProduction) {
    return {
      ...config,
      // Production overrides
      build: {
        ...config.build,
        enableSourceMaps: false, // Disable source maps in production for security
        enableMinification: true,
        enableTreeShaking: true
      }
    };
  }
  
  return config;
};

export default config;
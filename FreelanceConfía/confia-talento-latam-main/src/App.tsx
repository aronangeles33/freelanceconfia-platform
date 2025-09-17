import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Suspense, lazy, useEffect } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { AnalyticsProvider, ConsentBanner, PerformanceMonitor } from "@/components/analytics/AnalyticsProvider";
import { CacheProvider, CacheStatus } from "@/components/cache/CacheProvider";
import { useAccessibility } from "@/hooks/use-accessibility";
import { useAnalytics } from "@/components/analytics/AnalyticsProvider";
import { analyzeBundleSize } from "@/hooks/use-performance";
import ChatFloatingButton from "@/components/chat/ChatFloatingButton";
import PWAInstallBanner from "@/components/pwa/PWAInstallBanner";
import { EnhancedHeader } from "@/components/layout/EnhancedHeader";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/SEO";
import ErrorBoundary from "./components/ErrorBoundary";

// Lazy load pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const Projects = lazy(() => import("./pages/Projects"));
const Categories = lazy(() => import("./pages/Categories"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CreateProject = lazy(() => import("./pages/CreateProject"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const SecuritySettings = lazy(() => import("./pages/SecuritySettings"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const PWASettings = lazy(() => import("./pages/PWASettings"));
const EscrowPayments = lazy(() => import("./pages/EscrowPayments"));
const TestingPage = lazy(() => import("./pages/TestingPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const OptimizationDemo = lazy(() => import("./components/OptimizationDemo"));

// Loading component with performance optimization
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]" role="status" aria-label="Cargando página">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    <span className="sr-only">Cargando...</span>
  </div>
);

// Query client with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true
    },
    mutations: {
      retry: 1
    }
  }
});

// Mock user data - replace with real auth context
const mockUser = {
  name: 'María González',
  avatar: '/placeholder.svg',
  type: 'freelancer' as const,
  unreadNotifications: 3
};

const AppContent = () => {
  const { settings } = useAccessibility();
  const { trackPageView, markFeatureUsage } = useAnalytics();

  useEffect(() => {
    // Initialize performance monitoring
    if (process.env.NODE_ENV === 'development') {
      analyzeBundleSize();
    }

    // Register service worker
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered: ', registration);
          markFeatureUsage('pwa', 'service_worker_registered');
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
    }

    // Track initial page view
    trackPageView({
      page: window.location.pathname,
      title: document.title
    });
  }, [trackPageView, markFeatureUsage]);

  return (
    <ErrorBoundary>
      <div 
        className={`min-h-screen bg-background font-sans antialiased ${
          settings.highContrast ? 'high-contrast' : ''
        } ${
          settings.reducedMotion ? 'reduced-motion' : ''
        } ${
          settings.largeText ? 'large-text' : ''
        } ${
          settings.keyboardNavigation ? 'keyboard-navigation' : ''
        } ${
          settings.colorBlindFriendly ? 'color-blind-friendly' : ''
        }`}
      >
        {/* Global SEO */}
        <SEO 
          title="FreelanceConfía - Plataforma de Freelancers en América Latina"
          description="Conecta con los mejores freelancers de América Latina. Pagos seguros, proyectos verificados y soporte 24/7."
          type="website"
          image="/og-image.jpg"
        />

        {/* Skip to content link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50 transition-all"
        >
          Saltar al contenido principal
        </a>

        {/* Enhanced Header */}
        <EnhancedHeader user={mockUser} />

        {/* Main Content */}
        <main 
          id="main-content" 
          className="flex-1 main-content-mobile"
          role="main"
          tabIndex={-1}
        >
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/create-project" element={<CreateProject />} />
              <Route path="/project/:id" element={<ProjectDetail />} />
              <Route path="/security" element={<SecuritySettings />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/pwa-settings" element={<PWASettings />} />
              <Route path="/escrow" element={<EscrowPayments />} />
              <Route path="/escrow/:projectId" element={<EscrowPayments />} />
              <Route path="/testing" element={<TestingPage />} />
              <Route path="/demo" element={<OptimizationDemo />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>

        {/* Footer */}
        <Footer />

        {/* Floating Components */}
        <ChatFloatingButton />
        <PWAInstallBanner />

        {/* GDPR Consent Banner */}
        <ConsentBanner />

        {/* Development Tools */}
        {process.env.NODE_ENV === 'development' && (
          <>
            <PerformanceMonitor />
            <CacheStatus />
          </>
        )}

        {/* Screen Reader Announcements */}
        <div 
          id="screen-reader-announcements" 
          className="sr-only" 
          aria-live="polite" 
          aria-atomic="true"
        />

        {/* Accessibility Status */}
        {settings.screenReader && (
          <div className="sr-only" role="status" aria-live="polite">
            FreelanceConfía está optimizado para lectores de pantalla. 
            Usa Tab para navegar, Enter para activar elementos, y Escape para cerrar menús.
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AnalyticsProvider>
        <CacheProvider>
          <AuthProvider>
            <NotificationProvider>
              <ChatProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter
                    future={{
                      v7_startTransition: true,
                      v7_relativeSplatPath: true
                    }}
                  >
                    <AppContent />
                  </BrowserRouter>
                </TooltipProvider>
              </ChatProvider>
            </NotificationProvider>
          </AuthProvider>
        </CacheProvider>
      </AnalyticsProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;

import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { splitVendorChunkPlugin } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';
  
  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: true
      },
      open: false,
      cors: true,
      // DESHABILITAR CACHE EN DESARROLLO
      headers: mode === 'development' ? {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      } : {}
    },
    plugins: [
      react(), 
      mode === "development" && componentTagger(),
      splitVendorChunkPlugin()
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@components": path.resolve(__dirname, "./src/components"),
        "@hooks": path.resolve(__dirname, "./src/hooks"),
        "@utils": path.resolve(__dirname, "./src/lib"),
        "@pages": path.resolve(__dirname, "./src/pages"),
        "@assets": path.resolve(__dirname, "./src/assets"),
        "@config": path.resolve(__dirname, "./src/config")
      },
    },
    build: {
      // Target for optimal performance
      target: isProduction ? 'es2020' : 'esnext',
      // Enable minification
      minify: isProduction ? 'terser' : false,
      // Source maps configuration
      sourcemap: env.VITE_ENABLE_SOURCE_MAPS === 'true' ? true : (mode === 'development'),
      // CSS code splitting
      cssCodeSplit: true,
      
      rollupOptions: {
        external: [],
        output: {
          // Enhanced manual chunk splitting for optimal caching
          manualChunks: (id) => {
            // Vendor chunks
            if (id.includes('node_modules')) {
              // React ecosystem
              if (id.includes('react') || id.includes('react-dom')) {
                return 'react-vendor';
              }
              
              // Router
              if (id.includes('react-router')) {
                return 'router-vendor';
              }
              
              // UI libraries
              if (id.includes('@radix-ui') || id.includes('lucide-react')) {
                return 'ui-vendor';
              }
              
              // Query and state management
              if (id.includes('@tanstack/react-query') || id.includes('zustand')) {
                return 'query-vendor';
              }
              
              // Charts and visualization
              if (id.includes('recharts') || id.includes('d3')) {
                return 'chart-vendor';
              }
              
              // Utilities
              if (id.includes('clsx') || id.includes('tailwind-merge') || 
                  id.includes('class-variance-authority') || id.includes('date-fns')) {
                return 'utils-vendor';
              }
              
              // Performance monitoring
              if (id.includes('web-vitals') || id.includes('@sentry')) {
                return 'monitoring-vendor';
              }
              
              // Large libraries
              if (id.includes('monaco-editor') || id.includes('pdf-lib')) {
                return 'heavy-vendor';
              }
              
              // Everything else goes to vendor
              return 'vendor';
            }
            
            // App chunks
            if (id.includes('/src/pages/')) {
              return 'pages';
            }
            
            if (id.includes('/src/components/ui/')) {
              return 'ui-components';
            }
            
            if (id.includes('/src/components/')) {
              return 'components';
            }
            
            if (id.includes('/src/hooks/')) {
              return 'hooks';
            }
            
            if (id.includes('/src/config/')) {
              return 'config';
            }
          },
          
          // Optimized chunk naming for caching
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId;
            if (facadeModuleId && facadeModuleId.includes('node_modules')) {
              return 'vendor/[name]-[hash].js';
            }
            return 'chunks/[name]-[hash].js';
          },
          
          // Enhanced asset naming
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name?.split('.') || [];
            const ext = info[info.length - 1];
            
            if (/\.(png|jpe?g|gif|svg|webp|avif)$/i.test(assetInfo.name!)) {
              return `images/[name]-[hash].${ext}`;
            }
            
            if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name!)) {
              return `fonts/[name]-[hash].${ext}`;
            }
            
            if (/\.css$/i.test(assetInfo.name!)) {
              return `styles/[name]-[hash].${ext}`;
            }
            
            return `assets/[name]-[hash].${ext}`;
          }
        }
      },
      
      // Enhanced Terser options for production
      terserOptions: isProduction ? {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug'],
          passes: 2,
          unsafe_arrows: true,
          unsafe_comps: true,
          unsafe_math: true,
          unsafe_methods: true
        },
        mangle: {
          safari10: true,
          properties: {
            regex: /^_/
          }
        },
        format: {
          comments: false,
          safari10: true
        }
      } : {},
      
      // Asset handling
      assetsDir: 'assets',
      assetsInlineLimit: 4096, // 4kb
      
      // Chunk size warnings
      chunkSizeWarningLimit: parseInt(env.VITE_CHUNK_SIZE_WARNING_LIMIT) || 1000,
      
      // Performance options
      reportCompressedSize: isProduction,
      write: true,
      
      // Output directory
      outDir: env.VITE_OUTPUT_DIR || 'dist',
      emptyOutDir: true
    },
    
    // Enhanced dependency optimization
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@tanstack/react-query',
        'lucide-react',
        'clsx',
        'tailwind-merge',
        'react-helmet-async',
        'web-vitals'
      ],
      exclude: ['@vite/client', '@vite/env']
    },
    
    // CSS optimizations
    css: {
      devSourcemap: !isProduction
    },

    // Define global constants
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.1.0'),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __PRODUCTION__: JSON.stringify(isProduction),
      __DEV__: JSON.stringify(mode === 'development'),
      'process.env.NODE_ENV': JSON.stringify(mode)
    },

    // Environment variables
    envPrefix: 'VITE_',
    
    // Base path
    base: env.VITE_PUBLIC_BASE_PATH || '/',
    
    // Preview settings for production builds
    preview: {
      port: 4173,
      strictPort: true,
      open: false,
      cors: true
    },
    
    // Public directory
    publicDir: 'public',
    
    // Worker configuration
    worker: {
      format: 'es'
    }
  };
});

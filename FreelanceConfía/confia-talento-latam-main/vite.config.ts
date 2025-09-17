import { defineConfig, loadEnv, splitVendorChunkPlugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

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
          // Simple manual chunk splitting
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'ui-vendor': ['@radix-ui/react-slot', 'lucide-react'],
            'utils-vendor': ['clsx', 'tailwind-merge', 'class-variance-authority'],
            'vendor': ['@tanstack/react-query', 'react-router-dom']
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
      
      // Simplified Terser options for production
      terserOptions: isProduction ? {
        compress: {
          drop_console: true,
          drop_debugger: true
        },
        mangle: true
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

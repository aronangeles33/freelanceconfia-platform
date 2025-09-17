import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "./src"),
      "@components": path.resolve(process.cwd(), "./src/components"),
      "@hooks": path.resolve(process.cwd(), "./src/hooks"),
      "@utils": path.resolve(process.cwd(), "./src/lib"),
      "@pages": path.resolve(process.cwd(), "./src/pages"),
      "@assets": path.resolve(process.cwd(), "./src/assets"),
      "@config": path.resolve(process.cwd(), "./src/config")
    },
  },
  build: {
    target: 'es2020',
    minify: 'terser',
    sourcemap: false,
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui': ['@radix-ui/react-slot', 'lucide-react']
        }
      }
    }
  },
  server: {
    host: "::",
    port: 8080,
  }
});
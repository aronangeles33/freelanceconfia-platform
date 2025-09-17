const { defineConfig } = require('vite');
const { resolve } = require('path');

module.exports = defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@components": resolve(__dirname, "./src/components"),
      "@hooks": resolve(__dirname, "./src/hooks"),
      "@utils": resolve(__dirname, "./src/lib"),
      "@pages": resolve(__dirname, "./src/pages"),
      "@assets": resolve(__dirname, "./src/assets"),
      "@config": resolve(__dirname, "./src/config")
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
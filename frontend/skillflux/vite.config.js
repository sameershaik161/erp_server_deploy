import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/skillflux/',
  server: {
    port: 5173,
  },
  build: {
    target: "esnext", // Modern browsers
    minify: "esbuild", // Faster minification
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor'; // Split all dependencies into a single vendor chunk
          }
        }
      }
    }
  }
})
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
      '/socket.io': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Day 17: pisahkan dependency besar ke chunk masing-masing
        // agar tidak semua ter-bundle ke satu file index.js
        manualChunks: {
          'vendor-charts': ['apexcharts', 'vue3-apexcharts'],
          'vendor-map':    ['leaflet', '@vue-leaflet/vue-leaflet'],
          'vendor-vue':    ['vue', 'vue-router', 'pinia'],
        }
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: false,
  }
})

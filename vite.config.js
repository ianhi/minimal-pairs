import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(), 
    tailwindcss(),
  ],
  base: '/language-learning/minimal-pairs/', // Updated for Cloudflare Workers subpath
  build: {
    // Optimize for Cloudflare Workers
    target: 'es2020',
    sourcemap: false, // Disable sourcemaps in production
    minify: 'terser',
    reportCompressedSize: false, // Speed up build
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router'],
          // Add other vendor chunks as needed
        }
      }
    }
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
  define: {
    global: 'globalThis',
  }
})
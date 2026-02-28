import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      // Unified API proxy
      '/api': {
        target: 'http://127.0.0.1:5008',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api(\/api)?/, '') // Handles both /api/login and /api/api/login
      },
      // Keep direct routes for backward compatibility
      '/login': { target: 'http://127.0.0.1:5008', changeOrigin: true },
      '/register': { target: 'http://127.0.0.1:5008', changeOrigin: true },
      '/send-otp': { target: 'http://127.0.0.1:5008', changeOrigin: true },
      '/all-users': { target: 'http://127.0.0.1:5008', changeOrigin: true },
    }
  }
})
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    proxy: {
      // Forward all known backend routes to local server
      '/login': { target: 'http://127.0.0.1:5008', changeOrigin: true },
      '/register': { target: 'http://127.0.0.1:5008', changeOrigin: true },
      '/all-users': { target: 'http://127.0.0.1:5008', changeOrigin: true },
      '/all-transactions': { target: 'http://127.0.0.1:5008', changeOrigin: true },
      '/approve-user': { target: 'http://127.0.0.1:5008', changeOrigin: true },
      '/send-credentials': { target: 'http://127.0.0.1:5008', changeOrigin: true },
      '/send-otp': { target: 'http://127.0.0.1:5008', changeOrigin: true },
      '/verify-otp': { target: 'http://127.0.0.1:5008', changeOrigin: true },
      '/request-otp': { target: 'http://127.0.0.1:5008', changeOrigin: true },
      '/auth': { target: 'http://127.0.0.1:5008', changeOrigin: true },
      '/employees': { target: 'http://127.0.0.1:5008', changeOrigin: true },
      '/health': { target: 'http://127.0.0.1:5008', changeOrigin: true },
      '/bill-fetch': { target: 'http://127.0.0.1:5008', changeOrigin: true },
      '/bill-pay': { target: 'http://127.0.0.1:5008', changeOrigin: true },
      '/recharge': { target: 'http://127.0.0.1:5008', changeOrigin: true },
      '/get-balance': { target: 'http://127.0.0.1:5008', changeOrigin: true },
      '/log-txn': { target: 'http://127.0.0.1:5008', changeOrigin: true },
      '/transactions': { target: 'http://127.0.0.1:5008', changeOrigin: true },
      '/my-retailers': { target: 'http://127.0.0.1:5008', changeOrigin: true },
    }
  }
})
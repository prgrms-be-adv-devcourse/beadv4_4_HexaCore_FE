import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/v1/users': {
          target: env.VITE_BACKEND_USER || 'http://localhost:8080',
          changeOrigin: true,
        },
        '/api/v1/signup': {
          target: env.VITE_BACKEND_USER || 'http://localhost:8080',
          changeOrigin: true,
        },
        '/login': {
          target: env.VITE_BACKEND_USER || 'http://localhost:8080',
          changeOrigin: true,
        },
        '/logout': {
          target: env.VITE_BACKEND_USER || 'http://localhost:8080',
          changeOrigin: true,
        },
        '/api/v1/cash': {
          target: env.VITE_BACKEND_CASH || 'http://localhost:8081',
          changeOrigin: true,
        },
        '/api/v1/chat': {
          target: env.VITE_BACKEND_CHAT || 'http://localhost:8082',
          changeOrigin: true,
        },
        '/api/v1/market': {
          target: env.VITE_BACKEND_MARKET || 'http://localhost:8083',
          changeOrigin: true,
        },
        '/api/v1/notifications': {
          target: env.VITE_BACKEND_NOTIFICATION || 'http://localhost:8084',
          changeOrigin: true,
        },
        '/api/v1/products': {
          target: env.VITE_BACKEND_PRODUCT || 'http://localhost:8085',
          changeOrigin: true,
        },
        '/api/v1/settlements': {
          target: env.VITE_BACKEND_SETTLEMENT || 'http://localhost:8086',
          changeOrigin: true,
        },
        '/api/v1/admin/settlements': {
          target: env.VITE_BACKEND_SETTLEMENT || 'http://localhost:8086',
          changeOrigin: true,
        },
        '/oauth2': { // 소셜 로그인 리다이렉트용
          target: env.VITE_BACKEND_USER || 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    },
  }
})

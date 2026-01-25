import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target =
    env.VITE_BACKEND_USER ||
    env.VITE_BACKEND_CASH ||
    env.VITE_BACKEND_CHAT ||
    env.VITE_BACKEND_MARKET ||
    env.VITE_BACKEND_NOTIFICATION ||
    env.VITE_BACKEND_PRODUCT ||
    env.VITE_BACKEND_SETTLEMENT;

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/v1/notifications': {
          target: env.VITE_BACKEND_NOTIFICATION,
          changeOrigin: true,
          secure: false,
        },
        '/api': {
          target: target,
          changeOrigin: true,
          secure: false,
        },
        '/oauth2': { // 소셜 로그인 리다이렉트용
          target: target,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})

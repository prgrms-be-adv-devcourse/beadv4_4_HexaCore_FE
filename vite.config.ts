import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const gatewayTarget = env.VITE_BACKEND_GATEWAY || 'http://localhost:9000';

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: gatewayTarget,
          changeOrigin: true,
        },
        '/oauth2': {
          target: gatewayTarget,
          changeOrigin: true,
        },
        '/login': {
          target: gatewayTarget,
          changeOrigin: true,
        },
        '/logout': {
          target: gatewayTarget,
          changeOrigin: true,
        },
        '/ws': {
          target: gatewayTarget,
          changeOrigin: true,
          ws: true,
        },
      },
    },
  }
})

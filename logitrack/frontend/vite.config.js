import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '..', '')

  return {
    plugins: [react()],
    envDir: '..',
    server: {
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: env.VITE_DEV_API_TARGET || 'http://app:8080',
          changeOrigin: true,
        },
      },
    },
  }
})

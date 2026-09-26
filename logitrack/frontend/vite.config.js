import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  envDir: '..',
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://app:8080',
        changeOrigin: true,
      },
    },
  },
})

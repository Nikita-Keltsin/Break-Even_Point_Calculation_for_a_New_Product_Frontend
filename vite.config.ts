import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Проксирование на веб-сервис ЛР3-4 (Gin, порт 8080): фронт -> прокси -> бэк, без проблем с CORS.
    // Префикс /api не вырезаем: у бэкенда все методы и так начинаются с /api.
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})

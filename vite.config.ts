import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Обратный прокси решает ограничение CORS: браузер обращается только к :3000,
    // а dev-сервер Vite сам пересылает запросы веб-сервису и в MinIO
    proxy: {
      '/api': 'http://localhost:8080',
      // /s3/break-even/file.png -> http://localhost:9000/break-even/file.png
      '/s3': {
        target: 'http://localhost:9000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/s3/, ''),
      },
    },
  },
})

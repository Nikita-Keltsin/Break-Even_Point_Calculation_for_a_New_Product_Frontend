import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // В ЛР5 бэкенд не нужен, поэтому прокси на веб-сервис пока не настраиваем
  server: { port: 3000 },
})

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://arkhe-solana-mpjd8e989-arkhe12.vercel.app',
        changeOrigin: true,
      },
    },
  },
})
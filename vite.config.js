import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Split the dependencies out of the app chunk. Everything is still
        // loaded up front, so this changes nothing about the first visit —
        // what it fixes is every visit after a deploy. As one chunk, editing
        // a single component invalidated all 636KB; split, the vendor code
        // keeps its hash and stays cached, and only the app chunk is refetched.
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          qr: ['qr-code-styling'],
          data: ['@tanstack/react-query', 'axios'],
          icons: ['lucide-react', 'react-icons/fa', 'react-icons/fa6'],
        },
      },
    },
  },
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://liffto-qr.vercel.app',
        changeOrigin: true,
      },
    },
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: 'app/client',
  build: {
    outDir: '../../dist/client'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './app/client/src'),
      '@/components': path.resolve(__dirname, './app/client/src/components'),
      '@/lib': path.resolve(__dirname, './app/client/src/lib'),
      '@/functions': path.resolve(__dirname, './app/functions'),
      '@/data': path.resolve(__dirname, './app/data'),
      '@/prompts': path.resolve(__dirname, './prompts'),
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8888/.netlify/functions',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})

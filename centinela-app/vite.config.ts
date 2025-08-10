import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,        // necesario en contenedores
    port: 3000,
    strictPort: true,  // falla si 3000 está ocupado (mejor diagnóstico)
  },
  preview: {
    host: true,
    port: 3000,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
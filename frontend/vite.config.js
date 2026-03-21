import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' 
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    proxy: { // pour quoi fair ??
      '/api': {
        target: 'https://localhost:8443',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
 	hmr: {
      // On dit au HMR de passer par le domaine public géré par Traefik
      clientPort: 8443, 
    }
  },
})

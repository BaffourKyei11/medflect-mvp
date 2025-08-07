import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: { navigateFallbackDenylist: [/^\/api\//] },
      manifest: {
        name: 'Medflect',
        short_name: 'Medflect',
        description: 'AI-powered clinical decision support for Ghanaian healthcare',
        theme_color: '#0ea5e9',
        background_color: '#0b1220',
        display: 'standalone',
        icons: [
          { src: '/icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any' },
          { src: '/icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any' }
        ]
      }
    })
  ],
  server: { port: 5173, host: true },
  define: {
    'import.meta.env.VITE_API_BASE': JSON.stringify(process.env.VITE_API_BASE || 'http://localhost:3001'),
    'import.meta.env.VITE_GROQ_BASE': JSON.stringify(process.env.VITE_GROQ_BASE || 'http://91.108.112.45:4000')
  }
});

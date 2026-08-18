import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false, // registro manual em main.jsx, para checar atualizações periodicamente
      includeAssets: ['pwa-192x192.png', 'pwa-512x512.png'],

      manifest: {
        name: 'AVM System',
        short_name: 'AVM',
        description: 'Sistema de gerenciamento AVM Ar-Condicionado',
        theme_color: '#7b8cd4',
        background_color: '#f8fafc',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        lang: 'pt-BR',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },

      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          // Firestore removido do cache do service worker (2026-08-17): o SDK
          // do Firestore usa esse domínio pra um canal de long-polling em
          // tempo real (WebChannel), não só GETs simples — um service worker
          // interceptando isso quebra o canal e fica pendurado, causando
          // "Carregando fotos..." infinito em produção (nunca acontecia no
          // servidor local, onde o SW não fica ativo). O SDK do Firestore já
          // faz seu próprio cache/retry offline, não precisa do workbox aqui.
          {
            // Firebase Storage (fotos): cache permanente após primeiro download
            urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'storage-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 dias
              },
            },
          },
        ],
      },
    }),
  ],

  server: {
    historyApiFallback: true,
  },
})

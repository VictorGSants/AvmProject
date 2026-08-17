import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // 'prompt' (não 'autoUpdate'): com autoUpdate o próprio service worker
      // recarrega a página sozinho assim que uma versão nova ativa, sem dar
      // chance de adiar — isso já derrubou fotos capturadas no exato momento
      // em que o técnico volta da câmera nativa do celular (visibilitychange
      // dispara a checagem de update nesse instante). Com 'prompt' o reload
      // só acontece quando main.jsx chama updateSW(true) explicitamente,
      // depois de conferir que não há upload em andamento (uploadGuard.js).
      registerType: 'prompt',
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
        // skipWaiting removido de propósito: com ele o novo SW assume
        // sozinho, sem esperar o sinal explícito do cliente (updateSW), o
        // que reintroduziria o reload cego que o registerType 'prompt'
        // acima existe pra evitar.
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            // Firestore: tenta a rede primeiro, usa cache se offline
            urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'firestore-cache',
              networkTimeoutSeconds: 10,
            },
          },
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

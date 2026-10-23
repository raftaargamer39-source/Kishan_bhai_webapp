import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { VitePWA } from 'vite-plugin-pwa';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon.svg'],
      manifest: {
        id: '/',
        name: 'Kishan Bhai',
        short_name: 'KishanBhai',
        description: 'Your AI Farming Partner — From Seed to Sale.',
        theme_color: '#16A34A',
        background_color: '#F9FAFB',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22%2316a34a%22><path d=%22M12 2L4 7v10l8 5 8-5V7l-8-5zm0 2.2L18 8l-6 3.8L6 8l6-3.8zM6 9.8l5 3.1v6.3L6 16.1V9.8zm12 6.3l-5 3.1v-6.3l5-3.1v6.3z%22/></svg>',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'any',
          }
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5000000,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3001,
    allowedHosts: true,
  },
  build: {
    chunkSizeWarningLimit: 1500,
  },
});

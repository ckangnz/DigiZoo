/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base,
  build: {
    rolldownOptions: {
      output: {
        chunkFileNames: (chunk) =>
          chunk.facadeModuleId?.includes('/src/info/')
            ? 'assets/info/[name]-[hash].js'
            : 'assets/[name]-[hash].js',
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null,
      includeAssets: ['favicon.svg', 'icons/*.png'],
      manifest: {
        name: 'DigiZoo',
        short_name: 'DigiZoo',
        description:
          'Build animal worlds with cute stickers — safari, jungle, farm, ocean and more.',
        theme_color: '#7cc8f2',
        background_color: '#fdf6e8',
        display: 'fullscreen',
        display_override: ['fullscreen', 'standalone'],
        orientation: 'any',
        start_url: '.',
        scope: '.',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest,mp3}'],
        globIgnores: ['**/assets/info/**'],
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.includes('/assets/info/'),
            handler: 'CacheFirst',
            options: { cacheName: 'digizoo-info', expiration: { maxEntries: 400 } },
          },
        ],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.test.ts'],
    fsModuleCache: false,
  },
});

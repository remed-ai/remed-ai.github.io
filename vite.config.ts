import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';

// BASE_PATH is set by the deploy workflow ("/" for <owner>.github.io repos, "/<repo>/" otherwise).
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  base,
  plugins: [
    react(),
    // GitHub Pages serves 404.html for unknown paths, so /scan, /history, /demo work on reload.
    { name: 'spa-404', apply: 'build', closeBundle: () => copyFileSync(resolve('dist/index.html'), resolve('dist/404.html')) },
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['icon.svg', 'booth/*.svg', 'booth/*.html'],
      manifest: {
        name: 'Remed-AI',
        short_name: 'Remed-AI',
        description: 'Scan any medicine. Understand it in your language. Not professional medical advice.',
        theme_color: '#efe8d8',
        background_color: '#efe8d8',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '.',
        scope: '.',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,webmanifest}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  build: { target: 'es2022', chunkSizeWarningLimit: 1200 },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.{ts,tsx}'],
  },
});

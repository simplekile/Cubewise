import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// base './' keeps every path relative, so the same build works on GitHub Pages
// (served from /Cubewise/) and on any other static host.
export default defineConfig({
  base: './',
  build: { chunkSizeWarningLimit: 800 },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/apple-touch-icon.png'],
      manifest: {
        name: 'Cubewise',
        short_name: 'Cubewise',
        description: 'Học giải Rubik 3x3 từ con số 0, hiểu vì sao từng nước đi hoạt động.',
        lang: 'vi',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#0B0B0F',
        background_color: '#0B0B0F',
        start_url: './',
        scope: './',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: { globPatterns: ['**/*.{js,css,html,png,svg}'] },
    }),
  ],
});

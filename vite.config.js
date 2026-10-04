import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { execSync } from 'node:child_process';

// version shown in Settings, so the learner can tell which build is running
const sha = (process.env.GITHUB_SHA || (() => { try { return execSync('git rev-parse HEAD').toString(); } catch { return 'dev'; } })()).trim().slice(0, 7);
const vn = new Date(Date.now() + 7 * 3600e3); // Vietnam time, UTC+7
const two = (n) => String(n).padStart(2, '0');
const when = `${two(vn.getUTCHours())}:${two(vn.getUTCMinutes())} ${two(vn.getUTCDate())}/${two(vn.getUTCMonth() + 1)}`;
const VERSION = `${process.env.GITHUB_RUN_NUMBER ? `Bản ${process.env.GITHUB_RUN_NUMBER} · ` : ''}${sha} · ${when}`;

// base './' keeps every path relative, so the same build works on GitHub Pages
// (served from /Cubewise/) and on any other static host.
export default defineConfig({
  base: './',
  define: { __VERSION__: JSON.stringify(VERSION) },
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

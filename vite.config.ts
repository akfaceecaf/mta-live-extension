import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Builds the extension "pages" (options page) and the background service worker.
// The content script is built separately by vite.content.config.ts because Chrome
// loads content scripts as classic scripts, so they must be a single IIFE bundle.
export default defineConfig({
  root: resolve(import.meta.dirname, 'src/entrypoints'),
  publicDir: resolve(import.meta.dirname, 'public'), // manifest.json is copied as-is
  envDir: import.meta.dirname,
  plugins: [react()],
  resolve: {
    alias: { '@': resolve(import.meta.dirname, 'src') },
  },
  build: {
    outDir: resolve(import.meta.dirname, 'dist'),
    emptyOutDir: false, // `npm run clean` handles this, so the two builds don't wipe each other
    sourcemap: true,
    rollupOptions: {
      input: {
        options: resolve(import.meta.dirname, 'src/entrypoints/options/index.html'),
        background: resolve(import.meta.dirname, 'src/entrypoints/background.ts'),
      },
      output: {
        // manifest.json points at a fixed "background.js", so it can't be hashed
        entryFileNames: (chunk) =>
          chunk.name === 'background' ? 'background.js' : 'assets/[name]-[hash].js',
      },
    },
  },
});

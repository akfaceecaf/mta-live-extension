import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Builds the content script (the in-page train display) as one self-contained
// IIFE file, dist/content.js, which manifest.json injects into web pages.
export default defineConfig(({ mode }) => ({
  envDir: import.meta.dirname,
  publicDir: false,
  plugins: [react()],
  resolve: {
    alias: { '@': resolve(import.meta.dirname, 'src') },
  },
  // Library mode doesn't replace this automatically, and React needs it
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode === 'development' ? 'development' : 'production'),
  },
  build: {
    outDir: resolve(import.meta.dirname, 'dist'),
    emptyOutDir: false,
    sourcemap: mode === 'development' ? 'inline' : false,
    lib: {
      entry: resolve(import.meta.dirname, 'src/entrypoints/content/index.tsx'),
      formats: ['iife'],
      name: 'MtaLiveContent',
      fileName: () => 'content.js',
    },
  },
}));

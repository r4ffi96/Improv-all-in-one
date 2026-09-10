import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the same build works on GitHub Pages project sites
// (https://<user>.github.io/<repo>/), on a custom domain and locally.
// Routing is hash-based, so relative asset URLs always resolve.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1200,
  },
});

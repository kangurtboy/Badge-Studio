import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      lucide: path.resolve(__dirname, 'node_modules/lucide/dist/cjs/lucide.js')
    }
  },
  server: {
    port: 3000,
    open: false
  },
  build: {
    target: 'esnext'
  }
});

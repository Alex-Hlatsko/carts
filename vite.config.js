import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
    },
  },
  root: path.join(process.cwd(), 'client'),
  build: {
    outDir: path.join(process.cwd(), 'dist'),
    emptyOutDir: true,
  },
  server: {
    host: true,
    port: 3000,
  },
});

import { defineConfig } from 'vite';
import path from 'path';

const scssDir = path.resolve(__dirname, 'dev/scss'); // Path to your SCSS directory

export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: [scssDir]
      }
    }
  },
  server: {
    port: 3000
  }
});


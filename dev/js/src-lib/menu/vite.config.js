import { defineConfig } from 'vite';
import path from 'path';

const scssDir = path.resolve(__dirname, '../../../scss');

export default defineConfig({
  server: {
    fs: {
      allow: [
        scssDir,
        __dirname
      ]
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: [scssDir]
      }
    }
  }
});

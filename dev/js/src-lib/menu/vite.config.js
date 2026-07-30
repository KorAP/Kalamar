import { defineConfig } from 'vite';
import path from 'path';

const scssDir = path.resolve(__dirname, '../../../scss');
const fontDir = path.resolve(__dirname, '../../../font');

export default defineConfig({
  server: {
    fs: {
      allow: [
        scssDir,  
        fontDir,
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

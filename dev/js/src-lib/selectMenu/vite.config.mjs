import { defineConfig } from 'vite';
import path from 'path';

const scssDir = path.resolve(import.meta.dirname, '../../../scss'); // Path to your SCSS directory
const fontDir = path.resolve(import.meta.dirname, '../../../font');

export default defineConfig({

  server: {
    fs: {
      allow: [
        scssDir,
        fontDir,
        __dirname
      ]
    },
    port: 3000
  },

 
  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: [scssDir]
      }
    }
  }
});


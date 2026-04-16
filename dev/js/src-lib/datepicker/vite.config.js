import { defineConfig } from 'vite';
import path from 'path';

const scssDir = path.resolve(__dirname, '../../../scss'); // Path to your SCSS directory
const fontDir = path.resolve(__dirname, '../../../font');

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


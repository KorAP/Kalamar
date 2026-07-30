import { defineConfig } from 'vite';
import path from 'path';

const scssDir = path.resolve(__dirname, '../../../scss'); // Path to your SCSS directory

export default defineConfig({

  server: {
    fs: {
      allow: [
        scssDir,
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


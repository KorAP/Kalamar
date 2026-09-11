import { defineConfig } from 'vite';
import path from 'path';

const scssDir = path.resolve(import.meta.dirname, '../../../scss'); // Path to your SCSS directory

export default defineConfig({

  server: {
    fs: {
      allow: [
        scssDir,
        import.meta.dirname
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


import { defineConfig } from 'vite';
import path from 'path';

const scssDir = path.resolve(import.meta.dirname, '../../../scss'); // Path to your SCSS directory
const fontDir = path.resolve(import.meta.dirname, '../../../font');
const projectRoot = path.resolve(import.meta.dirname, '../../../..');

export default defineConfig({

  server: {
    fs: {
      allow: [
        projectRoot,  // Add project root to allow node_modules access
        scssDir,
        fontDir,
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


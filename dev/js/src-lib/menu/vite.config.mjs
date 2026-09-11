import { defineConfig } from 'vite';
import path from 'path';

const scssDir = path.resolve(import.meta.dirname, '../../../scss');
const fontDir = path.resolve(import.meta.dirname, '../../../font');

export default defineConfig({
  server: {
    fs: {
      allow: [
        scssDir,  
        fontDir,
        import.meta.dirname
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

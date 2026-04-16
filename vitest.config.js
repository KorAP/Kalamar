import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    root: 'dev/js/src-lib',
    environment: 'jsdom',
    include: ['*/test/**/*Spec.js'],
    globals: true
  }
});

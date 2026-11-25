import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [{
    // The vendored highlight.js pack registers the global "hljs" only
    // if "exports" is undefined, which isn't the case in vitest.
    name: 'hljs-global',
    transform (code, id) {
      if (id.endsWith('highlight/highlight.pack.js'))
        return code.replace('"undefined"!=typeof exports', 'false');
    }
  }, {
    // The vendored dagre registers the global "dagre" only
    // if "exports" is undefined, which isn't the case in vitest.
    name: 'dagre-global',
    transform (code, id) {
      if (id.endsWith('lib/dagre.js'))
        return code.replace('"object"==typeof exports&&"undefined"!=typeof module', 'false');
    }
  }],
  test: {
    root: 'dev/js/src-lib',
    environment: 'jsdom',
    include: ['**/test/**/*Spec.js'],
    pool: 'vmThreads',
    globals: true
  }
});

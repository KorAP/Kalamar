/**
 * AMD copy of dev/js/src-lib/vc/statistics.js, the canonical ES6 version
 * with its tests. Keep both in sync until the ES6 modules are loaded directly.
 * The returned object mirrors the ES6 module's exports.
 */
"use strict";

define(function () {
  /** Share corpus statistics and reuse the last verified size within this tab. */
  const integer = value => {
    if (!/^[0-9]+$/.test(String(value))) return null;
    const number = Number(value);
    return Number.isSafeInteger(number) ? number : null;
  };

  const valid = data => Boolean(data && integer(data.tokens) !== null &&
    !['errors', 'warnings', 'notifications'].some(name => data[name] && data[name].length) &&
    !(data.meta && (data.meta.timeExceeded || data.meta.memoryExceeded)));

  const cacheKey = (instance, scope, cq) => JSON.stringify([instance, scope, cq]);

  class CorpusStatistics {
    constructor(fetch = (cq, cb) => window.KorAP.API.getCorpStat(cq, cb)) {
      this.fetch = fetch;
      this.requests = new Map();
      this.listeners = new Set();
    }

    key(cq) {
      return cacheKey(window.KorAP.URL, this.scope, cq);
    }

    get scope() {
      return document.body.getAttribute('data-statistics-scope');
    }

    // One entry per instance bounds storage. Named references may change without
    // changing their name, so only persist expanded corpus definitions.
    remember(cq, data) {
      if (!this.scope || /\breferTo\s/.test(cq)) return null;
      try {
        const storageKey = `kalamar.corpus-statistics:${window.KorAP.URL}`;
        if (data) sessionStorage.setItem(storageKey, JSON.stringify({ key: this.key(cq), data }));
        const saved = JSON.parse(sessionStorage.getItem(storageKey));
        return saved && saved.key === this.key(cq) && valid(saved.data) ? saved.data : null;
      }
      catch (e) { return null; } // Disabled/full storage must not block search.
    }

    peek(cq) {
      return this.remember(cq);
    }

    load(cq) {
      const saved = this.peek(cq);
      if (saved) return Promise.resolve(saved);
      const id = this.key(cq);
      if (this.requests.has(id)) return this.requests.get(id);
      const request = new Promise(resolve => this.fetch(cq, resolve)).then(data => {
        // The panel receives the original response, including warnings/messages;
        // only verified denominators are shared with frequency views or stored.
        if (valid(data)) {
          this.remember(cq, data);
          this.listeners.forEach(listener => listener(cq, data));
        }
        else this.requests.delete(id);
        return data;
      }).catch(error => {
        this.requests.delete(id);
        throw error;
      });
      this.requests.set(id, request);
      return request;
    }

    // Subscribers share the lifetime of this document.
    subscribe(listener) {
      this.listeners.add(listener);
    }
  }

  const statistics = new CorpusStatistics();

  return { default: statistics, integer, valid, cacheKey, CorpusStatistics };
});

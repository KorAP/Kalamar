/** Share corpus statistics and reuse the last verified size within this tab. */
export const integer = value => {
  if (!/^[0-9]+$/.test(String(value))) return null;
  const number = Number(value);
  return Number.isSafeInteger(number) ? number : null;
};

export const valid = data => Boolean(data && integer(data.tokens) !== null &&
  !['errors', 'warnings', 'notifications'].some(name => data[name]?.length) &&
  !(data.meta?.timeExceeded || data.meta?.memoryExceeded));

export const cacheKey = (instance, scope, cq) => JSON.stringify([instance, scope, cq]);

export class CorpusStatistics {
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
    catch { return null; } // Disabled/full storage must not block search.
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

export default new CorpusStatistics();

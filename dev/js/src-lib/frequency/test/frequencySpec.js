import { beforeEach, describe, expect, it, vi } from 'vitest';
import Frequency, { integer, format, rate, valid, cacheKey } from '../frequency.js';
import { CorpusStatistics } from '../../vc/statistics.js';

const tick = async () => {
  // API callbacks, shared request and view update form a short promise chain.
  for (let i = 0; i < 10; i++) await Promise.resolve();
};

let service, callbacks;
beforeEach(() => {
  vi.restoreAllMocks();
  sessionStorage.clear();
  document.body.setAttribute('data-statistics-scope', 'anonymous-test-context');
  document.documentElement.lang = 'en';
  document.body.innerHTML = '';
  callbacks = [];
  window.KorAP = {
    URL: '', Locale: {}, log: vi.fn(),
    API: { getCorpStat: vi.fn((cq, cb) => callbacks.push({ cq, cb })) }
  };
  service = new CorpusStatistics();
});

function result(count = 12345, state = 'exact', cq = 'availability = /CC.*/') {
  const element = document.createElement('div');
  element.id = 'resultinfo';
  element.setAttribute('data-hit-count', count);
  element.setAttribute('data-count-state', state);
  element.innerHTML = '<p class="found"><span id="total-results">' + count + '</span> matches</p>';
  document.body.appendChild(element);
  return Frequency.create(element, cq, service);
}

describe('Relative frequency on demand', () => {
  it('does no work before activation, including hovering and focusing', async () => {
    const view = result();
    expect(view.separator.textContent).toBe('·');
    expect(view.tooltip.hidden).toBe(true);
    expect(view.tooltip.textContent).toContain('IPM: Instances per million tokens');
    expect(view.button.title).toBe(view.tooltip.textContent);
    expect(view.output.title).toBe(view.tooltip.textContent);
    view.button.focus();
    expect(view.button.getAttribute('aria-describedby')).toBe(view.tooltip.id);
    await tick();
    expect(KorAP.API.getCorpStat).not.toHaveBeenCalled();
    expect(view.button.textContent).toBe('');
    expect(view.button.getAttribute('aria-label')).toBe('Calculate relative frequency');
    expect(view.button.querySelector('.frequency-calculator[aria-hidden="true"]')).not.toBeNull();
    expect(view.output.textContent).toBe('IPM');
    expect(view.button.tagName).toBe('BUTTON');
    expect(view.button.getAttribute('type')).toBe('button');
    expect(view.element.querySelector('.relative-frequency a')).toBeNull();
  });

  it('loads once, shows matches per million and retains the absolute count', async () => {
    const view = result();
    view.button.click();
    view.load();
    await tick();
    expect(callbacks).toHaveLength(1);
    expect(view.button.disabled).toBe(true);
    expect(view.button.classList.contains('loading')).toBe(true);
    expect(view.output.textContent).toBe('IPM');
    expect(view.button.getAttribute('aria-label')).toBe('Loading corpus size …');
    expect(view.output.getAttribute('aria-busy')).toBe('true');
    callbacks[0].cb({ tokens: 250000000 });
    await tick();
    expect(view.output.textContent).toBe('49.38 IPM');
    expect(view.separator.textContent).toBe('·');
    expect(document.querySelector('#total-results').textContent).toBe('12345');
    expect(view.button.disabled).toBe(false);
    expect(view.button.classList.contains('loading')).toBe(false);
    expect(view.button.textContent).toBe('');
    expect(view.button.hidden).toBe(true);
    expect(view.element.querySelector('.relative-frequency-details')).toBeNull();
    expect(view.tooltip.textContent).toContain('250,000,000');
    view.unit.focus();
    expect(document.activeElement).toBe(view.unit);
    expect(callbacks).toHaveLength(1);
  });

  it('floors a minimum instead of rounding it above the proven bound', async () => {
    const view = result(12347, 'lower-bound');
    view.button.click();
    await tick();
    callbacks[0].cb({ tokens: 250000000 });
    await tick();
    expect(view.output.textContent).toBe('at least 49.38 IPM');
    expect(view.separator.textContent).toBe('·');
    expect(view.tooltip.textContent).toContain('minimum frequency');
  });

  it('does not turn a tiny positive bound into zero', async () => {
    const view = result(1, 'lower-bound');
    view.button.click();
    await tick();
    callbacks[0].cb({ tokens: 9000000000000000 });
    await tick();
    expect(view.output.textContent).toBe('at least 0.00000000011 IPM');
  });

  it('does not round a rational lower bound up through floating-point error', async () => {
    const view = result(428571433, 'lower-bound');
    view.button.click();
    callbacks[0].cb({ tokens: 1000000007 });
    await tick();
    expect(view.output.textContent).toBe('at least 428,571.42 IPM');
  });

  it('localizes complete rates and minimum rates in German', async () => {
    document.documentElement.lang = 'de';
    window.KorAP.Locale = { FREQ_ACTION: 'Relative Häufigkeit berechnen',
      FREQ_UNIT: 'Treffer je Million Token', FREQ_MINIMUM: 'mindestens',
      FREQ_BASIS: 'Korpusgröße', FREQ_TOKENS: 'Token' };
    const view = result(12347, 'lower-bound');
    expect(view.button.getAttribute('aria-label')).toBe('Relative Häufigkeit berechnen');
    view.button.click();
    await tick();
    callbacks[0].cb({ tokens: 250000000 });
    await tick();
    expect(view.output.textContent).toBe('mindestens 49,38 IPM');
    expect(view.tooltip.textContent).toContain('IPM: Treffer je Million Token');
    expect(view.tooltip.textContent).toContain('Korpusgröße: 250.000.000 Token');
  });

  it.each([[0, 'exact'], [0, 'lower-bound'], [-1, 'unknown']])(
    'omits the action for zero or uncounted totals %s %s', async (count, state) => {
    expect(result(count, state)).toBeNull();
    await tick();
    expect(KorAP.API.getCorpStat).not.toHaveBeenCalled();
    expect(document.querySelector('.relative-frequency')).toBeNull();
    expect(document.querySelector('p.found').classList.contains('has-frequency')).toBe(false);
    const request = service.load('availability = /CC.*/');
    await tick();
    callbacks[0].cb({ tokens: 250000000 });
    await request;
    expect(document.querySelector('.relative-frequency')).toBeNull();
  });

  it('does not guess the denominator when the executed scope is unavailable', async () => {
    expect(result(12345, 'exact', null)).toBeNull();
    await tick();
    expect(KorAP.API.getCorpStat).not.toHaveBeenCalled();
    expect(document.querySelector('.relative-frequency')).toBeNull();
  });

  it('keeps statistics for an edited selection separate from existing results', async () => {
    const view = result();
    const draft = service.load('author = "Goethe"');
    await tick();
    callbacks[0].cb({ tokens: 100 });
    await draft;
    expect(view.output.textContent).toBe('IPM');
    view.button.click();
    await tick();
    expect(callbacks[1].cq).toBe('availability = /CC.*/');
    callbacks[1].cb({ tokens: 250000000 });
    await tick();
    expect(view.output.textContent).toBe('49.38 IPM');
  });

  it('ignores a response after results have left the document', async () => {
    const view = result();
    view.button.click();
    await tick();
    view.element.remove();
    callbacks[0].cb({ tokens: 250000000 });
    await tick();
    expect(view.output.textContent).not.toContain('49.38');
  });

  it.each([undefined, { tokens: -1 }, { tokens: null }, { tokens: 'bad' },
    { tokens: 1.5 }, { tokens: 1e20 }, { tokens: 250000000, meta: { timeExceeded: true } },
    { tokens: 250000000, meta: { memoryExceeded: true } },
    { tokens: 250000000, warnings: [[1, 'partial statistics']] },
    { tokens: 250000000, errors: [[1, 'failed statistics']] },
    { tokens: 250000000, notifications: [[0, 'failed']] }])(
    'allows retry after unavailable or incomplete statistics %j', async data => {
      const view = result();
      view.button.click();
      await tick();
      callbacks[0].cb(data);
      await tick();
      expect(view.output.textContent).toContain('unavailable');
      expect(view.button.classList.contains('loading')).toBe(false);
      expect(view.button.getAttribute('aria-label')).toBe('Retry');
      view.button.click();
      await tick();
      expect(callbacks).toHaveLength(2);
      expect(view.output.textContent).toBe('IPM');
      callbacks[1].cb({ tokens: 250000000 });
      await tick();
      expect(view.output.textContent).toBe('49.38 IPM');
    }
  );

  it('does not divide by an empty corpus', async () => {
    const view = result();
    view.button.click();
    await tick();
    callbacks[0].cb({ tokens: 0 });
    await tick();
    expect(view.output.textContent).toContain('empty corpus');
    expect(view.output.textContent).not.toMatch(/Infinity|NaN/);
  });

  it('uses the native hover hint and an accessible description without any further request', async () => {
    const view = result();
    view.button.click();
    await tick();
    callbacks[0].cb({ tokens: 250000000 });
    await tick();
    expect(view.tooltip.hidden).toBe(true);
    expect(view.output.title).toBe(view.tooltip.textContent);
    expect(view.output.title).toContain('250,000,000');
    expect(view.unit.tagName).toBe('SPAN');
    expect(view.tooltip.textContent).toContain('IPM: Instances per million tokens');
    view.unit.focus();
    expect(view.unit.getAttribute('aria-describedby')).toBe(view.tooltip.id);
    expect(document.activeElement).toBe(view.unit);
    expect(callbacks).toHaveLength(1);
  });
});

describe('Shared corpus statistics', () => {
  it('shares even a synchronous API response', async () => {
    KorAP.API.getCorpStat.mockImplementation((cq, cb) => cb({ tokens: 10 }));
    const first = service.load('');
    const second = service.load('');
    expect(first).toBe(second);
    await first;
    expect(KorAP.API.getCorpStat).toHaveBeenCalledTimes(1);
  });

  it('keeps panel warnings visible without using them as a frequency denominator', async () => {
    const view = result();
    const received = vi.fn();
    service.load(view.cq).then(received);
    view.button.click();
    const response = { tokens: 250000000, warnings: [[1, 'partial statistics']] };
    callbacks[0].cb(response);
    await tick();
    expect(received).toHaveBeenCalledWith(response);
    expect(view.output.textContent).toContain('unavailable');
    expect(service.peek(view.cq)).toBeNull();
    view.button.click();
    expect(callbacks).toHaveLength(2);
  });

  it('preserves original notifications for the corpus statistics panel', async () => {
    const response = { notifications: [[1, 'Original server message']] };
    const request = service.load('');
    callbacks[0].cb(response);
    expect(await request).toBe(response);
  });

  it('coalesces panel and frequency requests and reuses the response both ways', async () => {
    const view = result();
    const received = vi.fn();
    service.load('availability = /CC.*/').then(received);
    view.button.click();
    await tick();
    expect(callbacks).toHaveLength(1);
    callbacks[0].cb({ tokens: 250000000 });
    await tick();
    expect(received).toHaveBeenCalledWith({ tokens: 250000000 });
    expect(view.output.textContent).toBe('49.38 IPM');
    service.load('availability = /CC.*/').then(received);
    await tick();
    expect(callbacks).toHaveLength(1);
    expect(received).toHaveBeenCalledTimes(2);
  });

  it('automatically enriches results when matching Corpus statistics is requested', async () => {
    const view = result();
    const request = service.load('availability = /CC.*/');
    await tick();
    callbacks[0].cb({ tokens: 250000000 });
    await request;
    expect(view.output.textContent).toBe('49.38 IPM');
    expect(view.button.hidden).toBe(true);
  });

  it('clears a failed synchronous API request so it can be retried', async () => {
    KorAP.API.getCorpStat.mockImplementationOnce(() => { throw new Error('network'); });
    await expect(service.load('')).rejects.toThrow('network');
    const retry = service.load('');
    await tick();
    callbacks[0].cb({ tokens: 10 });
    await expect(retry).resolves.toEqual({ tokens: 10 });
  });
});

describe('Corpus size across searches', () => {
  const cq = 'availability = /CC.*/';
  async function known(query = cq) {
    const request = service.load(query);
    await tick();
    callbacks[0].cb({ tokens: 250000000 });
    await request;
  }
  function nextSearch(query = cq, state = 'exact') {
    document.body.innerHTML = '';
    service = new CorpusStatistics(); // A real navigation creates fresh modules.
    return result(12347, state, query);
  }

  it('immediately uses the known denominator with the new hit count', async () => {
    await known();
    const view = nextSearch();
    expect(view.output.textContent).toBe('49.39 IPM');
    expect(view.button.hidden).toBe(true);
    expect(view.separator.textContent).toBe('·');
    await service.load(cq); // The corpus statistics panel also reuses it.
    expect(KorAP.API.getCorpStat).toHaveBeenCalledTimes(1);
  });

  it('keeps a later incomplete count a lower bound', async () => {
    await known();
    const view = nextSearch(cq, 'lower-bound');
    expect(view.output.textContent).toBe('at least 49.38 IPM');
    expect(view.separator.textContent).toBe('·');
  });

  it.each(['corpus', 'login', 'instance', 'missing context', 'named reference'])(
    'does not reuse corpus sizes after a change of %s', async change => {
      const query = change === 'named reference' ? 'referTo "@max/corpus"' : cq;
      await known(query);
      if (change === 'login') document.body.setAttribute('data-statistics-scope', 'other-login');
      if (change === 'instance') KorAP.URL = '/other-instance';
      if (change === 'missing context') document.body.removeAttribute('data-statistics-scope');
      const view = nextSearch(change === 'corpus' ? 'pubDate = 2026' : query);
      expect(view.button.hidden).toBe(false);
      expect(view.output.textContent).toBe('IPM');
      expect(KorAP.API.getCorpStat).toHaveBeenCalledTimes(1);
    }
  );

  it.each(['invalid JSON', 'invalid count', 'incomplete statistics'])(
    'ignores stored %s', async problem => {
      await known();
      const key = 'kalamar.corpus-statistics:';
      const saved = JSON.parse(sessionStorage.getItem(key));
      if (problem === 'invalid count') saved.data.tokens = -1;
      if (problem === 'incomplete statistics') saved.data.meta = { timeExceeded: true };
      sessionStorage.setItem(key, problem === 'invalid JSON' ? '{' : JSON.stringify(saved));
      expect(nextSearch().button.hidden).toBe(false);
    }
  );

  it('still works when browser storage is blocked', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    const view = result();
    view.button.click();
    await tick();
    callbacks[0].cb({ tokens: 250000000 });
    await tick();
    expect(view.output.textContent).toBe('49.38 IPM');
    expect(nextSearch().button.hidden).toBe(false);
  });
});

describe('Pure frequency calculations', () => {
  it('validates counts and statistics independently of the view', () => {
    expect(integer('123')).toBe(123);
    for (const value of [null, -1, 1.5, 'bad', Number.MAX_SAFE_INTEGER + 1])
      expect(integer(value)).toBeNull();
    expect(valid({ tokens: 0 })).toBe(true);
    expect(valid({ tokens: 10, warnings: [[1, 'partial']] })).toBe(false);
  });

  it('formats exact and minimum frequencies without ambient locale state', () => {
    expect(format(1234.5, 2, 'de')).toBe('1.234,5');
    expect(rate(12347, 250000000, false, 'en')).toBe('49.39');
    expect(rate(428571433, 1000000007, true, 'en')).toBe('428,571.42');
    expect(rate(12347, 250000000, true, 'de')).toBe('49,38');
    expect(rate(1, 9000000000000000, true, 'en')).toBe('0.00000000011');
  });

  it('separates cache keys by instance, login context and corpus definition', () => {
    const original = cacheKey('/korap', 'alice', 'pubDate = 2026');
    expect(cacheKey('/korap', 'alice', 'pubDate = 2026')).toBe(original);
    expect(cacheKey('/test', 'alice', 'pubDate = 2026')).not.toBe(original);
    expect(cacheKey('/korap', 'bob', 'pubDate = 2026')).not.toBe(original);
    expect(cacheKey('/korap', 'alice', 'pubDate = 2025')).not.toBe(original);
  });
});

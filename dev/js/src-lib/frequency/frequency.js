/** Reveal query matches per million tokens beside the absolute result count. */
import statistics, { integer, valid } from '../vc/statistics.js';
export { integer, valid, cacheKey } from '../vc/statistics.js';

export const format = (number, digits, language = 'en') =>
  number.toLocaleString(language, { maximumFractionDigits: digits });

export const rate = (count, tokens, minimum = false, language = 'en') => {
  const value = count / tokens * 1000000;
  // Keep rare positive frequencies visible rather than rounding to zero.
  const digits = value > 0 && value < 0.01
    ? Math.min(12, Math.max(2, Math.ceil(-Math.log10(value)) + 1)) : 2;
  if (!minimum) return format(value, digits, language);

  // Integer division preserves a lower bound, including at decimal boundaries.
  const scale = BigInt(10) ** BigInt(digits);
  const units = BigInt(count) * BigInt(1000000) * scale / BigInt(tokens);
  const whole = units / scale;
  const fraction = (units % scale).toString().padStart(digits, '0').replace(/0+$/, '');
  const separator = new Intl.NumberFormat(language).formatToParts(1.1)
    .find(part => part.type === 'decimal').value;
  return `${format(whole, 0, language)}${fraction ? separator + fraction : ''}`;
};

export default class Frequency {
  static create(element, cq, service = statistics) {
    const count = integer(element.getAttribute('data-hit-count'));
    const state = element.getAttribute('data-count-state');
    if (cq === null || count === null || count <= 0 ||
        !['exact', 'lower-bound'].includes(state)) return null;
    return new Frequency(element, cq, count, state, service);
  }

  constructor(element, cq, count, state, service) {
    this.element = element;
    this.cq = cq; // A snapshot of the executed query, never the editable corpus.
    this.count = count;
    this.state = state;
    this.statistics = service;
    this.language = document.documentElement.lang || 'en';
    const loc = this.loc = window.KorAP.Locale;
    loc.FREQ_ACTION = loc.FREQ_ACTION || 'Calculate relative frequency';
    loc.FREQ_LOADING = loc.FREQ_LOADING || 'Loading corpus size …';
    loc.FREQ_UNIT = loc.FREQ_UNIT || 'Instances per million tokens';
    loc.FREQ_MINIMUM = loc.FREQ_MINIMUM || 'at least';
    loc.FREQ_RETRY = loc.FREQ_RETRY || 'Retry';
    loc.FREQ_ERROR = loc.FREQ_ERROR || 'Relative frequency unavailable. Corpus statistics could not be loaded.';
    loc.FREQ_EMPTY = loc.FREQ_EMPTY || 'Relative frequency unavailable for an empty corpus.';
    loc.FREQ_INCOMPLETE = loc.FREQ_INCOMPLETE || 'Counting stopped before completion. This is a minimum frequency.';
    loc.FREQ_BASIS = loc.FREQ_BASIS || 'Corpus size';
    loc.FREQ_TOKENS = loc.FREQ_TOKENS || 'tokens';
    this._init();
  }

  _init() {
    const wrapper = document.createElement('span');
    wrapper.className = 'relative-frequency';
    const separator = document.createElement('span');
    this.separator = separator;
    separator.className = 'relative-frequency-separator';
    separator.textContent = '·';
    separator.setAttribute('aria-hidden', 'true');
    wrapper.appendChild(separator);

    this.output = document.createElement('span');
    this.output.className = 'relative-frequency-value';
    this.output.setAttribute('role', 'status');
    wrapper.appendChild(this.output);

    this.button = document.createElement('button');
    this.button.type = 'button';
    this.button.className = 'relative-frequency-action';
    const icon = document.createElement('span');
    icon.className = 'frequency-calculator';
    icon.setAttribute('aria-hidden', 'true');
    this.button.appendChild(icon);
    this.button.setAttribute('aria-label', this.loc.FREQ_ACTION);
    this.button.setAttribute('aria-describedby', 'relative-frequency-unit-tooltip');
    wrapper.insertBefore(this.button, this.output);

    this.unit = document.createElement('span');
    this.unit.className = 'frequency-unit';
    this.unit.textContent = 'IPM';
    this.unit.tabIndex = 0;
    this.unit.setAttribute('aria-label', this.loc.FREQ_UNIT);
    this.unit.setAttribute('aria-describedby', 'relative-frequency-unit-tooltip');
    this.output.appendChild(this.unit);
    this.tooltip = document.createElement('span');
    this.tooltip.id = 'relative-frequency-unit-tooltip';
    this.tooltip.className = 'relative-frequency-unit-tooltip';
    // Hidden text supplies aria-describedby for keyboard/screen-reader users;
    // native title supplies the same explanation on hover, as with Glimpse.
    this.tooltip.textContent = `IPM: ${this.loc.FREQ_UNIT}\n${this.loc.FREQ_ACTION}`;
    this.button.title = this.tooltip.textContent;
    this.output.title = this.tooltip.textContent;
    this.tooltip.hidden = true;
    wrapper.appendChild(this.tooltip);
    const found = this.element.querySelector('p.found');
    found.classList.add('has-frequency');
    found.appendChild(wrapper);

    this.button.addEventListener('click', () => this.load());

    this.statistics.subscribe((cq, data) => {
      if (cq === this.cq && !this.loading && this.element.isConnected)
        this._show(data);
    });
    const saved = this.statistics.peek(this.cq);
    if (saved) this._show(saved);
  }

  load() {
    if (this.loading) return;
    this.loading = true;
    this.button.disabled = true;
    this.button.classList.add('loading');
    this.button.setAttribute('aria-label', this.loc.FREQ_LOADING);
    this.output.replaceChildren(this.unit);
    this.output.setAttribute('aria-busy', 'true');
    this.statistics.load(this.cq).then((data) => {
      if (this.element.isConnected) this._show(data);
    }).catch(() => {
      if (this.element.isConnected) this._error(this.loc.FREQ_ERROR);
    });
  }

  _show(data) {
    if (!valid(data)) {
      this._error(this.loc.FREQ_ERROR);
      return;
    }
    const tokens = Number(data.tokens);
    if (tokens === 0) {
      this._error(this.loc.FREQ_EMPTY);
      return;
    }
    this.loading = false;
    this.button.disabled = false;
    this.button.classList.remove('loading');
    this.output.removeAttribute('aria-busy');
    this.output.textContent = (this.state === 'lower-bound' ? this.loc.FREQ_MINIMUM + ' ' : '') +
      rate(this.count, tokens, this.state === 'lower-bound', this.language) + ' ';
    this.output.appendChild(this.unit);
    this.tooltip.textContent = `IPM: ${this.loc.FREQ_UNIT}\n` +
      `${this.loc.FREQ_BASIS}: ${format(tokens, 0, this.language)} ${this.loc.FREQ_TOKENS}` +
      (this.state === 'lower-bound' ? `\n${this.loc.FREQ_INCOMPLETE}` : '');
    this.output.title = this.tooltip.textContent;
    const focused = document.activeElement === this.button;
    this.button.hidden = true;
    if (focused) this.unit.focus();
  }

  _error(message) {
    this.loading = false;
    this.button.disabled = false;
    this.button.classList.remove('loading');
    this.button.setAttribute('aria-label', this.loc.FREQ_RETRY);
    this.output.removeAttribute('aria-busy');
    this.output.textContent = message;
  }
}

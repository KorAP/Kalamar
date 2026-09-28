import { describe, it, expect, vi } from 'vitest';

describe('mailToChiffre', function () {
  it('should bind click handler for .PArok links', async function () {
    document.body.innerHTML = '<a class="PArok" href="/contact?to=test">Mail</a>';

    await import('../mailToChiffre.js?case=href');

    const originalPArok = window.PArok;
    const spy = vi.fn();
    window.PArok = spy;

    document.querySelector('.PArok').click();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toBe(false);
    expect(String(spy.mock.calls[0][1])).toContain('/contact?to=test');

    window.PArok = originalPArok;
  });

  it('should use data-href when href is #', async function () {
    document.body.innerHTML = '<a class="PArok" href="#" data-href="/contact?to=hidden">Mail</a>';
    const link = document.querySelector('.PArok');
    Object.defineProperty(link, 'href', {
      value: '#',
      configurable: true
    });

    await import('../mailToChiffre.js?case=datahref');

    const originalPArok = window.PArok;
    const spy = vi.fn();
    window.PArok = spy;

    link.click();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toBe(false);
    expect(String(spy.mock.calls[0][1])).toContain('/contact?to=hidden');

    window.PArok = originalPArok;
  });
});

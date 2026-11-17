import { beforeEach, describe, expect, it, vi } from 'vitest';
import source from '../../../src/view/result/export.js?raw';
import vm from 'node:vm';


describe('Export feedback', () => {
  let view, form, streams, failConstructor;
  const url = new URL('https://example.org/instance/test/export/export?q=Baum&format=rtf');

  beforeEach(() => {
    streams = [];
    failConstructor = false;
    class EventSourceMock {
      constructor() {
        if (failConstructor) throw new Error('Unable to connect');
        this.listeners = {};
        this.close = vi.fn();
        streams.push(this);
      }
      addEventListener(name, callback) { this.listeners[name] = callback; }
      emit(name, data) { this.listeners[name]?.({ data }); }
    }
    vm.runInNewContext(source, {
      define: (deps, factory) => { view = Object.create(factory({})); },
      URL, EventSource: EventSourceMock, KorAP: { log: vi.fn() }
    });
    view._download = vi.fn();
    form = document.createElement('form');
    form.innerHTML = `<input type="submit"><div class="export-feedback" hidden
      data-running="Preparing export" data-done="Download started"
      data-error="Export failed"><span class="export-status-text" role="status"></span>
      <span class="export-percent"></span><progress max="100" hidden></progress></div>`;
  });

  const button = form => form.querySelector('input');
  const progress = form => form.querySelector('progress');
  const status = form => form.querySelector('.export-status-text').textContent;

  it('shows fresh progress and blocks duplicate submissions', () => {
    view._stream(url, form);
    expect(button(form).disabled).toBe(true);
    expect(button(form).getAttribute('aria-busy')).toBe('true');
    expect(progress(form).hidden).toBe(false);
    expect(progress(form).value).toBe(0);
    expect(status(form)).toBe('Preparing export');
    view._stream(url, form);
    expect(streams).toHaveLength(1);
    streams[0].emit('Progress', '62.4');
    expect(progress(form).value).toBe(62.4);
    expect(form.querySelector('.export-percent').textContent).toBe('62 %');
    streams[0].emit('Progress', 'invalid');
    expect(progress(form).value).toBe(62.4);
  });

  it('hands off the file once and replaces the bar with completion text', () => {
    view._stream(url, form);
    streams[0].emit('Relocate', 'file-id;baum.rtf');
    streams[0].emit('Process', 'done');
    expect(view._download).toHaveBeenCalledExactlyOnceWith(
      'https://example.org/instance/test/export/export/file-id?fname=baum.rtf');
    expect(progress(form).hidden).toBe(true);
    expect(form.querySelector('.export-percent').textContent).toBe('');
    expect(status(form)).toBe('Download started');
    expect(button(form).disabled).toBe(false);
    expect(button(form).hasAttribute('aria-busy')).toBe(false);
    streams[0].emit('Process', 'done');
    streams[0].onerror({});
    expect(view._download).toHaveBeenCalledTimes(1);
    expect(status(form)).toBe('Download started');
    view._stream(url, form);
    expect(streams).toHaveLength(2);
    expect(progress(form).value).toBe(0);
  });

  it.each(['service', 'network', 'missing-file', 'constructor'])(
    'recovers from a %s error without reporting a download', failure => {
      failConstructor = failure === 'constructor';
      view._stream(url, form);
      if (failure === 'service') streams[0].emit('Error', 'Internal details');
      if (failure === 'network') streams[0].onerror({});
      if (failure === 'missing-file') streams[0].emit('Process', 'done');
      expect(status(form)).toBe('Export failed');
      expect(progress(form).hidden).toBe(true);
      expect(button(form).disabled).toBe(false);
      expect(button(form).hasAttribute('aria-busy')).toBe(false);
      expect(view._download).not.toHaveBeenCalled();
      if (streams[0]) {
        streams[0].emit('Relocate', 'late;file.rtf');
        streams[0].emit('Process', 'done');
      }
      expect(view._download).not.toHaveBeenCalled();
      expect(status(form)).toBe('Export failed');
      failConstructor = false;
      view._stream(url, form);
      expect(button(form).disabled).toBe(true);
      expect(status(form)).toBe('Preparing export');
    });
});

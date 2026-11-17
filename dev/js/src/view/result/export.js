/**
 * Export view of the result panel.
 * The form is rendered by the server (partial/export),
 * the export is done by the export service behind the form action.
 */
"use strict";

define(['view'], function (viewClass) {
  return {
    create : function (tmpl) {
      const obj = Object.create(viewClass)._init(['export']).upgradeTo(this);
      obj._tmpl = tmpl;
      return obj;
    },

    /**
     * Export view element
     */
    show : function () {
      if (this._show)
        return this._show;

      // Import to resolve the form action against the page
      const e = document.importNode(this._tmpl.content.firstElementChild, true);
      const form = e.querySelector('form');
      const button = form.querySelector('input[type=submit]');
      button.disabled = true;

      // Set the limits of the service
      fetch(form.action + '/config').then(
        res => res.ok ? res.json() : Promise.reject(res.status)
      ).then(function (conf) {
        const hitc = form.elements['hitc'];
        hitc.max = conf.maxHitc;
        hitc.value = conf.defaultHitc;

        // Show the limits
        [['.max-hitc', conf.maxHitc], ['.page-size', conf.pageSize]].forEach(function (i) {
          const info = e.querySelector(i[0]);
          info.querySelector('code').textContent = i[1];
          info.hidden = false;
        });

        button.disabled = false;

        if (conf.announcement) {
          const a = e.querySelector('.announcement');
          a.textContent = conf.announcement;
          a.hidden = false;
        };
      }).catch(function (err) {

        // An outdated service would export without authorization
        form.querySelector('input[type=submit]').disabled = true;
        KorAP.log(0, 'Export service is not available: ' + err);
      });

      // Export with progress. Without JavaScript the form
      // is sent directly and answered with the file.
      form.addEventListener('submit', function (ev) {
        ev.preventDefault();
        if (button.disabled || this._busy)
          return;
        const url = new URL(form.action);
        new FormData(form).forEach(function (v, k) {
          if (v !== '')
            url.searchParams.append(k, v);
        });
        this._stream(url, form);
      }.bind(this));

      this._show = e;
      return e;
    },

    // Follow the export of the service and fetch the file in the end
    _stream : function (url, form) {
      if (this._busy)
        return;
      this._busy = true;

      const feedback = form.querySelector('.export-feedback');
      const prog = feedback.querySelector('progress');
      const status = feedback.querySelector('.export-status-text');
      const percent = feedback.querySelector('.export-percent');
      const button = form.querySelector('input[type=submit]');
      let file, sse, settled = false;

      feedback.hidden = false;
      prog.hidden = false;
      prog.value = 0;
      percent.textContent = '0 %';
      status.textContent = feedback.dataset.running;
      button.disabled = true;
      button.setAttribute('aria-busy', 'true');

      const finish = function (message) {
        if (settled)
          return;
        settled = true;
        if (sse)
          sse.close();
        prog.hidden = true;
        percent.textContent = '';
        status.textContent = message;
        button.disabled = false;
        button.removeAttribute('aria-busy');
        this._busy = false;
      }.bind(this);

      const err = function (e) {
        if (settled)
          return;
        finish(feedback.dataset.error);
        KorAP.log(0, e.data || 'Unable to export');
      };

      try {
        sse = new EventSource(url);
      }
      catch (e) {
        err(e);
        return;
      }
      sse.addEventListener('Error', err);
      sse.onerror = err;

      sse.addEventListener('Progress', function (e) {
        if (settled)
          return;
        const value = Number(e.data);
        if (!Number.isFinite(value))
          return;
        prog.value = Math.min(100, Math.max(0, value));
        percent.textContent = Math.round(prog.value) + ' %';
      });

      // Location of the file: "<file>;<filename>"
      sse.addEventListener('Relocate', function (e) {
        if (settled)
          return;
        const data = (e.data || '').split(';');
        if (!data[0])
          return;

        file = new URL(url);
        file.search = '';
        file.pathname += '/' + data[0];
        if (data[1])
          file.searchParams.append('fname', data[1]);
      });

      sse.addEventListener('Process', function (e) {
        if (settled || e.data !== 'done')
          return;
        if (!file) {
          err({});
          return;
        }
        finish(feedback.dataset.done);
        this._download(file.href);
      }.bind(this));
    },

    _download : function (url) {
      location.href = url;
    }
  }
});

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
        const url = new URL(form.action);
        new FormData(form).forEach(function (v, k) {
          if (v !== '')
            url.searchParams.append(k, v);
        });
        this._stream(url, form.querySelector('progress'));
      }.bind(this));

      this._show = e;
      return e;
    },

    // Follow the export of the service and fetch the file in the end
    _stream : function (url, prog) {
      let file;
      const sse = new EventSource(url);

      const err = function (e) {
        sse.close();
        prog.hidden = true;
        KorAP.log(0, e.data || 'Unable to export');
      };

      sse.addEventListener('Error', err);
      sse.onerror = err;

      sse.addEventListener('Progress', function (e) {
        prog.value = e.data;
      });

      // Location of the file: "<file>;<filename>"
      sse.addEventListener('Relocate', function (e) {
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
        prog.hidden = false;
        if (e.data !== 'done')
          return;

        sse.close();
        prog.value = 100;

        if (file)
          location.href = file.href;
        else
          KorAP.log(0, 'Unable to export');
      });
    }
  }
});

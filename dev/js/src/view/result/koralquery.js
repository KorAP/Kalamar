"use strict";

define([
  'view',
  'lib/highlight/highlight.pack',
], function (viewClass) {
  return {
    create : function (classes) {
      return Object.create(viewClass)
        ._init(classes)
        .upgradeTo(this);
    },

    /**
     * KoralQuery view element
     */
    show : function () {
      if (this._show)
        return this._show;

      const kq = document.createElement('div');
      kq.setAttribute('id', 'koralquery');

      const kqInner = kq.addE('div');

      kqInner.addT(
        JSON.stringify(KorAP.koralQuery || {}, null, '  ')
      );
      
      // Highlight the view
      hljs.highlightBlock(kqInner);

      this._show = kq;
      return kq;
    }
  }
});

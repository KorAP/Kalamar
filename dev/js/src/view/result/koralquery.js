define([
  'view',
  'lib/highlight/highlight.pack',
], function (viewClass) {
  return {
    create : function (classes) {
      return Object.create(viewClass)._init(classes).upgradeTo(this);
    },

    /**
     * KoralQuery view element
     */
    show : function () {
      if (this._show)
        return this._show;

      var kq = document.createElement('div');
      kq.setAttribute('id', 'koralquery');

      var kqInner = kq.addE('div');
      kqInner.innerHTML = JSON.stringify(KorAP.koralQuery || {}, null, '  ');

      // Highlight the view
      hljs.highlightBlock(kqInner);

      this._show = kq;
      return kq;
    }
  }
});

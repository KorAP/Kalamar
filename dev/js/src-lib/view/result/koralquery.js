import viewClass from '../view.js';
import '../../../lib/highlight/highlight.pack.js';

  export default class KoralQuery extends viewClass {

    /**
     * KoralQuery view element
     */
    show () {
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
  };

/**
 * The result panel
 *
 * @author Nils Diewald
 */
import panelClass from '../panel.js';
import kqViewClass from '../../view/result/koralquery.js';
import '../../util/util.js';

  const d = document;

  // Localization values
  const loc = KorAP.Locale;
  loc.TOGGLE_ALIGN = loc.TOGGLE_ALIGN || 'toggle alignment';
  loc.SHOW_KQ      = loc.SHOW_KQ      || 'show KoralQuery';

  const aRoll = ['left', 'right','center'];
  
  export default class Result extends panelClass {
    type = 'result';
    
    // Initialize panel
    constructor (opened) {
      super(['result']);
      this._opened = opened;

      // If plugins are enabled, add all buttons for the result panel
      if (KorAP.Plugin) {

        // Add all result buttons in order
        KorAP.Plugin
          .buttonGroup("result")
          .forEach(i => this.actions().add.apply(this.actions(), i));

        KorAP.Plugin.clearButtonGroup("result");
      };
      
      this.prepend = true;
    }


    /**
     * Add KoralQuery action to panel
     */
    addKqAction () {

      // Open KoralQuery view
      const kqButton = this.actions().add(
        loc.SHOW_KQ,
        {'cls':['show-kq','button-icon']},
        function () {

          const t = this;

          // Show only once - otherwise toggle
          if (t._kq && t._kq.shown()) {
            t._kq.close();
            return;
          };
          
          t._kq = new kqViewClass();

          // On close, remove session info on KQ
          t._kq.onClose = function () {
            delete this._opened['kq'];
          }.bind(t);

          t._opened['kq'] = true;
          t.add(t._kq);
        }
      );

      // Show KoralQuery in case it's meant to be shown
      if (this._opened['kq'])
        kqButton.click();
    }


    /**
     * Add align action to panel
     */
    addAlignAction () {
      /**
       * Toggle the alignment (left <=> right)
       */
      let ol = d.querySelector('#search > ol');
      
      if (!ol) return false;
      let olCl = ol.classList;
      let buttonInit = "right";

      aRoll.find(function(align, i) {
        if (olCl.contains('align-' + align)) {
	  buttonInit = aRoll[i >= 2 ? 0 : i+1];
	  return true;
	};
      });
      
      this.actions().add(loc.TOGGLE_ALIGN, {'cls':['align',buttonInit,'button-icon']}, function (e) {
        aRoll.find(function(align, i) {
          if (olCl.contains('align-' + align)) {
            const n  = i >= 2 ? 0 : i+1;
            const nn = n >= 2 ? 0 : n+1;
            olCl.remove('align-' + align);
            olCl.add('align-' + aRoll[n]);
            this.button.toggleClass(aRoll[n], aRoll[nn]);
            return true;
          };
        }, this);
      });    
    }
  };

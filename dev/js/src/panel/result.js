/**
 * The result panel
 *
 * @author Nils Diewald
 */
define([
  'panel',
  'view/result/koralquery'
], function (panelClass, kqViewClass) {

  const d = document;

  // Localization values
  const loc = KorAP.Locale;
  loc.TOGGLE_ALIGN = loc.TOGGLE_ALIGN || 'toggle alignment';
  loc.SHOW_KQ      = loc.SHOW_KQ      || 'show KoralQuery';
  
  return {
    create : function (show) {
      return Object.create(panelClass)._init(['result']).upgradeTo(this)._init(show);
    },

    // Initialize panel
    _init : function (show) {

      return this;
    },


    /**
     * Add KoralQuery action to panel
     */
    addKqAction : function () {

      // Open KoralQuery view
      var kqButton = this.actions.add(loc.SHOW_KQ, ['show-kq','button-icon'], function () {

        // Show only once - otherwise toggle
        if (this._kq && this._kq.shown()) {
          this._kq.close();
          return;
        };
          
        this._kq = kqViewClass.create();

        // On close, remove session info on KQ
        this._kq.onClose = function () {
          delete show['kq'];
        };

        show['kq'] = true;
        this.add(this._kq);
      });

      // Show KoralQuery in case it's meant to be shown
      if (show['kq'])
        kqButton.click();
    },

    /**
     * Add align action to panel
     */
    addAlignAction : function () {
      /**
       * Toggle the alignment (left <=> right)
       */
      this.actions.add(loc.TOGGLE_ALIGN, ['align','right','button-icon'], function (e) {
        var ol = d.querySelector('#search > ol');
        ol.toggleClass("align-left", "align-right");
        this.button.toggleClass("left", "right");
      });
    }
  }
});

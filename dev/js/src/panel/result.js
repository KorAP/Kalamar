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

  const aRoll = ['left', 'right','center'];
  
  return {
    create : function (opened) {
      return Object.create(panelClass)._init(['result']).upgradeTo(this)._init(opened);
    },

    // Initialize panel
    _init : function (opened) {
      this._opened = opened;

      
      // If plugins are enabled, add all buttons for the result panel
     if (KorAP.Plugin) {
        var resultButtons = KorAP.Plugin.buttonGroup("result");

        // Add all result buttons in order
       resultButtons.forEach(i => this.actions.add.apply(this.actions, i));

        KorAP.Plugin.clearButtonGroup("result");
      };
      
      this.prepend = true;
      
      return this;
    },


    /**
     * Add KoralQuery action to panel
     */
    addKqAction : function () {

      // Open KoralQuery view
      var kqButton = this.actions.add(loc.SHOW_KQ, {'cls':['show-kq','button-icon']}, function () {

        // Show only once - otherwise toggle
        if (this._kq && this._kq.shown()) {
          this._kq.close();
          return;
        };
          
        this._kq = kqViewClass.create();

        // On close, remove session info on KQ
        this._kq.onClose = function () {
          delete this._opened['kq'];
        }.bind(this);

        this._opened['kq'] = true;
        this.add(this._kq);
      });

      // Show KoralQuery in case it's meant to be shown
      if (this._opened['kq'])
        kqButton.click();
    },

    /**
     * Add align action to panel
     */
    addAlignAction : function () {
      /**
       * Toggle the alignment (left <=> right)
       */
      this.actions.add(loc.TOGGLE_ALIGN, {'cls':['align','right','button-icon']}, function (e) {
        var olCl = d.querySelector('#search > ol').classList;

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
  }
});

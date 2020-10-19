/**
 * The result panel
 *
 * @author Nils Diewald
 */
"use strict";

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
    create : function (opened) {
      return Object.create(panelClass)._init(['result']).upgradeTo(this)._init(opened);
    },

    // Initialize panel
    _init : function (opened) {
      this._opened = opened;

      // If plugins are enabled, add all buttons for the result panel
      if (KorAP.Plugin) {

        // Add all result buttons in order
        KorAP.Plugin
          .buttonGroup("result")
          .forEach(i => this.actions.add.apply(this.actions, i));

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
      const kqButton = this.actions.add(
        loc.SHOW_KQ,
        {'cls':['show-kq','button-icon']},
        function () {

          const t = this;

          // Show only once - otherwise toggle
          if (t._kq && t._kq.shown()) {
            t._kq.close();
            return;
          };
          
          t._kq = kqViewClass.create();

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
    },


    /**
     * Add align action to panel
     */
    addAlignAction : function () {
      /**
       * Toggle the alignment (left <=> right)
       */
      this.actions.add(loc.TOGGLE_ALIGN, {'cls':['align','right','button-icon']}, function (e) {
        const olCl = d.querySelector('#search > ol').classList;
        if (olCl.contains('align-left')) {
          olCl.remove('align-left');
          olCl.add('align-right');
          this.button.toggleClass("right", "center");
        }
        else if (olCl.contains('align-right')) {
          olCl.remove('align-right');
          olCl.add('align-center');
          this.button.toggleClass("center", "left");
        }
        else if (olCl.contains('align-center')) {
          olCl.remove('align-center');
          olCl.add('align-left');
          this.button.toggleClass("left", "right");
        };        
      });
    }
  }
});

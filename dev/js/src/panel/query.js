/**
 * The query panel
 *
 * @author Nils Diewald
 */
define([
  'panel'
], function (panelClass) {

  const d = document;

  // Localization values
  const loc = KorAP.Locale;
  
  return {
    create : function (opened) {
      return Object.create(panelClass)._init(['query']).upgradeTo(this)._init(opened);
    },

    // Initialize panel
    _init : function (opened) {
      this._opened = opened;

      // If plugins are enabled, add all buttons for the query panel
      if (KorAP.Plugin) {
        var queryButtons = KorAP.Plugin.buttonGroup("query");

        // Add all matchbuttons in order
        for (i in queryButtons) {
          a.add.apply(a, queryButtons[i]);
        };

        KorAP.Plugin.clearButtons("query")
      };
      
      return this;
    }
  }
});

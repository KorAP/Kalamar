/**
 * The query panel
 *
 * @author Nils Diewald
 */
"use strict";

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
      const a = this.actions;
      
      // If plugins are enabled, add all buttons for the query panel
      if (KorAP.Plugin) {

        // Add all matchbuttons in order
        KorAP.Plugin
          .buttonGroup("query")
          .forEach(i => a.add.apply(a, i));

        KorAP.Plugin.clearButtonGroup("query")
      };
      
      return this;
    }
  }
});

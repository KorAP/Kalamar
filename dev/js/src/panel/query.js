/**
 * The query panel
 *
 * @author Nils Diewald
 */
"use strict";

define([
  'panel',
  'state'
], function (panelClass, stateClass) {

  const d = document;

  // Localization values
  const loc = KorAP.Locale;
  
  return {
    type : 'query',

    create : function (opened) {
      return Object.create(panelClass)._init(['query']).upgradeTo(this)._init(opened);
    },

    // Initialize panel
    _init : function (opened) {
      this._opened = opened;
      const a = this.actions();

      // Add glimpse button
      const s = stateClass.create([true,false]);
      const cof = document.getElementById("q-cutoff-field");
      const colabel = document.getElementById("glimpse").parentNode;
     
      let glimpseChange = {
        setState : function (val) {
          cof.checked = val;
        }
      };
      s.associate(glimpseChange);
      s.set(cof.checked);
      
      a.addToggle(
        "Glimpse", {
          'cls':['glimpse'],
          'desc':colabel.getAttribute('title')
        },
        s
      );

      // Don't show default glimpse
      colabel.style.display = "none";

      
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

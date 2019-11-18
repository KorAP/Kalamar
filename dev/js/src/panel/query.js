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
      return this;
    }
  }
});

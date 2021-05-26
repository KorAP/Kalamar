/**
 * An entry in menus that is always
 * displayed, with a string and onClick functionality
 * uses menu/prefix.js as prototype and doesn't change much, all
 * functionality comes from the alwaysmenu
 * 
 * 
 * @author Leo Repp
 */


"use strict";

define([
  'menu/prefix'
], function (prefixClass) {
  
  return {

    /**
     * Create new always visible menu entry object.
     * Like a prefix Object, always visible, for some defined action
     */
    create : function () {
      const obj = prefixClass.create()
        .upgradeTo(this)
        ._init();
      obj._el.innerHTML="Speichern";
      obj._el.classList.remove("pref");
      obj._el.classList.add("entry");
      //dont forget to adjust alwaysMenuSpec - alwaysEntry!
      return obj;
    },

    _update : function () {
      /*
      if (this._string.length!==0){ // I assume that this is a sufficient criterium for infering that the prefix is active
        this._el.style.bottom="-27px";
      } else if (this._string.length===0) {
        this._el.style.bottom="0px";
      }
      */
      return this._string; // No need to change the text (=innerHTML)
    },

  };
});

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
  'menu/prefix' //TODO How does this work Nils?
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
 
      //var _subEl = document.createTextNode("Speichern");
      //obj._el.appendChild(_subEl);
      //obj._el.style.visibility='visible';
      obj._el.innerHTML="Speichern";
      obj._el.classList.add('visible');
      return obj;
    },

    _update : function () {
      console.log("entry update");
      return this._string; // No need to change the text (=innerHTML)
    },

  };
});

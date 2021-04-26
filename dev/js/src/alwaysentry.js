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
      const obj = Object.create(prefixClass)
        .upgradeTo(this)
        ._init();
      // Add entry span, remove old one
      delete obj._el
      obj._el = document.createElement('entryDoc');
      obj._el.classList.add('entry');
      //?
      obj._el.appendChild(document.createTextNode("Speichern"));
      obj._el.innerHTML = "Speichern";
      //TODO: Languages

      // Connect action
      if (obj["onclick"] !== undefined)
        obj._el["onclick"] = obj.onclick.bind(t);
      return obj;
    },

    _update : function () {
      return this._string; // No need to change the text (=innerHTML)
    },

  };
});

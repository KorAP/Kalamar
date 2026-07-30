/**
 * An entry in menus that is always
 * displayed, with a string and onClick functionality
 * uses menu/prefix.js as prototype and doesn't change much, all
 * functionality comes from the alwaysmenu
 * 
 * 
 * @author Leo Repp
 */

import KalamarMenuPrefix from '../menu/menu/prefix';

export default class AlwaysEntry extends KalamarMenuPrefix {

    /**
     * Create new always visible menu entry object.
     * Like a prefix Object, always visible, for some defined action
     */
    constructor (text) {
      super();
      this._el.innerHTML = text || "Speichern";
      this._el.classList.remove("pref");
      this._el.classList.add("entry");
      //dont forget to adjust alwaysMenuSpec - alwaysEntry!
    }

    _update () {
      /*
      if (this._string.length!==0){ // I assume that this is a sufficient criterium for infering that the prefix is active
        this._el.style.bottom="-27px";
      } else if (this._string.length===0) {
        this._el.style.bottom="0px";
      }
      */
      return this._string; // No need to change the text (=innerHTML)
    }

}

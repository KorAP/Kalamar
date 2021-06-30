/**
 * API/ skeleton/ base class for an item contained within a container.
 * Here we see which functions container supports for containerItems.
 * 
 * @author Leo Repp
 */


//"use strict";

define({

  /**
   * API for an item contained within a container
   */
  create : function () {
    return Object.create(this); //._init();
  },

  /**
   * Upgrade this object to another object,
   * while private data stays intact.
   *
   * @param {Object} An object with properties.
   */
  upgradeTo : function (props) {
    for (let prop in props) {
      this[prop] = props[prop];
    };
    return this;
  },

  /**
   * Check or set if the item is active
   *
   * @param {boolean|null} State of activity
   */
  active : function (bool) {
    const cl = this.element().classList;
    if (bool === undefined) return cl.contains("active");
    else if (bool) cl.add("active");
    else cl.remove("active"); //allows for setting it to inactive if not (equal to undefined or truthy)
  },

  /**
   * Get/create the document element of the container item. Can be overwritten. Standard class: li
   */
  element : function () {
    // already defined
    if (this._el !== undefined) return this._el;
    
    // Create list item
    const li = document.createElement("li");

    // Connect action
    if (this["onclick"] !== undefined) {
      li["onclick"] = this.onclick.bind(this);
    };    
    return this._el = li;
  },

  /**
   * Expected to be overwritten
   * @returns whether the item is currently an option to be selected, or if it should just be skipped
   */
  isSelectable : function () {
    return true;
  },

  /**
   * API skeleton for reading letters. Expected to be overwritten.
   * @param {String} letter The letter to be read
   */
  add : function (letter) {},
    
  
  /**
   * API skeleton for clearing whole contents. Expected to be overwritten.
   */
  clear : function () {},
  
  
  /**
   * API skeleton method for execution. Expected to be overwritten.
   * @param {Event} event Event passed down by menu.
   */
  onclick : function (e) {},
  
    
  /**
   * API skeleton method for when backspace is pressed. Expected to be overwritten.
   */
  chop : function () {},

  /**
   * API skeleton method for pressing "right". Expected to be overwritten.
   * @param {Event} event Event passed down by menu.
   */
  further : function (e) {},

  /**
   * Return menu list. This._menu gets written by the container class
   */
  menu : function () {
    return this._menu;
  }

});
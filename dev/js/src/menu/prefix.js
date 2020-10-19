"use strict";

define({

  /**
   * Create new prefix object.
   */
  create : function () {
    return Object.create(this)._init();
  },


  // Initialize prefix object
  _init : function () {
    const t = this;

    t._string = '';

    // Add prefix span
    t._element = document.createElement('span');
    t._element.classList.add('pref');
    // Connect action

    if (t["onclick"] !== undefined)
      t._element["onclick"] = t.onclick.bind(t);
    
    return t;
  },


  _update : function () {
    return this._element.innerHTML
      = this._string;
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
   * Get or set the activity status of the prefix.
   */
  active : function (bool) {
    const cl = this.element().classList;
    if (bool === undefined)
      return cl.contains("active");
    else if (bool)
      cl.add("active");
    else
      cl.remove("active");
  },


  /**
   * Check, if a prefix is given or not.
   */
  isSet : function () {
    return this._string.length > 0 ?
      true : false;
  },


  /**
   * Get or set the prefix string.
   */
  value : function (string) {
    if (arguments.length === 1) {
      this._string = string;
      return this._update();
    };
    return this._string;
  },


  /**
   * Add string to prefix.
   */
  add : function (string) {
    this._string += string;
    return this._update();
  },
  

  /**
   * Clear prefix
   */
  clear : function () {
    this._string = '';
    return this._update();
  },


  /**
   * Action method.
   * Expected to be overridden.
   */
  onclick : function () {},

  
  /**
   * Remove the last character of the string
   */
  chop : function () {
    const t = this;

    // Prefix is long enough for backspace
    if (t._string.length > 1) {
      t._string = t._string.substring(
	      0, t._string.length - 1
      );
    }
    else {
      t._string = '';
    };
    
    return t._update();
  },


  /**
   * Get the associated dom element.
   */
  element : function () {
    return this._element;
  },


  /**
   * Return menu list.
   */
  menu : function () {
    return this._menu;
  }
});

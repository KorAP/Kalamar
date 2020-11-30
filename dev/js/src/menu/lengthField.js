"use strict";

define({

  /**
   * Create new lengthField object.
   */
  create : function () {
    return Object.create(this)._init();
  },


  // Initialize lengthField object
  _init : function () {
    this._el = document.createElement('div');
    this._el.classList.add('lengthField');
    return this;
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
   * Get the associated dom element.
   */
  element : function () {
    return this._el;
  },


  /**
   * Add string to lengthField.
   */
  add : function (param) {
    this._el.appendChild(document.createElement('span'))
      .appendChild(document.createTextNode(param[0] + '--'));
  },


  /**
   * Remove all initialized values
   */
  reset : function () {
    while (this._el.firstChild) {
      this._el.firstChild.remove(); //should google if this is the way to clear a tree
    };
  }
});

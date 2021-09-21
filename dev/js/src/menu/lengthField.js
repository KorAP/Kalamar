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
      this._el.firstChild.remove();
    };
  }
});

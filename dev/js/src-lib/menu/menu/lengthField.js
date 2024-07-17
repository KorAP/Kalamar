"use strict";

export default class KalamarMenuLengthField {

  /**
   * Create new lengthField object.
   */
  constructor () {
    return this._init();
  }


  // Initialize lengthField object
  _init () {
    this._el = document.createElement('div');
    this._el.classList.add('lengthField');
    return this;
  }


  /**
   * Get the associated dom element.
   */
  element () {
    return this._el;
  }


  /**
   * Add string to lengthField.
   */
  add (param) {
    this._el.appendChild(document.createElement('span'))
      .appendChild(document.createTextNode(param[0] + '--'));
  }


  /**
   * Remove all initialized values
   */
  reset () {
    while (this._el.firstChild) {
      this._el.firstChild.remove();
    };
  }
};

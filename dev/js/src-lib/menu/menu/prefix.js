"use strict";

export default class KalamarMenuPrefix {

  /**
   * Create new prefix object.
   */
  constructor () {
    return this._init();
  }


  // Initialize prefix object
  _init () {
    const t = this;

    t._string = '';

    // Add prefix span
    t._el = document.createElement('span');
    t._el.classList.add('non-item');
    t._el.classList.add('pref');
    // Connect action

    if (t["onclick"] !== undefined) {
      t._el["onclick"] = t.onclick.bind(t);
    }
    return t;
  }


  _update () {
    return this._el.innerHTML
      = this._string;
  }


  /**
   * Get or set the activity status of the prefix.
   */
  active (bool) {
    const cl = this.element().classList;
    if (bool === undefined)
      return cl.contains("active");
    else if (bool)
      cl.add("active");
    else
      cl.remove("active");
  }


  /**
   * Check, if a prefix is given or not.
   */
  isSet () {
    return this._string.length > 0 ?
      true : false;
  }


  /**
   * Get or set the prefix string.
   */
  value (string) {
    if (arguments.length === 1) {
      this._string = string;
      return this._update();
    };
    return this._string;
  }


  /**
   * Add string to prefix.
   */
  add (string) {
    this._string += string;
    return this._update();
  }
  

  /**
   * Clear prefix
   */
  clear () {
    this._string = '';
    return this._update();
  }


  /**
   * Action method.
   * Expected to be overridden.
   */
  onclick () {}

  
  /**
   * Remove the last character of the string
   */
  chop () {
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
  }


  /**
   * Get the associated dom element.
   */
  element () {
    return this._el;
  }


  /**
   * Return menu list.
   */
  menu () {
    return this._menu;
  }
};

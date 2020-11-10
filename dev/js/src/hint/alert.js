/**
 * Hint menu alert, positioned at the exact char.
 */
"use strict";

define(function () {

  return {

    /**
     * Construct a new alert object
     */
    create : function (msg) {
      return Object.create(this)._init(msg);
    },

    // Init
    _init : function (msg) {
      const t = this;
      t._type = 'alert';
      t.active = false;
      t._el = document.createElement('div');
      t._el.style.display = 'none';
      t._el.classList.add('alert', 'hint');
      return t;
    },


    /**
     * Show alert.
     */
    show : function (msg) {
      this.active = true;
      const e = this._el;
      e.textContent = msg;
      e.style.display = 'block';
    },


    /**
     * Hide alert.
     */
    hide : function () {
      if (!this.active)
	      return false;
      this._el.style.display = 'none';
      this.active = false;
      return true;
    },


    /**
     * Get alert object.
     */
    element : function () {
      return this._el;
    }
  }
});

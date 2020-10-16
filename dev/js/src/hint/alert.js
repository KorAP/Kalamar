/**
 * Hint menu alert, positioned at the exact char.
 */
define(function () {
  "use strict";

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
      t._element = document.createElement('div');
      t._element.style.display = 'none';
      t._element.classList.add('alert', 'hint');
      return t;
    },


    /**
     * Show alert.
     */
    show : function (msg) {
      this.active = true;
      const e = this._element;
      e.textContent = msg;
      e.style.display = 'block';
    },


    /**
     * Hide alert.
     */
    hide : function () {
      if (!this.active)
	      return false;
      this._element.style.display = 'none';
      this.active = false;
      return true;
    },


    /**
     * Get alert object.
     */
    element : function () {
      return this._element;
    }
  }
});

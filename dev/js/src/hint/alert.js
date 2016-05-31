/**
 * Hint menu alert
 */
define(function () {
  "use strict";
  return {
    create : function (msg) {
      return Object.create(this)._init(msg);
    },
    _init : function (msg) {
      this.active = false;
      this._element = document.createElement('div');
      this._element.style.opacity = 0;
      this._element.classList.add('alert', 'hint');
      return this;
    },
    show : function (msg) {
      this._element.textContent = msg;
      this.active = true;
      this._element.style.opacity = 1;
    },

    unshow : function () {
      if (!this.active)
	return false;
      this._element.style.opacity = 0;
      this.active = false;
      return true;
    },

    element : function () {
      return this._element;
    }
  }
});

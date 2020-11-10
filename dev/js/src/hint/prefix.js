"use strict";

define(['menu/prefix'], function (prefixClass) {
  return {

    /**
     * Create prefix object for the hint helper menu.
     */
    create : function (params) {
      return Object.create(prefixClass).
	      upgradeTo(this)._init(params);
    },

    /**
     * Override the prefix action.
     */
    onclick : function () {
      const m = this.menu();
      const value = this.value();
      const h = m.hint();
      m.hide();

      h.inputField().insert(value);
      h.active = false;
    }
  };
});

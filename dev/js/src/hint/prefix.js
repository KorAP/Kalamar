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
    onclick : function (e) {
      console.log("Prefix here");
      const m = this.menu();
      const value = this.value();
      const h = m.hint();
      console.log("value: ",value);
      h.inputField().insert(value);
      h.active(null);
      m.hide();
      // h.unshow();
      e.halt();
    }
  };
});

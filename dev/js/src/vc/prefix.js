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
      var m = this.menu();
      var value = this.value();
      m.release(value, "string");
    }
  };
});

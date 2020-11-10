"use strict";

define(['menu/lengthField', 'util'], function (lengthFieldClass) {
  return {

    /**
     * Create lengthField object for the hint helper menu.
     */
    create : function () {
      return Object.create(lengthFieldClass).
	      upgradeTo(this)._init();
    },

    /**
     * Override the prefix action.
     */
    add : function (param) {
      this._el.addE('span').addT(param[0] + '--');

      var desc = this._el.addE('span');
      desc.classList.add("desc");
      desc.addT(param[2] + '--');
      this._el.appendChild(desc);
    }
  };
});

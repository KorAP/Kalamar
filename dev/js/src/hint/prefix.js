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
      var m = this.menu();
      var h = m.hint();
      m.hide();

      h.inputField().insert(this.value());
      h.active = false;
    }
  };
});

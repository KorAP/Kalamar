define(['menu/prefix'], function (prefixClass) {
  return {
    create : function (params) {
      return Object.create(prefixClass).upgradeTo(this)._init(params);
    },
    onclick : function () {
      var m = this.menu();
      var h = m.hint();
      m.hide();

      h.inputField().insert(this.value());
      h.active = false;
    }
  };
});

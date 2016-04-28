define(['menu/lengthField'], function (lengthFieldClass) {
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
      this._element.appendChild(document.createElement('span'))
	.appendChild(document.createTextNode(param[0] + '--'));

      var desc = this._element.appendChild(document.createElement('span'));
      desc.classList.add("desc");
      desc.appendChild(document.createTextNode(param[2] + '--'));
      this._element.appendChild(desc);
    }
  };
});

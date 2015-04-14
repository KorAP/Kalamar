define({
  create : function (params) {
    return Object.create(this)._init();
  },
  _init : function () {
    this._string = '';

    // Add prefix span
    this._element = document.createElement('span');
    this._element.classList.add('pref');
    // Connect action

    if (this["onclick"] !== undefined)
      this._element["onclick"] = this.onclick.bind(this);
    
    return this;
  },
  _update : function () {
    this._element.innerHTML
      = this._string;
  },

  /**
   * Upgrade this object to another object,
   * while private data stays intact.
   *
   * @param {Object} An object with properties.
   */
  upgradeTo : function (props) {
    for (var prop in props) {
      this[prop] = props[prop];
    };
    return this;
  },

  active : function (bool) {
    var cl = this.element().classList;
    if (bool === undefined)
      return cl.contains("active");
    else if (bool)
      cl.add("active");
    else
      cl.remove("active");
  },

  element : function () {
    return this._element;
  },

  isSet : function () {
    return this._string.length > 0 ?
      true : false;
  },

  value : function (string) {
    if (arguments.length === 1) {
      this._string = string;
      this._update();
    };
    return this._string;
  },
  
  add : function (string) {
    this._string += string;
    this._update();
  },

  onclick : function () {},

  backspace : function () {
    if (this._string.length > 1) {
      this._string = this._string.substring(
	0, this._string.length - 1
      );
    }
    else {
      this._string = '';
    };
    
    this._update();
  },

  /**
   * Return menu list.
   */
  menu : function () {
    return this._menu;
  }
});

/**
 * Add string values to the virtual collection
 */
define({
  create : function () {
    var regex = false;
    var value = '';
    if (arguments.length == 2) {
      regex = arguments[1];
    };
    if (arguments.length > 1) {
      value = arguments[0];
    };
    return Object.create(this)._init(value, regex);
  },
  
  _init : function (value, regex) {
    this.element();
    this.value(value);
    this.regex(regex);
    return this;
  },

  regex : function (bool) {
    if (arguments.length === 1) {
      if (bool) {
	this._regex = true;
      }
      else {
	this._regex = false;
      };
      this._update();
    };
    return this._regex;
  },

  toggleRegex : function () {
    if (this._regex === false)
      this.regex(true);
    else
      this.regex(false);
  },
  
  value : function (val) {
    if (arguments.length === 1) {
      this._value = val;
      this._update();
    };
    return this._value;
  },
  
  _update : function () {
    this._input.firstChild.data = this._value;
    if (this._regex) {
      this._element.classList.add('regex');
    }
    else {
      this._element.classList.add('regex');
    };
  },
  
  element : function () {
    if (this._element !== undefined)
      return this._element;

    this._element = document.createElement('div');
    var cl = this._element.classList;
    cl.add('vc-value');
    if (this.regex())
      cl.add('regex');
    
    this._input = this._element.appendChild(
      document.createElement('input')
    );
    this._input.appendChild(
      document.createTextNode(this.value())
    );
    
    this._element.appendChild(
      document.createElement('div')
    ).addEventListener('click', function (e) {
      this.toggleRegex();
    }.bind(this));
    
    var go = this._element.appendChild(
      document.createElement('span')
    );

    return this._element;
  }
});

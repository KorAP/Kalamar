/**
 * Add string values to the virtual collection
 */
define({

  /**
   * Create new string value helper.
   */
  create : function () {
    var regex = false;
    var value = '';
    if (arguments.length == 2) {
      regex = arguments[1];
    };
    if (arguments.length >= 1) {
      value = arguments[0];
    };
    return Object.create(this)._init(value, regex);
  },
  

  // Initialize the string value
  _init : function (value, regex) {
    this.element();
    this.value(value);
    this.regex(regex);
    return this;
  },


  /**
   * Get or set the regex boolean value.
   *
   * @param bool Either true or false
   */
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


  /**
   * Toggle the regex, make it either true,
   * if it is false, or make it false, if it is true.
   */
  toggleRegex : function () {
    if (this._regex === false)
      this.regex(true);
    else
      this.regex(false);
  },
  
  /**
   * Get or set the string value.
   */
  value : function (val) {
    if (arguments.length === 1) {
      this._value = val;
      this._input.value = val;
      this._update();
    };
    return this._value;
  },


  // Update dom element
  _update : function () {
    this._value = this._input.value;

    if (this._regex) {
      this._element.classList.add('regex');
    }
    else {
      this._element.classList.remove('regex');
    };
  },
  

  /**
   * Store the string value.
   * This method should be overwritten.
   * The method receives the the value and the regex.
   */
  store : function (v,r) {},


  focus : function () {
    this._element.children[0].focus();
  },

  /**
   * Get the associated dom element.
   */
  element : function () {
    if (this._element !== undefined)
      return this._element;

    // Create element
    this._element = document.createElement('div');
    var e = this._element;
    e.setAttribute('tabindex', 0);
    e.style.outline = 0;

    var cl = e.classList;
    cl.add('value');
    if (this.regex() === true)
      cl.add('regex');
    
    // Add input field
    this._input = e.appendChild(
      document.createElement('input')
    );
    if (this.value() !== undefined)
      this._input.value = this.value();

    // Add regex button
    var re = e.appendChild(
      document.createElement('div')
    );
    re.addEventListener(
      'click',
      function (e) {
	this.toggleRegex();
	e.halt();
      }.bind(this),
      true
    );
    re.appendChild(document.createTextNode('RE'));

    e.addEventListener(
      'blur',
      function (e) {
	this.store(this.value(), this.regex());
	e.halt();
      }.bind(this)
    );

    this._input.addEventListener(
      'keypress',
      function (e) {
	if (e.keyCode == 13) {
	  this.value(this._input.value);
	  this.store(this.value(), this.regex());
          return false;
	};
      }.bind(this)
    );

    // Add store button
    /*
    e.appendChild(
      document.createElement('div')
    ).addEventListener('click', function () {
      this.store(this.value(), this.regex());
    }.bind(this));
    */
    return e;
  }
});

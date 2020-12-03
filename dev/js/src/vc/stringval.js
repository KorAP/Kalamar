/**
 * Add string values to the virtual corpus
 */
"use strict";

define(['util'], function () {

  const loc = KorAP.Locale;
  loc.REGEX      = loc.REGEX      || 'RegEx';
  loc.REGEX_DESC = loc.REGEX_DESC || 'Use a regular expression';

  return {
    /**
     * Create new string value helper.
     */
    create : function () {
      const a = arguments;
      let regexOp = true,
          regex = false,
          value = '';

      // Set value
      if (a.length >= 1) {
        if (a[0] !== undefined)
          value = a[0];
      };

      // Set regex
      if (a.length >= 2) {
        if (a[1] !== undefined)
          regex = a[1];
      };

      // Set regexOp
      if (a.length >= 3) {
        regexOp = a[2];
        if (regexOp === false) {
          regex = false;
        }
      };
      return Object.create(this)._init(value, regex, regexOp);
    },
    

    // Initialize the string value
    _init : function (value, regex, regexOp) {
      this.value(value);
      this.regex(regex);
      this._regexOp(regexOp);
      return this;
    },


    /**
     * Get or set the regex boolean value.
     *
     * @param bool Either true or false
     */
    regex : function (bool) {
      if (arguments.length === 1) {
	      this._regex = bool ? true : false;
        this._update();
      };
      return this._regex;
    },


    _regexOp : function (regexOp) {
      if (arguments.length === 1) {
        this.__regexOp = regexOp ? true : false;
        this._update();
      };
      return this.__regexOp;
    },


    /**
     * Toggle the regex, make it either true,
     * if it is false, or make it false, if it is true.
     */
    toggleRegex : function () {
      this.regex(this._regex === false ? true : false);
    },
    

    /**
     * Get or set the string value.
     */
    value : function (val) {
      if (arguments.length === 1) {
        this._value = val;
        // this._input.value = val;
        this._update();
      };
      return this._value;
    },


    // Update dom element
    _update : function () {
      if (this._el === undefined)
        return;
      
      this._value = this._input.value;

      const cl = this._el.classList;

      if (this._regexOp() && this._regex) {
        cl.add('regex');
      }
      else {
        cl.remove('regex');
      };
    },
    

    /**
     * Store the string value.
     * This method should be overwritten.
     * The method receives the value and the regex.
     */
    store : function (v,r) {},


    /**
     * Put focus on element
     */
    focus : function () {
      this._el.children[0].focus();
    },


    /**
     * Get the associated dom element.
     */
    element : function () {
      if (this._el !== undefined)
        return this._el;

      // Create element
      const e = this._el = document.createElement('div');
      e.setAttribute('tabindex', 0);
      e.style.outline = 0;

      const cl = e.classList;
      cl.add('value');
      if (this.regex() === true)
        cl.add('regex');
      
      // Add input field
      this._input = e.addE('input');

      if (this.value() !== undefined) {
        this._input.value = this.value();
      };

      // Add regex button
      if (this._regexOp()) {
        const re = e.addE('div');
        re.addEventListener(
          'click',
          function () {
	          this.toggleRegex();
            // ev.halt();
          }.bind(this),
          true
        );
        re.setAttribute("title", "Use as regular expression");
        re.addT('RegEx');
      };

      // If the focus is not on the text field anymore,
      // delegate focus to
      this._input.addEventListener(
        'blur',
        function (ev) {
          const t = this;
          if (!t._inField) {
	          t.value(t._input.value);
            t.store(t.value(), t.regex());
          };
          ev.halt();
        }.bind(this)
      );

      // Workaround to check the click is in the field
      e.addEventListener(
        'mousedown',
        function () {
          this._inField = true;
        }.bind(this)
      );

      e.addEventListener(
        'mouseup',
        function () {
          this._inField = false;
          this._input.focus();
        }.bind(this)
      );

      this._input.addEventListener(
        'keypress',
        function (ev) {
          const t = this;
	        if (ev.keyCode == 13) {
	          t.value(t._input.value);
	          t.store(t.value(), t.regex());
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
  };
});

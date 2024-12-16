/**
 * Add integer values to the virtual corpus
 */
"use strict";

define(['util'], function () {

  return {
    /**
     * Create new integer value helper.
     */
    create : function () {
      const a = arguments;
      let value = 0;

      // Set value
      if (a.length >= 1) {
        if (a[0] !== undefined)
          value = a[0];
      };

      return Object.create(this)._init(value);
    },
    

    // Initialize the integer value
    _init : function (value) {
      this.value(value);
      return this;
    },

    /**
     * Get or set the integer value.
     */
    value : function (val) {
      if (arguments.length === 1) {

        if (typeof val != "number")
          val = parseInt(val);

        if (isNaN(val))
          val = 0;
        
        this._value = val;
        this._update();
      };
      return this._value;
    },


    // Update dom element
    _update : function () {
      if (this._el === undefined)
        return;
      
      this._value = this._input.value;
    },
    

    /**
     * Store the integer value.
     * This method should be overwritten.
     * The method receives the value.
     */
    store : function (v) {},


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
      
      // Add input field
      this._input = e.addE('input');
      this._input.setAttribute("type", "number");

      if (this.value() !== undefined) {
        this._input.value = this.value();
      };

      // If the focus is not on the text field anymore,
      // delegate focus to
      this._input.addEventListener(
        'blur',
        function (ev) {
          const t = this;
          if (!t._inField) {
	          t.value(t._input.value);
            t.store(t.value());
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
	          t.store(t.value());
            return false;
	        };
        }.bind(this)
      );

      return e;
    }
  };
});

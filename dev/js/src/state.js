/**
 * Create a state object, that can have a single value
 * (mostly boolean) and multiple objects associated to it.
 * Whenever the state changes, all objects are informed
 * by their setState() method of the value change.
 *
 * @author Nils Diewald
 */
/*
 * TODO:
 *   Require names for states, that should be quite short, so they
 *   can easily be serialized and kept between page turns (via cookie
 *   and/or query param)
 */
"use strict";
// define makes the contained function or object to not use the global namespace, thus not polluting it. 
// also allows for noting file/module dependencies. https://requirejs.org/docs/api.html#define
define(function () {
  return {

    /**
     * Constructor
     */
    create : function (value) {
      return Object.create(this)._init(value);
    },


    /* Initialize
	 * assoc is an empty array that will contain "associated objects" that have setState methods
	 * values is an array either as passed by caller or if no parameters [false,true]
	 * or if not an array was passed, create array containing parameter
	 * value is values[0]. (i.e. false, first parameter element or whole parameter)
	 */
    _init : function (values) {
      const t = this;
      t._assoc = [];
      if (values == undefined) { //lieber === ?
        t.values = [false,true];
      }
      else if (Array.isArray(values)) { //Where can I find how this is defined
        t.values = values; //TODO Maybe test wether all elements in values are different
      }
      else {
        t.values = [values];
      }
      t.value = t.values[0];
      return t;
    },


    /**
     * Associate the state with a single object that has the setState Property and set its state to this one.
     */
    associate : function (obj) {

      // Check if the object has a setState() method
      if (obj.hasOwnProperty("setState") ){ //&& typeof obj.setState === 'function')  //NEW: test is setState a function and not a value
        this._assoc.push(obj);
        obj.setState(this.value);
      } else {
        console.log("Object " + obj + " has no setState() method.");//, or is not of type funtion");
      }
    },


    /**
     * Set the state to a certain value.
     * This will set the state to all associated objects as well.
	 * This also changes the values[current] object, if it is an object.
     */
    set : function (value) {
      if (value != this.value) { //Are you sure we want to use != ? It is the first part of the "bad parts Appendix"!
        this.value = value;
        this._assoc.forEach(i => i.setState(value)); //Where can I find a description for this notation?
      };
    },


    /**
     * Get the state value
     */
    get : function () {
      return this.value;
    },


    /**
     * Get the number of associated objects
     */
    associates : function () { //unclear name?
      return this._assoc.length;
    },


    /**
     * Clear all associated objects
     */
    clear : function () {
      return this._assoc = []; //Return an expression???
    },


    /**
     * Roll to the next value.
     * This may be used for toggling.
     */
    roll : function () {
      let next = 0; //is let necessary?  O'Reilly says we have function scope. Or do we just use let everywhere?
      for (let i = 0; i < this.values.length - 1; i++) { //could also be done in a while statement
        if (this.value == this.values[i]) { //Are you sure you want to use == ?
          next = i+1; //this only works as intended when all objects in values are different.
          break;
        };
      };
      this.set(this.values[next]); //update associated objects.
    }
  }
});

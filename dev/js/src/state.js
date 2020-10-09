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
 *   Add a "roll" parameter, like "roll":["left","right","center"]
 *   and a roll() method, that will switch through the states in the list
 *   for flexible toggling.
 */
define(function () {

  "use strict";

  return {

    /**
     * Constructor
     */
    create : function (value) {
      return Object.create(this)._init(value);
    },

    // Initialize
    _init : function (value) {
      this._assoc = [];
      this.value = value;
      return this;
    },


    /**
     * Associate the state with some objects.
     */
    associate : function (obj) {

      // Check if the object has a setState() method
      if (obj.hasOwnProperty("setState")) {
        this._assoc.push(obj);
        obj.setState(this.value);
      } else {
        console.log("Object " + obj + " has no setState() method");
      }
    },

    /**
     * Set the state to a certain value.
     * This will set the state to all associated objects as well.
     */
    set : function (value) {
      if (value != this.value) {
        this.value = value;
        this._assoc.forEach(i => i.setState(value));
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
    associates : function () {
      return this._assoc.length;
    },

    /**
     * Clear all associated objects
     */
    clear : function () {
      return this._assoc = [];
    }
  }
});

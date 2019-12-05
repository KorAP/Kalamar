/**
 * Create a state object, that can have a single value
 * (mostly boolean) and multiple objects associated to it.
 * Whenever the state changes, all objects are informed
 * by their setState() method of the value change.
 *
 * @author Nils Diewald
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
        for (let i in this._assoc) {
          this._assoc[i].setState(value);
        }
      };
    },

    /**
     * Get the state value
     */
    get : function () {
      return this.value;
    }
  }
});

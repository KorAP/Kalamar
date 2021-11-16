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

define(function () {
  return {

    /**
     * Constructor
     */
    create : function (values) {
      return Object.create(this)._init(values);
    },


    // Initialize
    _init : function (values) {
      const t = this;
      t._assoc = [];
      if (values == undefined) {
        t.values = [false,true];
      }
      else if (Array.isArray(values)) {
        t.values = values;
      }
      else {
        t.values = [values];
      }
      return t;
    },


    /**
     * Associate the state with some objects.
     */
    associate : function (obj) {

      console.log("Associate state with obj");
      
      // Check if the object has a setState() method
      if (obj.hasOwnProperty("setState")) {
        console.log("Has setState, set obj to", this.value);

        this._assoc.push(obj);
        // if (this.value != undefined) {
          obj.setState(this.value);
        // };
      } else {
        console.log("Object " + obj + " has no setState() method");
      }
    },


    /**
     * Set the state to a certain value.
     * This will set the state to all associated objects as well.
     */
    set : function (value) {
      console.log("SET1", value, this.associates());
      if (value != this.value) {
        console.log("SET2", value);
        // this._assoc.forEach(i => i.setState(value));
        this._assoc.forEach(function (i) {
          i.setState(value);
          console.log("Set state!",value);
        });
        this.value = value;
      };
    },


    /**
     * Set the state to a default value.
     * This will only be set, if no other value is set yet.
     */
    setIfNotYet : function (value) {
      if (this.value == undefined) {
        this.set(value);
      };
    },


    /**
     * Get the state value
     */
    get : function () {
      if (this.value == undefined) {
        this.value = this.values[0];
      };

      return this.value;
    },


    /**
     * Get the number of associated objects
     */
    associates : function () {
      return this._assoc.length;
    },


    /**
     * Get the list of associated objects
     * TODO: This should be renamed to associates().
     */
    associateList : function () {
      return this._assoc;
    },


    /**
     * Clear all associated objects
     */
    clear : function () {
      return this._assoc = [];
    },


    /**
     * Remove a single associated object
     * based on index
     */
    remove : function (i) {
      delete this._assoc[i];
    },


    /**
     * Roll to the next value.
     * This may be used for toggling.
     */
    roll : function () {
      let next = 0;
      for (let i = 0; i < this.values.length - 1; i++) {
        if (this.get() == this.values[i]) {
          next = i+1;
          break;
        };
      };
      this.set(this.values[next]);
    }
  }
});

/**
 * Create a state manager object, that can deserialize and
 * serialize states of associated states.
 * At the moment this requires an element for serialization,
 * but it may very well serialize in a cookie.
 *
 * @author Nils Diewald
 */

"use strict";

define(['state'], function(stateClass) {

  return {
    // Create new state amanger.
    // Expects an object with a value
    // to contain the serialization of all states.
    create : function (element) {
      return Object.create(this)._init(element);
    },


    // Initialize state manager
    _init : function (element) {
      this._e = element;
      this._states = {};
      this._parse(element.value);

      return this;
    },


    // Parse a value and populate states
    _parse : function (value) {
      if (value === undefined || value === '')
        return;

      
      
      this._states = JSON.parse(value);
    },


    // Return the string representation of all states
    toString : function () {

      if (this._states.size === 0)
        return undefined;
      
      let s = "";
      for (let name in this._states) {
        if (this._states[name] === 'boolean' || this._states[name] === 'number') {
          s += name + ':' + this._states[name];
        } else if (this._states[name] === 'string') {

          // util.js' quote should be available
          s += name + ':' + this._states[name].quote();
        } else {
          console.log("Unserializable type");
        };
        s += ',';
      };
      return JSON.stringify(this._states);
    },


    // Update the query component for states
    _update : function () {
      this._e.value = this.toString();
    },


    // Create new state that is automatically associated
    // with the state manager
    newState : function (name, values) {

      // Todo: Slugify name!

      const t = this;
      let s = stateClass.create(values);

      // Load state
      if (t._states[name] !== undefined) {
        s.set(t._states[name]);
      };
      
      // Associate with dummy object
      s.associate({
        setState : function (value) {
          t._states[name] = value;
          t._update();
        }
      });
      
      return s;
    }
  };
});

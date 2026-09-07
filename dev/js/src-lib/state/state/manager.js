/**
 * Create a state manager object, that can deserialize and
 * serialize states of associated states.
 * At the moment this requires an element for serialization,
 * but it may very well serialize in a cookie.
 *
 * @author Nils Diewald
 */

import stateClass from '../state.js';

export default class Manager {
  // Create new state amanger.
  // Expects an object with a value
  // to contain the serialization of all states.
  constructor (element) {
      this._init(element);
  }


  // Initialize state manager
  _init (element) {
      this._e = element;
      this._states = {};
      this._defaults = {};
      this._parse(element.value);

      return this;
  }


  // Parse a value and populate states
  _parse (value) {
      if (value == null || value == undefined || value == '')
        return;

      this._states = JSON.parse('{' + value + '}');
  }

  // Return element
  element () {
      return this._e;
  }

  // Return the string representation of all states
  toString () {

      if (this._states.size === 0)
        return undefined;
      
      return JSON.stringify(this._states).slice(1,-1);
  }


  // Update the query component for states
  _update () {
      this._e.setAttribute("value", this.toString());
  }


  // Create new state that is automatically associated
  // with the state manager
  newState (name, values, defValue) {

      const t = this;
      let s = new stateClass(values);

      if (this._states[name] != undefined) {
        if (values.includes(this._states[name]))
          s.setIfNotYet(this._states[name]);
      };

      // Set default value
      // TODO: It would be better to make this part
      // of the state and serialize correctly using TOJSON()
      if (defValue !== undefined) {
        s.setIfNotYet(defValue);
        t._defaults[name] = defValue;
      };
      
      // Associate with dummy object
      s.associate({
        setState (value) {
          if (t._defaults[name] !== undefined && t._defaults[name] == value) {
            delete t._states[name];
          } else {
            t._states[name] = value;
          };
          t._update();
        }
      });
      
      // Load state
      if (t._states[name] !== undefined) {
        s.set(t._states[name]);
      };

      return s;
  }
}

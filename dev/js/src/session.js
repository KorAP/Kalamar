/**
 * Simple cookie based session library that stores
 * values in JSON encoded cookies.
 *
 * @author Nils Diewald
 */

"use strict";

define({
  /**
   * Create a new session.
   * Expects a name or defaults to 'korap'
   */
  create : function (name = 'korap') {
    const obj = Object.create(this);
    obj._name = name.toLowerCase();
    obj._hash = {};
    obj._parse();
    return obj;
  },


  /**
   * Get a value based on a key.
   * The value can be complex, as the value is stored as JSON.
   */
  get : function (key) {
    return this._hash[key.toLowerCase()];
  },


  /**
   * Set a value based on a key.
   * The value can be complex, as the value is stored as JSON.
   */
  set : function (key, value) {
    this._hash[key] = value;
    this._store();
  },


  /**
   * Clears the session by removing the cookie
   */
  clear : function () {
    this._hash = {};
    document.cookie = this._name + '=; expires=-1';
  },


  /* Store cookie */
  _store : function () {
    document.cookie = this.toString();
  },


  /**
   * Stringify session cookie.
   */
  toString : function () {
    /*
      var date = new Date();
      date.setYear(date.getFullYear() + 1);
    */
    return this._name + '=' + encodeURIComponent(JSON.stringify(this._hash)) + ';';
  },


  /**
   * Parse cookie
   */
  _parse : function () {
    document.cookie.split(';').forEach(
      function (i) {
        const pair = i.split('=');
        const name = pair[0].trim().toLowerCase();
        if (name === this._name) {
	        if (pair.length === 1 || pair[1].length === 0)
	          return;
          this._hash = JSON.parse(decodeURIComponent(pair[1]));
	        return;
        };
      },
      this);
  }
});

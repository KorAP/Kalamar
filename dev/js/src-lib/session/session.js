/**
 * Simple cookie based session library that stores
 * values in JSON encoded cookies.
 *
 * @author Nils Diewald
 */

export default class Session {
  /**
   * Create a new session.
   * Expects a name or defaults to 'korap'
   * Expects a path or defaults to '/'
   */
  constructor (name = 'korap', path ="/") {
    this._name = name.toLowerCase();
    this._path = path;
    this._hash = {};
    this._parse();
  }


  /**
   * Get a value based on a key.
   * The value can be complex, as the value is stored as JSON.
   */
  get (key) {
    return this._hash[key.toLowerCase()];
  }


  /**
   * Set a value based on a key.
   * The value can be complex, as the value is stored as JSON.
   */
  set (key, value) {
    this._hash[key] = value;
    this._store();
  }
 

  /**
   * Clears the session by removing the cookie
   */
  clear () {
    this._hash = {};
    document.cookie = this._name + '=; expires=-1';
  }


  /* Store cookie */
  _store () {
    document.cookie = this.toString();
  }


  /**
   * Stringify session cookie.
   */
  toString () {
    /*
      var date = new Date();
      date.setYear(date.getFullYear() + 1);
    */
    return this._name + '=' + encodeURIComponent(JSON.stringify(this._hash)) + ';SameSite=Lax' + ';path='+this._path;
  }


  /**
   * Parse cookie
   */
  _parse () {
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
}

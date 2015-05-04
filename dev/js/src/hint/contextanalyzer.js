/**
 * Regex object for checking the context of the hint
 */
define({

  /**
   * Create analyzer based on regular expression.
   */
  create : function (regex) {
    return Object.create(this)._init(regex);
  },

  // Initialize analyzer
  _init : function (regex) {
    try {
      this._regex = new RegExp(regex);
    }
    catch (e) {
      KorAP.log(0, e);
      return;
    };
    return this;
  },

  /**
   * Check a context based on the analyzer
   * and return a valid context string.
   */
  test : function (text) {
    if (!this._regex.exec(text))
      return;
    return RegExp.$1;
  }
});

/**
 * Regex object for checking the context of the hint
 */
define({
  create : function (regex) {
    return Object.create(this)._init(regex);
  },
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
  test : function (text) {
    if (!this._regex.exec(text))
      return;
    return RegExp.$1;
  }
});

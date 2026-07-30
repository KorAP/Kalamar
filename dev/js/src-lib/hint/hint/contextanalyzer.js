/**
 * Regex object for checking the context of the hint
 */

export default class ContextAnalyzer {

  /**
   * Create analyzer based on regular expression.
   */
  constructor (regex) {
    try {
      this._regex = new RegExp(regex);
    }
    catch (e) {
      KorAP.log(0, e);
      return;
    };
  }

  /**
   * Check a context based on the analyzer
   * and return a valid context string.
   */
  test (text) {
    if (!this._regex.exec(text))
      return;
    return RegExp.$1;
  }
}

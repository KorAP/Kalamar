import prefixClass from '../../menu/menu/prefix.js';

export default class HintPrefix extends prefixClass {

    /**
     * Create prefix object for the hint helper menu.
     */
    constructor (params) {
      super();
      this.upgradeTo(HintPrefix.prototype)._init(params);
    }

    /**
     * Override the prefix action.
     */
    onclick (e) {
      const m = this.menu();
      const value = this.value();
      const h = m.hint();

      h.inputField().insert(value);
      h.active(null);
      m.hide();
      // h.unshow();
      e.halt();
    }
}

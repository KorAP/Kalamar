import lengthFieldClass from '../../menu/menu/lengthField.js';
import '../../util/util.js';

export default class HintLengthField extends lengthFieldClass {

    /**
     * Create lengthField object for the hint helper menu.
     */
    constructor () {
      super();
      this.upgradeTo(HintLengthField.prototype)._init();
    }

    /**
     * Override the prefix action.
     */
    add (param) {
      this._el.addE('span').addT(param[0] + '--');

      var desc = this._el.addE('span');
      desc.classList.add("desc");
      desc.addT(param[2] + '--');
      this._el.appendChild(desc);
    }
}

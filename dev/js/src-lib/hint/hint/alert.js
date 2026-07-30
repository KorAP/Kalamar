/**
 * Hint menu alert, positioned at the exact char.
 */

export default class Alert {

    /**
     * Construct a new alert object
     */
    constructor (msg) {
      const t = this;
      t._type = 'alert';
      t.active = false;
      t._el = document.createElement('div');
      t._el.style.display = 'none';
      t._el.classList.add('alert', 'hint');
    }


    /**
     * Show alert.
     */
    show (msg) {
      const e = this._el;
      if (msg !== undefined)
        e.textContent = msg;
      if (e.textContent == "")
        return;
      this.active = true;
      e.style.display = 'block';
    }


    /**
     * Hide alert.
     */
    hide () {
      if (!this.active)
	      return false;
      this._el.style.display = 'none';
      this.active = false;
      return true;
    }


    /**
     * Get alert object.
     */
    element () {
      return this._el;
    }
}

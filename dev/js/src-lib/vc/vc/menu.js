/**
 * Menu showing all key fields.
 */
import menuClass from '../../menu/menu.js';
import itemClass from './item.js';
import prefixClass from './prefix.js';

  export default class VCMenu extends menuClass {

    constructor (params) {
      super(params, {
        itemClass : itemClass,
        prefixClass : prefixClass
      });
      this.limit(6);

      // This is only domspecific
      this.element().addEventListener(
        'blur', function (e) {
          this.menu.hide();
        }
      );
    }


    /**
     * Register callback for click event.
     */
    released (cb) {
      this._cb = cb;
    }


    /**
     * A click event was released
     */
    release (key, type) {
      if (this._cb !== undefined)
        this._cb(key, type);
    }


    /**
     * Return a key type based on a key.
     * This is a linear search, but should work okay for small
     * VCs and small key lists.
     */
    typeOf (key) {
      const found = this._items.find(i => i.key() === key);

      if (found)
        return found.type();
    }
  };

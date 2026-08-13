/**
 * An unspecified criterion in a virtual corpus.
 * Inherits everything from jsonld
 */
import jsonldClass from './jsonld.js';
import docClass from './doc.js';
import docGroupRefClass from './docgroupref.js';
import { removeChildren } from '../../util/util.js';

  // Localize empty string
  const loc = KorAP.Locale;
  loc.EMPTY = loc.EMPTY || '⋯';

  export default class Unspecified extends jsonldClass {

    // The ld-type
    _ldType = "non";

    /**
     * Create new unspecified criterion
     * with a link to the parent object
     */
    constructor (parent) {
      super();

      if (parent !== undefined)
	      this._parent = parent;
    }


    /**
     * Set the key; this will spawn a new doc
     */
    key (v) {

      // Not replaceable
      if (this._parent === undefined)
	      return null;

      let newDoc;
      const keyType = KorAP._vcKeyMenu.typeOf(v);

      // Set JSON-LD type
      if (keyType && keyType === 'ref') {
        newDoc = new docGroupRefClass(this._parent);
      }
      else {
        newDoc = new docClass(this._parent);
        newDoc.key(v);
        newDoc.type(keyType);
      };
  
      // Unspecified document on root
      if (this._parent.ldType() === null) {
	      this._parent.root(newDoc);
	      this.destroy();
      }

      // Unspecified document in group
      else {
	      this._parent.replaceOperand(this, newDoc);
      };
      this._parent.update();
      return newDoc;
    }


    /**
     * Update the element
     */
    update () {
      const t = this;

      if (t._el === undefined)
	      return t.element();

      // Remove element content
      removeChildren(t._el);

      const ellipsis = document.createElement('span');
      ellipsis.addT(loc.EMPTY);

      // Click on empty criterion
      ellipsis.addEventListener('click', t.onclick.bind(t));

      t._el.appendChild(ellipsis);

      // Set ref - TODO: Cleanup!
      t._el.refTo = t;

      // Set operators
      if (t._parent !== undefined &&
          t.parent().ldType() !== null) {

	      t._el.appendChild(
	        t.operators(
	          false,
	          false,
	          true
	        ).element()
	      );
      };

      return t.element();
    }


    /**
     * Get the associated element
     */
    element () {
      const t = this;
      if (t._el !== undefined)
	      return t._el;
      t._el = document.createElement('div');
      t._el.setAttribute('class', 'doc unspecified');
      t.update();
      return t._el;
    }


    incomplete () {
      return true;
    }
    

    /**
     * Click on the unspecified object
     */
    onclick () {

      // Get the key menu
      const menu = KorAP._vcKeyMenu;

      // Add key menu element at the correct position
      this._el.insertBefore(
	      menu.element(),	
	      this._el.firstChild
      );

      const that = this;

      // Set released method
      menu.released(function (key) {
	      // Set chosen key and type - will return a doc
	      that.key(key).update();
	      this.hide();
      });

      menu.show();
      menu.focus();
    }
  };

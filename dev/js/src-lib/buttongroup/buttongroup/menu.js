/**
 * Menu to choose from in a button group.
 */

import menuClass from '../../menu/menu.js';

// TODO:
//   Add addToggle() method

export default class ButtonGroupMenu extends menuClass {

  constructor (list, itemClass) {
    super(list, {itemClass : itemClass});

    this.limit(6);

    const e = this.element();

    // This is only domspecific
    e.addEventListener('blur', function (e) {
      this.menu.hide();
    });

    e.classList.add('button-group-list');

    // Add menu to body
    document.getElementsByTagName('body')[0].appendChild(e);

    this._left = false;
    this._below = false;
    this._outside = false;
  }

  /**
   * Open the menu at a certain position
   * relative to the button.
   */
  openAt (left, below, outside) {
      this._left = left ? true : false;
      this._below = below ? true : false;
      this._outside = outside ? true : false;
  }

  /**
   * The panel object of the menu,
   * in case the menu was spawned by a panel.
   */
  panel (panelVar) {
      if (panelVar !== undefined)
        this._panel = panelVar;

      return this._panel;
  }


  // Attach menu to button
  button (btn) {

      this._button = btn;

      this._repos(this._button);
      this.slider().reInit();

      /*
       * This is a suboptimal scrolling solution, see
       * see https://developer.mozilla.org/docs/Mozilla/Performance/ScrollLinkedEffects
       */
      if (this._onscroll !== undefined) {
        window.removeEventListener('scroll', this._onscroll);
      };

      this._onscroll = function () {
        this._repos(this._button);
      }.bind(this);
      
      window.addEventListener('scroll', this._onscroll);
  }


  /**
   * Add button in order
   * 
   * Returns the button element
   */
  add (title, data, cb) {

      let that = this;

      const cbWrap = function (e) {

        // Call callback
        let obj = that._bind || this;
        obj.button = b;
        cb.apply(obj)
      };

      // TODO:
      //   support classes, data-icon and state in itemClass!
      const ItemClass = this.itemClass();
      const b = new ItemClass([title, title, cbWrap]);

      this.append(b);
      return b;
  }
  
  // Overwrite onHide method
  onHide () {

      // Remove listener
      if (this._onscroll !== undefined) {
        window.removeEventListener('scroll', this._onscroll);
      };
      this.element().blur();
  }

  _repos (e) {
      const bounding = e.getBoundingClientRect();
      const s = this._el.style;

      let left = window.pageXOffset;
      let top = 0;

      s.right = 'auto';
      s.bottom = 'auto';

      left += bounding.left;
      
      if (this._left) {
        left += bounding.width - this._el.clientWidth
      };

      if (this._below) {
        top += bounding.bottom;
        
        if (!this._outside) {
          top -= bounding.height;
        };

      } else {
        top -= this._el.clientHeight;
        if (this._outside) {
          top += bounding.top;
        } else {
          top += bounding.bottom;
        };
      };

      s.left = left + "px";
      s.top = top + "px";
  }
}

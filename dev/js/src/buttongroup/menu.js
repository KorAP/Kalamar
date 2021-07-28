/**
 * Menu to choose from in a button group.
 */
"use strict";

// TODO:
//   Add addToggle() method

define(['menu'], function (menuClass) {

  return {

    /**
     * Create new menu object.
     * Pass the list of items and the itemClass.
     */
    create : function (list, itemClass) {
      const obj = Object.create(menuClass)
	          .upgradeTo(this)
	          ._init(list, {itemClass : itemClass});
      obj.limit(6);

      const e = obj.element();

      // This is only domspecific
      e.addEventListener('blur', function (e) {
	this.menu.hide();
      });

      e.classList.add('button-group-list');

      // Add menu to body
      document.getElementsByTagName('body')[0].appendChild(e);

      return obj;
    },


    /**
     * The panel object of the menu,
     * in case the menu was spawned by a panel.
     */
    panel : function (panelVar) {
      if (panelVar !== undefined)
        this._panel = panelVar;

      return this._panel;
    },


    // Attach menu to button
    button : function (btn) {

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
    },


    /**
     * Add button in order
     * 
     * Returns the button element
     */
    add : function (title, data, cb) {

      let that = this;

      const cbWrap = function (e) {

        // Call callback
        let obj = that._bind || this;
        obj.button = b;
        cb.apply(obj)
      };

      // TODO:
      //   support classes, data-icon and state in itemClass!
      const b = this.itemClass().create([title, title, cbWrap]);
      this.append(b);
      return b;
    },
    
    // Overwrite onHide method
    onHide : function () {

      // Remove listener
      if (this._onscroll !== undefined) {
        window.removeEventListener('scroll', this._onscroll);
      };
      this.element().blur();
    },

    _repos : function (e) {
      const bounding = e.getBoundingClientRect();
      this._el.style.left = bounding.left + "px";
      this._el.style.top = (
        bounding.top +
          bounding.height -
          this._el.clientHeight
      ) + "px";
    }
  };
});

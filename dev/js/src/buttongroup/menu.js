/**
 * Menu to choose from in a button group.
 */
"use strict";
define(['menu'], function (menuClass) {

  return {

    /**
     * Create new menu object.
     * Pass the panel object
     * and the item parameters.
     *
     * @param panel The panel object
     * @param params The match menu items
     *   as an array of arrays.
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
     * The panel object of the menu.
     */
    panel :function (panelVar) {
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
      this._element.style.left = bounding.left + "px";
      this._element.style.top = (
        bounding.top +
          bounding.height -
          this._element.clientHeight
      ) + "px";
    }
  };
});

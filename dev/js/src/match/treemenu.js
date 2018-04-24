  /**
   * Menu to choose from for tree views.
   */
define(['menu', 'match/treeitem'], function (menuClass, itemClass) {
  "use strict";

  return {

    /**
     * Create new menu object.
     * Pass the match information object
     * and the item parameters.
     *
     * @param info The match info object
     * @param params The match menu items
     *   as an array of arrays.
     */
    create : function (list) {
      var obj = Object.create(menuClass)
	        .upgradeTo(this)
	        ._init(list, {itemClass : itemClass});
      obj.limit(6);

      var e = obj.element();

      // This is only domspecific
      e.addEventListener('blur', function (e) {
	      this.menu.hide();
      });

      e.setAttribute('id', 'treeMenu');

      // Add menu to body
      document.getElementsByTagName('body')[0].appendChild(e);

      return obj;
    },

    /**
     * The match information object of the menu.
     */
    info :function (infoVar) {
      if (infoVar !== undefined)
        this._info = infoVar;

      return this._info;
    },

    // Attach menu to
    attachTo : function (e) {

      // this._attached = e;
      this._repos(e);
      this.slider().reInit();

      /*
       * This is a suboptimal scrolling solution, see
       * see https://developer.mozilla.org/docs/Mozilla/Performance/ScrollLinkedEffects
       */
      if (this._onscroll !== undefined) {
        window.removeEventListener('scroll', this._onscroll);
      };

      this._onscroll = function () {
        this._repos(e);
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
      var bounding = e.getBoundingClientRect();
      this._element.style.left = bounding.left + "px";
      this._element.style.top = (
        bounding.top +
          bounding.height -
          this._element.clientHeight
      ) + "px";
    }
  };
});

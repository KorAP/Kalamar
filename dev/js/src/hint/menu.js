/**
 * Hint menu
 */

"use strict";

define([
  'containermenu',
	'hint/item',
	'hint/prefix',
	'hint/lengthField'
], function (
  containerMenuClass,
  itemClass,
  prefixClass,
  lengthFieldClass) {

  return {
    
    /**
     * Create new hint helper menu.
     */
    create : function (hint, context, params) {
      const obj = containerMenuClass.create(params, {
        itemClass : itemClass,
        prefixClass : prefixClass,
        lengthFieldClass : lengthFieldClass})
	      .upgradeTo(this);
      obj._context = context;
      obj._el.classList.add('hint');
      obj._hint = hint;

      // Make the top item always active
      obj._firstActive = true;

      obj.element().addEventListener('blur', function (e) {
        this.menu.hide(); // WithoutDestruction();
      });
      // Fix the containeritems not being clickable. Add this to the containers element.
      obj.container().element().addEventListener("mousedown", function (e) {
        // see https://stackoverflow.com/questions/10652852/jquery-fire-click-before-blur-event
        e.preventDefault();
        // It used to be, that clicking on a item within the container (see container.js) would cause the container to gain focus
        // thanks to mousedown default behaviour, which would mean the actual menu (ul menu roll containermenu hint) would not be in focus (I think? containermenu ul is its child
        // afterall?). This would cause blur to be called, which (see hint/menu.js) would hide the current menu and its container, causing click to target a location
        // the containeritem USED to be.
        //https://w3c.github.io/uievents/#event-type-mousedown
        //These default actions are thus not supported anymore.
        
      }.bind(obj));
      obj.container().element().addEventListener("click", function (e) {
        this.reset("");
        this.element().blur();
        //NOW IN RESET: this.hint().unshow(); //hide the containermenu, not with hide but with blur, because blur would usually happen in default mousedown behaviour
        e.halt(); // Question: my impression is that this click event handler is called after all the others and thus this should be absolutely no problem.
        // Are we sure there are no things that do not happen now thanks to this?

        //by default, click focuses its target. Maybe that is why e.halt() is necessary? (https://w3c.github.io/uievents/#event-type-click)
      }.bind(obj));

      // Focus on input field on hide
      obj.onHide = function () {
        const h = this._hint;
        h._inputField.element().focus();
        if (h.active() !== null) {
          if (h._alert.active) {
            h._unshowAlert();
          };
          h.active(null);
        };
      };

      return obj;
    },

    /**
     * The hint helper object,
     * the menu is attached to.
     */ 
    hint : function () {
      return this._hint;
    },

    /**
     * Reset the prefix, inputField and hide the menu. Called by hint/item.
     */
     reset : function (action) {
      this.prefix("");
      this.hint().inputField().insert(action).update();
      this.hint().unshow()
    },
  };
});

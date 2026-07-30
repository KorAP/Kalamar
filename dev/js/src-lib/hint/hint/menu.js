/**
 * Hint menu
 */

import containerMenuClass from '../../containermenu/containermenu.js';
import itemClass from './item.js';
import prefixClass from './prefix.js';
import lengthFieldClass from './lengthField.js';

export default class HintMenu extends containerMenuClass {
    
    /**
     * Create new hint helper menu.
     */
    constructor (hint, context, params) {
      super(params, {
        itemClass : itemClass,
        prefixClass : prefixClass,
        lengthFieldClass : lengthFieldClass});
      this._context = context;
      this._el.classList.add('hint');
      this._hint = hint;

      // Make the top item always active
      this._firstActive = true;

      this.element().addEventListener('blur', function (e) {
        this.menu.hide(); // WithoutDestruction();
      });
      // Fix the containeritems not being clickable. Add this to the containers element.
      this.container().element().addEventListener("mousedown", function (e) {
        // see https://stackoverflow.com/questions/10652852/jquery-fire-click-before-blur-event
        e.preventDefault();
        // It used to be, that clicking on a item within the container (see container.js) would cause the container to gain focus
        // thanks to mousedown default behaviour, which would mean the actual menu (ul menu roll containermenu hint) would not be in focus (I think? containermenu ul is its child
        // afterall?). This would cause blur to be called, which (see hint/menu.js) would hide the current menu and its container, causing click to target a location
        // the containeritem USED to be.
        //https://w3c.github.io/uievents/#event-type-mousedown
        //These default actions are thus not supported anymore.
        
      }.bind(this));
      this.container().element().addEventListener("click", function (e) {
        this.reset("");
        this.element().blur();
        //NOW IN RESET: this.hint().unshow(); //hide the containermenu, not with hide but with blur, because blur would usually happen in default mousedown behaviour
        e.halt(); // Question: my impression is that this click event handler is called after all the others and thus this should be absolutely no problem.
        // Are we sure there are no things that do not happen now thanks to this?

        //by default, click focuses its target. Maybe that is why e.halt() is necessary? (https://w3c.github.io/uievents/#event-type-click)
      }.bind(this));

      // Focus on input field on hide
      this.onHide = function () {
        const h = this._hint;
        h._inputField.element().focus();
        if (h.active() !== null) {
          if (h._alert.active) {
            h._unshowAlert();
          };
          h.active(null);
        };
      };
    }

    /**
     * The hint helper object,
     * the menu is attached to.
     */ 
    hint () {
      return this._hint;
    }

    /**
     * Reset the prefix, inputField and hide the menu. Called by hint/item.
     */
     reset (action) {
      this.prefix("");
      this.hint().inputField().insert(action).update();
      this.hint().unshow()
    }
}

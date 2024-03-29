/**
 * Menu with a container for always visible non scrollable items (can also be made invisible)
 * Automatically moves the prefix into the container. See containeritem.js for an API of functions
 * a container will call on containeritem.
 * 
 * @author Leo Repp, with reused code by Nils Diewald
 */

"use strict";
define([
  'menu',
  'container/container',
  'util'
], function (defaultMenuClass,
            defaultContainerClass) {

  return {
    /**
     * Create new Container Menu based on the action prefix
     * and a list of menu items.
     *
     * Accepts an associative array containg the elements
     * itemClass, prefixClass, lengthFieldClass, containerClass, containerItemClass
     *
     * @this {Menu}
     * @constructor
     * @param {string} params Context prefix
     * @param {Array.<Array.<string>>} list List of menu items
     * @param {Array.<Array.<containerItem>>} containerList List of container items
     */
    create : function (list, params, containerList) {
      const obj = defaultMenuClass.create(list, params)
          .upgradeTo(this)
          ._init(list, params);
      
      obj._el.classList.add('containermenu');

      //add container object and allow for own containerClasses
      if (params!==undefined && params["containerClass"] !== undefined) {
        obj._container = params["containerClass"].create(containerList, params);
      } else {
        obj._container = defaultContainerClass.create(containerList, params);
      }
      obj.container().addMenu(obj); //this is your menu, container!

      // add entry to HTML element
      obj._el.appendChild(obj.container().element());
      obj._el.removeChild(obj._prefix.element()); //different HTML element relationship required
      //Keep prefix as 'pref' style. The additional distance is fine.
      obj.container().addPrefix(obj._prefix); //creates containeritem as base for prefix that then is upgraded to prefix. Also ajust _menu chains.
      return obj;
    },

    /**
     * Destroy this menu
     * (in case you don't trust the
     * mark and sweep GC)!
     */
    destroy : function () {
      // Upon change also update alwaysmenu.js please
      const t = this;

      // Remove circular reference to "this" in menu
      if (t._el != undefined)
        delete t._el["menu"]; 

      // Remove circular reference to "this" in items
      t._items.forEach(function(i) {
        delete i["_menu"];
      });

      // Remove circular reference to "this" in prefix
      delete t._prefix['_menu'];
      delete t._lengthField['_menu'];
      delete t._slider['_menu'];
      t.container().destroy();
      delete t.container()['_menu'];
    },

    // Arrow key and container treatment
    _keydown : function (e) {
      const t = this;

      switch (_codeFromEvent(e)) {

      case 27: // 'Esc'
        e.halt();
        t.hide();
        break;

      case 38: // 'Up'
        e.halt();
        t.prev();
        break;

      case 33: // 'Page up'
        e.halt();
        t.pageUp();
        break;

      case 40: // 'Down'
        e.halt();
        t.next();
        break;

      case 34: // 'Page down'
        e.halt();
        t.pageDown();
        break;

      case 39: // 'Right'
        if (t.container().active()){
          t.container().further();
          e.halt();
          break;
        }

        const item = t.liveItem(t.position);
        
        if (item["further"] !== undefined) {
          item["further"].bind(item).apply();
        };
        
        e.halt();
        break;

      case 13: // 'Enter'
        // Click on prefix
        if (t.container().active()){
          t.container().enter(e);
          //NEW: reset some things. These are reset for hint menu style items
          // so I believe we need to do the same when pressing on items in the container
          //t.reset("");
          //t.hide();
          //t.hint().unshow(); Moved this line into hint/menu.js because it is hint containermenu specific!
          //for clicking this is done in container.js with an eventListener for click.
        } else { // Click on item
          t.liveItem(t.position).onclick(e);
          //Above is already done: see file dev/js/src/hint/item.js

        };
        e.halt();
        break;

      case 8: // 'Backspace'
        t.container().chop();
        t.show();
        e.halt();
        break;
      };
    },


    // Add characters to prefix and other interested items
    _keypress : function (e) {
      if (e.charCode !== 0) {
        e.halt();
        
        // Add prefix and other interested items
        this.container().add(
          String.fromCharCode(_codeFromEvent(e))
        );

        this.show();
      };
    },


    /**
     * Filter the list and make it visible.
     * This is always called once the prefix changes.
     *
     * @param {string} Prefix for filtering the list
     */
    show : function (active) {
      const t = this;

      // show menu based on initial offset
      t._unmark();     // Unmark everything that was marked before
      t.removeItems();
      t.container().exit();

      // Initialize the list
      if (!t._initList()) {

        // The prefix is not active
        //t._prefix.active(true);
        t.container().makeActive(); //Incase the own
        // list becomes empty we need to make container active for handling ENTER keypress to work

        // finally show the element
        t._el.classList.add('visible');
        t.container()._el.classList.add('visible');

        return true;
      };

      let offset = 0;

      // Set a chosen value to active and move the viewport
      if (arguments.length === 1) {

        // Normalize active value
        if (active < 0) {
          active = 0;
        }
        else if (active >= t.liveLength()) {
          active = t.liveLength() - 1;
        };

        // Item is outside the first viewport
        if (active >= t._limit) {
          offset = active;
          const newOffset = t.liveLength() - t._limit;
          if (offset > newOffset) {
            offset = newOffset;
          };
        };
        
        t.position = active;
      }

      // Choose the first item
      else if (t._firstActive) {
        t.position = 0;
      }

      // Choose no item
      else {
        t.position = -1;
      };

      t.offset = offset;
      t._showItems(offset); // Show new item list

      // Make chosen value active
      if (t.position !== -1) {
        t.liveItem(t.position).active(true);
      };

      // The prefix is not active
      t._prefix.active(false);

      // finally show the element
      t._el.classList.add('visible');
      t.container()._el.classList.add('visible');

      // Add classes for rolling menus
      t._boundary(true);

      return true;
    },


    /**
     * Hide the menu and call the onHide callback.
     */
    hide : function () { //only one new line
      if (!this.dontHide) {
        this.removeItems();
        this._prefix.clear();
        this.onHide();
        this._el.classList.remove('visible');
        this.container()._el.classList.remove('visible'); //NEW //apparently not necessary
      }
      // this._el.blur();
    },


    
    /**
     * Make the next item in the filtered menu active
     */
    next : function () {
      const t = this;
      var notInContainerAnyMore;
      const c = t.container();
      const cLLength = c.liveLength();
      // No list
      if (t.liveLength()===0){
        if (cLLength === 0) return;
        notInContainerAnyMore = c.next();
        if (notInContainerAnyMore) {
          c.next();
        }
        return;
      };
      if (!c.active() && t.position!==-1) {t.liveItem(t.position).active(false);} //this should be enough to ensure a valid t.position
      if (!c.active()){
        t.position++;
      };
      let newItem = t.liveItem(t.position); //progress
      if (newItem === undefined) { //too far
        t.position = -1;
        if (cLLength !== 0){ //actually makes sense to next
          notInContainerAnyMore = t.container().next(); //activate container
          if (notInContainerAnyMore) { //oh, next one (should not happen, because cLLength is now liveLength)
            t.position = 0;
            t._showItems(0);
            newItem=t.liveItem(0);
          };
        } else {
          t.position = 0;
          t._showItems(0);
          newItem=t.liveItem(0);
        };
      }// The next element is after the viewport - roll down
      else if (t.position >= (t.limit() + t.offset)) {
        t.screen(t.position - t.limit() + 1);
      }
      // The next element is before the viewport - roll up
      else if (t.position <= t.offset) {
        t.screen(t.position);
      }
      if (newItem !== undefined) {
        newItem.active(true);
      };
    },


    /**
     * Make the previous item in the menu active
     */
    prev : function () {
      const t = this;
      var notInContainerAnyMore;
      const c = t.container();
      const cLLength = c.liveLength();

      // No list
      if (t.liveLength() === 0) {
        if (cLLength === 0) return;
        notInContainerAnyMore = c.prev();
        if (notInContainerAnyMore) {
          c.prev();
        }
        return;
      }
      if (!c.active() && t.position!==-1) {t.liveItem(t.position).active(false);}//this should be enough to ensure a valid t.position
      if (!c.active()){
        t.position--;
      };
      let newItem = t.liveItem(t.position); //progress
      if (newItem === undefined) { //too far
        t.position = -1;
        let offset =  t.liveLength() - t.limit();
        // Normalize offset
        offset = offset < 0 ? 0 : offset;
        if (cLLength !== 0){ //actually makes sense to next
          notInContainerAnyMore = t.container().prev(); //activate container
          if (notInContainerAnyMore) { //oh, next one (should not happen, because cLLength is now liveLength)
            t.position = t.liveLength() - 1;
            newItem = t.liveItem(t.position);
            t._showItems(offset);
          } else {
            t.offset = offset;
          };
        } else {
          t.position = t.liveLength() - 1;
          newItem = t.liveItem(t.position);
          t._showItems(offset);
        }
      }
      // The previous element is before the view - roll up
      else if (t.position < t.offset) {
        t.screen(t.position);
      }

      // The previous element is after the view - roll down
      else if (t.position >= (t.limit() + t.offset)) {
        t.screen(t.position - t.limit() + 2);
      };
      if (newItem !== undefined) {
        newItem.active(true);
      };
    },

    /**
     * Get the container object
     */
    container : function () {
      return this._container;
    }


  };
});

/**
 * 
 * A Version of the menu class, that
 * has an always displayed entry that can be
 * clicked and contains text
 * 
 * This entry button may or may not be displayed on top of objects
 * lying under (>y) this menu. See alwaysentry update: negative absolute 
 * y coordinate.
 * 
 * @author Leo Repp
 */

"use strict";
define([
  'menu',
  'menu/item',
  'menu/prefix',
  'menu/lengthField',
  'alwaysentry',
  'util'
], function (
    menuClass,
    defaultItemClass,
    defaultPrefixClass,
    defaultLengthFieldClass,
    defaultAlwaysEntryClass) {

    return {

    /**
     * Create new menu with an always visible entry.
     * @this {AlwaysMenu}
     * @constructor
     * @param {Object["like this"]} params Object with attributes prefixCLass, itemClass, lengthFieldClass, alwaysEntryClass
     * @param {Array.<Array.<string>>} list list of menu items
     */
    create : function (list, params) {
      const obj = menuClass.create(list,params)
          .upgradeTo(this)
          ._init(list, params);
      
      obj._el.classList.add('alwaysmenu');

      //add entry object and allow for own entryClasses
      if (params!==undefined && params["alwaysEntryClass"] !== undefined) {
        obj._entry = params["alwaysEntryClass"].create();
      } else {
        obj._entry=defaultAlwaysEntryClass.create();
      }
      obj._entry._menu=obj;
      obj._notItemElements=4;
      // add entry to HTML element
      obj._el.appendChild(obj._entry.element());

      return obj;
    },


    /**
     * Destroy this menu
     * (in case you don't trust the
     * mark and sweep GC)!
     */
    destroy : function () {
       //based on menu.js
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
      delete t._entry['_menu'];
    },


    // Arrow key and prefix treatment
    _keydown : function (e) {
      //based on menu.js
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
        // "Use" this item
        if (t._prefix.active())
          break;

        
        else if (t._entry.active()){
          break; 
        }; 

        const item = t.liveItem(t.position);
        
        if (item["further"] !== undefined) {
          item["further"].bind(item).apply();
        };
        
        e.halt();
        break;

      case 13: // 'Enter'
        // Click on prefix
        if (t._prefix.active())
          t._prefix.onclick(e);
        //Click on entry
        else if (t._entry.active())
          t._entry.onclick(e);
        // Click on item
        else
          t.liveItem(t.position).onclick(e);
        e.halt();
        break;

      case 8: // 'Backspace'
        t._prefix.chop();
        t._entry.chop();
        t.show();
        e.halt();
        break;
      };
    },

    // Add characters to prefix
    _keypress : function (e) {
      if (e.charCode !== 0) {
        e.halt();
        
        // Add prefix
        this._prefix.add(
          String.fromCharCode(_codeFromEvent(e))
        );
        this._entry.add(
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
       //only two new lines compared to menu.js show method (see NEW LINE)
      const t = this;

      // show menu based on initial offset
      t._unmark();     // Unmark everything that was marked before
      t.removeItems();

      // Initialize the list
      if (!t._initList()) {

        // The prefix is not active
        t._prefix.active(true);
        //FIRST NEW LINE
        t._entry.active(false);

        // finally show the element
        t._el.classList.add('visible');
        
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
      //SECOND NEW LINE
      t._entry.active(false);

      // finally show the element
      t._el.classList.add('visible');

      // Add classes for rolling menus
      t._boundary(true);

      return true;
    },

    /**
     * Hide the menu and call the onHide callback.
     */
    hide : function () {
      if (!this.dontHide) {
        this.removeItems();
        this._prefix.clear();
        this._entry.clear();
        this.onHide();
        this._el.classList.remove('visible');
      }
      // this._el.blur();
    },


    /**
     * The alwaysEntry object
     * the menu is attached to.
     */ 
    alwaysEntry : function () {
      return this._entry;
    },

    /**
   * Get/Set the alwaysEntry Text
   */
    alwaysEntryValue : function (value) {
      if (arguments.length === 1) {
        this._entry.value(value);
        return this;
      };
      return this._entry.value();
    },

    /**
     * Delete all visible items from the menu element
     */

    /**
     * Make the next item in the filtered menu active
     */
    next : function () {
      //Hohe zyklomatische Komplexität
      const t = this;
      // Activate prefix and entry
      const prefix = this._prefix;
      const entry = this._entry;

      // No list
      if (t.liveLength() === 0){ //switch between entry and prefix
        if (!prefix.isSet()){//It is entry and it will stay entry
          entry.active(true);
          prefix.active(false);//Question: do we need to activate entry?
          return; 
        };
        if (prefix.active() && !entry.active()){
          t.position = 2; // ?
          prefix.active(false);
          entry.active(true); //activate entry
          return;
        }
        else if (!prefix.active() && entry.active()){
          t.position = 1; // ?
          prefix.active(true); //activate prefix
          entry.active(false);
          return;
        };
        //otherwise: confusion
        return;
      };
        
      // liveLength!=0
      // Deactivate old item
      if (t.position !== -1 && !t._prefix.active() && !t._entry.active()) {
        t.liveItem(t.position).active(false);
      };

      // Get new active item
      t.position++;
      let newItem = t.liveItem(t.position);

      // The next element is undefined - roll to top or to prefix or to entry
      if (newItem === undefined) {

        if ( !entry.active() ){ //if entry is active we definetly go to first item next
          if (prefix.isSet() && !prefix.active()){ //prefix is next and exists
            t.position=t.liveLength()+1;
            prefix.active(true); //activate prefix
            entry.active(false);
            return;
          }
          else if ( (prefix.isSet() && prefix.active()) || // we had prefix
                    (!prefix.isSet() && !prefix.active()) ){ //or it isnt there
            t.position=t.liveLength()+2; 
            prefix.active(false);
            entry.active(true); //activate entry
            return;
          };
        }

        // Choose first item
        else {
          newItem = t.liveItem(0);
          // choose first item
          t.position = 0;
          t._showItems(0);
          // we reach point A from here
        };
      }

      // The next element is after the viewport - roll down
      else if (t.position >= (t.limit() + t.offset)) {
        t.screen(t.position - t.limit() + 1);
      }

      // The next element is before the viewport - roll up
      else if (t.position <= t.offset) {
        t.screen(t.position);
      };

      //Point A
      t._prefix.active(false);
      t._entry.active(false);
      newItem.active(true);
    },


    /*
     * Make the previous item in the menu active
     */
    prev : function () {
      const t = this;
      // Activate prefix and entry
      const prefix = this._prefix;
      const entry = this._entry;

      // No list
      if (t.liveLength() === 0){ //switch between entry and prefix
        if (!prefix.isSet()){//It is entry and it will stay entry
          entry.active(true);
          prefix.active(false);//Question: do we need to activate entry?
          return; 
        };
        
        if (prefix.active() && !entry.active()){
          t.position = 2; // ?
          prefix.active(false);
          entry.active(true); //activate entry
          return;
        }
        else if (!prefix.active() && entry.active()){
          t.position = 1; // ?
          prefix.active(true); //activate prefix
          entry.active(false);
          return;
        };
        //otherwise: confusion
      };

      // Deactivate old item
      if (!prefix.active() && !entry.active()) {

        // No active element set
        if (t.position === -1) {
          t.position = t.liveLength();
        }

        // deactivate active element
        else {
          t.liveItem(t.position--).active(false); //returns before decrement
        };
      };

      // Get new active item
      let newItem = t.liveItem(t.position);

      // The previous element is undefined - roll to bottom
      if (newItem === undefined) {

        
        let offset =  t.liveLength() - t.limit();
        
        // Normalize offset
        offset = offset < 0 ? 0 : offset;

        // Choose the last item
        t.position = t.liveLength() - 1;
        
        if(!entry.active()){
          if (prefix.isSet() && prefix.active()){
            // we were on prefix and now choose last item
            newItem = t.liveItem(t.position);
            t._showItems(offset);
          }
          else if(!prefix.active()){
            // we need to loop around: pick entry
            t.position=t.liveLength()+2; 
            prefix.active(false);
            entry.active(true); //activate entry
            return;
          };
          //otherwise confusion
        } else {
          if(prefix.isSet()){ // we had entry and thus now need prefix
            t.position=t.liveLength()+1;
            prefix.active(true); //activate prefix
            entry.active(false);
            return;
          } else { // we had entry but there is no prefix
            newItem = t.liveItem(t.position);
            t._showItems(offset); // Choose last item
          };      
        };
      }

      // The previous element is before the view - roll up
      else if (t.position < t.offset) {
        t.screen(t.position);
      }

      // The previous element is after the view - roll down
      else if (t.position >= (t.limit() + t.offset)) {
        t.screen(t.position - t.limit() + 2);
      };

      t._prefix.active(false);
      t._entry.active(false);
      newItem.active(true);
    },
// Append Items that should be shown
_showItems : function (off) {
  const t = this;

  // optimization: scroll down one step
  if (t.offset === (off - 1)) {
    t.offset = off;

    // Remove the HTML node from the first item
    // leave lengthField/prefix/slider
    t._el.removeChild(t._el.children[this._notItemElements]);

    t._append(
      t._list[t.offset + t.limit() - 1]
    );
  }

  // optimization: scroll up one step
  else if (t.offset === (off + 1)) {
    t.offset = off;

    // Remove the HTML node from the last item
    t._el.removeChild(t._el.lastChild);

    t._prepend(t._list[t.offset]);
  }

  else {
    t.offset = off;

    // Remove all items
    t.removeItems();

    // Use list
    let shown = 0;

    for (let i = 0; i < t._list.length; i++) {

      // Don't show - it's before offset
      shown++;
      if (shown <= off)
        continue;

      t._append(t._list[i]);
      
      if (shown >= (t.limit() + off))
        break;
    };
  };

  // set the slider to the new offset
  t._slider.offset(t.offset);
},


  };
});

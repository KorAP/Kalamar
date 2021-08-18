/**
 * Container for several containerItem style items. Functions like a mini menu with next, prev, add etc propagation,
 * but no event handling or slider or lengthField. Supposed to be subelement to a (container)menu class item.
 * 
 * @author Leo Repp
 */

"use strict";
define([
  'container/containeritem'
], function (
  defaultContainerItemClass
) {

  return {
    /**
    * 
    * @param {Array<object>} listOfContainerItems List of items that will be placed within the container and that realise some of the functions supplied in containeritem.js
    * @param {object} params May contain attribute containerItemClass for a base class all containerItems build upon
    * @returns The container object
    */
    create : function (listOfContainerItems, params) {
      var obj = Object.create(this);
      obj._init(listOfContainerItems, params);
      return obj;
    },

    _init : function (listOfContainerItems, params){
      if (params !== undefined && params["containerItemClass"] !== undefined){
        this._containerItemClass = params["containerItemClass"];
      } else {
        this._containerItemClass = defaultContainerItemClass;
      };
      this._el = document.createElement("ul");
      this._el.style.outline = 0;
      this._el.setAttribute('tabindex', 0);
      this._el.classList.add('menu', 'container'); //container class allows for more stylesheet changes
      this._el.addEventListener("mousedown", function (e) {
        // see https://stackoverflow.com/questions/10652852/jquery-fire-click-before-blur-event
        e.preventDefault();
        // It used to be, that clicking on a item within the container (see container.js) would cause the container to gain focus
        // thanks to mousedown default behaviour, which would mean the actual menu (ul menu roll containermenu hint) would not be in focus (I think? containermenu ul is its child
        // afterall?). This would cause blur to be called, which (see hint/menu.js) would hide the current menu and its container, causing click to target a location
        // the containeritem USED to be.
        
      }.bind(this));
      this._el.addEventListener("click", function (e) {
        this._menu.prefix("");
        this._menu.hint().inputField().insert("").update();
        this._menu.element().blur();
        this._menu.hint().show(false); //hide the containermenu, not with hide but with blur, because blur would usually happen in default mousedown behaviour
      }.bind(this));

      this.items = new Array();
      //items are stored in the order they are added in. This includes the prefix.
      if (listOfContainerItems !== undefined) {
        for (let item of listOfContainerItems) {
          this.addItem(item);
        }
      }

      this.position = undefined; //undefined = not in container,
      // 0 to length-1 = in container

      this._prefixPosition = undefined; //Required so that switching
      // to prefix by default is supported

      this._menu = undefined // add later


      
      //t._el.classList.add('visible'); //Done by containermenu
    },

    /**
     * Adds a static item to this container by creating a standard containerItem as specified when this container was created,
     * then upgrading it to the item passed to this function, and calling element() and content(). For a full list of supported functions see
     * containeritem.js .
     * Example:
     * 
     * menu.container().addItem(
     *  {defaultTextValue : "dynamic", onClick : function (e) { ... }
     * )
     * 
     *  For a full demo see containermenudemo.js.
     * 
     * @param {Object} item An object with any number of functions like in containeritem.js or an attribute defaultTextValue,
     * as well as any number of own properties.
     * @returns the new use-ready containerItem
     */
    addItem : function (item) {
      //Call Order: First _containerItemClass is created and then upgraded To whatever object is passed to this function
      //Then container calls first element() and then container()
      var cItem = this._containerItemClass.create().upgradeTo(item);
      cItem._menu = this._menu; //if not set then undefined, but thats OK
      this.items.push(cItem);
      if (this._cItemPrefix !== undefined){ //this must be dynamic adding of CIs, move prefix to the back
        this.items.splice(this.items.indexOf(this._cItemPrefix) , 1); //remove cItemPrefix
        this.items.push(this._cItemPrefix); //and move it to the end;
      };
      this._el.appendChild(cItem.element());
      cItem.content(); // create its textNode
      return cItem;
    },

    addMenu : function (menu) {
      this._menu = menu;
      if (this._cItemPrefix !== undefined) {
        this._menu._prefix = this._cItemPrefix; // better than going via classList or something
      };
      for (let item of this.items) {
        item._menu=menu;
      }
    },

    addPrefix : function (prefix) {
      prefix.isSelectable =  function () {
        return this.isSet(); //TODO check!
      }
      this._prefixPosition = this.items.length;
      prefix.content = function (t) {}; //Does not need a textNode Child!
      var prefItem = this.addItem(prefix);
      this._cItemPrefix = prefItem;
      prefItem._el["onclick"] = prefItem.onclick.bind(prefItem);
      if (this._menu !== undefined){
        this._menu._prefix=prefItem;
      }
    },
    
    //Taken from Branch 5133
    /**
    * Remove a containeritem from the container by identity. Should not be used with prefix.
    * If the active item is removed, this calls menu.next().
    * @param {containerItemClass} item The item to be removed.
    */
    removeItem : function (item) {
      if (this.items.indexOf(item) === -1){ // This is returned if indexOf cannot find the item.
        KorAP.log(0,"Invalid item in containers removeItemByIndex: This containerItem is not contained", "container.js");
        return;
      };
      if (item === this._cItemPrefix) {//CHANGE TO _cItemPrefix later!!!
        KorAP.log(0,"Tried to remove the prefix item by calling removeItem. Please cut all connections from the menu to prefix and then\
 the connection container._cItemPrefix before calling this function if you really want to remove the prefix.","container.js");
        return;
      };
      if (item.active()) {
        this._menu.next();
      };
      item._menu=undefined;
      this._el.removeChild(item.element());
      this.items.splice(this.items.indexOf(item) , 1);
    },

    /**
     * Remove a containeritem from the container by its index. Should not be used with prefix.
     * CAUTION liveIndex, so what you see, is not the actual index within the containerItem list.
     * This can be accessed with container.items . If the active item is removed, this calls menu.next().
     * @param {Int} index The index of the item to be removed.
     */
    removeItemByIndex : function (index) {
      if (index < 0 || index >= this.length()){
        KorAP.log(0,"Invalid index in containers removeItemByIndex: "+index, "container.js");
        return;
      };
      this.removeItem(this.items[index]); //CAUTION liveIndex (what you see) != index within the list!
    },

    /**
    * Exit the container unconditionally. Required so that active returns the
    * correct result. Called when the prefix or similar resets the currently visual
    * field.
    */
    exit : function () {
      if (this.position !== undefined) {
        this.item().active(false);
        this.position = undefined;
      };
    },

    element : function () {
      return this._el;
    },

    destroy : function () {
      for (let item of this.items){
        delete item['_menu'];
      }
    },

    /**
    * @returns whether an item within the container is active (by checking this.position)
    */
    active : function () {
      return this.position !== undefined;
    },

    /**
    * Getter for items
    * @param {Integer} index [optional] Index of to select item. If left blank this.position.
    * @returns item at location index
    */
    item : function (index) {
      if (index === undefined) return this.items[this.position];
      return this.items[index];
    },

    /**
     * 
     * Make the container active without having called prev or next.
     * Occurs whenever the prefix makes the
     * menus list empty while we had it selected.
     * This potentially requires adjusting this.position.
     */
    makeActive : function () {
      if (this.position === undefined) {
        if (this._cItemPrefix.isSelectable()) {
          this.position = this._prefixPosition; //make prefix active if it exists
          this.item().active(true);
        } else if (this.liveLength() > 0) {
          this.position = 0;
          this._cItemPrefix.active(false); // usually the menu makes the prefix active anyway.
          this.item().active(true);
        }
      }
    },
    
    /**
     * 
    * Move on to the next item in container. Returns true if we then leave the container, false otherwise.
    */
    next : function() {
      if (this.position !== undefined){
        this.item().active(false);
        this.position++;
      } else {
        this.position = 0;
      };
      if (this.position >= this.length()) {
        this.position=undefined;
        return true;
      };
      while (!this.item().isSelectable()) {
        this.position++;
        if (this.position >= this.length()) {
          this.position=undefined;
          return true;
        }
      };
      this.item().active(true);
      return false;
    },

    /**
    * Move on to the previous item in container. Returns true if we then leave the container, false otherwise.
    */
    prev : function() {
      if (this.position !== undefined){
        this.item().active(false);
        this.position = (this.position-1)
      } else {
        this.position = (this.items.length-1);
      }
      if (this.position<0) {
        this.position=undefined;
        return true;
      }
      while (!this.item().isSelectable()) {
        this.position--;
        if (this.position<0){
          this.position=undefined;
          return true;
        };
      };
      this.item().active(true);
      return false;
    },

    further : function () {
      const item = this.item();
      if (item["further"] !== undefined) {
        item["further"].bind(item).apply();
      };
    },

    enter : function (event) {
      this.item().onclick(event);
    },

    chop : function () {
      for (let item of this.items) {
        item.chop();
      }
    },

    add : function (letter) {
      for (let item of this.items) {
        item.add(letter);
      }
    },

    length : function () {
      return this.items.length;
    },

    /**
    * 
    * @returns The number of items that are selectable. Is the actual length of the list.
    */
    liveLength : function () {
      var ll = 0;
      for (let item of this.items){
        if (item.isSelectable()){
          ll++;
        }
      }
      return ll;
    }

};
});

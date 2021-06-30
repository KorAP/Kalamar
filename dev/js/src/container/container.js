

"use strict";
define([
  'containeritem'
], function (defaultContainerItemClass) {

  return {
    create : function (listOfContainerItems, params) {
      return Object.create(this)._init(listOfContainerItems, params)
    },

    _init : function (listOfContainerItems, params){
      if (params !== undefined && params["containerItemClass"] !== undefined){
        this._containerItemClass = params["containerItemClass"];
      } else {
        this._containerItemClass = defaultContainerItemClass;
      };
      var el = document.createElement("ul");
      el.style.outline = 0;
      el.setAttribute('tabindex', 0);
      el.classList.add('menu', 'roll'); //?

      this._el = el;

      this.items = new Array();
      for (let item of listOfContainerItems) {
        this.addItem(item);
      }

      this.position = undefined; //undefined = not in container, 0 to length-1 in container

      
      //t._el.classList.add('visible'); //lets see


    },

    addItem : function (item) {
      var cItem = this._containerItemClass.create().upgradeTo(item);
      cItem._menu = this._menu; //if not set then undefined, but thats OK
      this.items.push(cItem);
      this._el.appendChild(cItem.element());
    },

    addMenu : function (menu) {
      this._menu = menu;
      for (let item of this.items) {
        item._menu=menu;
      }
    },

    addPrefix : function (prefix) {
      prefix.isSelectable =  function () {
        return prefix.isSet(); //TODO check!
      }
      this.addItem(prefix); //Do I need something different?
    },

    element : function () {
      return this._el;
    },

    destroy : function () {
      for (let item of this.items){
        delete item['menu'];
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
     * Move on to the next item in container. Returns true if we then leave the container, false otherwise.
     */
    next : function() {
      if (this.position !== undefined){
        this.item().active(false);
      }
      this.position = this.position++ || 0;
      while( !this.item().isSelectable() ){
        this.position++;
        if (this.position>=this.length()){
          this.position=undefined;
          return true;
        }
      }
      this.item().active(true);
      return false;
    },

    /**
     * Move on to the previous item in container. Returns true if we then leave the container, false otherwise.
     */
    prev : function() {
      if (this.position !== undefined){
        this.item().active(false);
      }
      this.position = this.position-- || this.items.length-1;
      while( !this.item().isSelectable() ){
        this.position--;
        if (this.position<0){
          this.position=undefined;
          return true;
        }
      }
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
      for (item of this.items){
        if (item.isSelectable()){
          ll++;
        }
      }
      return ll;
    }

};
});
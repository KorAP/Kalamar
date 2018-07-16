define(['buttongroup/menu','menu/item','util'], function (treeMenuClass, defaultItemClass) {
  "use strict";
  
  return {
    /**
     * Create button group
     */
    create : function (classes) {
      return Object.create(this)._init(classes);
    },
    
    // Initialize button group
    _init : function (classes) {
      var e = document.createElement('div');
      var cl = e.classList;
      if (classes) {
        cl.add.apply(cl,classes);
      };
      cl.add('button-group');
      this._element = e;
      return this;
    },

    
    /**
     * Return main element
     */
    element : function () {
      return this._element;
    },

    
    /**
     * Upgrade this object to another object,
     * while private data stays intact.
     *
     * @param {Object} An object with properties.
     */
    upgradeTo : function (props) {
      for (var prop in props) {
        this[prop] = props[prop];
      };
      return this;
    },

    
    /**
     * Add button in order
     *
     * Returns the button element
     */
    add : function (title, classes, cb) {
      var b = this._element.addE('span');
      b.setAttribute('title',title);
      if (classes !== undefined) {
        b.classList.add.apply(b.classList, classes);
      };
      b.addE('span').addT(title);

      var that = this;
      b.addEventListener('click', function (e) {

        // Do not bubble
        e.halt();
        
        // Call callback
        var obj = that._bind || this;
        obj.button = b;
        cb.apply(obj, e)
      });

      return b;
    },

    
    /**
     * Add button that spawns a list in order.
     *
     * Returns the list object.
     */
    addList : function (title, classes, itemClass = defaultItemClass) {
      var list = treeMenuClass.create([], itemClass);
      this.add(title, classes, function (e) {
        list.show();
        list.button(this.button);
        list.focus();
      });

      return list;
    },
    

    /**
     * Bind an object to all callbacks of the button group.
     * To get the button element inside the callback,
     * use this.button
     */
    bind : function (obj) {
      if (obj !== undefined) {
        this._bind = obj;
        return this;
      };
      return this._bind || this;
    },

    
    /**
     * Remove all defined buttons
     */
    clear : function () {
      _removeChildren(this._element);
      return this;
    }
  }
});

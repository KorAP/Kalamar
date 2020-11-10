"use strict";

define(['buttongroup/menu','menu/item','util'], function (treeMenuClass, defaultItemClass) {
  
  return {
    /**
     * Create button group
     */
    create : function (classes) {
      return Object.create(this)._init(classes);
    },
    
    // Initialize button group
    _init : function (classes) {
      const e = document.createElement('div');
      const cl = e.classList;
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
    add : function (title, data, cb) {
      
      const b = this._element.addE('span');
      b.setAttribute('title',title);

      if (data !== undefined) {
        if (data['cls'] !== undefined) {
          b.classList.add.apply(b.classList, data['cls']);
        };
     
        if (data['icon'] !== undefined) { 
          b.setAttribute('data-icon', data['icon']);
        };

        if (data['state'] !== undefined) {
          b['state'] = data['state'];
        }
      };
     
      b.addE('span').addT(title);

      let that = this;
      b.addEventListener('click', function (e) {

        // Do not bubble
        e.halt();
        
        // Call callback
        let obj = that._bind || this;
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
    addList : function (title, data, itemClass = defaultItemClass) {
      const list = treeMenuClass.create([], itemClass);
      this.add(title, data, function (e) {
        list.show();
        list.button(this.button);
        list.focus();
      });
      return list;
    },

    /**
     * Add button that can toggle a state.
     * The state has to be a state object.
     */
    addToggle : function (title, data, state) {
      const b = this._element.addE('span');
      b.setAttribute('title',title);

      if (data != undefined) {
        if (data['cls'] !== undefined) {
          b.classList.add.apply(
            b.classList,
            data['cls']
          );
        };
      };

      // Set check marker
      const check = b.addE('span');
      check.classList.add("check", "button-icon");
      check.addE('span');

      // Associate this object to state
      // Add setState method to object
      check.setState = function (value) {
        if (value) {
          this.classList.add("checked");
        } else {
          this.classList.remove("checked");
        }
      };
      state.associate(check);

      b.addE('span').addT(title);
      
      let that = this;
      b.addEventListener('click', function (e) {

        // Do not bubble
        e.halt();
        
        // Toggle state
        state.roll();
      });

      return b;
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

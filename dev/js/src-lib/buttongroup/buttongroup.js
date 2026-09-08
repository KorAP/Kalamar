import treeMenuClass from './buttongroup/menu.js';
import defaultItemClass from '../menu/menu/item.js';
import '../util/util.js';
  
class ButtonGroup {

    /**
     * Create button group
     */
    constructor (classes) {
      this._init(classes);
    }

    /**
     * Initialize button group
     */
    _init (classes) {
      const e = document.createElement('div');
      const cl = e.classList;
      if (classes) {
        cl.add.apply(cl,classes);
        classes.forEach(i => {
          switch (i) {
          case "open-menu-below" : {
            this._omBelow = true;
            break;
          }
          case "open-menu-outside" : {
            this._omOutside = true;
            break;
          }
          case "open-menu-left" : {
            this._omLeft = true;
          }
          }
        })
      };
      cl.add('button-group');
      this._el = e;
      return this;
    }

    /**
     * Adopt existing button group element
     */
    static adopt (element) {
      const obj = new this();
      obj._el = element;
      return obj;
    }
    
    /**
     * Return main element
     */
    element () {
      return this._el;
    }

    /**
     * Define element following newly added buttons.
     */
    anchor (anchor) {
      if (anchor !== null && anchor.parentNode == this._el) {
        this._anchor = anchor;
        return true;
      };
      return false;
    }
    

    _insert (tag = 'span') {
      const span = document.createElement(tag);
      if (this._anchor) {
        this._el.insertBefore(span, this._anchor);
        return span;
      }
      return this._el.appendChild(span);
    }
    
    /**
     * Add button in order
     * 
     * Returns the button element
     */
    add (title, data, cb) {
      const b = this._insert('span');
      let desc = title;

      let that = this;
      if (data !== undefined) {
        if (data['cls'] !== undefined) {
          b.classList.add.apply(b.classList, data['cls']);
        };
     
        if (data['icon'] !== undefined) { 
          b.setAttribute('data-icon', data['icon']);
        };

        if (data['state'] !== undefined) {
          b['state'] = data['state'];
        };

        if (data['active'] !== undefined) {
          let active = data['active'];
          b['active'] = active;

      	  let check = _addCheck(b,active);
	        check.addEventListener('click', function (e) {
	          // Do not bubble
	          e.halt();
            // Toggle state
	          active.roll();

            let obj = that._bind || this;
            obj.button = b;
            b._activeClick = true;
            cb.apply(obj, e);
            b._activeClick = false;
	        });
        };

	
        if (data['desc'] !== undefined) {
          desc = data['desc'];
        };
      };

      b.setAttribute('title', desc);
      let innerSpan = document.createElement('span');
      b.appendChild(innerSpan);
      innerSpan.textContent = title;
      
      b["changeTitle"] = function (title) {
       	innerSpan.textContent = title;
      };
      
      b.addEventListener('click', function (e) {

        // Do not bubble
        e.halt();
        
        // Call callback
        let obj = that._bind || this;
        obj.button = b;
        cb.apply(obj, e)
      });

      return b;
    }

    
    /**
     * Add button that spawns a list in order.
     * 
     * Returns the list object.
     */
    addList (title, data, itemClass = defaultItemClass) {
      const list = new treeMenuClass([], itemClass);

      list.openAt(
        this._omLeft ? true : false,
        this._omBelow ? true : false,
        this._omOutside ? true : false,
      );
      
      let b = this.add(title, data, function (e) {
        list.show();
        list.button(this.button);
        list.focus();
      });
      b.list = list;
      return b;
    }

    /**
     * Add button that can toggle a state.
     * The state has to be a state object.
     */
    /*
     * addToggle() should be removed in favor of add(toggleObj)
     * or similar, so the API of buttongroups and lists is similar
     * for use as action plugins.
     */
    addToggle (title, data, state) {
      const b = this._insert('span');
      let desc = title;

      if (data != undefined) {
        if (data['cls'] !== undefined) {
          b.classList.add.apply(
            b.classList,
            data['cls']
          );
        };

        if (data['icon'] !== undefined) { 
          b.setAttribute('data-icon', data['icon']);
        };
        
        if (data['desc'] !== undefined) {
          desc = data['desc'];
        };
      };

      b.setAttribute('title',desc);

      _addCheck(b, state);

      b.addE('span').addT(title);
      
      let that = this;
      b.addEventListener('click', function (e) {

        // Do not bubble
        e.halt();
        
        // Toggle state
        state.roll();
      });

      return b;
    }

    /**
     * Bind an object to all callbacks of the button group. 
     * To get the button element inside the callback, 
     * use this.button
     */
    bind (obj) {
      if (obj !== undefined) {
        this._bind = obj;
        return this;
      };
      return this._bind || this;
    }

    
    /**
     * Remove all defined buttons
     */
    clear () {
      _removeChildren(this._el);
      return this;
    }
}

export default ButtonGroup;

function _removeChildren (node) {
  // Remove everything underneath
  while (node.firstChild)
    node.removeChild(node.firstChild);
};

function _addCheck(b,state) {
      
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
  return check;
};

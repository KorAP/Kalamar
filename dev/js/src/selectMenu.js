"use strict";

define(
  ['menu', 'selectMenu/item', 'util'],
  function (menuClass, selectMenuItemClass) {

    return {
      create : function (element) {

	      const select = element.getElementsByTagName('select')[0];

        if (select === null)
          return;

	      // Prepare list before object upgras
	      const list = [];

        // Iterate through options list
        // Get option item and add to list
        Array.from(
          select.getElementsByTagName('option')
        ).forEach(function(item) {
        
	        const opt = [
	          item.textContent,
	          item.getAttribute('value')
	        ];

          // If the item has an attribute - list
	        if (item.hasAttribute('desc'))
	          opt.push(item.getAttribute('desc'));

	        list.push(opt);
	      });

	      // Create object with list
	      const obj = Object.create(menuClass).upgradeTo(this)
	            ._init(
                list, {
	                itemClass : selectMenuItemClass
	              }
              );
        
	      obj._container = element;
	      obj._select = select;
	      select.style.display = 'none';

	      // Create title
	      obj._title = obj._container.addE('span');
	      obj._title.addT('');

        obj._container.appendChild(obj.element());

        // Show the menu
	      obj._container.addEventListener('click', obj.showSelected.bind(obj));

	      // Add index information to each item
	      obj._items.forEach((e,i) => e._index = i);

	      // This is only domspecific
	      obj.element().addEventListener('blur', function (e) {
	        this.menu.hide();
	        this.menu.showTitle();
	      });

	      // In case another tool changes
	      // the option via JS - this needs
	      // to be reflected!
	      select.addEventListener('change', function (e) {
	        this.showTitle();
	      }.bind(obj));

	      obj.showTitle();
	      return obj;
      },

      /**
       * Get or set the selection index
       */
      select : function (index) {
        const t = this;
	      if (arguments.length > 0) {
	        t._selected = index;
	        t._select.selectedIndex = index;
	      };

	      return t._selected || t._select.selectedIndex || 0;
      },


      /**
       * Set the select value
       */
      selectValue : function (vParam) {
        const t = this;
        const qlf = t._select.options;
        for (let i = 0; i < qlf.length; i++) {
	        if (qlf[i].value == vParam) {
            t.hide();
            t.select(i);
            t.showTitle();
            break;
	        };
        };
        return t;
      },
      

      /**
       * Show the select menu
       */
      showSelected : function () {
        const t = this;
	      t._title.style.display = 'none';
	      t.show(t._selected = t._select.selectedIndex);
	      t.focus();
      },


      /**
       * Show the title
       */
      showTitle : function () {

        // Get the selection context
        const t = this;
	      const s = t.select();
	      t._title.textContent = t.item(
	        t.select()
	      ).title();
	      t._title.style.display = 'inline';
      }
    }
  }
);

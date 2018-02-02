define(
  ['menu', 'selectMenu/item', 'util'],
  function (menuClass, selectMenuItemClass) {

    return {
      create : function (element) {

	      var select = element.getElementsByTagName('select')[0];

        if (select === null)
          return;

	      // Prepare list before object upgras
	      var list = [];
	      var options = select.getElementsByTagName('option');

        // Iterate through options list
	      for (var i = 0; i < options.length; i++) {

          // Get option item and add to list
	        var item = options.item(i);
	        var opt = [
	          item.textContent,
	          item.getAttribute('value')
	        ];

          // If the item has an attribute - list
	        if (item.hasAttribute('desc'))
	          opt.push(item.getAttribute('desc'));

	        list.push(opt);
	      };

	      // Create object with list
	      var obj = Object.create(menuClass).upgradeTo(this)
	          ._init(list, {
	            itemClass : selectMenuItemClass
	          });
        
	      obj._container = element;
	      obj._select = select;
	      obj._select.style.display = 'none';

	      // Create title
	      obj._title = obj._container.addE('span');
	      obj._title.addT('');
	      obj._container.appendChild(obj.element());

        // Show the menu
	      obj._container.addEventListener('click', obj.showSelected.bind(obj));

	      // Add index information to each item
	      for (i in obj._items) {
	        obj._items[i]._index = i;
	      };

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
	      if (arguments.length > 0) {
	        this._selected = index;
	        this._select.selectedIndex = index;
	      };

	      return this._selected || this._select.selectedIndex || 0;
      },


      /**
       * Set the select value
       */
      selectValue : function (vParam) {
        var qlf = this._select.options;
        var i;
        for (i in qlf) {
	        if (qlf[i].value == vParam) {
            this.hide();
            this.select(i);
            this.showTitle();
            break;
	        };
        };
        return this;
      },
      
      /**
       * Show the select menu
       */
      showSelected : function () {
	      this._title.style.display = 'none';
	      this._selected = this._select.selectedIndex;
	      this.show(this._selected);
	      this.focus();
      },

      /**
       * Show the title
       */
      showTitle : function () {

        // Get the selection context
	      var s = this.select();
	      this._title.textContent = this.item(
	        this.select()
	      ).title();
	      this._title.style.display = 'inline';
      }
    }
  }
);

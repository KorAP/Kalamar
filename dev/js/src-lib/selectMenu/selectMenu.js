import menuClass from '../menu/menu.js';
import selectMenuItemClass from './selectMenu/item.js';
import '../util/util.js';

export default class SelectMenu extends menuClass {
      constructor(element) {

	      const select = element.getElementsByTagName('select')[0];
	      const list = [];

	      if (select !== null) {

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
	      };

	      super(list, {
	              itemClass : selectMenuItemClass
	            });

        if (select === null)
          return;
        
	      this._container = element;
	      this._select = select;
	      select.style.display = 'none';

	      // Create title
	      this._title = this._container.addE('span');
	      this._title.addT('');

        this._container.appendChild(this.element());

        // Show the menu
	      this._container.addEventListener('click', this.showSelected.bind(this));

	      // Add index information to each item
	      this._items.forEach((e,i) => e._index = i);

	      // This is only domspecific
	      this.element().addEventListener('blur', function (e) {
	        this.menu.hide();
	        this.menu.showTitle();
	      });

	      // In case another tool changes
	      // the option via JS - this needs
	      // to be reflected!
	      select.addEventListener('change', function (e) {
	        this.showTitle();
	      }.bind(this));

	      this.showTitle();
      }

      /**
       * Get or set the selection index
       */
      select(index) {
        const t = this;
	      if (arguments.length > 0) {
	        t._selected = index;
	        t._select.selectedIndex = index;
	      };

	      return t._selected || t._select.selectedIndex || 0;
      }


      /**
       * Set the select value
       */
      selectValue(vParam) {
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
      }
      

      /**
       * Show the select menu
       */
      showSelected() {
        const t = this;
	      t._title.style.display = 'none';
	      t.show(t._selected = t._select.selectedIndex);
	      t.focus();
      }


      /**
       * Show the title
       */
      showTitle() {

        // Get the selection context
        const t = this;
	      const s = t.select();
	      t._title.textContent = t.item(
	        t.select()
	      ).title();
	      t._title.style.display = 'inline';
      }
	}

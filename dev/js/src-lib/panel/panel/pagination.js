/**
 * The pagination panel
 *
 * @author Nils Diewald
 */
import panelClass from '../panel.js';
import buttonGroupClass from '../../buttongroup/buttongroup.js';
import pageInfoClass from '../../pageInfo/pageInfo.js';

  const d = document;

  // Localization values
  const loc = KorAP.Locale;
  loc.RANDOM_PAGE = loc.RANDOM_PAGE || 'Random page';
  
  export default class Pagination extends panelClass {
    type = 'pagination';

    // Initialize panel
    constructor () {
      super(['pagination']);

      // The panel is only valid, if pagination information exists
      this.valid = false;

      // Override existing button group
      // This allows actions.add() ... to work for list items in server.js
      const pagEl = d.getElementById("pagination");
      if (pagEl === null) {
        return;
      };

      // Do not show if no pages exist
      if (pagEl.getAttribute('data-total') === '0') {
        return;
      };

      this._actions.panel = undefined;
      this._actions.clear();

      const bg = buttonGroupClass.adopt(pagEl);
      bg._omOutside = true;
      bg._omLeft = true;
      
      bg.anchor(pagEl.lastElementChild);

      const button = bg.addList("More", {'cls':['button-group-list','button-icon']});
      this._actions = button.list;
      this._bg = bg;

      button.setAttribute('data-icon',"\uf0c9");

      // Warning: This is circular
      this._actions.panel = this;
     
      this.prepend = true;
      this.valid = true;
    }


    /**
     * The buttongroup holding the pagination panel.
     * This differs from action, as action contains the list.
     */
    buttonGroup () {
      return this._bg;
    }

    
    /**
     * Add random paginator to list
     */
    addRandomPage () {
      const pi = new pageInfoClass();

      if (pi.total() < 2)
        return false;

      this.actions().add(
        loc.RANDOM_PAGE,
        {},
        function () {
          if (pi.total() > 1) {
            const sp = new URLSearchParams(window.location.search);
            sp.set("p", Math.floor(Math.random() * pi.total()) + 1);
            window.location.search = sp.toString();
          };
        }
      );

      return true;
    }
  };

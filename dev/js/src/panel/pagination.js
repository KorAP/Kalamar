/**
 * The pagination panel
 *
 * @author Nils Diewald
 */
"use strict";

define([
  'panel',
  'buttongroup',
  'pageInfo'
], function (panelClass, buttonGroupClass, pageInfoClass) {

  const d = document;

  // Localization values
  const loc = KorAP.Locale;
  loc.RANDOM_PAGE = loc.RANDOM_PAGE || 'Random page';
  
  return {
    type : 'pagination',

    create : function () {
      return Object.create(panelClass)._init(['pagination']).upgradeTo(this)._init();
    },

    // Initialize panel
    _init : function () {

      // Override existing button group
      // This allows actions.add() ... to work for list items in server.js
      let pagEl = document.getElementById("pagination");
      if (pagEl === null) {
        return null;
      };

      // Do not show if no pages exist
      if (pagEl.getAttribute('data-total') === '0') {
        return null;
      };

      this._actions.panel = undefined;
      this._actions.clear();

      const bg = buttonGroupClass.adopt(pagEl);
      bg._omOutside = true;
      bg._omLeft = true;
      
      bg.anchor(pagEl.lastElementChild);

      let button = bg.addList("More", {'cls':['button-group-list','button-icon']});
      this._actions = button.list;
      this._bg = bg;

      button.setAttribute('data-icon',"\uf0c9");

      // Warning: This is circular
      this._actions.panel = this;
     
      this.prepend = true;
      
      return this;
    },

    /**
     * The buttongroup holding the pagination panel.
     * This differs from action, as action contains the list.
     */
    buttonGroup : function () {
      return this._bg;
    },

    
    /**
     * Add random paginator to list
     */
    addRandomPage : function () {
      const pi = pageInfoClass.create();

      if (pi.total() < 2)
        return false;

      const button = this.actions().add(
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
  }
});

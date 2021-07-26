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
  
  return {
    create : function () {
      return Object.create(panelClass)._init(['pagination']).upgradeTo(this)._init();
    },

    // Initialize panel
    _init : function () {

      // Override existing button group
      // This allows actions.add() ... to work for list items in server.js
      let pagEl = document.getElementById("pagination");
      if (pagEl === null) {
        return;
      };

      this._actions.panel = undefined;
      this._actions.clear();

      const bg = buttonGroupClass.adopt(pagEl);
      bg._omOutside = true;
      bg._omLeft = true;
      
      bg.anchor(pagEl.lastElementChild);

      let button = bg.addList("More", {'cls':['button-group-list','button-icon']});
      this._actions = button.list;

      button.setAttribute('data-icon',"\uf0c9");

      // Warning: This is circular
      this._actions.panel = this;
     
      this.prepend = true;
      
      return this;
    },

    
    /**
     * Add random paginator to list
     */
    addRandomPage : function () {
      const pi = pageInfoClass.create();
      
      const button = this.actions().add(
        'Random',
        {},
        function () {
          if (pi.total() > 0) {
            const sp = new URLSearchParams(window.location.search);
            sp.set("p") = Math.floor(Math.random() * pi.total()) + 1;
            window.location.search = sp.toString();
          };
        }
      )
    }
  }
});

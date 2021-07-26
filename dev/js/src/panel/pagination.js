/**
 * The pagination panel
 *
 * @author Nils Diewald
 */
"use strict";

define([
  'panel',
  'buttongroup'
], function (panelClass, buttonGroupClass) {

  const d = document;
  
  return {
    create : function () {
      return Object.create(panelClass)._init([
        'pagination',
        'open-menu-outside',
        'open-menu-left'
      ]).upgradeTo(this)._init();
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
      bg.anchor(pagEl.lastElementChild);

      this._actions = bg.addList("haha", {'cls':['buttongroup-list']});

      // Warning: This is circular
      this._actions.panel = this;
      
      // If plugins are enabled,
      // add all buttons for the pagination
      // panel in a single item list
      /*
      if (KorAP.Plugin) {

        let buttons = KorAP.Plugin.buttonGroup("pagination");
        if (buttons.size >= 1) {
      
          // Add buttons to pagination list
          buttons.forEach(i => function (i) {
            list.add(list.itemClass.create(i));
          });

          KorAP.Plugin.clearButtonGroup("pagination");
        };
      };
      */

      
      this.prepend = true;
      
      return this;
    },

    
    /**
     * Add random paginator to list
     */
    addRandomPage : function () {

      const button = this.actions().add(
        'Random',
        {},
        function () {
          const t = this;
          console.log("Okay");
        }
      )
    }
  }
});

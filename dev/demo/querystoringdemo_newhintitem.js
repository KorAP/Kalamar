/**
 * new menu item based on hintItem that allows for selection and later deletion
 */
"use strict";

define(['./item', 'util'], function (itemClass) {
  return {

    /**
     * Create new menu item object.
     */
    create : function (params) {
      const obj = itemClass.create(params)
	      .upgradeTo(this)
	      ._init(params);
      return obj;
    },

    /**
     * Override the click action
     * of the hint menu item.
     */
    onclick : function (e) {
      var m = this.menu();
      // m.hide();
      var h = m.hint();
      if ( h._hintItemMode === undefined || h._hintItemMode === "REGULAR" ) { //the same

        // Reset prefix and update the input field
        m.reset(this._action);

        e.halt();
      
        // show alt
        h.show(true);
      } else if ( h._hintItemMode === "DELETE SELECTION" ) { //see deleteButton in querystoringdemo.js

        h._deleteTheseQueries.push( this.name() );
        this.element().classList.add("selected-for-deletion"); //TODO @Nils Maybe a different type of highlighting?
        //this. //Here you see why I added the content function: easier text changing.
        e.halt();
       
        // show alt
        h.show(true);
      };
    }
  }
});

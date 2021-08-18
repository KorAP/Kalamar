/**
 * API/ skeleton/ base class for an item contained within a container.
 * Here we see which functions container supports for containerItems.
 * 
 * @author Leo Repp
 */


//"use strict";

define({

  /**
   * API for an item contained within a container
   */
  create : function () {
    return Object.create(this); //._init();
  },

  /**
   * Check or set if the item is active
   *
   * @param {boolean|null} State of activity
   */
  active : function (bool) {
    const cl = this.element().classList;
    if (bool === undefined) return cl.contains("active");
    else if (bool) cl.add("active");
    else cl.remove("active"); //allows for setting it to inactive if not (equal to undefined or truthy)
  },

  /**
   * Get/create the document element of the container item. Can be overwritten. Standard class: li
   * If you wish to change the textNode please overwrite the content function instead.
   */
  element : function () {
    //Call Order: First this class is created and then upgraded To whatever object is passed to container
    //Then container calls first element() and then container()
    if (this._el !== undefined) return this._el;
    
    // Create list item
    const li = document.createElement("li");

    // Connect action
    if (this["onclick"] !== undefined) {
      li["onclick"] = this.onclick.bind(this);
    };    
    return this._el = li;
  },

  /**
   * Get/create a TextNode with text "content". If content is left blank it gets set to this.defaultTextValue,
   * or the empty string if it does not exists
   * @param {String} content String to which to set the text
   * @returns textNode with content or undefined
   */
  content : function (content) {
    var newText; //set textNode to this
    if (arguments.length === 1) { //new value!
      newText = content;
    } else { //use default
      if (this.defaultTextValue === undefined) { //default default is ""
        this.defaultTextValue = "";
      }
      newText = this.defaultTextValue;
    };
    if (this._content === undefined) { //no Element until now
      this._content = document.createTextNode(newText); //create one
      this.element().appendChild(this._content);
    } else { //just change it
      this._content.nodeValue = newText; // use nodeValue instead of _innerHTML
    };
    return this._content;
  },

  /**
   * Expected to be overwritten. Default returns true always.
   * @returns whether the item is currently an option to be selected, or if it should just be skipped
   */
  isSelectable : function () {
    return true;
  },

  /**
   * API skeleton for reading letters. Expected to be overwritten.
   * @param {String} letter The letter to be read
   */
  add : function (letter) {},
    
  
  /**
   * API skeleton for clearing whole contents. Expected to be overwritten.
   */
  clear : function () {},
  
  
  /**
   * API skeleton method for execution. Expected to be overwritten. Please always call e.halt();.
   * @param {Event} event Event passed down by menu.
   */
  onclick : function (e) {
  },
  
    
  /**
   * API skeleton method for when backspace is pressed. Expected to be overwritten.
   */
  chop : function () {},

  /**
   * API skeleton method for pressing "right". Expected to be overwritten.
   * @param {Event} event Event passed down by menu.
   */
  further : function (e) {},

  /**
   * Return menu list. This._menu gets written by the container class
   */
  menu : function () {
    return this._menu;
  }

});

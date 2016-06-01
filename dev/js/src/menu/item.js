/*
 * MenuItems may define:
 *
 * onclick: action happen on click and enter.
 * further: action happen on right arrow
 */

/**
 * Item in the Dropdown menu
 */
define({
  /**
   * Create a new MenuItem object.
   *
   * @constructor
   * @this {MenuItem}
   * @param {Array.<string>} An array object of name, action and
   *   optionally a description
   */
  create : function (params) {
    return Object.create(this)._init(params);
  },

  /**
   * Upgrade this object to another object,
   * while private data stays intact.
   *
   * @param {Object] An object with properties.
   */
  upgradeTo : function (props) {
    for (var prop in props) {
      this[prop] = props[prop];
    };
    return this;
  },


  /**
   * Get or set the content of the meun item.
   */
  content : function (content) {
    if (arguments.length === 1)
      this._content = document.createTextNode(content);
    return this._content;
  },

  /**
   * Get the lower cased field of the item
   * (used for analyses).
   */
  lcField : function () {
    return this._lcField;
  },


  /**
   * Get or set the information for action of this item. 
   */
  action : function (action) {
    if (arguments.length === 1)
      this._action = action;
    return this._action;
  },

  /**
   * Check or set if the item is active
   *
   * @param {boolean|null} State of activity
   */
  active : function (bool) {
    var cl = this.element().classList;
    if (bool === undefined)
      return cl.contains("active");
    else if (bool)
      cl.add("active");
    else
      cl.remove("active");
  },

  /**
   * Check or set if the item is
   * at the boundary of the menu
   * list
   *
   * @param {boolean|null} State of activity
   */
  noMore : function (bool) {
    var cl = this.element().classList;
    if (bool === undefined)
      return cl.contains("no-more");
    else if (bool)
      cl.add("no-more");
    else
      cl.remove("no-more");
  },
  
  /**
   * Get the document element of the menu item
   */
  element : function () {
    // already defined
    if (this._element !== undefined)
      return this._element;
    
    // Create list item
    var li = document.createElement("li");

    // Connect action
    if (this["onclick"] !== undefined) {
      li["onclick"] = this.onclick.bind(this);
    };

    // Append template
    li.appendChild(this.content());
    
    return this._element = li;
  },

  /**
   * Highlight parts of the item
   *
   * @param {string} Prefix string for highlights
   */
  highlight : function (prefix) {

    // The prefix already matches
    if (this._prefix === prefix)
      return;

    // There is a prefix but it doesn't match
    if (this._prefix !== null) {
      this.lowlight();
    }

    var children = this.element().childNodes;
    for (var i = children.length -1; i >= 0; i--) {
      this._highlight(children[i], prefix);
    };

    this._prefix = prefix;
  },

  /**
   * Remove highlight of the menu item
   */
  lowlight : function () {
    if (this._prefix === null)
      return;

    var e = this.element();
    
    var marks = e.getElementsByTagName("mark");
    for (var i = marks.length - 1; i >= 0; i--) {
      // Create text node clone
      var x = document.createTextNode(
	marks[i].firstChild.nodeValue
      );
      
      // Replace with content
      marks[i].parentNode.replaceChild(
	x,
	marks[i]
      );
    };

    // Remove consecutive textnodes
    e.normalize();
    this._prefix = null;
  },

  // Highlight a certain substring of the menu item
  _highlight : function (elem, prefix) {
    if (elem.nodeType === 3) {
      
      var text   = elem.nodeValue;
      var textlc = text.toLowerCase();
      var pos    = textlc.indexOf(prefix);
      if (pos >= 0) {
	
	// First element
	if (pos > 0) {
	  elem.parentNode.insertBefore(
	    document.createTextNode(text.substr(0, pos)),
	    elem
	  );
	};
	
	// Second element
	var hl = document.createElement("mark");
	hl.appendChild(
	  document.createTextNode(text.substr(pos, prefix.length))
	);
	elem.parentNode.insertBefore(hl, elem);
	
	// Third element
	var third = text.substr(pos + prefix.length);
	if (third.length > 0) {
	  var thirdE = document.createTextNode(third);
	  elem.parentNode.insertBefore(
	    thirdE,
	    elem
	  );
	  this._highlight(thirdE, prefix);
	};
	
	var p = elem.parentNode;
	p.removeChild(elem);
      };
    }
    else {
      var children = elem.childNodes;
      for (var i = children.length -1; i >= 0; i--) {
	this._highlight(children[i], prefix);
      };
    };
  },

  // Initialize menu item
  _init : function (params) {
    
    if (params[0] === undefined)
      throw new Error("Missing parameters");

    this.content(params[0]);
    
    if (params.length === 2)
      this._action = params[1];

    this._lcField = ' ' + this.content().textContent.toLowerCase();
    this._prefix = null;

    return this;
  },

  /**
   * Return menu list.
   */
  menu : function () {
    return this._menu;
  }
});

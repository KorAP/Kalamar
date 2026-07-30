import '../../../../scss/kalamar.scss';
import AlwaysMenu from '../alwaysmenu.js';
import menuItemClass from '../../menu/menu/item.js';
import prefixClass from '../../menu/menu/prefix.js';
import lengthFieldClass from '../../menu/menu/lengthField.js';
import SelectMenu from '../../selectMenu/selectMenu.js';
import AlwaysEntry from '../../alwaysentry/alwaysentry.js';

/**
 * Demo for AlwaysMenu component
 */


/**
 * Custom menu item class with click handlers
 */
class OwnMenuItem extends menuItemClass {

  constructor (params) {
    super();
    if (params[0] === undefined) {
      throw new Error("Missing parameters");
    };

    this._name = params[0];
    this._content = document.createTextNode(this._name);
    this._lcField = ' ' + this.content().textContent.toLowerCase();
    this._prefix = null;
  };

  content (content) {
    if (arguments.length === 1) {
      this._content = content;
    };
    return this._content;
  };

  // Enter or click
  onclick () {
    console.log('Item clicked:', this._name);
  };

  // Right arrow
  further () {
    console.log('Further:', this._name);
  };
};


/**
 * Custom prefix class with click handler
 */
class OwnPrefix extends prefixClass {

  onclick () {
    console.log('Prefix:', this.value());
  };
};


/**
 * Custom always-entry class with click handler
 */
class OwnEntry extends AlwaysEntry {

  constructor () {
    super("Save");
  };

  onclick () {
    console.log('Entry clicked:', this.value());
  };
};


/**
 * Custom AlwaysMenu with custom item classes
 */
class OwnAlwaysMenu extends AlwaysMenu {

  constructor (list) {
    super(list, {
      itemClass : OwnMenuItem,
      prefixClass : OwnPrefix,
      lengthFieldClass : lengthFieldClass,
      alwaysEntryClass : OwnEntry
    });
    this._firstActive = true;
  };
};


// Create the menu with field options
const menu = new OwnAlwaysMenu([
  ['Titel', 'title', 'string'],
  ['Untertitel', 'subTitle', 'string'],
  ['Beschreibung', 'desc', 'string'],
  ['Veröffentlichungsdatum', 'pubDate', 'date'],
  ['Länge', 'length', 'integer'],
  ['Autor', 'author', 'string'],
  ['Genre', 'genre', 'string'],
  ['corpusID', 'corpusID', 'string'],
  ['docID', 'docID', 'string'],
  ['textID', 'textID', 'string']
]);

// Add menu to DOM
document.getElementById('menu').appendChild(menu.element());

// Configure and show menu
menu.limit(3).show(3);
menu.focus();

// Initialize SelectMenu for query language selector
new SelectMenu(document.getElementById('choose-ql')).limit(5);

// For debugging in console
console.log('AlwaysMenu demo initialized:', menu);
  
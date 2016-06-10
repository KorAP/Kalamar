requirejs.config({
  baseUrl: '../js/src'
});

require(['menu','menu/item', 'menu/prefix', 'menu/lengthField', 'selectMenu'], function (menuClass, itemClass, prefixClass, lengthFieldClass, selectMenuClass) {

  /**
   * Create own menu item class.
   */
  var OwnMenuItemClass = {
    create : function (params) {
      return Object.create(itemClass).upgradeTo(this)._init(params);
    },

    // content function
    content : function (content) {
      if (arguments.length === 1) {
        this._content = content;
      };
      return this._content;
    },

    // enter or click
    onclick : function () {
      console.log(this._name);
    },

    // right arrow
    further : function () {
      console.log("Further: " + this._name);
    },

    // initialize item
    _init : function (params) {
      if (params[0] === undefined)
	throw new Error("Missing parameters");

      this._name = params[0];
      this._content = document.createTextNode(this._name);
      this._lcField = ' ' + this.content().textContent.toLowerCase();
      return this;
    }
  };

  /**
   * Create own prefix class.
   */
  var OwnPrefixClass = {
    create : function () {
      return Object.create(prefixClass)
	.upgradeTo(this)
	._init();
    },
    onclick : function () {
      console.log('Prefix: ' + this.value());
    }
  };

  /**
   * Create own menu class.
   */
  var OwnMenu = {
    create : function (params) {
      var obj = Object.create(menuClass)
      .upgradeTo(this)
      ._init(OwnMenuItemClass, OwnPrefixClass, lengthFieldClass, params);
      obj._firstActive = true;
      return obj;
    }
  };

  var menu = OwnMenu.create([
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

  document.getElementById('menu').appendChild(menu.element());

  menu.limit(3).show(3);
  menu.focus();

  selectMenuClass.create(document.getElementById('choose-ql')).limit(5); // .show();
});

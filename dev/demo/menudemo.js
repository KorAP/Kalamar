requirejs.config({
  baseUrl: '../js/src'
});

require(['menu','menu/item', 'menu/prefix'], function (menuClass, itemClass, prefixClass) {
  var OwnMenuItemClass = {
    create : function (params) {
      return Object.create(itemClass).upgradeTo(this)._init(params);
    },
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
    _init : function (params) {
      if (params[0] === undefined)
	throw new Error("Missing parameters");

      this._name = params[0];
      this._content = document.createTextNode(this._name);
      this._lcField = ' ' + this.content().textContent.toLowerCase();
      
      return this;
    }
  };

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

  var OwnMenu = {
    create : function (params) {
      return Object.create(menuClass)
      .upgradeTo(this)
      ._init(OwnMenuItemClass, OwnPrefixClass, params);
    }
  };

  var menu = OwnMenu.create([
    ['Titel', 'title', 'string'],
    ['Untertitel', 'subTitle', 'string'],
    ['Veröffentlichungsdatum', 'pubDate', 'date'],
    ['Länge', 'length', 'integer'],
    ['Autor', 'author', 'string'],
    ['Genre', 'genre', 'string'],
    ['corpusID', 'corpusID', 'string'],
    ['docID', 'docID', 'string'],
    ['textID', 'textID', 'string']
  ]);

  document.getElementById('menu').appendChild(menu.element());

  menu.limit(3);
  menu.show('');
  menu.focus();
});

define(['menu', 'menu/item', 'menu/prefix', 'menu/lengthField'],
       function (menuClass, menuItemClass, prefixClass, lengthFieldClass) {
 
  // The OwnMenu item
  KorAP.OwnMenuItem = {
    create : function (params) {
      return Object.create(menuItemClass).upgradeTo(KorAP.OwnMenuItem)._init(params);
    },
    content : function (content) {
      if (arguments.length === 1) {
	this._content = content;
      };
      return this._content;
    },
    _init : function (params) {
      if (params[0] === undefined)
	throw new Error("Missing parameters");

      this._content = document.createTextNode(params[0]);
      this._lcField = ' ' + this.content().textContent.toLowerCase();

      return this;
    }
  };

  // The OwnMenu
  KorAP.OwnMenu = {
    create : function (params) {
      return Object.create(menuClass)
	.upgradeTo(KorAP.OwnMenu)
	._init(KorAP.OwnMenuItem, undefined, undefined, params);
    }
  };


  // HintMenuItem
  KorAP.HintMenuItem = {
    create : function (params) {
      return Object.create(menuItemClass)
	.upgradeTo(KorAP.HintMenuItem)
	._init(params);
    },
    content : function (content) {
      if (arguments.length === 1) {
	this._content = content;
      };
      return this._content;
    },
    _init : function (params) {
      if (params[0] === undefined || params[1] === undefined)
	throw new Error("Missing parameters");

      this._name   = params[0];
      this._action = params[1];
      this._lcField = ' ' + this._name.toLowerCase();

      if (params.length > 2) {
	this._desc = params[2];
	this._lcField += " " + this._desc.toLowerCase();
      };

      return this;
    },

    name : function () {
      return this._name;
    },
    action : function () {
      return this._action;
    },
    desc : function () {
      return this._desc;
    },
    element : function () {
      // already defined
      if (this._element !== undefined)
	return this._element;

      // Create list item
      var li = document.createElement("li");
      li.setAttribute("data-action", this._action);

      // Create title
      var name =  document.createElement("strong");
      name.appendChild(document.createTextNode(this._name));
      
      li.appendChild(name);

      // Create description
      if (this._desc !== undefined) {
	var desc = document.createElement("span");
	desc.appendChild(document.createTextNode(this._desc));
	li.appendChild(desc);
      };
      return this._element = li;
    }
  };


  // HintMenu
  KorAP.HintMenu = {
    create : function (context, params) {
      var obj = Object.create(menuClass)
	.upgradeTo(KorAP.HintMenu)
	._init(KorAP.HintMenuItem, undefined, undefined, params);
      obj._context = context;
      return obj;
    }
  };


  // The ComplexMenuItem
  KorAP.ComplexMenuItem = {
    create : function (params) {
      return Object.create(menuItemClass)
	.upgradeTo(KorAP.ComplexMenuItem)
	._init(params);
    },
    content : function (content) {
      if (arguments.length === 1) {
	this._content = content;
      };
      return this._content;
    },
    _init : function (params) {
      if (params[0] === undefined)
	throw new Error("Missing parameters");

      var r = document.createElement('div');
      for (var i = 1; i <= params.length; i++) {
	var h = document.createElement('h' + i);
	h.appendChild(document.createTextNode(params[i-1]));
	r.appendChild(h);
      };

      this._content = r;
      this._lcField = ' ' + this.content().textContent.toLowerCase();

      return this;
    }
  };


  describe('KorAP.MenuItem', function () {
    it('should be initializable', function () {
      expect(
	function() { menuItemClass.create([]) }
      ).toThrow(new Error("Missing parameters"));

      expect(
	function() { KorAP.OwnMenuItem.create([]) }
      ).toThrow(new Error("Missing parameters"));

      var mi = KorAP.OwnMenuItem.create(["Baum"]);
      expect(mi.element().firstChild.nodeValue).toEqual('Baum');
      expect(mi.lcField()).toEqual(' baum');
    });

    it('shouldn\'t have a reference to the menu', function () {
      var menuItem = KorAP.OwnMenuItem.create(['Test']);
      expect(menuItem.menu()).toBe(undefined);
    });

    it('should be activatable and deactivateable by class', function () {
      var menuItem = KorAP.OwnMenuItem.create(['Test']);

      expect(menuItem.active()).toBe(false);
      expect(menuItem.element().getAttribute("class")).toBe(null);
      menuItem.active(true);
      expect(menuItem.active()).toBe(true);
      expect(menuItem.element().getAttribute("class")).toEqual("active");
      menuItem.active(false); // Is active
      expect(menuItem.active()).toBe(false);
      expect(menuItem.element().getAttribute("class")).toEqual("");
      menuItem.active(true);
      expect(menuItem.active()).toBe(true);
      expect(menuItem.element().getAttribute("class")).toEqual("active");

      menuItem = KorAP.OwnMenuItem.create(['Spiegel']);
      expect(menuItem.active()).toBe(false);
      expect(menuItem.element().getAttribute("class")).toBe(null);
      menuItem.active(false); // Is not active
      expect(menuItem.active()).toBe(false);
      expect(menuItem.element().getAttribute("class")).toBe(null);
    });

    it('should be set to boundary', function () {
      var menuItem = KorAP.OwnMenuItem.create(['CoreNLP']);
      expect(menuItem.active()).toBe(false);
      expect(menuItem.element().getAttribute("class")).toBe(null);

      // Set active
      menuItem.active(true);
      expect(menuItem.active()).toBe(true);
      expect(menuItem.noMore()).toBe(false);
      expect(menuItem.element().getAttribute("class")).toEqual("active");

      // Set no more
      menuItem.noMore(true);
      expect(menuItem.active()).toBe(true);
      expect(menuItem.noMore()).toBe(true);
      expect(menuItem.element().getAttribute("class")).toEqual("active no-more");

      // No no more
      menuItem.noMore(false);
      expect(menuItem.active()).toBe(true);
      expect(menuItem.noMore()).toBe(false);
      expect(menuItem.element().getAttribute("class")).toEqual("active");

      // Set no more, deactivate
      menuItem.noMore(true);
      menuItem.active(false);
      expect(menuItem.active()).toBe(false);
      expect(menuItem.noMore()).toBe(true);
      expect(menuItem.element().getAttribute("class")).toEqual("no-more");

      // Set active
      menuItem.active(true);
      expect(menuItem.active()).toBe(true);
      expect(menuItem.noMore()).toBe(true);
      expect(menuItem.element().getAttribute("class")).toEqual("no-more active");
    });


    it('should be highlightable', function () {
      // Highlight in the middle
      var menuItem = KorAP.OwnMenuItem.create(['CoreNLP']);
      menuItem.highlight("ren");
      expect(menuItem.element().innerHTML).toEqual("Co<mark>reN</mark>LP");

      menuItem.lowlight();
      expect(menuItem.element().innerHTML).toEqual("CoreNLP");

      var plain = "<div><h1>CoreNLP</h1><h2>corenlp/</h2></div>";

      // Starting highlight
      menuItem = KorAP.ComplexMenuItem.create(['CoreNLP', 'corenlp/']);
      menuItem.highlight("cor");
      expect(menuItem.element().innerHTML).toEqual("<div><h1><mark>Cor</mark>eNLP</h1><h2><mark>cor</mark>enlp/</h2></div>");

      menuItem.lowlight();
      expect(menuItem.element().innerHTML).toEqual(plain);

      // Starting highlight - short
      menuItem = KorAP.ComplexMenuItem.create(['CoreNLP', 'corenlp/']);
      menuItem.highlight("c");
      expect(menuItem.element().innerHTML).toEqual("<div><h1><mark>C</mark>oreNLP</h1><h2><mark>c</mark>orenlp/</h2></div>");

      menuItem.lowlight();
      expect(menuItem.element().innerHTML).toEqual(plain);

      // Highlight at the end
      menuItem = KorAP.ComplexMenuItem.create(['CoreNLP', 'corenlp/']);
      menuItem.highlight("nlp");
      expect(menuItem.element().innerHTML).toEqual("<div><h1>Core<mark>NLP</mark></h1><h2>core<mark>nlp</mark>/</h2></div>");

      menuItem.lowlight();
      expect(menuItem.element().innerHTML).toEqual(plain);

      // Highlight at the end - short
      menuItem = KorAP.ComplexMenuItem.create(['CoreNLP', 'corenlp/']);
      menuItem.highlight("p");
      expect(menuItem.element().innerHTML).toEqual("<div><h1>CoreNL<mark>P</mark></h1><h2>corenl<mark>p</mark>/</h2></div>");

      menuItem.lowlight();
      expect(menuItem.element().innerHTML).toEqual(plain);

      // No highlight
      menuItem = KorAP.ComplexMenuItem.create(['CoreNLP', 'corenlp/']);
      menuItem.highlight("xp");
      expect(menuItem.element().innerHTML).toEqual(plain);

      menuItem.lowlight();
      expect(menuItem.element().innerHTML).toEqual(plain);

      // Highlight in the middle - first
      menuItem = KorAP.ComplexMenuItem.create(['CoreNLP', 'corenlp/', 'This is my Example']);
      menuItem.highlight("ren");
      expect(menuItem.element().innerHTML).toEqual("<div><h1>Co<mark>reN</mark>LP</h1><h2>co<mark>ren</mark>lp/</h2><h3>This is my Example</h3></div>");

      plain = "<div><h1>CoreNLP</h1><h2>corenlp/</h2><h3>This is my Example</h3></div>"

      menuItem.lowlight();
      expect(menuItem.element().innerHTML).toEqual(plain);

      // Highlight in the middle - second
      menuItem = KorAP.ComplexMenuItem.create(['CoreNLP', 'corenlp/', 'This is my Example']);
      menuItem.highlight("ampl");
      expect(menuItem.element().innerHTML).toEqual("<div><h1>CoreNLP</h1><h2>corenlp/</h2><h3>This is my Ex<mark>ampl</mark>e</h3></div>");

      menuItem.lowlight();
      expect(menuItem.element().innerHTML).toEqual(plain);

      // Highlight in the middle - both
      menuItem = KorAP.ComplexMenuItem.create(['CoreNLP', 'corenlp/', 'This is my Example']);
      menuItem.highlight("e");
      expect(menuItem.element().innerHTML).toEqual("<div><h1>Cor<mark>e</mark>NLP</h1><h2>cor<mark>e</mark>nlp/</h2><h3>This is my <mark>E</mark>xampl<mark>e</mark></h3></div>");

      menuItem.lowlight();
      expect(menuItem.element().innerHTML).toEqual(plain);

      // Highlight in the end - second
      menuItem = KorAP.ComplexMenuItem.create(['CoreNLP', 'corenlp/', 'This is my Example']);
      menuItem.highlight("le");
      expect(menuItem.element().innerHTML).toEqual("<div><h1>CoreNLP</h1><h2>corenlp/</h2><h3>This is my Examp<mark>le</mark></h3></div>");

      menuItem.lowlight();
      expect(menuItem.element().innerHTML).toEqual(plain);

      // Highlight at the beginning - second
      menuItem = KorAP.ComplexMenuItem.create(['CoreNLP', 'corenlp/', 'This is my Example']);
      menuItem.highlight("this");
      expect(menuItem.element().innerHTML).toEqual("<div><h1>CoreNLP</h1><h2>corenlp/</h2><h3><mark>This</mark> is my Example</h3></div>");

      menuItem.lowlight();
      expect(menuItem.element().innerHTML).toEqual(plain);
    });
  });


  describe('KorAP.Menu', function () {
    var list = [
      ["Constituency", "c=", "Example 1"],
      ["Lemma", "l="],
      ["Morphology", "m=", "Example 2"],
      ["Part-of-Speech", "p="],
      ["Syntax", "syn="]
    ];

    var demolist = [
      ['Titel', 'title'],
      ['Untertitel', 'subTitle'],
      ['Veröffentlichungsdatum', 'pubDate'],
      ['Länge', 'length'],
      ['Autor', 'author']
    ];

    var demolonglist = [
      ['Titel', 'title'],
      ['Untertitel', 'subTitle'],
      ['Veröffentlichungsdatum', 'pubDate'],
      ['Länge', 'length'],
      ['Autor', 'author'],
      ['Genre', 'genre'],
      ['corpusID', 'corpusID'],
      ['docID', 'docID'],
      ['textID', 'textID'],
    ];

    it('should be initializable', function () {
      var list = [
	["Constituency"],
	["Lemma"],
	["Morphology"],
	["Part-of-Speech"],
	["Syntax"]
      ];

      var menu = KorAP.OwnMenu.create(list);
      menu._firstActive = true;
      expect(menu.itemClass()).toEqual(KorAP.OwnMenuItem);
      expect(menu.element().nodeName).toEqual('UL');
      expect(menu.element().style.opacity).toEqual("0");
      expect(menu.limit()).toEqual(8);

      menu.limit(9);
      expect(menu.limit()).toEqual(9);

      menu.limit(8);

      // view
      menu.show();

      // First element in list
      expect(menu.item(0).active()).toBe(true);
      expect(menu.item(0).noMore()).toBe(true);

      // Middle element in list
      expect(menu.item(2).active()).toBe(false);
      expect(menu.item(2).noMore()).toBe(false);

      // Last element in list
      expect(menu.item(menu.length() - 1).active()).toBe(false);
      expect(menu.item(menu.length() - 1).noMore()).toBe(true);
    });

    it('should have a reference to the menu', function () {
      var menu = KorAP.HintMenu.create("cnx/", list);
      expect(menu.item(0).menu()).toEqual(menu);

      menu = KorAP.HintMenu.create("cnx/", list);
      expect(menu.element().menu).toEqual(menu);
    });


    it('should be visible', function () {
      var menu = KorAP.HintMenu.create("cnx/", list);
      expect(menu.removeItems()).toBe(undefined);
      menu.limit(3);

      expect(menu.show()).toBe(true);

      expect(menu.element().childNodes[3].innerHTML).toEqual("<strong>Constituency</strong><span>Example 1</span>");
      expect(menu.element().childNodes[4].innerHTML).toEqual("<strong>Lemma</strong>");
      expect(menu.element().childNodes[4].getAttribute("data-action")).toEqual("l=");
      expect(menu.element().childNodes[5].innerHTML).toEqual("<strong>Morphology</strong><span>Example 2</span>");
      expect(menu.element().childNodes[6]).toBe(undefined);

      // Check boundaries
      expect(menu.element().childNodes[3].classList.contains("no-more")).toBe(true);
      expect(menu.element().childNodes[4].classList.contains("no-more")).toBe(false);
      expect(menu.element().childNodes[5].classList.contains("no-more")).toBe(false);
    });

    it('should be filterable', function () {
      var menu = KorAP.HintMenu.create("cnx/", list);
      menu.limit(3);
      expect(menu.prefix("o").show()).toBe(true);
      expect(menu.element().childNodes[0].innerHTML).toEqual("o");
      expect(menu.element().childNodes[3].innerHTML).toEqual("<strong>C<mark>o</mark>nstituency</strong><span>Example 1</span>");
      expect(menu.element().childNodes[4].innerHTML).toEqual("<strong>M<mark>o</mark>rph<mark>o</mark>l<mark>o</mark>gy</strong><span>Example 2</span>");
      expect(menu.element().childNodes[5].innerHTML).toEqual("<strong>Part-<mark>o</mark>f-Speech</strong>");
      expect(menu.element().childNodes[6]).toBe(undefined);

      // Check boundaries
      expect(menu.element().childNodes[3].classList.contains("no-more")).toBe(true);
      expect(menu.element().childNodes[4].classList.contains("no-more")).toBe(false);
      expect(menu.element().childNodes[5].classList.contains("no-more")).toBe(true);

      menu.limit(2);

      expect(menu.prefix("o").show()).toBe(true);
      expect(menu.element().childNodes[0].innerHTML).toEqual("o");
      expect(menu.element().childNodes[3].innerHTML).toEqual("<strong>C<mark>o</mark>nstituency</strong><span>Example 1</span>");
      expect(menu.element().childNodes[4].innerHTML).toEqual("<strong>M<mark>o</mark>rph<mark>o</mark>l<mark>o</mark>gy</strong><span>Example 2</span>");
      expect(menu.element().childNodes[5]).toBe(undefined);

      // Check boundaries
      expect(menu.element().childNodes[3].classList.contains("no-more")).toBe(true);
      expect(menu.element().childNodes[4].classList.contains("no-more")).toBe(false);
      expect(menu.element().childNodes[5]).toBe(undefined);

      expect(menu.prefix("e").show()).toBe(true);
      expect(menu.element().childNodes[0].innerHTML).toEqual("e");
      expect(menu.element().childNodes[3].innerHTML).toEqual("<strong>Constitu<mark>e</mark>ncy</strong><span><mark>E</mark>xampl<mark>e</mark> 1</span>");
      expect(menu.element().childNodes[4].innerHTML).toEqual("<strong>Morphology</strong><span><mark>E</mark>xampl<mark>e</mark> 2</span>");
      expect(menu.element().childNodes[5]).toBe(undefined);

      menu.limit(5);
      expect(menu.prefix("a").show()).toBe(true);
      expect(menu.element().childNodes[0].innerHTML).toEqual("a");
      expect(menu.element().childNodes[3].innerHTML).toEqual("<strong>Constituency</strong><span>Ex<mark>a</mark>mple 1</span>");
      expect(menu.element().childNodes[4].innerHTML).toEqual("<strong>Lemm<mark>a</mark></strong>");
      expect(menu.element().childNodes[5].innerHTML).toEqual("<strong>Morphology</strong><span>Ex<mark>a</mark>mple 2</span>");
      expect(menu.element().childNodes[6].innerHTML).toEqual("<strong>P<mark>a</mark>rt-of-Speech</strong>");
      expect(menu.element().childNodes[7].innerHTML).toEqual("<strong>Synt<mark>a</mark>x</strong>");
      expect(menu.element().childNodes[8]).toBe(undefined);
    });


    it('should be nextable', function () {
      var menu = KorAP.HintMenu.create("cnx/", list);
      menu._firstActive = true;

      // Show only 3 items
      menu.limit(3);
      expect(menu.show()).toBe(true);
      expect(menu.element().childNodes[3].innerHTML).toEqual("<strong>Constituency</strong><span>Example 1</span>");
      expect(menu.shownItem(0).active()).toBe(true);
      expect(menu.element().childNodes[4].innerHTML).toEqual("<strong>Lemma</strong>");
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.element().childNodes[5].innerHTML).toEqual("<strong>Morphology</strong><span>Example 2</span>");
      expect(menu.shownItem(2).active()).toBe(false);
      expect(menu.element().childNodes[6]).toBe(undefined);

      // Activate next (1)
      menu.next();
      expect(menu.element().childNodes[3].innerHTML).toEqual("<strong>Constituency</strong><span>Example 1</span>");
      expect(menu.shownItem(0).active()).toBe(false);
      expect(menu.element().childNodes[4].innerHTML).toEqual("<strong>Lemma</strong>");
      expect(menu.shownItem(1).active()).toBe(true);
      expect(menu.element().childNodes[5].innerHTML).toEqual("<strong>Morphology</strong><span>Example 2</span>");
      expect(menu.shownItem(2).active()).toBe(false);
      expect(menu.element().childNodes[6]).toBe(undefined);

      // Activate next (2)
      menu.next();
      expect(menu.element().childNodes[3].innerHTML).toEqual("<strong>Constituency</strong><span>Example 1</span>");
      expect(menu.shownItem(0).active()).toBe(false);
      expect(menu.element().childNodes[4].innerHTML).toEqual("<strong>Lemma</strong>");
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.element().childNodes[5].innerHTML).toEqual("<strong>Morphology</strong><span>Example 2</span>");
      expect(menu.shownItem(2).active()).toBe(true);
      expect(menu.element().childNodes[6]).toBe(undefined);

      // Activate next (3)
      // scroll!
      menu.next();
      expect(menu.element().childNodes[3].innerHTML).toEqual("<strong>Lemma</strong>");
      expect(menu.shownItem(0).active()).toBe(false);
      expect(menu.element().childNodes[4].innerHTML).toEqual("<strong>Morphology</strong><span>Example 2</span>");
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.element().childNodes[5].innerHTML).toEqual("<strong>Part-of-Speech</strong>");
      expect(menu.shownItem(2).active()).toBe(true);
      expect(menu.element().childNodes[6]).toBe(undefined);

      // Activate next (4)
      menu.next();
      expect(menu.element().childNodes[3].innerHTML).toEqual("<strong>Morphology</strong><span>Example 2</span>");
      expect(menu.shownItem(0).active()).toBe(false);
      expect(menu.element().childNodes[4].innerHTML).toEqual("<strong>Part-of-Speech</strong>");
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.element().childNodes[5].innerHTML).toEqual("<strong>Syntax</strong>");
      expect(menu.shownItem(2).active()).toBe(true);
      expect(menu.element().childNodes[6]).toBe(undefined);

      // Activate next (5) - ROLL
      menu.next();
      expect(menu.element().childNodes[3].innerHTML).toEqual("<strong>Constituency</strong><span>Example 1</span>");
      expect(menu.shownItem(0).active()).toBe(true);
      expect(menu.element().childNodes[4].innerHTML).toEqual("<strong>Lemma</strong>");
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.element().childNodes[5].innerHTML).toEqual("<strong>Morphology</strong><span>Example 2</span>");
      expect(menu.shownItem(2).active()).toBe(false);
      expect(menu.element().childNodes[6]).toBe(undefined);

      // Active next (6)
      menu.next();
      expect(menu.element().childNodes[3].innerHTML).toEqual("<strong>Constituency</strong><span>Example 1</span>");
      expect(menu.shownItem(0).active()).toBe(false);
      expect(menu.element().childNodes[4].innerHTML).toEqual("<strong>Lemma</strong>");
      expect(menu.shownItem(1).active()).toBe(true);
      expect(menu.element().childNodes[5].innerHTML).toEqual("<strong>Morphology</strong><span>Example 2</span>");
      expect(menu.shownItem(2).active()).toBe(false);
      expect(menu.element().childNodes[6]).toBe(undefined);
    });

    it('should be prevable', function () {
      var menu = KorAP.HintMenu.create("cnx/", list);
      menu._firstActive = true;
      menu.limit(3);
      expect(menu.show()).toBe(true);

      expect(menu.element().childNodes[3].innerHTML).toEqual("<strong>Constituency</strong><span>Example 1</span>");
      expect(menu.shownItem(0).active()).toBe(true);
      expect(menu.element().childNodes[4].innerHTML).toEqual("<strong>Lemma</strong>");
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.element().childNodes[5].innerHTML).toEqual("<strong>Morphology</strong><span>Example 2</span>");
      expect(menu.shownItem(2).active()).toBe(false);
      expect(menu.element().childNodes[6]).toBe(undefined);

      // Activate prev (1) - roll to bottom
      menu.prev();
      expect(menu.element().childNodes[3].innerHTML).toEqual("<strong>Morphology</strong><span>Example 2</span>");
      expect(menu.shownItem(0).active()).toBe(false);
      expect(menu.element().childNodes[4].innerHTML).toEqual("<strong>Part-of-Speech</strong>");
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.element().childNodes[5].innerHTML).toEqual("<strong>Syntax</strong>");
      expect(menu.shownItem(2).active()).toBe(true);
      expect(menu.element().childNodes[6]).toBe(undefined);

      // Activate prev (2)
      menu.prev();
      expect(menu.element().childNodes[3].innerHTML).toEqual("<strong>Morphology</strong><span>Example 2</span>");
      expect(menu.shownItem(0).active()).toBe(false);
      expect(menu.element().childNodes[4].innerHTML).toEqual("<strong>Part-of-Speech</strong>");
      expect(menu.shownItem(1).active()).toBe(true);
      expect(menu.element().childNodes[5].innerHTML).toEqual("<strong>Syntax</strong>");
      expect(menu.shownItem(2).active()).toBe(false);
      expect(menu.element().childNodes[6]).toBe(undefined);

      // Activate prev (3)
      menu.prev();
      expect(menu.shownItem(0).name()).toEqual("Morphology");
      expect(menu.shownItem(0).active()).toBe(true);
      expect(menu.shownItem(1).name()).toEqual("Part-of-Speech");
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(2).name()).toEqual("Syntax");
      expect(menu.shownItem(2).active()).toBe(false);
      expect(menu.element().childNodes[6]).toBe(undefined);

      // Activate prev (4)
      menu.prev();
      expect(menu.shownItem(0).name()).toEqual("Lemma");
      expect(menu.shownItem(0).active()).toBe(true);
      expect(menu.shownItem(1).name()).toEqual("Morphology");
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(2).name()).toEqual("Part-of-Speech");
      expect(menu.shownItem(2).active()).toBe(false);
      expect(menu.element().childNodes[6]).toBe(undefined);

      // Activate prev (5)
      menu.prev();
      expect(menu.shownItem(0).name()).toEqual("Constituency");
      expect(menu.shownItem(0).active()).toBe(true);
      expect(menu.shownItem(1).name()).toEqual("Lemma");
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(2).name()).toEqual("Morphology");
      expect(menu.shownItem(2).active()).toBe(false);
      expect(menu.element().childNodes[6]).toBe(undefined);

      // Activate next (1)
      menu.next();
      expect(menu.shownItem(0).name()).toEqual("Constituency");
      expect(menu.shownItem(0).active()).toBe(false);
      expect(menu.shownItem(1).name()).toEqual("Lemma");
      expect(menu.shownItem(1).active()).toBe(true);
      expect(menu.shownItem(2).name()).toEqual("Morphology");
      expect(menu.shownItem(2).active()).toBe(false);
      expect(menu.element().childNodes[6]).toBe(undefined);

      // Activate prev (6)
      menu.prev();

      // Activate prev (7)
      menu.prev();
      expect(menu.shownItem(0).name()).toEqual("Morphology");
      expect(menu.shownItem(0).active()).toBe(false);
      expect(menu.shownItem(1).name()).toEqual("Part-of-Speech");
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(2).name()).toEqual("Syntax");
      expect(menu.shownItem(2).active()).toBe(true);
      expect(menu.element().childNodes[6]).toBe(undefined);
    });


    it('should be navigatable and filterable (prefix = "o")', function () {
      var menu = KorAP.HintMenu.create("cnx/", list);
      menu._firstActive = true;
      menu.limit(2);

      expect(menu.prefix("o").show()).toBe(true);
      expect(menu.shownItem(0).name()).toEqual("Constituency");
      expect(menu.element().childNodes[3].innerHTML).toEqual("<strong>C<mark>o</mark>nstituency</strong><span>Example 1</span>");
      expect(menu.shownItem(0).active()).toBe(true);
      expect(menu.shownItem(1).name()).toEqual("Morphology");
      expect(menu.element().childNodes[4].innerHTML).toEqual("<strong>M<mark>o</mark>rph<mark>o</mark>l<mark>o</mark>gy</strong><span>Example 2</span>");
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(2)).toBe(undefined);

      // Next (1)
      menu.next();
      expect(menu.shownItem(0).name()).toEqual("Constituency");
      expect(menu.element().childNodes[3].innerHTML).toEqual("<strong>C<mark>o</mark>nstituency</strong><span>Example 1</span>");
      expect(menu.shownItem(0).active()).toBe(false);
      expect(menu.shownItem(1).name()).toEqual("Morphology");
      expect(menu.element().childNodes[4].innerHTML).toEqual("<strong>M<mark>o</mark>rph<mark>o</mark>l<mark>o</mark>gy</strong><span>Example 2</span>");
      expect(menu.shownItem(1).active()).toBe(true);
      expect(menu.shownItem(2)).toBe(undefined);

      // Next (2)
      menu.next();
      expect(menu.shownItem(0).name()).toEqual("Morphology");
      expect(menu.element().childNodes[3].innerHTML).toEqual("<strong>M<mark>o</mark>rph<mark>o</mark>l<mark>o</mark>gy</strong><span>Example 2</span>");
      expect(menu.shownItem(0).active()).toBe(false);
      expect(menu.shownItem(1).name()).toEqual("Part-of-Speech");
      expect(menu.element().childNodes[4].innerHTML).toEqual("<strong>Part-<mark>o</mark>f-Speech</strong>");
      expect(menu.shownItem(1).active()).toBe(true);
      expect(menu.shownItem(2)).toBe(undefined);

      // Next (3) - to prefix
      menu.next();
      expect(menu.shownItem(0).name()).toEqual("Morphology");
      expect(menu.element().childNodes[3].innerHTML).toEqual("<strong>M<mark>o</mark>rph<mark>o</mark>l<mark>o</mark>gy</strong><span>Example 2</span>");
      expect(menu.shownItem(0).active()).toBe(false);
      expect(menu.shownItem(1).name()).toEqual("Part-of-Speech");
      expect(menu.element().childNodes[4].innerHTML).toEqual("<strong>Part-<mark>o</mark>f-Speech</strong>");
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(2)).toBe(undefined);

      menu.next();
      expect(menu.shownItem(0).name()).toEqual("Constituency");
      expect(menu.element().childNodes[3].innerHTML).toEqual("<strong>C<mark>o</mark>nstituency</strong><span>Example 1</span>");
      expect(menu.shownItem(0).active()).toBe(true);
      expect(menu.shownItem(1).name()).toEqual("Morphology");
      expect(menu.element().childNodes[4].innerHTML).toEqual("<strong>M<mark>o</mark>rph<mark>o</mark>l<mark>o</mark>gy</strong><span>Example 2</span>");
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(2)).toBe(undefined);
    });


    it('should be navigatable and filterable (prefix = "ex", "e")', function () {
      var menu = KorAP.HintMenu.create("cnx/", list);
      menu._firstActive = true;

      menu.limit(2);
      expect(menu.prefix("ex").show()).toBe(true);

      expect(menu.shownItem(0).name()).toEqual("Constituency");
      expect(menu.element().childNodes[3].innerHTML).toEqual("<strong>Constituency</strong><span><mark>Ex</mark>ample 1</span>");
      expect(menu.shownItem(0).active()).toBe(true);
      expect(menu.shownItem(1).name()).toEqual("Morphology");
      expect(menu.element().childNodes[4].innerHTML).toEqual("<strong>Morphology</strong><span><mark>Ex</mark>ample 2</span>");
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(2)).toBe(undefined);

      // Next (1)
      menu.next();
      expect(menu.shownItem(0).name()).toEqual("Constituency");
      expect(menu.element().childNodes[3].innerHTML).toEqual("<strong>Constituency</strong><span><mark>Ex</mark>ample 1</span>");
      expect(menu.shownItem(0).active()).toBe(false);
      expect(menu.shownItem(1).name()).toEqual("Morphology");
      expect(menu.element().childNodes[4].innerHTML).toEqual("<strong>Morphology</strong><span><mark>Ex</mark>ample 2</span>");
      expect(menu.shownItem(1).active()).toBe(true);
      expect(menu.shownItem(2)).toBe(undefined);

      // Next (2)
      menu.next();

      expect(menu.prefix()).toEqual('ex');
      expect(menu.shownItem(0).name()).toEqual("Constituency");
      expect(menu.element().childNodes[3].innerHTML).toEqual("<strong>Constituency</strong><span><mark>Ex</mark>ample 1</span>");
      expect(menu.shownItem(0).active()).toBe(false);

      expect(menu.shownItem(1).name()).toEqual("Morphology");
      expect(menu.element().childNodes[4].innerHTML).toEqual("<strong>Morphology</strong><span><mark>Ex</mark>ample 2</span>");
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(2)).toBe(undefined);

      // Reset limit
      menu.limit(5);

      // Change show
      expect(menu.prefix("e").show()).toBe(true);
      expect(menu._prefix.active()).toBe(false);
      expect(menu.shownItem(0).name()).toEqual("Constituency");
      expect(menu.element().childNodes[3].innerHTML).toEqual("<strong>Constitu<mark>e</mark>ncy</strong><span><mark>E</mark>xampl<mark>e</mark> 1</span>");
      expect(menu.shownItem(0).active()).toBe(true);
      expect(menu.shownItem(1).name()).toEqual("Morphology");
      expect(menu.element().childNodes[4].innerHTML).toEqual("<strong>Morphology</strong><span><mark>E</mark>xampl<mark>e</mark> 2</span>");
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(2)).toBe(undefined);

      // Next (1)
      menu.next();
      expect(menu._prefix.active()).toBe(false);
      expect(menu.prefix()).toEqual('e');
      expect(menu.shownItem(0).name()).toEqual("Constituency");
      expect(menu.element().childNodes[3].innerHTML).toEqual("<strong>Constitu<mark>e</mark>ncy</strong><span><mark>E</mark>xampl<mark>e</mark> 1</span>");
      expect(menu.shownItem(0).active()).toBe(false);
      expect(menu.shownItem(1).name()).toEqual("Morphology");
      expect(menu.element().childNodes[4].innerHTML).toEqual("<strong>Morphology</strong><span><mark>E</mark>xampl<mark>e</mark> 2</span>");
      expect(menu.shownItem(1).active()).toBe(true);
      expect(menu.shownItem(2)).toBe(undefined);

      // Next (2)
      menu.next();
      expect(menu._prefix.active()).toBe(true);
      expect(menu.shownItem(0).name()).toEqual("Constituency");
      expect(menu.element().childNodes[3].innerHTML).toEqual("<strong>Constitu<mark>e</mark>ncy</strong><span><mark>E</mark>xampl<mark>e</mark> 1</span>");
      expect(menu.shownItem(0).active()).toBe(false);
      expect(menu.shownItem(1).name()).toEqual("Morphology");
      expect(menu.element().childNodes[4].innerHTML).toEqual("<strong>Morphology</strong><span><mark>E</mark>xampl<mark>e</mark> 2</span>");
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(2)).toBe(undefined);

      // Next (3)
      menu.next();
      expect(menu._prefix.active()).toBe(false);
      expect(menu.shownItem(0).name()).toEqual("Constituency");
      expect(menu.element().childNodes[3].innerHTML).toEqual("<strong>Constitu<mark>e</mark>ncy</strong><span><mark>E</mark>xampl<mark>e</mark> 1</span>");
      expect(menu.shownItem(0).active()).toBe(true);
      expect(menu.shownItem(1).name()).toEqual("Morphology");
      expect(menu.element().childNodes[4].innerHTML).toEqual("<strong>Morphology</strong><span><mark>E</mark>xampl<mark>e</mark> 2</span>");
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(2)).toBe(undefined);
    });


    it('should choose prefix with failing prefix (1)', function () {
      var menu = KorAP.HintMenu.create("cnx/", list);
      menu.limit(2);
      expect(menu.prefix("exit").show()).toBe(true);
      expect(menu.element().querySelector('li')).toBe(null);
      expect(menu.shownItem(0)).toBeUndefined();
      expect(menu._prefix.active()).toBe(true);
    });


    it('should choose prefix with failing prefix (2)', function () {
      var menu = KorAP.HintMenu.create("cnx/", list);
      menu.limit(2);
      expect(menu.show()).toBe(true);
      expect(menu.prefix("exit").show()).toBe(true);
      expect(menu.element().querySelector('li')).toBe(null);
      expect(menu.shownItem(0)).toBeUndefined();
      expect(menu._prefix.active()).toBe(true);
    });

    it('should ignore navigation with failing prefix', function () {
      var menu = KorAP.HintMenu.create("cnx/", list);
      menu.limit(2);
      expect(menu.show()).toBe(true);

      menu.next();

      expect(menu.prefix("exit").show()).toBe(true);
      expect(menu.element().querySelector('li')).toBe(null);
      expect(menu.shownItem(0)).toBeUndefined();
      expect(menu._prefix.active()).toBe(true);

      menu.next();
      expect(menu._prefix.active()).toBe(true);

      menu.prev();
      expect(menu._prefix.active()).toBe(true);

    });

    it('should be navigatable with prefix', function () {
      var menu = KorAP.HintMenu.create("cnx/", demolist);
      menu._firstActive = true;

      menu.limit(3);

      expect(menu.show()).toBe(true);
      expect(menu.prefix()).toEqual("");

      expect(menu.shownItem(0).name()).toEqual("Titel");
      expect(menu.element().childNodes[3].innerHTML).toEqual("<strong>Titel</strong>");
      expect(menu.shownItem(0).active()).toBe(true);
      expect(menu.shownItem(1).name()).toEqual("Untertitel");
      expect(menu.element().childNodes[4].innerHTML).toEqual("<strong>Untertitel</strong>");
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(2).name()).toEqual("Veröffentlichungsdatum");
      expect(menu.element().childNodes[5].innerHTML).toEqual("<strong>Veröffentlichungsdatum</strong>");
      expect(menu.shownItem(2).active()).toBe(false);
      expect(menu.shownItem(3)).toBe(undefined);

      menu._prefix.add('a');
      expect(menu.show()).toBe(true);
      expect(menu.prefix()).toEqual("a");
      expect(menu.shownItem(0).name()).toEqual("Autor");
      expect(menu.element().childNodes[3].innerHTML).toEqual("<strong><mark>A</mark>utor</strong>");

      menu._prefix.add('u');
      expect(menu.show()).toBe(true);
      expect(menu.prefix()).toEqual("au");
      expect(menu.shownItem(0).name()).toEqual("Autor");
      expect(menu.element().childNodes[3].innerHTML).toEqual("<strong><mark>Au</mark>tor</strong>");

      menu._prefix.chop();
      expect(menu.show()).toBe(true);
      expect(menu.prefix()).toEqual("a");
      expect(menu.shownItem(0).name()).toEqual("Autor");
      expect(menu.element().childNodes[3].innerHTML).toEqual("<strong><mark>A</mark>utor</strong>");

      menu._prefix.chop();
      expect(menu.show()).toBe(true);
      expect(menu.prefix()).toEqual("");
      expect(menu.shownItem(0).name()).toEqual("Titel");
      expect(menu.element().childNodes[3].innerHTML).toEqual("<strong>Titel</strong>");
      expect(menu.shownItem(0).active()).toBe(true);
      expect(menu.shownItem(1).name()).toEqual("Untertitel");
      expect(menu.element().childNodes[4].innerHTML).toEqual("<strong>Untertitel</strong>");
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(2).name()).toEqual("Veröffentlichungsdatum");
      expect(menu.element().childNodes[5].innerHTML).toEqual("<strong>Veröffentlichungsdatum</strong>");
      expect(menu.shownItem(2).active()).toBe(false);
      expect(menu.shownItem(3)).toBe(undefined);

      // Forward
      menu._prefix.chop();
      expect(menu.show()).toBe(true);
      expect(menu.prefix()).toEqual("");
      expect(menu.shownItem(0).name()).toEqual("Titel");
      expect(menu.element().childNodes[3].innerHTML).toEqual("<strong>Titel</strong>");
      expect(menu.shownItem(0).active()).toBe(true);
      expect(menu.shownItem(1).name()).toEqual("Untertitel");
      expect(menu.element().childNodes[4].innerHTML).toEqual("<strong>Untertitel</strong>");
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(2).name()).toEqual("Veröffentlichungsdatum");
      expect(menu.element().childNodes[5].innerHTML).toEqual("<strong>Veröffentlichungsdatum</strong>");
      expect(menu.shownItem(2).active()).toBe(false);

      // Forward
      menu.next();
      expect(menu.prefix()).toEqual("");
      expect(menu.shownItem(0).name()).toEqual("Titel");
      expect(menu.element().childNodes[3].innerHTML).toEqual("<strong>Titel</strong>");
      expect(menu.shownItem(0).active()).toBe(false);
      expect(menu.shownItem(1).name()).toEqual("Untertitel");
      expect(menu.element().childNodes[4].innerHTML).toEqual("<strong>Untertitel</strong>");
      expect(menu.shownItem(1).active()).toBe(true);
      expect(menu.shownItem(2).name()).toEqual("Veröffentlichungsdatum");
      expect(menu.element().childNodes[5].innerHTML).toEqual("<strong>Veröffentlichungsdatum</strong>");
      expect(menu.shownItem(2).active()).toBe(false);
      expect(menu.shownItem(3)).toBe(undefined);

      // Forward
      menu.next();
      expect(menu.prefix()).toEqual("");
      expect(menu.shownItem(0).name()).toEqual("Titel");
      expect(menu.element().childNodes[3].innerHTML).toEqual("<strong>Titel</strong>");
      expect(menu.shownItem(0).active()).toBe(false);
      expect(menu.shownItem(1).name()).toEqual("Untertitel");
      expect(menu.element().childNodes[4].innerHTML).toEqual("<strong>Untertitel</strong>");
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(2).name()).toEqual("Veröffentlichungsdatum");
      expect(menu.element().childNodes[5].innerHTML).toEqual("<strong>Veröffentlichungsdatum</strong>");
      expect(menu.shownItem(2).active()).toBe(true);
      expect(menu.shownItem(3)).toBe(undefined);

      // Forward
      menu.next();
      expect(menu.prefix()).toEqual("");
      expect(menu.shownItem(0).name()).toEqual("Untertitel");
      expect(menu.element().childNodes[3].innerHTML).toEqual("<strong>Untertitel</strong>");
      expect(menu.shownItem(0).active()).toBe(false);
      expect(menu.shownItem(1).name()).toEqual("Veröffentlichungsdatum");
      expect(menu.element().childNodes[4].innerHTML).toEqual("<strong>Veröffentlichungsdatum</strong>");
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(2).name()).toEqual("Länge");
      expect(menu.element().childNodes[5].innerHTML).toEqual("<strong>Länge</strong>");
      expect(menu.shownItem(2).active()).toBe(true);
      expect(menu.shownItem(3)).toBe(undefined);

      // Forward
      menu.next();
      expect(menu.prefix()).toEqual("");
      expect(menu.shownItem(0).name()).toEqual("Veröffentlichungsdatum");
      expect(menu.element().childNodes[3].innerHTML).toEqual("<strong>Veröffentlichungsdatum</strong>");
      expect(menu.shownItem(0).active()).toBe(false);
      expect(menu.shownItem(1).name()).toEqual("Länge");
      expect(menu.element().childNodes[4].innerHTML).toEqual("<strong>Länge</strong>");
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(2).name()).toEqual("Autor");
      expect(menu.element().childNodes[5].innerHTML).toEqual("<strong>Autor</strong>");
      expect(menu.shownItem(2).active()).toBe(true);
      expect(menu.shownItem(3)).toBe(undefined);

      // Forward
      menu.next();
      expect(menu.prefix()).toEqual("");
      expect(menu.shownItem(0).name()).toEqual("Titel");
      expect(menu.element().childNodes[3].innerHTML).toEqual("<strong>Titel</strong>");
      expect(menu.shownItem(0).active()).toBe(true);
      expect(menu.shownItem(1).name()).toEqual("Untertitel");
      expect(menu.element().childNodes[4].innerHTML).toEqual("<strong>Untertitel</strong>");
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(2).name()).toEqual("Veröffentlichungsdatum");
      expect(menu.element().childNodes[5].innerHTML).toEqual("<strong>Veröffentlichungsdatum</strong>");
      expect(menu.shownItem(2).active()).toBe(false);
    });


    it('should be navigatable with a prefix (1)', function () {
      var menu = KorAP.HintMenu.create("cnx/", demolist);
      menu._firstActive = true;

      menu.limit(3);

      expect(menu.show()).toBe(true);
      expect(menu.prefix()).toEqual("");

      // Add prefix in uppercase - but check in lowercase
      menu.prefix('El');
      expect(menu.show()).toBe(true);

      expect(menu.prefix()).toEqual("El");
      expect(menu._prefix.active()).toEqual(false);
      expect(menu.shownItem(0).name()).toEqual("Titel");
      expect(menu.element().childNodes[3].innerHTML).toEqual("<strong>Tit<mark>el</mark></strong>");
      expect(menu.shownItem(0).active()).toBe(true);
      expect(menu.shownItem(1).name()).toEqual("Untertitel");
      expect(menu.element().childNodes[4].innerHTML).toEqual("<strong>Untertit<mark>el</mark></strong>");
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(2)).toBe(undefined);

      // Forward
      menu.next();
      expect(menu.prefix()).toEqual("El");
      expect(menu._prefix.active()).toEqual(false);
      expect(menu.shownItem(0).name()).toEqual("Titel");
      expect(menu.element().childNodes[3].innerHTML).toEqual("<strong>Tit<mark>el</mark></strong>");
      expect(menu.shownItem(0).active()).toBe(false);
      expect(menu.shownItem(1).name()).toEqual("Untertitel");
      expect(menu.element().childNodes[4].innerHTML).toEqual("<strong>Untertit<mark>el</mark></strong>");
      expect(menu.shownItem(1).active()).toBe(true);
      expect(menu.shownItem(2)).toBe(undefined);

      // Forward
      menu.next();
      expect(menu.prefix()).toEqual("El");
      expect(menu._prefix.active()).toEqual(true);
      expect(menu.shownItem(0).name()).toEqual("Titel");
      expect(menu.element().childNodes[3].innerHTML).toEqual("<strong>Tit<mark>el</mark></strong>");
      expect(menu.shownItem(0).active()).toBe(false);
      expect(menu.shownItem(1).name()).toEqual("Untertitel");
      expect(menu.element().childNodes[4].innerHTML).toEqual("<strong>Untertit<mark>el</mark></strong>");
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(2)).toBe(undefined);

      // Backward
      menu.prev();
      expect(menu.prefix()).toEqual("El");
      expect(menu._prefix.active()).toEqual(false);
      expect(menu.shownItem(0).name()).toEqual("Titel");
      expect(menu.element().childNodes[3].innerHTML).toEqual("<strong>Tit<mark>el</mark></strong>");
      expect(menu.shownItem(0).active()).toBe(false);

      expect(menu.shownItem(1).name()).toEqual("Untertitel");
      expect(menu.element().childNodes[4].innerHTML).toEqual("<strong>Untertit<mark>el</mark></strong>");
      expect(menu.shownItem(1).active()).toBe(true);
      expect(menu.shownItem(2)).toBe(undefined);
    });


    it('should be navigatable with a prefix (2)', function () {
      var menu = KorAP.HintMenu.create("cnx/", demolist);
      menu._firstActive = true;

      menu.limit(3);
      expect(menu.show()).toBe(true);
      expect(menu.prefix()).toEqual("");
      menu.prefix('el');
      expect(menu.show()).toBe(true);

      expect(menu.prefix()).toEqual("el");
      expect(menu._prefix.active()).toEqual(false);
      expect(menu.shownItem(0).name()).toEqual("Titel");
      expect(menu.element().childNodes[3].innerHTML).toEqual("<strong>Tit<mark>el</mark></strong>");
      expect(menu.shownItem(0).active()).toBe(true);
      expect(menu.shownItem(1).name()).toEqual("Untertitel");
      expect(menu.element().childNodes[4].innerHTML).toEqual("<strong>Untertit<mark>el</mark></strong>");
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(2)).toBe(undefined);

      // Backward
      menu.prev();
      expect(menu._prefix.active()).toEqual(true);

      expect(menu.shownItem(0).name()).toEqual("Titel");
      expect(menu.element().childNodes[3].innerHTML).toEqual("<strong>Tit<mark>el</mark></strong>");
      expect(menu.shownItem(0).active()).toBe(false);

      expect(menu.shownItem(1).name()).toEqual("Untertitel");
      expect(menu.element().childNodes[4].innerHTML).toEqual("<strong>Untertit<mark>el</mark></strong>");
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(2)).toBe(undefined);

      // Backward
      menu.prev();
      expect(menu._prefix.active()).toEqual(false);
      expect(menu.shownItem(0).name()).toEqual("Titel");
      expect(menu.element().childNodes[3].innerHTML).toEqual("<strong>Tit<mark>el</mark></strong>");
      expect(menu.shownItem(0).active()).toBe(false);
      expect(menu.shownItem(1).name()).toEqual("Untertitel");
      expect(menu.element().childNodes[4].innerHTML).toEqual("<strong>Untertit<mark>el</mark></strong>");
      expect(menu.shownItem(1).active()).toBe(true);
      expect(menu.shownItem(2)).toBe(undefined);
    });

    it('should be navigatable with a prefix (3)', function () {
      var menu = KorAP.HintMenu.create("cnx/", demolist);
      menu._firstActive = true;
      menu.limit(3);
      expect(menu.show()).toBe(true);
      expect(menu.prefix()).toEqual("");
      menu.prefix('el');
      expect(menu.show()).toBe(true);

      expect(menu.prefix()).toEqual("el");
      expect(menu._prefix.active()).toEqual(false);
      expect(menu.shownItem(0).name()).toEqual("Titel");
      expect(menu.element().childNodes[3].innerHTML).toEqual("<strong>Tit<mark>el</mark></strong>");
      expect(menu.shownItem(0).active()).toBe(true);
      expect(menu.shownItem(1).name()).toEqual("Untertitel");
      expect(menu.element().childNodes[4].innerHTML).toEqual("<strong>Untertit<mark>el</mark></strong>");
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(2)).toBe(undefined);

      // Backward
      menu.prev();
      expect(menu._prefix.active()).toEqual(true);
      expect(menu.shownItem(0).name()).toEqual("Titel");
      expect(menu.element().childNodes[3].innerHTML).toEqual("<strong>Tit<mark>el</mark></strong>");
      expect(menu.shownItem(0).active()).toBe(false);
      expect(menu.shownItem(1).name()).toEqual("Untertitel");
      expect(menu.element().childNodes[4].innerHTML).toEqual("<strong>Untertit<mark>el</mark></strong>");
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(2)).toBe(undefined);


      // Forward
      menu.next();
      expect(menu.prefix()).toEqual("el");
      expect(menu._prefix.active()).toEqual(false);
      expect(menu.shownItem(0).name()).toEqual("Titel");
      expect(menu.element().childNodes[3].innerHTML).toEqual("<strong>Tit<mark>el</mark></strong>");
      expect(menu.shownItem(0).active()).toBe(true);
      expect(menu.shownItem(1).name()).toEqual("Untertitel");
      expect(menu.element().childNodes[4].innerHTML).toEqual("<strong>Untertit<mark>el</mark></strong>");
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(2)).toBe(undefined);

    });

    it('should show screens by offset', function () {
      var menu = KorAP.HintMenu.create('cnx/', demolist);
      menu.limit(3);
      expect(menu.show()).toBe(true);

      expect(menu.shownItem(0).active()).toBe(false);
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(2).active()).toBe(false);

      // Highlight the first entry
      menu.next();

      expect(menu.shownItem(0).active()).toBe(true);
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(2).active()).toBe(false);

      // Highlight the second entry
      menu.next();

      expect(menu.shownItem(0).active()).toBe(false);
      expect(menu.shownItem(1).active()).toBe(true);
      expect(menu.shownItem(2).active()).toBe(false);
      expect(menu.shownItem(3)).toBe(undefined);

      expect(menu.shownItem(0).lcField()).toEqual(' titel');
      expect(menu.shownItem(1).lcField()).toEqual(' untertitel');

      // Move to first screen
      menu.screen(0);
      expect(menu.shownItem(0).lcField()).toEqual(' titel');
      expect(menu.shownItem(1).lcField()).toEqual(' untertitel');
      expect(menu.shownItem(0).active()).toBe(false);
      expect(menu.shownItem(1).active()).toBe(true);
      expect(menu.shownItem(2).active()).toBe(false);
      expect(menu.shownItem(3)).toBe(undefined);

      // Move to second screen
      menu.screen(1);
      expect(menu.shownItem(0).lcField()).toEqual(' untertitel');
      expect(menu.shownItem(0).active()).toBe(true);
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(2).active()).toBe(false);
      expect(menu.shownItem(3)).toBe(undefined);

      menu.screen(2);
      expect(menu.shownItem(0).lcField()).toEqual(' veröffentlichungsdatum');
      expect(menu.shownItem(0).active()).toBe(false);
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(2).active()).toBe(false);
      expect(menu.shownItem(3)).toBe(undefined);

      menu.screen(1);
      expect(menu.shownItem(0).lcField()).toEqual(' untertitel');
      expect(menu.shownItem(0).active()).toBe(true);
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(2).active()).toBe(false);
      expect(menu.shownItem(3)).toBe(undefined);
    });

    it('should show screens by offset when prefixed', function () {
      var menu = KorAP.HintMenu.create('cnx/', demolist);
      menu.limit(3);
      expect(menu.prefix("e").show()).toBe(true);
      expect(menu.shownItem(0).active()).toBe(false);
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(2).active()).toBe(false);

      expect(menu.shownItem(0).element().innerHTML).toEqual('<strong>Tit<mark>e</mark>l</strong>');
      menu.screen(1);
      expect(menu.shownItem(0).element().innerHTML).toEqual('<strong>Unt<mark>e</mark>rtit<mark>e</mark>l</strong>');
    });


    it('should be page downable', function () {
      var menu = KorAP.OwnMenu.create(demolonglist);
      menu.limit(3);

      expect(menu.show(0)).toBe(true);

      expect(menu.shownItem(0).active()).toBe(true);
      expect(menu.shownItem(0).lcField()).toEqual(' titel');
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(2).active()).toBe(false);
      expect(menu.shownItem(3)).toBe(undefined);

      menu.pageDown();

      expect(menu.shownItem(0).lcField()).toEqual(' länge');
      expect(menu.shownItem(0).active()).toBe(false);
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(2).active()).toBe(false);

      menu.pageDown();

      expect(menu.shownItem(0).lcField()).toEqual(' corpusid');
      expect(menu.shownItem(0).active()).toBe(false);
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(2).active()).toBe(false);

      // Doesn't matter
      menu.pageDown();

      expect(menu.shownItem(0).lcField()).toEqual(' corpusid');
      expect(menu.shownItem(0).active()).toBe(false);
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(2).active()).toBe(false);
    });

    it('should be page downable with prefix', function () {
      var menu = KorAP.OwnMenu.create(demolonglist);
      menu.limit(3);

      expect(menu.prefix('e').show(0)).toBe(true);

      expect(menu.shownItem(0).active()).toBe(true);
      expect(menu.shownItem(0).lcField()).toEqual(' titel');
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(1).lcField()).toEqual(' untertitel');
      expect(menu.shownItem(2).active()).toBe(false);
      expect(menu.shownItem(2).lcField()).toEqual(' veröffentlichungsdatum');
      expect(menu.shownItem(3)).toBe(undefined);

      menu.pageDown();

      expect(menu.shownItem(0).active()).toBe(false);
      expect(menu.shownItem(0).lcField()).toEqual(' länge');
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(1).lcField()).toEqual(' genre');
      expect(menu.shownItem(2).active()).toBe(false);
      expect(menu.shownItem(2).lcField()).toEqual(' textid');

      // Doesn't matter
      menu.pageDown();

      expect(menu.shownItem(0).active()).toBe(false);
      expect(menu.shownItem(0).lcField()).toEqual(' länge');
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(1).lcField()).toEqual(' genre');
      expect(menu.shownItem(2).active()).toBe(false);
      expect(menu.shownItem(2).lcField()).toEqual(' textid');
    });


    it('should be page upable', function () {
      var menu = KorAP.OwnMenu.create(demolonglist);
      menu.limit(3);

      // Choose the final value
      expect(menu.show(1000)).toBe(true);

      expect(menu.shownItem(0).active()).toBe(false);
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(2).active()).toBe(true);
      expect(menu.shownItem(2).lcField()).toEqual(' textid');
      expect(menu.shownItem(3)).toBe(undefined);

      menu.pageUp();

      expect(menu.shownItem(0).lcField()).toEqual(' länge');
      expect(menu.shownItem(0).active()).toBe(false);
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(2).active()).toBe(false);

      menu.pageUp();

      expect(menu.shownItem(0).lcField()).toEqual(' titel');
      expect(menu.shownItem(0).active()).toBe(false);
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(2).active()).toBe(false);

      // Doesn't matter
      menu.pageUp();

      expect(menu.shownItem(0).lcField()).toEqual(' titel');
      expect(menu.shownItem(0).active()).toBe(false);
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(2).active()).toBe(false);
    });

    it('should be page upable with prefix', function () {
      var menu = KorAP.OwnMenu.create(demolonglist);
      menu.limit(3);

      // Choose the final value
      expect(menu.prefix("e").show(1000)).toBe(true);

      expect(menu.shownItem(0).active()).toBe(false);
      expect(menu.shownItem(0).lcField()).toEqual(' länge');
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(1).lcField()).toEqual(' genre');
      expect(menu.shownItem(2).active()).toBe(true);
      expect(menu.shownItem(2).lcField()).toEqual(' textid');
      expect(menu.shownItem(3)).toBe(undefined);

      menu.pageUp();

      expect(menu.shownItem(0).lcField()).toEqual(' titel');
      expect(menu.shownItem(0).active()).toBe(false);
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(1).lcField()).toEqual(' untertitel');
      expect(menu.shownItem(2).active()).toBe(false);
      expect(menu.shownItem(2).lcField()).toEqual(' veröffentlichungsdatum');

      // Doesn't matter
      menu.pageUp();

      expect(menu.shownItem(0).lcField()).toEqual(' titel');
      expect(menu.shownItem(0).active()).toBe(false);
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(1).lcField()).toEqual(' untertitel');
      expect(menu.shownItem(2).active()).toBe(false);
      expect(menu.shownItem(2).lcField()).toEqual(' veröffentlichungsdatum');
    });

    it('should scroll to a chosen value', function () {
      var menu = KorAP.OwnMenu.create(demolist);
      menu.limit(3);

      // Choose value 1
      expect(menu.show(1)).toBe(true);

      expect(menu.shownItem(0).active()).toBe(false);
      expect(menu.shownItem(0).lcField()).toEqual(' titel');
      expect(menu.shownItem(1).active()).toBe(true);
      expect(menu.shownItem(2).active()).toBe(false);
      expect(menu.shownItem(3)).toBe(undefined);

      // Choose value 2
      expect(menu.show(2)).toBe(true);

      expect(menu.shownItem(0).active()).toBe(false);
      expect(menu.shownItem(0).lcField()).toEqual(' titel');
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(2).active()).toBe(true);
      expect(menu.shownItem(3)).toBe(undefined);

    });

    xit('should highlight a chosen value');
    xit('should move the viewport to active, if active is not in the viewport');
  });




  describe('KorAP.Prefix', function () {
    it('should be initializable', function () {
      var p = prefixClass.create();
      expect(p.element().classList.contains('pref')).toBeTruthy();
      expect(p.isSet()).not.toBeTruthy();

/*
      expect(mi.lcField()).toEqual(' baum');
*/
      
    });

    it('should be modifiable', function () {
      var p = prefixClass.create();
      expect(p.value()).toEqual('');
      expect(p.element().firstChild).toBeNull();

      // Set string
      expect(p.value('Test')).toEqual('Test');
      expect(p.value()).toEqual('Test');
      expect(p.element().firstChild.nodeValue).toEqual('Test');

      // Add string
      expect(p.add('ified')).toEqual('Testified');
      expect(p.value()).toEqual('Testified');
      expect(p.element().firstChild.nodeValue).toEqual('Testified');

      // Clear string
      p.clear();
      expect(p.value()).toEqual('');
      expect(p.element().firstChild).toBeNull();

      // Set string
      expect(p.value('Test')).toEqual('Test');
      expect(p.value()).toEqual('Test');
      expect(p.element().firstChild.nodeValue).toEqual('Test');

      expect(p.chop()).toEqual('Tes');
      expect(p.value()).toEqual('Tes');
      expect(p.element().firstChild.nodeValue).toEqual('Tes');

      expect(p.chop()).toEqual('Te');
      expect(p.value()).toEqual('Te');
      expect(p.element().firstChild.nodeValue).toEqual('Te');

      expect(p.chop()).toEqual('T');
      expect(p.value()).toEqual('T');
      expect(p.element().firstChild.nodeValue).toEqual('T');

      expect(p.chop()).toEqual('');
      expect(p.value()).toEqual('');
      expect(p.element().firstChild).toBeNull();
    });

    it('should be activatable', function () {
      var p = prefixClass.create();
      expect(p.value()).toEqual('');
      expect(p.element().firstChild).toBeNull();

      expect(p.value('Test')).toEqual('Test');
      expect(p.element().firstChild.nodeValue).toEqual('Test');

      expect(p.active()).not.toBeTruthy();
      expect(p.element().classList.contains('active')).not.toBeTruthy();

      p.active(true);
      expect(p.active()).toBeTruthy();
      expect(p.element().classList.contains('active')).toBeTruthy();
    });
  });

  describe('KorAP.LengthField', function () {
    it('should be initializable', function () {
      var l = lengthFieldClass.create();
      expect(l.element().classList.contains('lengthField')).toBeTruthy();
      expect(l.element().children.length).toEqual(0);      
    });

    it('should be extensible', function () {
      var l = lengthFieldClass.create();
      l.add(['Baum']);
      expect(l.element().children.length).toEqual(1);
      expect(l.element().children[0].nodeName).toEqual('SPAN');
      expect(l.element().children[0].textContent).toEqual('Baum--');
      l.add(['Fragezeichen']);
      expect(l.element().children.length).toEqual(2);
      expect(l.element().children[1].nodeName).toEqual('SPAN');
      expect(l.element().children[1].textContent).toEqual('Fragezeichen--');
    });

    it('should be correctly initializable', function () {
      var list = [
	["Constituency"],
	["Lemma"],
	["Morphology"],
	["Part-of-Speech"],
	["Syntax"]
      ];

      var menu = KorAP.OwnMenu.create(list);

      expect(menu.lengthField().element().children.length).toEqual(5);
    });
  });

  describe('KorAP.Slider', function () {

    var demolonglist = [
      ['Titel', 'title'],
      ['Untertitel', 'subTitle'],
      ['Veröffentlichungsdatum', 'pubDate'],
      ['Länge', 'length'],
      ['Autor', 'author'],
      ['Genre', 'genre'],
      ['corpusID', 'corpusID'],
      ['docID', 'docID'],
      ['textID', 'textID'],
    ];

    it('should correctly be initializable', function () {
      var list = [
	["Constituency"],
	["Lemma"],
	["Morphology"],
	["Part-of-Speech"],
	["Syntax"]
      ];

      var menu = KorAP.OwnMenu.create(list);

      menu._firstActive = true;
      menu.limit(3);

      expect(menu.show()).toBe(true);

      expect(menu.shownItem(0).active()).toBe(true);
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(2).active()).toBe(false);
      expect(menu.slider().offset()).toEqual(0);
      expect(menu.position).toEqual(0);
    });

    it('should correctly move on arrow keys', function () {
      var list = [
	["Constituency"],
	["Lemma"],
	["Morphology"],
	["Part-of-Speech"],
	["Syntax"]
      ];

      var menu = KorAP.OwnMenu.create(list);

      menu._firstActive = true;
      menu.limit(3);

      expect(menu.show()).toBe(true);

      menu.next();
      expect(menu.shownItem(0).active()).toBe(false);
      expect(menu.shownItem(1).active()).toBe(true);
      expect(menu.shownItem(2).active()).toBe(false);
      expect(menu.slider().offset()).toEqual(0);
      expect(menu.position).toEqual(1);

      menu.next();
      expect(menu.shownItem(0).active()).toBe(false);
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(2).active()).toBe(true);
      expect(menu.slider().offset()).toEqual(0);
      expect(menu.position).toEqual(2);

      menu.next();
      expect(menu.shownItem(0).active()).toBe(false);
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(2).active()).toBe(true);
      expect(menu.slider().offset()).toEqual(1);
      expect(menu.position).toEqual(3);

      menu.next();
      expect(menu.shownItem(0).active()).toBe(false);
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(2).active()).toBe(true);
      expect(menu.slider().offset()).toEqual(2);
      expect(menu.position).toEqual(4);

      menu.next();
      expect(menu.shownItem(0).active()).toBe(true);
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(2).active()).toBe(false);
      expect(menu.slider().offset()).toEqual(0);
      expect(menu.position).toEqual(0);

      expect(menu.slider()._slider.style.height).toEqual('60%');
    });

    it('should correctly resize on prefixing', function () {
      var menu = KorAP.OwnMenu.create(demolonglist);
      menu._firstActive = true;
      menu.limit(3);

      expect(menu.show()).toBe(true);
      expect(menu.slider().offset()).toEqual(0);
      expect(menu.slider().length()).toEqual(9);

      expect(menu.prefix("e").show()).toBe(true);
      expect(menu.slider().length()).toEqual(6);

      expect(menu.prefix("el").show()).toBe(true);
      expect(menu.slider().length()).toEqual(2);

      expect(menu.prefix("e").show()).toBe(true);
      expect(menu.slider().length()).toEqual(6);

      expect(menu.prefix("").show()).toBe(true);
      expect(menu.slider().length()).toEqual(9);
    });


    it('should correctly move the list on mousemove', function () {
      var list = [
	["Constituency"],
	["Lemma"],
	["Morphology"],
	["Part-of-Speech"],
	["Syntax"]
      ];

      var menu = KorAP.OwnMenu.create(list);

      menu._firstActive = true;
      menu.limit(3);

      expect(menu.show()).toBe(true);

      expect(menu.shownItem(0).active()).toBe(true);
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(2).active()).toBe(false);
      expect(menu.slider().offset()).toEqual(0);

      // This will normally be done on 
      menu.slider()._rulerHeight = 100;
      menu.slider()._sliderHeight = 40;
      expect(menu.slider().length()).toEqual(5);

      menu.slider().movetoRel(10);
      expect(menu.slider().offset()).toEqual(0);
      expect(menu.shownItem(0).active()).toBe(true);
      expect(menu.shownItem(0).lcField()).toEqual(' constituency');
      menu.slider().movetoRel(24);
      expect(menu.slider().offset()).toEqual(0);
      menu.slider().movetoRel(25);
      expect(menu.slider().offset()).toEqual(0);

      menu.slider().movetoRel(30);
      expect(menu.slider().offset()).toEqual(1);
      menu.slider().movetoRel(59);
      expect(menu.slider().offset()).toEqual(1);
      expect(menu.shownItem(0).active()).toBe(false);
      expect(menu.shownItem(0).lcField()).toEqual(' lemma');

      // Everything > 60 is offset 2
      menu.slider().movetoRel(60);
      expect(menu.slider().offset()).toEqual(2);
      menu.slider().movetoRel(180);
      expect(menu.slider().offset()).toEqual(2);
      expect(menu.shownItem(0).active()).toBe(false);
      expect(menu.shownItem(0).lcField()).toEqual(' morphology');

      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(2).active()).toBe(false);

      // When the active cursor moves again - scroll to viewport
      // cursor is before viewport
      menu.next();
      expect(menu.shownItem(0).active()).toBe(true);
      expect(menu.shownItem(0).lcField()).toEqual(' lemma');
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(2).active()).toBe(false);

      menu.next();
      menu.next();
      expect(menu.shownItem(0).active()).toBe(false);
      expect(menu.shownItem(0).lcField()).toEqual(' lemma');
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(1).lcField()).toEqual(' morphology');
      expect(menu.shownItem(2).active()).toBe(true);
      expect(menu.shownItem(2).lcField()).toEqual(' part-of-speech');

      menu.slider().movetoRel(0);
      expect(menu.slider().offset()).toEqual(0);
      expect(menu.shownItem(0).active()).toBe(false);
      expect(menu.shownItem(0).lcField()).toEqual(' constituency');
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(1).lcField()).toEqual(' lemma');
      expect(menu.shownItem(2).active()).toBe(false);
      expect(menu.shownItem(2).lcField()).toEqual(' morphology');

      // cursor is after viewport
      menu.next();
      expect(menu.slider().offset()).toEqual(2);
      expect(menu.shownItem(0).active()).toBe(false);
      expect(menu.shownItem(0).lcField()).toEqual(' morphology');
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(1).lcField()).toEqual(' part-of-speech');
      expect(menu.shownItem(2).active()).toBe(true);
      expect(menu.shownItem(2).lcField()).toEqual(' syntax');

      menu.slider().movetoRel(0);
      expect(menu.slider().offset()).toEqual(0);
      expect(menu.shownItem(0).active()).toBe(false);
      expect(menu.shownItem(0).lcField()).toEqual(' constituency');
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(1).lcField()).toEqual(' lemma');
      expect(menu.shownItem(2).active()).toBe(false);
      expect(menu.shownItem(2).lcField()).toEqual(' morphology');

      menu.prev();
      expect(menu.slider().offset()).toEqual(2);
      expect(menu.shownItem(0).lcField()).toEqual(' morphology');
      expect(menu.shownItem(0).active()).toBe(false);
      expect(menu.shownItem(1).lcField()).toEqual(' part-of-speech');
      expect(menu.shownItem(1).active()).toBe(true);
      expect(menu.shownItem(2).lcField()).toEqual(' syntax');
      expect(menu.shownItem(2).active()).toBe(false);

      menu.prev();
      menu.prev();
      expect(menu.slider().offset()).toEqual(1);
      expect(menu.shownItem(0).lcField()).toEqual(' lemma');
      expect(menu.shownItem(0).active()).toBe(true);
      expect(menu.shownItem(1).lcField()).toEqual(' morphology');
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(2).lcField()).toEqual(' part-of-speech');
      expect(menu.shownItem(2).active()).toBe(false);

      menu.slider().movetoRel(100);
      expect(menu.slider().offset()).toEqual(2);
      expect(menu.shownItem(0).lcField()).toEqual(' morphology');
      expect(menu.shownItem(0).active()).toBe(false);
      expect(menu.shownItem(1).lcField()).toEqual(' part-of-speech');
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(2).lcField()).toEqual(' syntax');
      expect(menu.shownItem(2).active()).toBe(false);

      menu.prev();
      expect(menu.slider().offset()).toEqual(0);
      expect(menu.shownItem(0).lcField()).toEqual(' constituency');
      expect(menu.shownItem(0).active()).toBe(true);
      expect(menu.shownItem(1).lcField()).toEqual(' lemma');
      expect(menu.shownItem(1).active()).toBe(false);
      expect(menu.shownItem(2).lcField()).toEqual(' morphology');
      expect(menu.shownItem(2).active()).toBe(false);
    });
  });
});

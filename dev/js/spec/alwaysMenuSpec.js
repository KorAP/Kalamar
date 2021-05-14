define(
  ['alwaysmenu', 'menu/item', 'menu/prefix', 'menu/lengthField', 'alwaysentry'],
  function (alwaysMenuClass, menuItemClass, prefixClass, lengthFieldClass, alwaysEntryClass) {
 
    //These class definitions were taken from menuSpec for a guideline on how to procede

    // The OwnAlwaysMenu item
    KorAP.OwnAlwaysMenuItem = {
      create : function (params) {
        return Object.create(menuItemClass).upgradeTo(KorAP.OwnAlwaysMenuItem)._init(params);
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

    // The OwnAlwaysMenu
    KorAP.OwnAlwaysMenu = {
      create : function (list) {
        return alwaysMenuClass.create(list, { itemClass : KorAP.OwnAlwaysMenuItem } )
	        .upgradeTo(KorAP.OwnAlwaysMenu);
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
        if (this._el !== undefined)
	        return this._el;

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
        return this._el = li;
      }
    };


    // HintMenu
    KorAP.HintMenu = {
      create : function (context, list) {
        var obj = alwaysMenuClass.create(list, {itemClass : KorAP.HintMenuItem} )
	          .upgradeTo(KorAP.HintMenu);
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


    describe('KorAP.AlwaysMenu', function () {
      var list = [
        ["Constituency", "c=", "Example 1"],
        ["Lemma", "l="],
        ["Morphology", "m=", "Example 2"],
        ["Part-of-Speech", "p="],
        ["Syntax", "syn="]
      ];

      var listMultiPrefix = [
        ["PP","PP ","Personal Pronoun"],
        ["PPP","PPP ","Personal Pronoun, Plural"],
        ["PPPA","PPPA ","Personal Pronoun, Plural, Acc."],
        ["PPPD","PPPD ","Personal Pronoun, Plural, Dative"],
        ["PPPR","PPPR ","Personal Pronoun, Plural, Direct"],
        ["PPPO","PPPO ","Personal Pronoun, Plural, Oblique"],
        ["PPS","PPS ","Personal Pronoun, Singular"],
        ["PPSA","PPSA ","Personal Pronoun, Singular, Accusative"],
        ["PPSD","PPSD ","Personal Pronoun, Singular, Dative"],
        ["PPSR","PPSR ","Personal Pronoun, Singular, Direct"],
        ["PPSN","PPSN ","Personal Pronoun, Singular, Nominative"],
        ["PPSO","PPSO ","Personal Pronoun, Singular, Oblique"]
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

        var menu = KorAP.OwnAlwaysMenu.create(list);
        menu._firstActive = true;
        expect(menu.itemClass()).toEqual(KorAP.OwnAlwaysMenuItem);
        expect(menu._notItemElements).toEqual(4);
        expect(menu.element().getElementsByClassName("pref").length).toEqual(2);
        expect(menu.element().getElementsByClassName("pref")[1].innerHTML).toEqual("Speichern");
        expect(menu.alwaysEntry().element().innerHTML).toEqual("Speichern");
        expect(menu.element().childNodes[3].innerHTML).toEqual("Speichern");
        // getElementsByClassName funktioniert bei allen Kindern.


        // view
        menu.show();

        expect(menu.alwaysEntry().active()).toBe(false);
      });

      it('should be visible', function () {
        var menu = KorAP.HintMenu.create("cnx/", list);
        expect(menu.removeItems()).toBe(undefined);
        menu.limit(3);

        expect(menu.show()).toBe(true);

        expect(menu.element().childNodes[3+1].innerHTML).toEqual("<strong>Constituency</strong><span>Example 1</span>");
        expect(menu.element().childNodes[4+1].innerHTML).toEqual("<strong>Lemma</strong>");
        expect(menu.element().childNodes[4+1].getAttribute("data-action")).toEqual("l=");
        expect(menu.element().childNodes[5+1].innerHTML).toEqual("<strong>Morphology</strong><span>Example 2</span>");
        expect(menu.element().childNodes[6+1]).toBe(undefined);

        // Check boundaries
        expect(menu.element().childNodes[3+1].classList.contains("no-more")).toBe(true);
        expect(menu.element().childNodes[4+1].classList.contains("no-more")).toBe(false);
        expect(menu.element().childNodes[5+1].classList.contains("no-more")).toBe(false);
      });

      it('should be filterable', function () {
        var menu = KorAP.HintMenu.create("cnx/", list);
        menu.limit(3);
        expect(menu.prefix("o").show()).toBe(true);
        expect(menu.alwaysEntryValue("o").show()).toBe(true);
        expect(menu.alwaysEntryValue()).toEqual("o");
        expect(menu.element().childNodes[0].innerHTML).toEqual("o");
        expect(menu.element().childNodes[3].innerHTML).toEqual("Speichern");
        expect(menu.element().childNodes[3+1].innerHTML).toEqual("<strong>C<mark>o</mark>nstituency</strong><span>Example 1</span>");
        expect(menu.element().childNodes[4+1].innerHTML).toEqual("<strong>M<mark>o</mark>rph<mark>o</mark>l<mark>o</mark>gy</strong><span>Example 2</span>");
        expect(menu.element().childNodes[5+1].innerHTML).toEqual("<strong>Part-<mark>o</mark>f-Speech</strong>");
        expect(menu.element().childNodes[6+1]).toBe(undefined);

        // Check boundaries
        expect(menu.element().childNodes[3+1].classList.contains("no-more")).toBe(true);
        expect(menu.element().childNodes[4+1].classList.contains("no-more")).toBe(false);
        expect(menu.element().childNodes[5+1].classList.contains("no-more")).toBe(true);

        menu.limit(2);

        expect(menu.prefix("o").show()).toBe(true);
        expect(menu.alwaysEntryValue("o").show()).toBe(true);
        expect(menu.alwaysEntryValue()).toEqual("o");
        expect(menu.element().childNodes[0].innerHTML).toEqual("o");
        expect(menu.element().childNodes[3].innerHTML).toEqual("Speichern");
        expect(menu.element().childNodes[3+1].innerHTML).toEqual("<strong>C<mark>o</mark>nstituency</strong><span>Example 1</span>");
        expect(menu.element().childNodes[4+1].innerHTML).toEqual("<strong>M<mark>o</mark>rph<mark>o</mark>l<mark>o</mark>gy</strong><span>Example 2</span>");
        expect(menu.element().childNodes[5+1]).toBe(undefined);

        // Check boundaries
        expect(menu.element().childNodes[3+1].classList.contains("no-more")).toBe(true);
        expect(menu.element().childNodes[4+1].classList.contains("no-more")).toBe(false);
        expect(menu.element().childNodes[5+1]).toBe(undefined);

        expect(menu.prefix("e").show()).toBe(true);
        expect(menu.alwaysEntryValue("e").show()).toBe(true);
        expect(menu.alwaysEntryValue()).toEqual("e");
        expect(menu.element().childNodes[0].innerHTML).toEqual("e");        
        expect(menu.element().childNodes[3].innerHTML).toEqual("Speichern");
        expect(menu.element().childNodes[3+1].innerHTML).toEqual("<strong>Constitu<mark>e</mark>ncy</strong><span><mark>E</mark>xampl<mark>e</mark> 1</span>");
        expect(menu.element().childNodes[4+1].innerHTML).toEqual("<strong>Morphology</strong><span><mark>E</mark>xampl<mark>e</mark> 2</span>");
        expect(menu.element().childNodes[5+1]).toBe(undefined);

        menu.limit(5);
        expect(menu.prefix("a").show()).toBe(true);
        expect(menu.alwaysEntryValue("a").show()).toBe(true);
        expect(menu.alwaysEntryValue()).toEqual("a");
        expect(menu.element().childNodes[0].innerHTML).toEqual("a");        
        expect(menu.element().childNodes[3].innerHTML).toEqual("Speichern");
        expect(menu.element().childNodes[3+1].innerHTML).toEqual("<strong>Constituency</strong><span>Ex<mark>a</mark>mple 1</span>");
        expect(menu.element().childNodes[4+1].innerHTML).toEqual("<strong>Lemm<mark>a</mark></strong>");
        expect(menu.element().childNodes[5+1].innerHTML).toEqual("<strong>Morphology</strong><span>Ex<mark>a</mark>mple 2</span>");
        expect(menu.element().childNodes[6+1].innerHTML).toEqual("<strong>P<mark>a</mark>rt-of-Speech</strong>");
        expect(menu.element().childNodes[7+1].innerHTML).toEqual("<strong>Synt<mark>a</mark>x</strong>");
        expect(menu.element().childNodes[8+1]).toBe(undefined);
      });


      it('should be nextable - no prefix', function () {
        var menu = KorAP.HintMenu.create("cnx/", list);
        menu._firstActive = true;

        expect(menu._prefix.active()).toBe(false);

        // Show only 3 items
        menu.limit(3);
        expect(menu.show()).toBe(true);
        expect(menu.element().childNodes[3+1].innerHTML).toEqual("<strong>Constituency</strong><span>Example 1</span>");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(menu.element().childNodes[4+1].innerHTML).toEqual("<strong>Lemma</strong>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.element().childNodes[5+1].innerHTML).toEqual("<strong>Morphology</strong><span>Example 2</span>");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(menu.element().childNodes[6+1]).toBe(undefined);
        expect(menu.alwaysEntry().active()).toBe(false);

        // Activate next (1)
        menu.next();
        expect(menu.element().childNodes[3+1].innerHTML).toEqual("<strong>Constituency</strong><span>Example 1</span>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.element().childNodes[4+1].innerHTML).toEqual("<strong>Lemma</strong>");
        expect(menu.shownItem(1).active()).toBe(true);
        expect(menu.element().childNodes[5+1].innerHTML).toEqual("<strong>Morphology</strong><span>Example 2</span>");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(menu.element().childNodes[6+1]).toBe(undefined);
        expect(menu.alwaysEntry().active()).toBe(false);

        // Activate next (2)
        menu.next();
        expect(menu.element().childNodes[3+1].innerHTML).toEqual("<strong>Constituency</strong><span>Example 1</span>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.element().childNodes[4+1].innerHTML).toEqual("<strong>Lemma</strong>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.element().childNodes[5+1].innerHTML).toEqual("<strong>Morphology</strong><span>Example 2</span>");
        expect(menu.shownItem(2).active()).toBe(true);
        expect(menu.element().childNodes[6+1]).toBe(undefined);
        expect(menu.alwaysEntry().active()).toBe(false);

        // Activate next (3)
        // scroll!
        menu.next();
        expect(menu.element().childNodes[3+1].innerHTML).toEqual("<strong>Lemma</strong>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.element().childNodes[4+1].innerHTML).toEqual("<strong>Morphology</strong><span>Example 2</span>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.element().childNodes[5+1].innerHTML).toEqual("<strong>Part-of-Speech</strong>");
        expect(menu.shownItem(2).active()).toBe(true);
        expect(menu.element().childNodes[6+1]).toBe(undefined);
        expect(menu.alwaysEntry().active()).toBe(false);

        // Activate next (4)
        menu.next();
        expect(menu.element().childNodes[3+1].innerHTML).toEqual("<strong>Morphology</strong><span>Example 2</span>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.element().childNodes[4+1].innerHTML).toEqual("<strong>Part-of-Speech</strong>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.element().childNodes[5+1].innerHTML).toEqual("<strong>Syntax</strong>");
        expect(menu.shownItem(2).active()).toBe(true);
        expect(menu.element().childNodes[6+1]).toBe(undefined);
        expect(menu.alwaysEntry().active()).toBe(false);

        // Activate next (5) - Entry / Speichern
        menu.next();
        expect(menu.element().childNodes[3+1].innerHTML).toEqual("<strong>Morphology</strong><span>Example 2</span>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.element().childNodes[4+1].innerHTML).toEqual("<strong>Part-of-Speech</strong>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.element().childNodes[5+1].innerHTML).toEqual("<strong>Syntax</strong>");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(menu.element().childNodes[6+1]).toBe(undefined);
        expect(menu.alwaysEntry().active()).toBe(true);

        // Activate next (6) - ROLL
        menu.next();
        expect(menu.element().childNodes[3+1].innerHTML).toEqual("<strong>Constituency</strong><span>Example 1</span>");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(menu.element().childNodes[4+1].innerHTML).toEqual("<strong>Lemma</strong>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.element().childNodes[5+1].innerHTML).toEqual("<strong>Morphology</strong><span>Example 2</span>");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(menu.element().childNodes[6+1]).toBe(undefined);
        expect(menu.alwaysEntry().active()).toBe(false);

        // Active next (7)
        menu.next();
        expect(menu.element().childNodes[3+1].innerHTML).toEqual("<strong>Constituency</strong><span>Example 1</span>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.element().childNodes[4+1].innerHTML).toEqual("<strong>Lemma</strong>");
        expect(menu.shownItem(1).active()).toBe(true);
        expect(menu.element().childNodes[5+1].innerHTML).toEqual("<strong>Morphology</strong><span>Example 2</span>");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(menu.element().childNodes[6+1]).toBe(undefined);
        expect(menu.alwaysEntry().active()).toBe(false);

        expect(menu._prefix.active()).toBe(false);
      });

      it('should be nextable without active field', function () {
        var menu = KorAP.HintMenu.create("cnx/", list);
        menu.limit(3);
        expect(menu.show()).toBe(true);
        menu.next();
        expect(menu.shownItem(0).active()).toEqual(true);
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

      it('should be prevable without active field', function () {
        var menu = KorAP.HintMenu.create("cnx/", list);
        menu.limit(3);
        expect(menu.show()).toBe(true);
        menu.prev();
        expect(menu.shownItem(2).active()).toEqual(true);
        expect(menu.shownItem(2).lcField()).toEqual(' syntax');
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

      it('should be filterable (multiple prefix = "pro sin")', function () {
        var menu = KorAP.HintMenu.create("drukola/p=", listMultiPrefix);
        menu._firstActive = true;

        menu.limit(2);
        expect(menu.prefix("pro sin").show()).toBe(true);
        expect(menu.shownItem(0).name()).toEqual("PPS");
        expect(menu.element().childNodes[3].innerHTML).toEqual(
          "<strong>PPS</strong><span>Personal <mark>Pro</mark>noun, <mark>Sin</mark>gular</span>"
        );

        expect(menu.shownItem(0).active()).toBe(true);
        expect(menu.shownItem(1).name()).toEqual("PPSA");
        expect(menu.element().childNodes[4].innerHTML).toEqual("<strong>PPSA</strong><span>Personal <mark>Pro</mark>noun, <mark>Sin</mark>gular, Accusative</span>");
        expect(menu.shownItem(1).active()).toBe(false);

        expect(menu.shownItem(2)).toBe(undefined);
      });

      it('should be filterable (trimming = " p")', function () {
        var menu = KorAP.HintMenu.create("/p=", listMultiPrefix);
        // menu._firstActive = true;

        menu.limit(2);
        expect(menu.show()).toBe(true);
        menu._prefix.add(" ");
        expect(menu.show()).toBe(true);
        menu._prefix.add("p")
        expect(menu.show()).toBe(true);
        expect(menu.shownItem(0).name()).toEqual("PP");
        expect(menu.element().childNodes[3].innerHTML).toEqual(
          "<strong><mark>P</mark><mark>P</mark></strong>"+
            "<span><mark>P</mark>ersonal <mark>P</mark>ronoun</span>"
        );
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
        var menu = KorAP.OwnAlwaysMenu.create(demolonglist);
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
        var menu = KorAP.OwnAlwaysMenu.create(demolonglist);
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
        var menu = KorAP.OwnAlwaysMenu.create(demolonglist);
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
        var menu = KorAP.OwnAlwaysMenu.create(demolonglist);
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

      it('should be view upable and downable (1)', function () {
        var menu = KorAP.OwnAlwaysMenu.create(demolonglist);
        menu.limit(7);

        // Choose the final value
        expect(menu.show(1)).toBe(true);

        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(0).lcField()).toEqual(' titel');
        expect(menu.shownItem(1).active()).toBe(true);
        expect(menu.shownItem(2).active()).toBe(false);
        expect(menu.shownItem(2).lcField()).toEqual(' veröffentlichungsdatum');
        expect(menu.shownItem(6).active()).toBe(false);
        expect(menu.shownItem(7)).toBe(undefined);

        // Doesn't change anything
        menu.viewUp();

        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(0).lcField()).toEqual(' titel');
        expect(menu.shownItem(1).active()).toBe(true);

        menu.viewDown();

        expect(menu.shownItem(0).active()).toBe(true);
        expect(menu.shownItem(0).lcField()).toEqual(' untertitel');
        expect(menu.shownItem(1).active()).toBe(false);

        menu.viewDown();

        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(0).lcField()).toEqual(' veröffentlichungsdatum');
        expect(menu.shownItem(1).active()).toBe(false);

        // No effect anymore
        menu.viewDown();

        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(0).lcField()).toEqual(' veröffentlichungsdatum');
        expect(menu.shownItem(1).active()).toBe(false);
      });

      it('should be view upable and downable (2)', function () {

        // List is longer than limit
        var menu = KorAP.OwnAlwaysMenu.create(demolist);
        menu.limit(7);

        // Choose the final value
        expect(menu.show(1)).toBe(true);

        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(0).lcField()).toEqual(' titel');
        expect(menu.shownItem(1).active()).toBe(true);
        expect(menu.shownItem(2).active()).toBe(false);
        expect(menu.shownItem(2).lcField()).toEqual(' veröffentlichungsdatum');
        expect(menu.shownItem(4).active()).toBe(false);
        expect(menu.shownItem(5)).toBe(undefined);

        // Doesn't change anything
        menu.viewUp();

        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(0).lcField()).toEqual(' titel');
        expect(menu.shownItem(1).active()).toBe(true);

        menu.viewDown();

        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(0).lcField()).toEqual(' titel');
        expect(menu.shownItem(1).active()).toBe(true);
      });      

      
      it('should scroll to a chosen value (1)', function () {
        var menu = KorAP.OwnAlwaysMenu.create(demolist);
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

      it('should scroll to a chosen value (2)', function () {
        var menu = KorAP.OwnAlwaysMenu.create(demolonglist);

        // Choose value 3
        expect(menu.limit(3).show(3)).toBe(true);
        expect(menu.shownItem(0).lcField()).toEqual(' länge');
        expect(menu.shownItem(0).active()).toBe(true);
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2).active()).toBe(false);
        expect(menu.shownItem(3)).toBe(undefined);
      });

      xit('should scroll to a chosen value after prefixing, if the chosen value is live');
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

        var menu = KorAP.OwnAlwaysMenu.create(list);

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

        var menu = KorAP.OwnAlwaysMenu.create(list);

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

        var menu = KorAP.OwnAlwaysMenu.create(list);

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
        var menu = KorAP.OwnAlwaysMenu.create(demolonglist);
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

        var menu = KorAP.OwnAlwaysMenu.create(list);

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
        menu.slider()._event.initOffset = 0;
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

    describe('KorAP.AlwaysMenuBenchmark', function () {
      var menu = alwaysMenuClass.create([
        ['Titel', 'title'],
        ['Untertitel', 'subTitle'],
        ['Veröffentlichungsdatum', 'pubDate'],
        ['Länge', 'length'],
        ['Autor', 'author']
      ]);

      menu.limit(3).show();

      // Some actions
      menu.next();
      menu.next();
      menu.prev();
      menu.prev();
      menu.prev();
      
      menu.pageDown();
      menu.pageUp();

      // There is no fourth item in the list!
      menu.prefix('e').show(4);
      menu.next();
      menu.next();
      menu.prev();
      menu.prev();
      menu.prev();
    });
  });

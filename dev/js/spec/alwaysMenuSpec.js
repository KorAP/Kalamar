define(
  ['alwaysmenu', 'menu/item', 'menu/prefix', 'menu/lengthField', 'alwaysentry'],
  function (alwaysMenuClass, menuItemClass, prefixClass, lengthFieldClass, alwaysEntryClass) {
 
    //These class definitions were taken from menuSpec for a guideline on how to procede

    // The OwnAlwaysMenu item
    const OwnAlwaysMenuItem = {
      create : function (params) {
        return Object.create(menuItemClass).upgradeTo(OwnAlwaysMenuItem)._init(params);
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
    let OwnAlwaysMenu = {
      create : function (list) {
        return alwaysMenuClass.create(list, { itemClass : OwnAlwaysMenuItem } )
	        .upgradeTo(OwnAlwaysMenu);
      }
    };



    // HintMenuItem
    const HintMenuItem = {
      create : function (params) {
        return Object.create(menuItemClass)
	        .upgradeTo(HintMenuItem)
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
    const HintMenu = {
      create : function (context, list) {
        var obj = alwaysMenuClass.create(list, {itemClass : HintMenuItem} )
	          .upgradeTo(HintMenu);
        obj._context = context;
        return obj;
      }
    };


    // The ComplexMenuItem
    const ComplexMenuItem = {
      create : function (params) {
        return Object.create(menuItemClass)
	        .upgradeTo(ComplexMenuItem)
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

        var menu = OwnAlwaysMenu.create(list);
        menu._firstActive = true;
        expect(menu.itemClass()).toEqual(OwnAlwaysMenuItem);
        expect(menu._notItemElements).toEqual(4);
        expect(menu.element().getElementsByClassName("entry").length).toEqual(1); 
        expect(menu.element().getElementsByClassName("entry").length).toEqual(1);
        expect(menu.element().getElementsByClassName("entry")[0].innerHTML).toEqual("Speichern");
        expect(menu.alwaysEntry().element().innerHTML).toEqual("Speichern");
        //expect(menu.element().childNodes[3].innerHTML).toEqual("Speichern"); //?
        // getElementsByClassName funktioniert bei allen Kindern.


        // view
        menu.show();

        expect(menu.alwaysEntry().active()).toBe(false);
      });

      it('should be visible', function () {
        var menu = HintMenu.create("cnx/", list);
        expect(menu.removeItems()).toBe(undefined);
        menu.limit(3);

        expect(menu.show()).toBe(true);

        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong>Constituency</strong><span>Example 1</span>");
        expect(directElementChildrenByTagName(menu.element(),"li")[1].innerHTML).toEqual("<strong>Lemma</strong>");
        expect(directElementChildrenByTagName(menu.element(),"li")[1].getAttribute("data-action")).toEqual("l=");
        expect(directElementChildrenByTagName(menu.element(),"li")[2].innerHTML).toEqual("<strong>Morphology</strong><span>Example 2</span>");
        expect(directElementChildrenByTagName(menu.element(),"li")[3]).toBe(undefined);

        // Check boundaries
        expect(directElementChildrenByTagName(menu.element(),"li")[0].classList.contains("no-more")).toBe(true);
        expect(directElementChildrenByTagName(menu.element(),"li")[1].classList.contains("no-more")).toBe(false);
        expect(directElementChildrenByTagName(menu.element(),"li")[2].classList.contains("no-more")).toBe(false);
      });

      it('should be filterable', function () {
        var menu = HintMenu.create("cnx/", list);
        menu.limit(3);
        expect(menu.prefix("o").show()).toBe(true);
        expect(menu.alwaysEntryValue("o").alwaysEntryValue()).toEqual("o");
        expect(menu.element().getElementsByClassName("pref")[0].innerHTML).toEqual("o");
        expect(menu.alwaysEntry().element().innerHTML).toEqual("Speichern");
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong>C<mark>o</mark>nstituency</strong><span>Example 1</span>");
        expect(directElementChildrenByTagName(menu.element(),"li")[1].innerHTML).toEqual("<strong>M<mark>o</mark>rph<mark>o</mark>l<mark>o</mark>gy</strong><span>Example 2</span>");
        expect(directElementChildrenByTagName(menu.element(),"li")[2].innerHTML).toEqual("<strong>Part-<mark>o</mark>f-Speech</strong>");
        expect(directElementChildrenByTagName(menu.element(),"li")[3]).toBe(undefined);

        // Check boundaries
        expect(directElementChildrenByTagName(menu.element(),"li")[0].classList.contains("no-more")).toBe(true);
        expect(directElementChildrenByTagName(menu.element(),"li")[1].classList.contains("no-more")).toBe(false);
        expect(directElementChildrenByTagName(menu.element(),"li")[2].classList.contains("no-more")).toBe(true);

        menu.limit(2);

        expect(menu.prefix("o").show()).toBe(true);
        expect(menu.alwaysEntryValue("o").alwaysEntryValue()).toEqual("o");
        expect(menu.element().getElementsByClassName("pref")[0].innerHTML).toEqual("o");
        expect(menu.alwaysEntry().element().innerHTML).toEqual("Speichern");
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong>C<mark>o</mark>nstituency</strong><span>Example 1</span>");
        expect(directElementChildrenByTagName(menu.element(),"li")[1].innerHTML).toEqual("<strong>M<mark>o</mark>rph<mark>o</mark>l<mark>o</mark>gy</strong><span>Example 2</span>");
        expect(directElementChildrenByTagName(menu.element(),"li")[2]).toBe(undefined);

        // Check boundaries
        expect(directElementChildrenByTagName(menu.element(),"li")[0].classList.contains("no-more")).toBe(true);
        expect(directElementChildrenByTagName(menu.element(),"li")[1].classList.contains("no-more")).toBe(false);
        expect(directElementChildrenByTagName(menu.element(),"li")[2]).toBe(undefined);

        expect(menu.prefix("e").show()).toBe(true);
        expect(menu.alwaysEntryValue("e").alwaysEntryValue()).toEqual("e");
        expect(menu.element().getElementsByClassName("pref")[0].innerHTML).toEqual("e");        
        expect(menu.alwaysEntry().element().innerHTML).toEqual("Speichern");
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong>Constitu<mark>e</mark>ncy</strong><span><mark>E</mark>xampl<mark>e</mark> 1</span>");
        expect(directElementChildrenByTagName(menu.element(),"li")[1].innerHTML).toEqual("<strong>Morphology</strong><span><mark>E</mark>xampl<mark>e</mark> 2</span>");
        expect(directElementChildrenByTagName(menu.element(),"li")[2]).toBe(undefined);

        menu.limit(5);
        expect(menu.prefix("a").show()).toBe(true);
        expect(menu.alwaysEntryValue("a").alwaysEntryValue()).toEqual("a");
        expect(menu.element().getElementsByClassName("pref")[0].innerHTML).toEqual("a");        
        expect(menu.alwaysEntry().element().innerHTML).toEqual("Speichern");
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong>Constituency</strong><span>Ex<mark>a</mark>mple 1</span>");
        expect(directElementChildrenByTagName(menu.element(),"li")[1].innerHTML).toEqual("<strong>Lemm<mark>a</mark></strong>");
        expect(directElementChildrenByTagName(menu.element(),"li")[2].innerHTML).toEqual("<strong>Morphology</strong><span>Ex<mark>a</mark>mple 2</span>");
        expect(directElementChildrenByTagName(menu.element(),"li")[3].innerHTML).toEqual("<strong>P<mark>a</mark>rt-of-Speech</strong>");
        expect(directElementChildrenByTagName(menu.element(),"li")[4].innerHTML).toEqual("<strong>Synt<mark>a</mark>x</strong>");
        expect(directElementChildrenByTagName(menu.element(),"li")[5]).toBe(undefined);
      });


      it('should be nextable', function () {
        var menu = HintMenu.create("cnx/", list);
        menu._firstActive = true;

        expect(menu._prefix.active()).toBe(false);

        // Show only 3 items
        menu.limit(3);
        expect(menu.show()).toBe(true);
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong>Constituency</strong><span>Example 1</span>");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(directElementChildrenByTagName(menu.element(),"li")[1].innerHTML).toEqual("<strong>Lemma</strong>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(directElementChildrenByTagName(menu.element(),"li")[2].innerHTML).toEqual("<strong>Morphology</strong><span>Example 2</span>");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(directElementChildrenByTagName(menu.element(),"li")[3]).toBe(undefined);
        expect(menu.alwaysEntry().active()).toBe(false);

        // Activate next (1)
        menu.next();
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong>Constituency</strong><span>Example 1</span>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(directElementChildrenByTagName(menu.element(),"li")[1].innerHTML).toEqual("<strong>Lemma</strong>");
        expect(menu.shownItem(1).active()).toBe(true);
        expect(directElementChildrenByTagName(menu.element(),"li")[2].innerHTML).toEqual("<strong>Morphology</strong><span>Example 2</span>");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(directElementChildrenByTagName(menu.element(),"li")[3]).toBe(undefined);
        expect(menu.alwaysEntry().active()).toBe(false);

        // Activate next (2)
        menu.next();
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong>Constituency</strong><span>Example 1</span>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(directElementChildrenByTagName(menu.element(),"li")[1].innerHTML).toEqual("<strong>Lemma</strong>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(directElementChildrenByTagName(menu.element(),"li")[2].innerHTML).toEqual("<strong>Morphology</strong><span>Example 2</span>");
        expect(menu.shownItem(2).active()).toBe(true);
        expect(directElementChildrenByTagName(menu.element(),"li")[3]).toBe(undefined);
        expect(menu.alwaysEntry().active()).toBe(false);

        // Activate next (3)
        // scroll!
        menu.next();
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong>Lemma</strong>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(directElementChildrenByTagName(menu.element(),"li")[1].innerHTML).toEqual("<strong>Morphology</strong><span>Example 2</span>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(directElementChildrenByTagName(menu.element(),"li")[2].innerHTML).toEqual("<strong>Part-of-Speech</strong>");
        expect(menu.shownItem(2).active()).toBe(true);
        expect(directElementChildrenByTagName(menu.element(),"li")[3]).toBe(undefined);
        expect(menu.alwaysEntry().active()).toBe(false);

        // Activate next (4)
        menu.next();
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong>Morphology</strong><span>Example 2</span>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(directElementChildrenByTagName(menu.element(),"li")[1].innerHTML).toEqual("<strong>Part-of-Speech</strong>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(directElementChildrenByTagName(menu.element(),"li")[2].innerHTML).toEqual("<strong>Syntax</strong>");
        expect(menu.shownItem(2).active()).toBe(true);
        expect(directElementChildrenByTagName(menu.element(),"li")[3]).toBe(undefined);
        expect(menu.alwaysEntry().active()).toBe(false);

        // Activate next (5) - Entry / Speichern
        menu.next();
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong>Morphology</strong><span>Example 2</span>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(directElementChildrenByTagName(menu.element(),"li")[1].innerHTML).toEqual("<strong>Part-of-Speech</strong>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(directElementChildrenByTagName(menu.element(),"li")[2].innerHTML).toEqual("<strong>Syntax</strong>");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(directElementChildrenByTagName(menu.element(),"li")[3]).toBe(undefined);
        expect(menu.alwaysEntry().active()).toBe(true);

        // Activate next (6) - ROLL
        menu.next();
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong>Constituency</strong><span>Example 1</span>");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(directElementChildrenByTagName(menu.element(),"li")[1].innerHTML).toEqual("<strong>Lemma</strong>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(directElementChildrenByTagName(menu.element(),"li")[2].innerHTML).toEqual("<strong>Morphology</strong><span>Example 2</span>");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(directElementChildrenByTagName(menu.element(),"li")[3]).toBe(undefined);
        expect(menu.alwaysEntry().active()).toBe(false);

        // Active next (7)
        menu.next();
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong>Constituency</strong><span>Example 1</span>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(directElementChildrenByTagName(menu.element(),"li")[1].innerHTML).toEqual("<strong>Lemma</strong>");
        expect(menu.shownItem(1).active()).toBe(true);
        expect(directElementChildrenByTagName(menu.element(),"li")[2].innerHTML).toEqual("<strong>Morphology</strong><span>Example 2</span>");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(directElementChildrenByTagName(menu.element(),"li")[3]).toBe(undefined);
        expect(menu.alwaysEntry().active()).toBe(false);

        expect(menu._prefix.active()).toBe(false);
      });

      it('should be nextable without active field', function () {
        var menu = HintMenu.create("cnx/", list);
        menu.limit(3);
        expect(menu.show()).toBe(true);
        menu.next();
        expect(menu.shownItem(0).active()).toEqual(true);
      });


      it('should be prevable', function () {
        var menu = HintMenu.create("cnx/", list);
        menu._firstActive = true;
        menu.limit(3);
        expect(menu.show()).toBe(true);
        expect(menu._prefix.active()).toBe(false);
        expect(menu.alwaysEntryValue()).toBe("");

        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong>Constituency</strong><span>Example 1</span>");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(directElementChildrenByTagName(menu.element(),"li")[1].innerHTML).toEqual("<strong>Lemma</strong>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(directElementChildrenByTagName(menu.element(),"li")[2].innerHTML).toEqual("<strong>Morphology</strong><span>Example 2</span>");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(directElementChildrenByTagName(menu.element(),"li")[3]).toBe(undefined);
        expect(menu.alwaysEntry().active()).toBe(false);


        // Activate prev (1) - roll to bottom
        menu.prev();
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong>Constituency</strong><span>Example 1</span>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(directElementChildrenByTagName(menu.element(),"li")[1].innerHTML).toEqual("<strong>Lemma</strong>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(directElementChildrenByTagName(menu.element(),"li")[2].innerHTML).toEqual("<strong>Morphology</strong><span>Example 2</span>");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(directElementChildrenByTagName(menu.element(),"li")[3]).toBe(undefined);
        expect(menu.alwaysEntry().active()).toBe(true);

        // Activate prev (2)
        menu.prev();
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong>Morphology</strong><span>Example 2</span>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(directElementChildrenByTagName(menu.element(),"li")[1].innerHTML).toEqual("<strong>Part-of-Speech</strong>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(directElementChildrenByTagName(menu.element(),"li")[2].innerHTML).toEqual("<strong>Syntax</strong>");
        expect(menu.shownItem(2).active()).toBe(true);
        expect(directElementChildrenByTagName(menu.element(),"li")[3]).toBe(undefined);
        expect(menu.alwaysEntry().active()).toBe(false);

        // Activate prev (3)
        menu.prev();
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong>Morphology</strong><span>Example 2</span>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(directElementChildrenByTagName(menu.element(),"li")[1].innerHTML).toEqual("<strong>Part-of-Speech</strong>");
        expect(menu.shownItem(1).active()).toBe(true);
        expect(directElementChildrenByTagName(menu.element(),"li")[2].innerHTML).toEqual("<strong>Syntax</strong>");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(directElementChildrenByTagName(menu.element(),"li")[3]).toBe(undefined);
        expect(menu.alwaysEntry().active()).toBe(false);

        // Activate prev (4)
        menu.prev();
        expect(menu.shownItem(0).name()).toEqual("Morphology");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(menu.shownItem(1).name()).toEqual("Part-of-Speech");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2).name()).toEqual("Syntax");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(directElementChildrenByTagName(menu.element(),"li")[3]).toBe(undefined);
        expect(menu.alwaysEntry().active()).toBe(false);

        // Activate prev (5)
        menu.prev();
        expect(menu.shownItem(0).name()).toEqual("Lemma");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(menu.shownItem(1).name()).toEqual("Morphology");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2).name()).toEqual("Part-of-Speech");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(directElementChildrenByTagName(menu.element(),"li")[3]).toBe(undefined);
        expect(menu.alwaysEntry().active()).toBe(false);

        // Activate prev (6)
        menu.prev();
        expect(menu.shownItem(0).name()).toEqual("Constituency");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(menu.shownItem(1).name()).toEqual("Lemma");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2).name()).toEqual("Morphology");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(directElementChildrenByTagName(menu.element(),"li")[3]).toBe(undefined);
        expect(menu.alwaysEntry().active()).toBe(false);

        // Activate next (7)
        menu.next();
        expect(menu.shownItem(0).name()).toEqual("Constituency");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(1).name()).toEqual("Lemma");
        expect(menu.shownItem(1).active()).toBe(true);
        expect(menu.shownItem(2).name()).toEqual("Morphology");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(directElementChildrenByTagName(menu.element(),"li")[3]).toBe(undefined);
        expect(menu.alwaysEntry().active()).toBe(false);

        // Activate prev (8)
        menu.prev();

        // Activate prev (9) - Roll again
        menu.prev();
        expect(menu.shownItem(0).name()).toEqual("Constituency");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(1).name()).toEqual("Lemma");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2).name()).toEqual("Morphology");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(directElementChildrenByTagName(menu.element(),"li")[3]).toBe(undefined);
        expect(menu.alwaysEntry().active()).toBe(true);

        // Activate prev (10)
        menu.prev()
        expect(menu.shownItem(0).name()).toEqual("Morphology");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(1).name()).toEqual("Part-of-Speech");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2).name()).toEqual("Syntax");
        expect(menu.shownItem(2).active()).toBe(true);
        expect(directElementChildrenByTagName(menu.element(),"li")[3]).toBe(undefined);
        expect(menu.alwaysEntry().active()).toBe(false);
        expect(menu._prefix.active()).toBe(false);
        expect(menu.alwaysEntryValue()).toBe("");
        expect(menu.alwaysEntry().element().innerHTML).toBe("Speichern");

      });

      it('should be prevable without active field', function () {
        var menu = HintMenu.create("cnx/", list);
        menu.limit(3);
        expect(menu.show()).toBe(true);
        menu.prev();
        expect(menu.alwaysEntry().active()).toBe(true);
        expect(menu.shownItem(2).active()).toEqual(false);
        expect(menu.shownItem(2).lcField()).toEqual(' morphology example 2');
        menu.prev()
        expect(menu.shownItem(2).active()).toEqual(true);
        expect(menu.shownItem(2).lcField()).toEqual(' syntax');
      });

      it('should be navigatable and filterable (prefix = "o")', function () {
        var menu = HintMenu.create("cnx/", list);
        menu._firstActive = true;
        menu.limit(2);

        expect(menu.prefix("o").show()).toBe(true);
        expect(menu.alwaysEntryValue("o").alwaysEntryValue()).toBe("o");
        expect(menu._prefix.active()).toBe(false);
        expect(menu.alwaysEntry().active()).toBe(false);

        expect(menu.shownItem(0).name()).toEqual("Constituency");
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong>C<mark>o</mark>nstituency</strong><span>Example 1</span>");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(menu.shownItem(1).name()).toEqual("Morphology");
        expect(directElementChildrenByTagName(menu.element(),"li")[1].innerHTML).toEqual("<strong>M<mark>o</mark>rph<mark>o</mark>l<mark>o</mark>gy</strong><span>Example 2</span>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2)).toBe(undefined);

        // Next (1)
        menu.next();
        expect(menu.shownItem(0).name()).toEqual("Constituency");
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong>C<mark>o</mark>nstituency</strong><span>Example 1</span>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(1).name()).toEqual("Morphology");
        expect(directElementChildrenByTagName(menu.element(),"li")[1].innerHTML).toEqual("<strong>M<mark>o</mark>rph<mark>o</mark>l<mark>o</mark>gy</strong><span>Example 2</span>");
        expect(menu.shownItem(1).active()).toBe(true);
        expect(menu.shownItem(2)).toBe(undefined);

        // Next (2)
        menu.next();
        expect(menu.shownItem(0).name()).toEqual("Morphology");
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong>M<mark>o</mark>rph<mark>o</mark>l<mark>o</mark>gy</strong><span>Example 2</span>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(1).name()).toEqual("Part-of-Speech");
        expect(directElementChildrenByTagName(menu.element(),"li")[1].innerHTML).toEqual("<strong>Part-<mark>o</mark>f-Speech</strong>");
        expect(menu.shownItem(1).active()).toBe(true);
        expect(menu.shownItem(2)).toBe(undefined);

        // Next (3) - to prefix
        menu.next();
        expect(menu.shownItem(0).name()).toEqual("Morphology");
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong>M<mark>o</mark>rph<mark>o</mark>l<mark>o</mark>gy</strong><span>Example 2</span>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(1).name()).toEqual("Part-of-Speech");
        expect(directElementChildrenByTagName(menu.element(),"li")[1].innerHTML).toEqual("<strong>Part-<mark>o</mark>f-Speech</strong>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2)).toBe(undefined);
        expect(menu._prefix.active()).toBe(true);
        expect(menu.alwaysEntry().active()).toBe(false);

         // Next (4) - to entry
         menu.next();
         expect(menu.shownItem(0).name()).toEqual("Morphology");
         expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong>M<mark>o</mark>rph<mark>o</mark>l<mark>o</mark>gy</strong><span>Example 2</span>");
         expect(menu.shownItem(0).active()).toBe(false);
         expect(menu.shownItem(1).name()).toEqual("Part-of-Speech");
         expect(directElementChildrenByTagName(menu.element(),"li")[1].innerHTML).toEqual("<strong>Part-<mark>o</mark>f-Speech</strong>");
         expect(menu.shownItem(1).active()).toBe(false);
         expect(menu.shownItem(2)).toBe(undefined);
         expect(menu._prefix.active()).toBe(false);
         expect(menu.alwaysEntry().active()).toBe(true);

        menu.next();
        expect(menu.shownItem(0).name()).toEqual("Constituency");
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong>C<mark>o</mark>nstituency</strong><span>Example 1</span>");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(menu.shownItem(1).name()).toEqual("Morphology");
        expect(directElementChildrenByTagName(menu.element(),"li")[1].innerHTML).toEqual("<strong>M<mark>o</mark>rph<mark>o</mark>l<mark>o</mark>gy</strong><span>Example 2</span>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2)).toBe(undefined);

        expect(menu.prefix("o").show()).toBe(true);
        expect(menu.alwaysEntryValue("o").alwaysEntryValue()).toBe("o");
        expect(menu._prefix.active()).toBe(false);
        expect(menu.alwaysEntry().active()).toBe(false);
      });


      it('should be navigatable and filterable (prefix = "ex", "e")', function () {
        var menu = HintMenu.create("cnx/", list);
        menu._firstActive = true;

        menu.limit(2);
        expect(menu.prefix("ex").show()).toBe(true);
        expect(menu.alwaysEntryValue("ex").alwaysEntryValue()).toBe("ex");
        expect(menu._prefix.active()).toBe(false);
        expect(menu.alwaysEntry().active()).toBe(false);

        expect(menu.shownItem(0).name()).toEqual("Constituency");
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong>Constituency</strong><span><mark>Ex</mark>ample 1</span>");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(menu.shownItem(1).name()).toEqual("Morphology");
        expect(directElementChildrenByTagName(menu.element(),"li")[1].innerHTML).toEqual("<strong>Morphology</strong><span><mark>Ex</mark>ample 2</span>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2)).toBe(undefined);

        // Next (1)
        menu.next();
        expect(menu.shownItem(0).name()).toEqual("Constituency");
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong>Constituency</strong><span><mark>Ex</mark>ample 1</span>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(1).name()).toEqual("Morphology");
        expect(directElementChildrenByTagName(menu.element(),"li")[1].innerHTML).toEqual("<strong>Morphology</strong><span><mark>Ex</mark>ample 2</span>");
        expect(menu.shownItem(1).active()).toBe(true);
        expect(menu.shownItem(2)).toBe(undefined);
        expect(menu.alwaysEntryValue()).toBe("ex");
        expect(menu._prefix.active()).toBe(false);
        expect(menu.alwaysEntry().active()).toBe(false);

        // Next (2)
        menu.next();

        expect(menu.prefix()).toEqual('ex');
        expect(menu.shownItem(0).name()).toEqual("Constituency");
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong>Constituency</strong><span><mark>Ex</mark>ample 1</span>");
        expect(menu.shownItem(0).active()).toBe(false);

        expect(menu.shownItem(1).name()).toEqual("Morphology");
        expect(directElementChildrenByTagName(menu.element(),"li")[1].innerHTML).toEqual("<strong>Morphology</strong><span><mark>Ex</mark>ample 2</span>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2)).toBe(undefined);
        expect(menu.alwaysEntryValue()).toBe("ex");
        expect(menu._prefix.active()).toBe(true);
        expect(menu.alwaysEntry().active()).toBe(false);

        // Reset limit
        menu.limit(5);

        // Change show
        expect(menu.prefix("e").show()).toBe(true);
        expect(menu.alwaysEntryValue("e").alwaysEntryValue()).toBe("e");
        expect(menu._prefix.active()).toBe(false);
        expect(menu.alwaysEntry().active()).toBe(false);
        expect(menu.shownItem(0).name()).toEqual("Constituency");
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong>Constitu<mark>e</mark>ncy</strong><span><mark>E</mark>xampl<mark>e</mark> 1</span>");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(menu.shownItem(1).name()).toEqual("Morphology");
        expect(directElementChildrenByTagName(menu.element(),"li")[1].innerHTML).toEqual("<strong>Morphology</strong><span><mark>E</mark>xampl<mark>e</mark> 2</span>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2)).toBe(undefined);

        // Next (1)
        menu.next();
        expect(menu._prefix.active()).toBe(false);
        expect(menu.prefix()).toEqual('e');
        expect(menu.shownItem(0).name()).toEqual("Constituency");
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong>Constitu<mark>e</mark>ncy</strong><span><mark>E</mark>xampl<mark>e</mark> 1</span>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(1).name()).toEqual("Morphology");
        expect(directElementChildrenByTagName(menu.element(),"li")[1].innerHTML).toEqual("<strong>Morphology</strong><span><mark>E</mark>xampl<mark>e</mark> 2</span>");
        expect(menu.shownItem(1).active()).toBe(true);
        expect(menu.shownItem(2)).toBe(undefined);
        expect(menu._prefix.active()).toBe(false);
        expect(menu.alwaysEntry().active()).toBe(false);

        // Next (2)
        menu.next();
        expect(menu._prefix.active()).toBe(true);
        expect(menu.shownItem(0).name()).toEqual("Constituency");
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong>Constitu<mark>e</mark>ncy</strong><span><mark>E</mark>xampl<mark>e</mark> 1</span>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(1).name()).toEqual("Morphology");
        expect(directElementChildrenByTagName(menu.element(),"li")[1].innerHTML).toEqual("<strong>Morphology</strong><span><mark>E</mark>xampl<mark>e</mark> 2</span>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2)).toBe(undefined);
        expect(menu._prefix.active()).toBe(true);
        expect(menu.alwaysEntry().active()).toBe(false);

        // Next (2.5)
        menu.next();
        expect(menu._prefix.active()).toBe(false);
        expect(menu.shownItem(0).name()).toEqual("Constituency");
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong>Constitu<mark>e</mark>ncy</strong><span><mark>E</mark>xampl<mark>e</mark> 1</span>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(1).name()).toEqual("Morphology");
        expect(directElementChildrenByTagName(menu.element(),"li")[1].innerHTML).toEqual("<strong>Morphology</strong><span><mark>E</mark>xampl<mark>e</mark> 2</span>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2)).toBe(undefined);
        expect(menu._prefix.active()).toBe(false);
        expect(menu.alwaysEntry().active()).toBe(true);

        // Next (3)
        menu.next();
        expect(menu._prefix.active()).toBe(false);
        expect(menu.shownItem(0).name()).toEqual("Constituency");
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong>Constitu<mark>e</mark>ncy</strong><span><mark>E</mark>xampl<mark>e</mark> 1</span>");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(menu.shownItem(1).name()).toEqual("Morphology");
        expect(directElementChildrenByTagName(menu.element(),"li")[1].innerHTML).toEqual("<strong>Morphology</strong><span><mark>E</mark>xampl<mark>e</mark> 2</span>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2)).toBe(undefined);

        expect(menu.alwaysEntryValue()).toBe("e");
        expect(menu._prefix.active()).toBe(false);
        expect(menu.alwaysEntry().active()).toBe(false);
      });

      it('should be filterable (multiple prefix = "pro sin")', function () {
        var menu = HintMenu.create("drukola/p=", listMultiPrefix);
        menu._firstActive = true;

        menu.limit(2);
        expect(menu.prefix("pro sin").show()).toBe(true);
        expect(menu.alwaysEntryValue("pro sin").alwaysEntryValue()).toBe("pro sin");
        expect(menu._prefix.active()).toBe(false);
        expect(menu.alwaysEntry().active()).toBe(false);
        expect(menu.shownItem(0).name()).toEqual("PPS");
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual(
          "<strong>PPS</strong><span>Personal <mark>Pro</mark>noun, <mark>Sin</mark>gular</span>"
        );

        expect(menu.shownItem(0).active()).toBe(true);
        expect(menu.shownItem(1).name()).toEqual("PPSA");
        expect(directElementChildrenByTagName(menu.element(),"li")[1].innerHTML).toEqual("<strong>PPSA</strong><span>Personal <mark>Pro</mark>noun, <mark>Sin</mark>gular, Accusative</span>");
        expect(menu.shownItem(1).active()).toBe(false);

        expect(menu.shownItem(2)).toBe(undefined);
      });

      it('should be filterable (trimming = " p")', function () {
        var menu = HintMenu.create("/p=", listMultiPrefix);
        // menu._firstActive = true;

        menu.limit(2);
        expect(menu.show()).toBe(true);
        menu._prefix.add(" ");
        menu._entry.add(" ")
        expect(menu.show()).toBe(true);
        menu._prefix.add("p")
        menu._entry.add("p")
        expect(menu.alwaysEntryValue()).toBe(" p");
        expect(menu.show()).toBe(true);
        expect(menu.shownItem(0).name()).toEqual("PP");
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual(
          "<strong><mark>P</mark><mark>P</mark></strong>"+
            "<span><mark>P</mark>ersonal <mark>P</mark>ronoun</span>"
        );
      });      
 


      it('should ignore navigation with failing prefix', function () {
        var menu = HintMenu.create("cnx/", list);
        menu.limit(2);
        expect(menu.show()).toBe(true);

        menu.next();

        expect(menu.prefix("exit").show()).toBe(true);
        expect(menu.element().querySelector('li')).toBe(null);
        expect(menu.shownItem(0)).toBeUndefined();
        expect(menu._prefix.active()).toBe(true);

        menu.next();
        expect(menu._prefix.active()).toBe(false);
        expect(menu._entry.active()).toBe(true);

        menu.next();
        expect(menu._prefix.active()).toBe(true);
        expect(menu._entry.active()).toBe(false);

        menu.prev();
        expect(menu._prefix.active()).toBe(false);
        expect(menu._entry.active()).toBe(true);

        menu.prev();
        expect(menu._prefix.active()).toBe(true);
        expect(menu._entry.active()).toBe(false);

      });

      it('should be navigatable with prefix', function () {
        var menu = HintMenu.create("cnx/", demolist);
        menu._firstActive = true;

        menu.limit(3);

        expect(menu.show()).toBe(true);
        expect(menu.prefix()).toEqual("");
        expect(menu.alwaysEntryValue()).toEqual("");
        expect(menu._prefix.active()).toEqual(false);
        expect(menu._entry.active()).toEqual(false);

        expect(menu.shownItem(0).name()).toEqual("Titel");
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong>Titel</strong>");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(menu.shownItem(1).name()).toEqual("Untertitel");
        expect(directElementChildrenByTagName(menu.element(),"li")[1].innerHTML).toEqual("<strong>Untertitel</strong>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2).name()).toEqual("Veröffentlichungsdatum");
        expect(directElementChildrenByTagName(menu.element(),"li")[2].innerHTML).toEqual("<strong>Veröffentlichungsdatum</strong>");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(menu.shownItem(3)).toBe(undefined);
        expect(menu._prefix.active()).toEqual(false);
        expect(menu._entry.active()).toEqual(false);

        menu._prefix.add('a');
        menu._entry.add('a');
        expect(menu._prefix.active()).toEqual(false);
        expect(menu._entry.active()).toEqual(false);
        expect(menu.show()).toBe(true);
        expect(menu.prefix()).toEqual("a");
        expect(menu.alwaysEntryValue()).toEqual("a");
        expect(menu.shownItem(0).name()).toEqual("Autor");
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong><mark>A</mark>utor</strong>");

        menu._prefix.add('u');
        menu._entry.add('u');
        expect(menu.show()).toBe(true);
        expect(menu.prefix()).toEqual("au");
        expect(menu.alwaysEntryValue()).toEqual("au");
        expect(menu.shownItem(0).name()).toEqual("Autor");
        expect(menu._prefix.active()).toEqual(false);
        expect(menu._entry.active()).toEqual(false);
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong><mark>Au</mark>tor</strong>");

        menu._prefix.chop();
        menu._entry.chop();
        expect(menu.show()).toBe(true);
        expect(menu.prefix()).toEqual("a");
        expect(menu.alwaysEntryValue()).toEqual("a");
        expect(menu.shownItem(0).name()).toEqual("Autor");
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong><mark>A</mark>utor</strong>");

        menu._prefix.chop();
        menu._entry.chop();
        expect(menu.show()).toBe(true);
        expect(menu.prefix()).toEqual("");
        expect(menu.alwaysEntryValue()).toEqual("");
        expect(menu._prefix.active()).toEqual(false);
        expect(menu._entry.active()).toEqual(false);
        expect(menu.shownItem(0).name()).toEqual("Titel");
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong>Titel</strong>");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(menu.shownItem(1).name()).toEqual("Untertitel");
        expect(directElementChildrenByTagName(menu.element(),"li")[1].innerHTML).toEqual("<strong>Untertitel</strong>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2).name()).toEqual("Veröffentlichungsdatum");
        expect(directElementChildrenByTagName(menu.element(),"li")[2].innerHTML).toEqual("<strong>Veröffentlichungsdatum</strong>");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(menu.shownItem(3)).toBe(undefined);

        // Forward
        menu._prefix.chop();
        menu._entry.chop();
        expect(menu.show()).toBe(true);
        expect(menu.prefix()).toEqual("");
        expect(menu._prefix.active()).toEqual(false);
        expect(menu._entry.active()).toEqual(false);
        expect(menu.alwaysEntryValue()).toEqual("");
        expect(menu.shownItem(0).name()).toEqual("Titel");
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong>Titel</strong>");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(menu.shownItem(1).name()).toEqual("Untertitel");
        expect(directElementChildrenByTagName(menu.element(),"li")[1].innerHTML).toEqual("<strong>Untertitel</strong>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2).name()).toEqual("Veröffentlichungsdatum");
        expect(directElementChildrenByTagName(menu.element(),"li")[2].innerHTML).toEqual("<strong>Veröffentlichungsdatum</strong>");
        expect(menu.shownItem(2).active()).toBe(false);

        // Forward
        menu.next();
        expect(menu.prefix()).toEqual("");
        expect(menu.alwaysEntryValue()).toEqual("");
        expect(menu._prefix.active()).toEqual(false);
        expect(menu._entry.active()).toEqual(false);
        expect(menu.shownItem(0).name()).toEqual("Titel");
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong>Titel</strong>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(1).name()).toEqual("Untertitel");
        expect(directElementChildrenByTagName(menu.element(),"li")[1].innerHTML).toEqual("<strong>Untertitel</strong>");
        expect(menu.shownItem(1).active()).toBe(true);
        expect(menu.shownItem(2).name()).toEqual("Veröffentlichungsdatum");
        expect(directElementChildrenByTagName(menu.element(),"li")[2].innerHTML).toEqual("<strong>Veröffentlichungsdatum</strong>");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(menu.shownItem(3)).toBe(undefined);

        // Forward
        menu.next();
        expect(menu.prefix()).toEqual("");
        expect(menu.alwaysEntryValue()).toEqual("");
        expect(menu._prefix.active()).toEqual(false);
        expect(menu._entry.active()).toEqual(false);
        expect(menu.shownItem(0).name()).toEqual("Titel");
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong>Titel</strong>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(1).name()).toEqual("Untertitel");
        expect(directElementChildrenByTagName(menu.element(),"li")[1].innerHTML).toEqual("<strong>Untertitel</strong>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2).name()).toEqual("Veröffentlichungsdatum");
        expect(directElementChildrenByTagName(menu.element(),"li")[2].innerHTML).toEqual("<strong>Veröffentlichungsdatum</strong>");
        expect(menu.shownItem(2).active()).toBe(true);
        expect(menu.shownItem(3)).toBe(undefined);

        // Forward
        menu.next();
        expect(menu.prefix()).toEqual("");
        expect(menu.alwaysEntryValue()).toEqual("");
        expect(menu.shownItem(0).name()).toEqual("Untertitel");
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong>Untertitel</strong>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(1).name()).toEqual("Veröffentlichungsdatum");
        expect(directElementChildrenByTagName(menu.element(),"li")[1].innerHTML).toEqual("<strong>Veröffentlichungsdatum</strong>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2).name()).toEqual("Länge");
        expect(directElementChildrenByTagName(menu.element(),"li")[2].innerHTML).toEqual("<strong>Länge</strong>");
        expect(menu.shownItem(2).active()).toBe(true);
        expect(menu.shownItem(3)).toBe(undefined);
        expect(menu._prefix.active()).toEqual(false);
        expect(menu._entry.active()).toEqual(false);

        // Forward
        menu.next();
        expect(menu.prefix()).toEqual("");
        expect(menu.alwaysEntryValue()).toEqual("");
        expect(menu.shownItem(0).name()).toEqual("Veröffentlichungsdatum");
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong>Veröffentlichungsdatum</strong>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(1).name()).toEqual("Länge");
        expect(directElementChildrenByTagName(menu.element(),"li")[1].innerHTML).toEqual("<strong>Länge</strong>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2).name()).toEqual("Autor");
        expect(directElementChildrenByTagName(menu.element(),"li")[2].innerHTML).toEqual("<strong>Autor</strong>");
        expect(menu.shownItem(2).active()).toBe(true);
        expect(menu.shownItem(3)).toBe(undefined);
        expect(menu._prefix.active()).toEqual(false);
        expect(menu._entry.active()).toEqual(false);
        
        // Forward
        menu.next();
        expect(menu.prefix()).toEqual("");
        expect(menu.alwaysEntryValue()).toEqual("");
        expect(menu.shownItem(0).name()).toEqual("Veröffentlichungsdatum");
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong>Veröffentlichungsdatum</strong>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(1).name()).toEqual("Länge");
        expect(directElementChildrenByTagName(menu.element(),"li")[1].innerHTML).toEqual("<strong>Länge</strong>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2).name()).toEqual("Autor");
        expect(directElementChildrenByTagName(menu.element(),"li")[2].innerHTML).toEqual("<strong>Autor</strong>");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(menu.shownItem(3)).toBe(undefined);
        expect(menu._prefix.active()).toEqual(false);
        expect(menu._entry.active()).toEqual(true);

        // Forward
        menu.next();
        expect(menu.prefix()).toEqual("");
        expect(menu.alwaysEntryValue()).toEqual("");
        expect(menu.shownItem(0).name()).toEqual("Titel");
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong>Titel</strong>");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(menu.shownItem(1).name()).toEqual("Untertitel");
        expect(directElementChildrenByTagName(menu.element(),"li")[1].innerHTML).toEqual("<strong>Untertitel</strong>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2).name()).toEqual("Veröffentlichungsdatum");
        expect(directElementChildrenByTagName(menu.element(),"li")[2].innerHTML).toEqual("<strong>Veröffentlichungsdatum</strong>");
        expect(menu.shownItem(2).active()).toBe(false);
      });


      it('should be navigatable with a prefix (1)', function () {
        var menu = HintMenu.create("cnx/", demolist);
        menu._firstActive = true;

        menu.limit(3);

        expect(menu.show()).toBe(true);
        expect(menu.prefix()).toEqual("");
        expect(menu.alwaysEntryValue()).toEqual("");

        // Add prefix in uppercase - but check in lowercase
        menu.prefix('El');
        menu.alwaysEntryValue('El');
        expect(menu.show()).toBe(true);

        expect(menu.prefix()).toEqual("El");
        expect(menu._prefix.active()).toEqual(false);
        expect(menu.alwaysEntryValue()).toEqual("El");
        expect(menu._entry.active()).toEqual(false);
        expect(menu.shownItem(0).name()).toEqual("Titel");
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong>Tit<mark>el</mark></strong>");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(menu.shownItem(1).name()).toEqual("Untertitel");
        expect(directElementChildrenByTagName(menu.element(),"li")[1].innerHTML).toEqual("<strong>Untertit<mark>el</mark></strong>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2)).toBe(undefined);

        // Forward
        menu.next();
        expect(menu.prefix()).toEqual("El");
        expect(menu._prefix.active()).toEqual(false);
        expect(menu.alwaysEntryValue()).toEqual("El");
        expect(menu._entry.active()).toEqual(false);
        expect(menu.shownItem(0).name()).toEqual("Titel");
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong>Tit<mark>el</mark></strong>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(1).name()).toEqual("Untertitel");
        expect(directElementChildrenByTagName(menu.element(),"li")[1].innerHTML).toEqual("<strong>Untertit<mark>el</mark></strong>");
        expect(menu.shownItem(1).active()).toBe(true);
        expect(menu.shownItem(2)).toBe(undefined);

        // Forward
        menu.next();
        expect(menu.prefix()).toEqual("El");
        expect(menu._prefix.active()).toEqual(true);
        expect(menu.alwaysEntryValue()).toEqual("El");
        expect(menu._entry.active()).toEqual(false);
        expect(menu.shownItem(0).name()).toEqual("Titel");
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong>Tit<mark>el</mark></strong>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(1).name()).toEqual("Untertitel");
        expect(directElementChildrenByTagName(menu.element(),"li")[1].innerHTML).toEqual("<strong>Untertit<mark>el</mark></strong>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2)).toBe(undefined);

        // Forward
        menu.next();
        expect(menu.prefix()).toEqual("El");
        expect(menu._prefix.active()).toEqual(false);
        expect(menu.alwaysEntryValue()).toEqual("El");
        expect(menu._entry.active()).toEqual(true);
        expect(menu.shownItem(0).name()).toEqual("Titel");
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong>Tit<mark>el</mark></strong>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(1).name()).toEqual("Untertitel");
        expect(directElementChildrenByTagName(menu.element(),"li")[1].innerHTML).toEqual("<strong>Untertit<mark>el</mark></strong>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2)).toBe(undefined);

        menu.prev()
        expect(menu.prefix()).toEqual("El");
        expect(menu._prefix.active()).toEqual(true);
        expect(menu.alwaysEntryValue()).toEqual("El");
        expect(menu._entry.active()).toEqual(false);
        expect(menu.shownItem(0).name()).toEqual("Titel");
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong>Tit<mark>el</mark></strong>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(1).name()).toEqual("Untertitel");
        expect(directElementChildrenByTagName(menu.element(),"li")[1].innerHTML).toEqual("<strong>Untertit<mark>el</mark></strong>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2)).toBe(undefined);

        // Backward
        menu.prev();
        expect(menu.prefix()).toEqual("El");
        expect(menu._prefix.active()).toEqual(false);
        expect(menu.alwaysEntryValue()).toEqual("El");
        expect(menu._entry.active()).toEqual(false);
        expect(menu.shownItem(0).name()).toEqual("Titel");
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong>Tit<mark>el</mark></strong>");
        expect(menu.shownItem(0).active()).toBe(false);

        expect(menu.shownItem(1).name()).toEqual("Untertitel");
        expect(directElementChildrenByTagName(menu.element(),"li")[1].innerHTML).toEqual("<strong>Untertit<mark>el</mark></strong>");
        expect(menu.shownItem(1).active()).toBe(true);
        expect(menu.shownItem(2)).toBe(undefined);
      });


      it('should be navigatable with a prefix (2)', function () {
        var menu = HintMenu.create("cnx/", demolist);
        menu._firstActive = true;

        menu.limit(3);
        expect(menu.show()).toBe(true);
        expect(menu.prefix()).toEqual("");
        menu.prefix('el');
        expect(menu.alwaysEntryValue()).toEqual("");
        menu.alwaysEntryValue('el');
        expect(menu.show()).toBe(true);

        expect(menu.prefix()).toEqual("el");
        expect(menu._prefix.active()).toEqual(false);
        expect(menu.alwaysEntryValue()).toEqual("el");
        expect(menu._entry.active()).toEqual(false);
        expect(menu.shownItem(0).name()).toEqual("Titel");
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong>Tit<mark>el</mark></strong>");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(menu.shownItem(1).name()).toEqual("Untertitel");
        expect(directElementChildrenByTagName(menu.element(),"li")[1].innerHTML).toEqual("<strong>Untertit<mark>el</mark></strong>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2)).toBe(undefined);

        // Backward
        menu.prev();
        expect(menu._prefix.active()).toEqual(false);
        expect(menu._entry.active()).toEqual(true);

        expect(menu.shownItem(0).name()).toEqual("Titel");
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong>Tit<mark>el</mark></strong>");
        expect(menu.shownItem(0).active()).toBe(false);

        expect(menu.shownItem(1).name()).toEqual("Untertitel");
        expect(directElementChildrenByTagName(menu.element(),"li")[1].innerHTML).toEqual("<strong>Untertit<mark>el</mark></strong>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2)).toBe(undefined);


        // Backward
        menu.prev();
        expect(menu._prefix.active()).toEqual(true);
        expect(menu._entry.active()).toEqual(false);

        expect(menu.shownItem(0).name()).toEqual("Titel");
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong>Tit<mark>el</mark></strong>");
        expect(menu.shownItem(0).active()).toBe(false);

        expect(menu.shownItem(1).name()).toEqual("Untertitel");
        expect(directElementChildrenByTagName(menu.element(),"li")[1].innerHTML).toEqual("<strong>Untertit<mark>el</mark></strong>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2)).toBe(undefined);

        // Backward
        menu.prev();
        expect(menu._prefix.active()).toEqual(false);
        expect(menu._entry.active()).toEqual(false);
        expect(menu.shownItem(0).name()).toEqual("Titel");
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong>Tit<mark>el</mark></strong>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(1).name()).toEqual("Untertitel");
        expect(directElementChildrenByTagName(menu.element(),"li")[1].innerHTML).toEqual("<strong>Untertit<mark>el</mark></strong>");
        expect(menu.shownItem(1).active()).toBe(true);
        expect(menu.shownItem(2)).toBe(undefined);
      });

      it('should be navigatable with a prefix (3)', function () {
        var menu = HintMenu.create("cnx/", demolist);
        menu._firstActive = true;
        menu.limit(3);
        expect(menu.show()).toBe(true);
        expect(menu.prefix()).toEqual("");
        menu.prefix('el');
        expect(menu.alwaysEntryValue()).toEqual("");
        expect(menu.alwaysEntry().value()).toEqual("");
        menu.alwaysEntryValue('el');
        expect(menu.show()).toBe(true);

        expect(menu.prefix()).toEqual("el");
        expect(menu._prefix.active()).toEqual(false);
        expect(menu.alwaysEntry().value()).toEqual("el");
        expect(menu._entry.active()).toEqual(false);
        expect(menu.shownItem(0).name()).toEqual("Titel");
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong>Tit<mark>el</mark></strong>");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(menu.shownItem(1).name()).toEqual("Untertitel");
        expect(directElementChildrenByTagName(menu.element(),"li")[1].innerHTML).toEqual("<strong>Untertit<mark>el</mark></strong>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2)).toBe(undefined);

        // Backward
        menu.prev();
        expect(menu._prefix.active()).toEqual(false);
        expect(menu._entry.active()).toEqual(true);
        expect(menu.shownItem(0).name()).toEqual("Titel");
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong>Tit<mark>el</mark></strong>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(1).name()).toEqual("Untertitel");
        expect(directElementChildrenByTagName(menu.element(),"li")[1].innerHTML).toEqual("<strong>Untertit<mark>el</mark></strong>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2)).toBe(undefined);

        // Backward
        menu.prev();
        expect(menu._prefix.active()).toEqual(true);
        expect(menu._entry.active()).toEqual(false);
        expect(menu.shownItem(0).name()).toEqual("Titel");
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong>Tit<mark>el</mark></strong>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(1).name()).toEqual("Untertitel");
        expect(directElementChildrenByTagName(menu.element(),"li")[1].innerHTML).toEqual("<strong>Untertit<mark>el</mark></strong>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2)).toBe(undefined);


        // Forward
        menu.next();
        expect(menu.prefix()).toEqual("el");
        expect(menu._prefix.active()).toEqual(false);
        expect(menu._entry.active()).toEqual(true);
        expect(menu.shownItem(0).name()).toEqual("Titel");
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong>Tit<mark>el</mark></strong>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(1).name()).toEqual("Untertitel");
        expect(directElementChildrenByTagName(menu.element(),"li")[1].innerHTML).toEqual("<strong>Untertit<mark>el</mark></strong>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2)).toBe(undefined);

        // Forward
        menu.next();
        expect(menu.prefix()).toEqual("el");
        expect(menu._prefix.active()).toEqual(false);
        expect(menu._entry.active()).toEqual(false);
        expect(menu.shownItem(0).name()).toEqual("Titel");
        expect(directElementChildrenByTagName(menu.element(),"li")[0].innerHTML).toEqual("<strong>Tit<mark>el</mark></strong>");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(menu.shownItem(1).name()).toEqual("Untertitel");
        expect(directElementChildrenByTagName(menu.element(),"li")[1].innerHTML).toEqual("<strong>Untertit<mark>el</mark></strong>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2)).toBe(undefined);
      });



      xit('should scroll to a chosen value after prefixing, if the chosen value is live');
    });

    describe('KorAP.AlwaysMenu.Entry', function () {
      it('should be initializable', function () {
        var p = alwaysEntryClass.create();
        expect(p.element().classList.contains('pref')).toBeFalsy();
        expect(p.element().classList.contains('entry')).toBeTruthy();
        expect(p.isSet()).not.toBeTruthy();
        expect(p.element().innerHTML).toEqual("Speichern");
        expect(p.value()).toEqual("");

        /*
          expect(mi.lcField()).toEqual(' baum');
        */
        
      });

      it('should be initializable with a different name', function () {
        var p = alwaysEntryClass.create("Save");
        expect(p.element().classList.contains('pref')).toBeFalsy();
        expect(p.element().classList.contains('entry')).toBeTruthy();
        expect(p.isSet()).not.toBeTruthy();
        expect(p.element().innerHTML).toEqual("Save");
        expect(p.value()).toEqual("");

        /*
          expect(mi.lcField()).toEqual(' baum');
        */
        
      });

      it('should be modifiable', function () {
        var p = alwaysEntryClass.create();
        expect(p.value()).toEqual('');
        expect(p.element().firstChild).toEqual(document.createTextNode("Speichern"));

        // Set string
        expect(p.value('Test')).toEqual('Test');
        expect(p.value()).toEqual('Test');
        expect(p.element().firstChild.nodeValue).toEqual('Speichern');

        // Add string
        expect(p.add('ified')).toEqual('Testified');
        expect(p.value()).toEqual('Testified');
        expect(p.element().firstChild.nodeValue).toEqual('Speichern');

        // Clear string
        p.clear();
        expect(p.value()).toEqual('');
        expect(p.element().firstChild).toEqual(document.createTextNode("Speichern"));

        // Set string
        expect(p.value('Test')).toEqual('Test');
        expect(p.value()).toEqual('Test');
        expect(p.element().firstChild.nodeValue).toEqual('Speichern');

        expect(p.chop()).toEqual('Tes');
        expect(p.value()).toEqual('Tes');
        expect(p.element().firstChild.nodeValue).toEqual('Speichern');

        expect(p.chop()).toEqual('Te');
        expect(p.value()).toEqual('Te');
        expect(p.element().firstChild.nodeValue).toEqual('Speichern');

        expect(p.chop()).toEqual('T');
        expect(p.value()).toEqual('T');
        expect(p.element().firstChild.nodeValue).toEqual('Speichern');

        expect(p.chop()).toEqual('');
        expect(p.value()).toEqual('');
        expect(p.element().firstChild).toEqual(document.createTextNode("Speichern"));
      });

      it('should be activatable', function () {
        var p = alwaysEntryClass.create();
        expect(p.value()).toEqual('');
        expect(p.element().firstChild).toEqual(document.createTextNode("Speichern"));

        expect(p.value('Test')).toEqual('Test');
        expect(p.element().firstChild.nodeValue).toEqual('Speichern');

        expect(p.active()).not.toBeTruthy();
        expect(p.element().classList.contains('active')).not.toBeTruthy();

        p.active(true);
        expect(p.active()).toBeTruthy();
        expect(p.element().classList.contains('active')).toBeTruthy();
      });
    });

    describe('KorAP.AlwaysMenu.Slider', function () {

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

        var menu = OwnAlwaysMenu.create(list);

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

        var menu = OwnAlwaysMenu.create(list);

        menu._firstActive = true;
        menu.limit(3);

        expect(menu.show()).toBe(true);

        menu.next();
        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(1).active()).toBe(true);
        expect(menu.shownItem(2).active()).toBe(false);
        expect(menu._prefix.active()).toBe(false);
        expect(menu._entry.active()).toBe(false);
        expect(menu.slider().offset()).toEqual(0);
        expect(menu.position).toEqual(1);

        menu.next();
        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2).active()).toBe(true);
        expect(menu._prefix.active()).toBe(false);
        expect(menu._entry.active()).toBe(false);
        expect(menu.slider().offset()).toEqual(0);
        expect(menu.position).toEqual(2);

        menu.next();
        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2).active()).toBe(true);
        expect(menu._prefix.active()).toBe(false);
        expect(menu._entry.active()).toBe(false);
        expect(menu.slider().offset()).toEqual(1);
        expect(menu.position).toEqual(3);

        menu.next();
        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2).active()).toBe(true);
        expect(menu._prefix.active()).toBe(false);
        expect(menu._entry.active()).toBe(false);
        expect(menu.slider().offset()).toEqual(2);
        expect(menu.position).toEqual(4);

        menu.next();
        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2).active()).toBe(false);
        expect(menu._prefix.active()).toBe(false);
        expect(menu._entry.active()).toBe(true);
        expect(menu.slider().offset()).toEqual(2);
        expect(menu.position).toEqual(7);

        menu.next();
        expect(menu.shownItem(0).active()).toBe(true);
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2).active()).toBe(false);
        expect(menu._prefix.active()).toBe(false);
        expect(menu._entry.active()).toBe(false);
        expect(menu.slider().offset()).toEqual(0);
        expect(menu.position).toEqual(0);

        expect(menu.slider()._slider.style.height).toEqual('60%');
      });

    });

    describe('KorAP.AlwaysMenu.Benchmark', function () {
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

define(
  ['containermenu', 'menu/item', 'menu/prefix', 'menu/lengthField','container/containeritem','container/container'],
  function (containerMenuClass, menuItemClass, prefixClass, lengthFieldClass, containerItemClass, containerClass) {

    OwnMenuItem = {
      create : function (params) {
        return Object.create(menuItemClass).upgradeTo(OwnMenuItem)._init(params);
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


    /**
     * Create own conainerItem class.
     */
    var OwnContainerItemClass = {
      create : function () {
        var obj = containerItemClass.create()
          .upgradeTo(OwnContainerItemClass);
          //._init();
        obj.value="";
        return obj;
      },
      add : function (letter) {
        this.value+=letter;
      },
      clear : function () {
        this.value = "";
      },
      further : function () {
        this.value = this.value + this.value;
      },
      onclick : function () {
      },
      element : function () {
        // already defined
        if (this._el !== undefined) return this._el;
        
        // Create list item
        const li = document.createElement("li");
        li.innerHTML="CI";
    
        // Connect action
        if (this["onclick"] !== undefined) {
          li["onclick"] = this.onclick.bind(this);
        };    
        return this._el = li;
      }
    };

    //List of items.
    var ExampleItemList = new Array;
    ExampleItemList.push(OwnContainerItemClass.create());
    ExampleItemList.push(OwnContainerItemClass.create());
    ExampleItemList[0].value = "CIValue1 ";
    ExampleItemList[1].value = "CIValue2 ";
    ExampleItemList[0].element().innerHTML = "CIText1 ";
    ExampleItemList[1].element().innerHTML = "CIText2 ";

    //Own container class.
    var OwnContainerClass = {
      create : function (listOfContainerItems, params) {
        //console.log(containerClass);
        return containerClass.create(listOfContainerItems, params)
          .upgradeTo(OwnContainerClass);
      }
    };

    var OwnContainerMenu = {
      create : function (list, containerList) {
        const params = {
          itemClass : OwnMenuItem,
          prefixClass : prefixClass,
          lengthFieldClass : lengthFieldClass,
          containerClass : OwnContainerClass,
          containerItemClass : OwnContainerItemClass
        };
        var obj = containerMenuClass.create(list,params,containerList)
            .upgradeTo(OwnContainerMenu);
            //._init(list, params);
        obj._firstActive = true;
        return obj;
      }
    };

    describe('OwnContainerMenu', function () {

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
        /**var list = [
	        ["Constituency"],
	        ["Lemma"],
	        ["Morphology"],
	        ["Part-of-Speech"],
	        ["Syntax"]
        ];
        */

        var menu = OwnContainerMenu.create(list); //,ExampleItemList
        // This is the same with and without additional container items!
        expect(menu.dontHide).toBe(false);
        menu._firstActive = true;
        expect(menu.itemClass()).toEqual(OwnMenuItem);
        expect(menu.element().nodeName).toEqual('UL');
        expect(menu.element().classList.contains('visible')).toBeFalsy();
        expect(menu.limit()).toEqual(8);
        expect(menu._notItemElements).toEqual(3);

        menu.limit(9);
        expect(menu.limit()).toEqual(9);

        menu.limit(8);

        // view
        menu.show();
        expect(menu.element().classList.contains('visible')).toBeTruthy();
        expect(menu.container().element().classList.contains('visible')).toBeTruthy();

        // First element in list
        expect(menu.item(0).active()).toBe(true);
        expect(menu.item(0).noMore()).toBe(true);

        // Middle element in list
        expect(menu.item(2).active()).toBe(false);
        expect(menu.item(2).noMore()).toBe(false);

        // Last element in list
        expect(menu.item(menu.length() - 1).active()).toBe(false);
        expect(menu.item(menu.length() - 1).noMore()).toBe(true);

        expect(menu.element().classList.contains('containermenu')).toBeTruthy();
        expect(menu.container()).toBeTruthy();
        expect(menu._container.element().nodeName).toEqual('UL'); // actually need new one for container!
        expect(menu._prefix.element().nodeName).toEqual('LI'); 
      });

      it('should have a reference to the menu', function () {
        var menu = OwnContainerMenu.create(list);
        expect(menu.item(0).menu()).toEqual(menu);

        menu = OwnContainerMenu.create(list);
        expect(menu.element().menu).toEqual(menu);
      });


      it('should be visible', function () {
        var menu = OwnContainerMenu.create(list);
        expect(menu.removeItems()).toBe(undefined);
        menu.limit(3);

        expect(menu.show()).toBe(true);
        const liElements = menu.directElementChildrenByTagName("li");
        expect(liElements("li")[0].innerHTML).toEqual("<strong>Constituency</strong><span>Example 1</span>");
        expect(liElements("li")[1].innerHTML).toEqual("<strong>Lemma</strong>");
        expect(liElements("li")[1].getAttribute("data-action")).toEqual("l=");
        expect(liElements("li")[2].innerHTML).toEqual("<strong>Morphology</strong><span>Example 2</span>");
        expect(liElements("li")[3]).toBe(undefined);

        // Check boundaries
        expect(liElements("li")[0].classList.contains("no-more")).toBe(true);
        expect(liElements("li")[1].classList.contains("no-more")).toBe(false);
        expect(liElements("li")[2].classList.contains("no-more")).toBe(false);
      });

      it('should be filterable', function () {
        var menu = OwnContainerMenu.create(list);
        menu.limit(3);
        expect(menu.prefix("o").show()).toBe(true);
        const liElements = menu.directElementChildrenByTagName("li");
        expect(menu.element().getElementsByClassName("pref")[0].innerHTML).toEqual("o");
        expect(liElements("li")[0].innerHTML).toEqual("<strong>C<mark>o</mark>nstituency</strong><span>Example 1</span>");
        expect(liElements("li")[1].innerHTML).toEqual("<strong>M<mark>o</mark>rph<mark>o</mark>l<mark>o</mark>gy</strong><span>Example 2</span>");
        expect(liElements("li")[2].innerHTML).toEqual("<strong>Part-<mark>o</mark>f-Speech</strong>");
        expect(liElements("li")[3]).toBe(undefined);

        // Check boundaries
        expect(liElements("li")[0].classList.contains("no-more")).toBe(true);
        expect(liElements("li")[1].classList.contains("no-more")).toBe(false);
        expect(liElements("li")[2].classList.contains("no-more")).toBe(true);

        menu.limit(2);
        
        const liElements = menu.directElementChildrenByTagName("li");
        expect(menu.prefix("o").show()).toBe(true);
        expect(menu.element().getElementsByClassName("pref")[0].innerHTML).toEqual("o");
        expect(liElements("li")[0].innerHTML).toEqual("<strong>C<mark>o</mark>nstituency</strong><span>Example 1</span>");
        expect(liElements("li")[1].innerHTML).toEqual("<strong>M<mark>o</mark>rph<mark>o</mark>l<mark>o</mark>gy</strong><span>Example 2</span>");
        expect(liElements("li")[2]).toBe(undefined);

        // Check boundaries
        expect(liElements("li")[0].classList.contains("no-more")).toBe(true);
        expect(liElements("li")[1].classList.contains("no-more")).toBe(false);
        expect(liElements("li")[2]).toBe(undefined);

        expect(menu.prefix("e").show()).toBe(true);
        const liElements = menu.directElementChildrenByTagName("li");
        expect(menu.element().getElementsByClassName("pref")[0].innerHTML).toEqual("e");
        expect(liElements("li")[0].innerHTML).toEqual("<strong>Constitu<mark>e</mark>ncy</strong><span><mark>E</mark>xampl<mark>e</mark> 1</span>");
        expect(liElements("li")[1].innerHTML).toEqual("<strong>Morphology</strong><span><mark>E</mark>xampl<mark>e</mark> 2</span>");
        expect(liElements("li")[2]).toBe(undefined);

        menu.limit(5);
        expect(menu.prefix("a").show()).toBe(true);
        const liElements = menu.directElementChildrenByTagName("li");
        expect(menu.element().getElementsByClassName("pref")[0].innerHTML).toEqual("a");
        expect(liElements("li")[0].innerHTML).toEqual("<strong>Constituency</strong><span>Ex<mark>a</mark>mple 1</span>");
        expect(liElements("li")[1].innerHTML).toEqual("<strong>Lemm<mark>a</mark></strong>");
        expect(liElements("li")[2].innerHTML).toEqual("<strong>Morphology</strong><span>Ex<mark>a</mark>mple 2</span>");
        expect(liElements("li")[3].innerHTML).toEqual("<strong>P<mark>a</mark>rt-of-Speech</strong>");
        expect(liElements("li")[4].innerHTML).toEqual("<strong>Synt<mark>a</mark>x</strong>");
        expect(liElements("li")[5]).toBe(undefined);
      });

      it('should be nextable', function () {
        var menu = OwnContainerMenu.create(list);
        menu._firstActive = true;

        // Show only 3 items
        menu.limit(3);
        expect(menu.show()).toBe(true);
        const liElements = menu.directElementChildrenByTagName("li");
        expect(liElements("li")[0].innerHTML).toEqual("<strong>Constituency</strong><span>Example 1</span>");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(liElements("li")[1].innerHTML).toEqual("<strong>Lemma</strong>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(liElements("li")[2].innerHTML).toEqual("<strong>Morphology</strong><span>Example 2</span>");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(liElements("li")[3]).toBe(undefined);

        // Activate next (1)
        menu.next();
        const liElements = menu.directElementChildrenByTagName("li");
        expect(liElements("li")[0].innerHTML).toEqual("<strong>Constituency</strong><span>Example 1</span>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements("li")[1].innerHTML).toEqual("<strong>Lemma</strong>");
        expect(menu.shownItem(1).active()).toBe(true);
        expect(liElements("li")[2].innerHTML).toEqual("<strong>Morphology</strong><span>Example 2</span>");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(liElements("li")[3]).toBe(undefined);

        // Activate next (2)
        menu.next();
        const liElements = menu.directElementChildrenByTagName("li");
        expect(liElements("li")[0].innerHTML).toEqual("<strong>Constituency</strong><span>Example 1</span>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements("li")[1].innerHTML).toEqual("<strong>Lemma</strong>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(liElements("li")[2].innerHTML).toEqual("<strong>Morphology</strong><span>Example 2</span>");
        expect(menu.shownItem(2).active()).toBe(true);
        expect(liElements("li")[3]).toBe(undefined);

        // Activate next (3)
        // scroll!
        menu.next();
        const liElements = menu.directElementChildrenByTagName("li");
        expect(liElements("li")[0].innerHTML).toEqual("<strong>Lemma</strong>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements("li")[1].innerHTML).toEqual("<strong>Morphology</strong><span>Example 2</span>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(liElements("li")[2].innerHTML).toEqual("<strong>Part-of-Speech</strong>");
        expect(menu.shownItem(2).active()).toBe(true);
        expect(liElements("li")[3]).toBe(undefined);

        // Activate next (4)
        menu.next();
        const liElements = menu.directElementChildrenByTagName("li");
        expect(liElements("li")[0].innerHTML).toEqual("<strong>Morphology</strong><span>Example 2</span>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements("li")[1].innerHTML).toEqual("<strong>Part-of-Speech</strong>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(liElements("li")[2].innerHTML).toEqual("<strong>Syntax</strong>");
        expect(menu.shownItem(2).active()).toBe(true);
        expect(liElements("li")[3]).toBe(undefined);

        // Activate next (5) - ROLL
        menu.next();
        const liElements = menu.directElementChildrenByTagName("li");
        expect(liElements("li")[0].innerHTML).toEqual("<strong>Constituency</strong><span>Example 1</span>");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(liElements("li")[1].innerHTML).toEqual("<strong>Lemma</strong>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(liElements("li")[2].innerHTML).toEqual("<strong>Morphology</strong><span>Example 2</span>");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(liElements("li")[3]).toBe(undefined);

        // Active next (6)
        menu.next();
        const liElements = menu.directElementChildrenByTagName("li");
        expect(liElements("li")[0].innerHTML).toEqual("<strong>Constituency</strong><span>Example 1</span>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements("li")[1].innerHTML).toEqual("<strong>Lemma</strong>");
        expect(menu.shownItem(1).active()).toBe(true);
        expect(liElements("li")[2].innerHTML).toEqual("<strong>Morphology</strong><span>Example 2</span>");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(liElements("li")[3]).toBe(undefined);
      });

      it('should be nextable without active field', function () {
        var menu = OwnContainerMenu.create(list);
        menu.limit(3);
        expect(menu.show()).toBe(true);
        menu.next();
        expect(menu.shownItem(0).active()).toEqual(true);
      });


      it('should be prevable', function () {
        var menu = OwnContainerMenu.create(list);
        menu._firstActive = true;
        menu.limit(3);
        expect(menu.show()).toBe(true);

        const liElements = menu.directElementChildrenByTagName("li");
        expect(liElements("li")[0].innerHTML).toEqual("<strong>Constituency</strong><span>Example 1</span>");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(liElements("li")[1].innerHTML).toEqual("<strong>Lemma</strong>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(liElements("li")[2].innerHTML).toEqual("<strong>Morphology</strong><span>Example 2</span>");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(liElements("li")[3]).toBe(undefined);

        // Activate prev (1) - roll to bottom
        menu.prev();
        const liElements = menu.directElementChildrenByTagName("li");
        expect(liElements("li")[0].innerHTML).toEqual("<strong>Morphology</strong><span>Example 2</span>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements("li")[1].innerHTML).toEqual("<strong>Part-of-Speech</strong>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(liElements("li")[2].innerHTML).toEqual("<strong>Syntax</strong>");
        expect(menu.shownItem(2).active()).toBe(true);
        expect(liElements("li")[3]).toBe(undefined);

        // Activate prev (2)
        menu.prev();
        const liElements = menu.directElementChildrenByTagName("li");
        expect(liElements("li")[0].innerHTML).toEqual("<strong>Morphology</strong><span>Example 2</span>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements("li")[1].innerHTML).toEqual("<strong>Part-of-Speech</strong>");
        expect(menu.shownItem(1).active()).toBe(true);
        expect(liElements("li")[2].innerHTML).toEqual("<strong>Syntax</strong>");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(liElements("li")[3]).toBe(undefined);

        // Activate prev (3)
        menu.prev();
        const liElements = menu.directElementChildrenByTagName("li");
        expect(menu.shownItem(0).name()).toEqual("Morphology");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(menu.shownItem(1).name()).toEqual("Part-of-Speech");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2).name()).toEqual("Syntax");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(liElements("li")[3]).toBe(undefined);

        // Activate prev (4)
        menu.prev();
        const liElements = menu.directElementChildrenByTagName("li");
        expect(menu.shownItem(0).name()).toEqual("Lemma");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(menu.shownItem(1).name()).toEqual("Morphology");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2).name()).toEqual("Part-of-Speech");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(liElements("li")[3]).toBe(undefined);

        // Activate prev (5)
        menu.prev();
        const liElements = menu.directElementChildrenByTagName("li");
        expect(menu.shownItem(0).name()).toEqual("Constituency");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(menu.shownItem(1).name()).toEqual("Lemma");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2).name()).toEqual("Morphology");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(liElements("li")[3]).toBe(undefined);

        // Activate next (1)
        menu.next();
        const liElements = menu.directElementChildrenByTagName("li");
        expect(menu.shownItem(0).name()).toEqual("Constituency");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(1).name()).toEqual("Lemma");
        expect(menu.shownItem(1).active()).toBe(true);
        expect(menu.shownItem(2).name()).toEqual("Morphology");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(liElements("li")[3]).toBe(undefined);

        // Activate prev (6)
        menu.prev();

        // Activate prev (7)
        menu.prev();
        const liElements = menu.directElementChildrenByTagName("li");
        expect(menu.shownItem(0).name()).toEqual("Morphology");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(1).name()).toEqual("Part-of-Speech");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2).name()).toEqual("Syntax");
        expect(menu.shownItem(2).active()).toBe(true);
        expect(liElements("li")[3]).toBe(undefined);
      });

      it('should be prevable without active field', function () {
        var menu = OwnContainerMenu.create(list);
        menu.limit(3);
        expect(menu.show()).toBe(true);
        menu.prev();
        expect(menu.shownItem(2).active()).toEqual(true);
        expect(menu.shownItem(2).lcField()).toEqual(' syntax');
      });

      it('should be navigatable and filterable (prefix = "o")', function () {
        var menu = OwnContainerMenu.create(list);
        menu._firstActive = true;
        menu.limit(2);

        const liElements = menu.directElementChildrenByTagName("li");
        expect(menu.prefix("o").show()).toBe(true);
        expect(menu.shownItem(0).name()).toEqual("Constituency");
        expect(liElements("li")[0].innerHTML).toEqual("<strong>C<mark>o</mark>nstituency</strong><span>Example 1</span>");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(menu.shownItem(1).name()).toEqual("Morphology");
        expect(liElements("li")[1].innerHTML).toEqual("<strong>M<mark>o</mark>rph<mark>o</mark>l<mark>o</mark>gy</strong><span>Example 2</span>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2)).toBe(undefined);

        // Next (1)
        menu.next();
        const liElements = menu.directElementChildrenByTagName("li");
        expect(menu.shownItem(0).name()).toEqual("Constituency");
        expect(liElements("li")[0].innerHTML).toEqual("<strong>C<mark>o</mark>nstituency</strong><span>Example 1</span>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(1).name()).toEqual("Morphology");
        expect(liElements("li")[1].innerHTML).toEqual("<strong>M<mark>o</mark>rph<mark>o</mark>l<mark>o</mark>gy</strong><span>Example 2</span>");
        expect(menu.shownItem(1).active()).toBe(true);
        expect(menu.shownItem(2)).toBe(undefined);

        // Next (2)
        menu.next();
        const liElements = menu.directElementChildrenByTagName("li");
        expect(menu.shownItem(0).name()).toEqual("Morphology");
        expect(liElements("li")[0].innerHTML).toEqual("<strong>M<mark>o</mark>rph<mark>o</mark>l<mark>o</mark>gy</strong><span>Example 2</span>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(1).name()).toEqual("Part-of-Speech");
        expect(liElements("li")[1].innerHTML).toEqual("<strong>Part-<mark>o</mark>f-Speech</strong>");
        expect(menu.shownItem(1).active()).toBe(true);
        expect(menu.shownItem(2)).toBe(undefined);

        // Next (3) - to prefix
        menu.next();
        const liElements = menu.directElementChildrenByTagName("li");
        expect(menu.shownItem(0).name()).toEqual("Morphology");
        expect(liElements("li")[0].innerHTML).toEqual("<strong>M<mark>o</mark>rph<mark>o</mark>l<mark>o</mark>gy</strong><span>Example 2</span>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(1).name()).toEqual("Part-of-Speech");
        expect(liElements("li")[1].innerHTML).toEqual("<strong>Part-<mark>o</mark>f-Speech</strong>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2)).toBe(undefined);

        menu.next();
        const liElements = menu.directElementChildrenByTagName("li");
        expect(menu.shownItem(0).name()).toEqual("Constituency");
        expect(liElements("li")[0].innerHTML).toEqual("<strong>C<mark>o</mark>nstituency</strong><span>Example 1</span>");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(menu.shownItem(1).name()).toEqual("Morphology");
        expect(liElements("li")[1].innerHTML).toEqual("<strong>M<mark>o</mark>rph<mark>o</mark>l<mark>o</mark>gy</strong><span>Example 2</span>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2)).toBe(undefined);
      });


      it('should be navigatable and filterable (prefix = "ex", "e")', function () {
        var menu = OwnContainerMenu.create(list);
        menu._firstActive = true;

        menu.limit(2);
        expect(menu.prefix("ex").show()).toBe(true);

        const liElements = menu.directElementChildrenByTagName("li");
        expect(menu.shownItem(0).name()).toEqual("Constituency");
        expect(liElements("li")[0].innerHTML).toEqual("<strong>Constituency</strong><span><mark>Ex</mark>ample 1</span>");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(menu.shownItem(1).name()).toEqual("Morphology");
        expect(liElements("li")[1].innerHTML).toEqual("<strong>Morphology</strong><span><mark>Ex</mark>ample 2</span>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2)).toBe(undefined);

        // Next (1)
        menu.next();
        const liElements = menu.directElementChildrenByTagName("li");
        expect(menu.shownItem(0).name()).toEqual("Constituency");
        expect(liElements("li")[0].innerHTML).toEqual("<strong>Constituency</strong><span><mark>Ex</mark>ample 1</span>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(1).name()).toEqual("Morphology");
        expect(liElements("li")[1].innerHTML).toEqual("<strong>Morphology</strong><span><mark>Ex</mark>ample 2</span>");
        expect(menu.shownItem(1).active()).toBe(true);
        expect(menu.shownItem(2)).toBe(undefined);

        // Next (2)
        menu.next();

        const liElements = menu.directElementChildrenByTagName("li");
        expect(menu.prefix()).toEqual('ex');
        expect(menu.shownItem(0).name()).toEqual("Constituency");
        expect(liElements("li")[0].innerHTML).toEqual("<strong>Constituency</strong><span><mark>Ex</mark>ample 1</span>");
        expect(menu.shownItem(0).active()).toBe(false);

        expect(menu.shownItem(1).name()).toEqual("Morphology");
        expect(liElements("li")[1].innerHTML).toEqual("<strong>Morphology</strong><span><mark>Ex</mark>ample 2</span>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2)).toBe(undefined);

        // Reset limit
        menu.limit(5);

        // Change show
        const liElements = menu.directElementChildrenByTagName("li");
        expect(menu.prefix("e").show()).toBe(true);
        expect(menu._prefix.active()).toBe(false);
        expect(menu.shownItem(0).name()).toEqual("Constituency");
        expect(liElements("li")[0].innerHTML).toEqual("<strong>Constitu<mark>e</mark>ncy</strong><span><mark>E</mark>xampl<mark>e</mark> 1</span>");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(menu.shownItem(1).name()).toEqual("Morphology");
        expect(liElements("li")[1].innerHTML).toEqual("<strong>Morphology</strong><span><mark>E</mark>xampl<mark>e</mark> 2</span>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2)).toBe(undefined);

        // Next (1)
        menu.next();
        const liElements = menu.directElementChildrenByTagName("li");
        expect(menu._prefix.active()).toBe(false);
        expect(menu.prefix()).toEqual('e');
        expect(menu.shownItem(0).name()).toEqual("Constituency");
        expect(liElements("li")[0].innerHTML).toEqual("<strong>Constitu<mark>e</mark>ncy</strong><span><mark>E</mark>xampl<mark>e</mark> 1</span>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(1).name()).toEqual("Morphology");
        expect(liElements("li")[1].innerHTML).toEqual("<strong>Morphology</strong><span><mark>E</mark>xampl<mark>e</mark> 2</span>");
        expect(menu.shownItem(1).active()).toBe(true);
        expect(menu.shownItem(2)).toBe(undefined);

        // Next (2)
        menu.next();
        const liElements = menu.directElementChildrenByTagName("li");
        expect(menu._prefix.active()).toBe(true);
        expect(menu.shownItem(0).name()).toEqual("Constituency");
        expect(liElements("li")[0].innerHTML).toEqual("<strong>Constitu<mark>e</mark>ncy</strong><span><mark>E</mark>xampl<mark>e</mark> 1</span>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(1).name()).toEqual("Morphology");
        expect(liElements("li")[1].innerHTML).toEqual("<strong>Morphology</strong><span><mark>E</mark>xampl<mark>e</mark> 2</span>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2)).toBe(undefined);

        // Next (3)
        menu.next();
        const liElements = menu.directElementChildrenByTagName("li");
        expect(menu._prefix.active()).toBe(false);
        expect(menu.shownItem(0).name()).toEqual("Constituency");
        expect(liElements("li")[0].innerHTML).toEqual("<strong>Constitu<mark>e</mark>ncy</strong><span><mark>E</mark>xampl<mark>e</mark> 1</span>");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(menu.shownItem(1).name()).toEqual("Morphology");
        expect(liElements("li")[1].innerHTML).toEqual("<strong>Morphology</strong><span><mark>E</mark>xampl<mark>e</mark> 2</span>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2)).toBe(undefined);
      });

      it('should be filterable (multiple prefix = "pro sin")', function () {
        var menu = OwnContainerMenu.create("drukola/p=", listMultiPrefix);
        menu._firstActive = true;

        menu.limit(2);
        const liElements = menu.directElementChildrenByTagName("li");
        expect(menu.prefix("pro sin").show()).toBe(true);
        expect(menu.shownItem(0).name()).toEqual("PPS");
        expect(liElements("li")[0].innerHTML).toEqual(
          "<strong>PPS</strong><span>Personal <mark>Pro</mark>noun, <mark>Sin</mark>gular</span>"
        );

        expect(menu.shownItem(0).active()).toBe(true);
        expect(menu.shownItem(1).name()).toEqual("PPSA");
        expect(liElements("li")[1].innerHTML).toEqual("<strong>PPSA</strong><span>Personal <mark>Pro</mark>noun, <mark>Sin</mark>gular, Accusative</span>");
        expect(menu.shownItem(1).active()).toBe(false);

        expect(menu.shownItem(2)).toBe(undefined);
      });

      it('should be filterable (trimming = " p")', function () {
        var menu = OwnContainerMenu.create("/p=", listMultiPrefix);
        // menu._firstActive = true;

        menu.limit(2);
        const liElements = menu.directElementChildrenByTagName("li");
        expect(menu.show()).toBe(true);
        menu._prefix.add(" ");
        expect(menu.show()).toBe(true);
        menu._prefix.add("p")
        expect(menu.show()).toBe(true);
        expect(menu.shownItem(0).name()).toEqual("PP");
        expect(liElements("li")[0].innerHTML).toEqual(
          "<strong><mark>P</mark><mark>P</mark></strong>"+
            "<span><mark>P</mark>ersonal <mark>P</mark>ronoun</span>"
        );
      });

      
      it('should choose prefix with failing prefix (1)', function () {
        var menu = OwnContainerMenu.create(list);
        menu.limit(2);
        expect(menu.prefix("exit").show()).toBe(true);
        expect(menu.element().querySelector('li')).toBe(null);
        expect(menu.shownItem(0)).toBeUndefined();
        expect(menu._prefix.active()).toBe(true);
      });


      it('should choose prefix with failing prefix (2)', function () {
        var menu = OwnContainerMenu.create(list);
        menu.limit(2);
        expect(menu.show()).toBe(true);
        expect(menu.prefix("exit").show()).toBe(true);
        expect(menu.element().querySelector('li')).toBe(null);
        expect(menu.shownItem(0)).toBeUndefined();
        expect(menu._prefix.active()).toBe(true);
      });

      it('should ignore navigation with failing prefix', function () {
        var menu = OwnContainerMenu.create(list);
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
        var menu = OwnContainerMenu.create("cnx/", demolist);
        menu._firstActive = true;

        menu.limit(3);

        expect(menu.show()).toBe(true);
        expect(menu.prefix()).toEqual("");

        const liElements = menu.directElementChildrenByTagName("li");
        expect(menu.shownItem(0).name()).toEqual("Titel");
        expect(liElements("li")[0].innerHTML).toEqual("<strong>Titel</strong>");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(menu.shownItem(1).name()).toEqual("Untertitel");
        expect(liElements("li")[1].innerHTML).toEqual("<strong>Untertitel</strong>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2).name()).toEqual("Veröffentlichungsdatum");
        expect(liElements("li")[2].innerHTML).toEqual("<strong>Veröffentlichungsdatum</strong>");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(menu.shownItem(3)).toBe(undefined);

        menu._prefix.add('a');
        const liElements = menu.directElementChildrenByTagName("li");
        expect(menu.show()).toBe(true);
        expect(menu.prefix()).toEqual("a");
        expect(menu.shownItem(0).name()).toEqual("Autor");
        expect(liElements("li")[0].innerHTML).toEqual("<strong><mark>A</mark>utor</strong>");

        menu._prefix.add('u');
        const liElements = menu.directElementChildrenByTagName("li");
        expect(menu.show()).toBe(true);
        expect(menu.prefix()).toEqual("au");
        expect(menu.shownItem(0).name()).toEqual("Autor");
        expect(liElements("li")[0].innerHTML).toEqual("<strong><mark>Au</mark>tor</strong>");

        menu._prefix.chop();
        const liElements = menu.directElementChildrenByTagName("li");
        expect(menu.show()).toBe(true);
        expect(menu.prefix()).toEqual("a");
        expect(menu.shownItem(0).name()).toEqual("Autor");
        expect(liElements("li")[0].innerHTML).toEqual("<strong><mark>A</mark>utor</strong>");

        menu._prefix.chop();
        expect(menu.show()).toBe(true);
        expect(menu.prefix()).toEqual("");
        expect(menu.shownItem(0).name()).toEqual("Titel");
        const liElements = menu.directElementChildrenByTagName("li");
        expect(liElements("li")[0].innerHTML).toEqual("<strong>Titel</strong>");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(menu.shownItem(1).name()).toEqual("Untertitel");
        expect(liElements("li")[1].innerHTML).toEqual("<strong>Untertitel</strong>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2).name()).toEqual("Veröffentlichungsdatum");
        expect(liElements("li")[2].innerHTML).toEqual("<strong>Veröffentlichungsdatum</strong>");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(menu.shownItem(3)).toBe(undefined);

        // Forward
        menu._prefix.chop();
        const liElements = menu.directElementChildrenByTagName("li");
        expect(menu.show()).toBe(true);
        expect(menu.prefix()).toEqual("");
        expect(menu.shownItem(0).name()).toEqual("Titel");
        expect(liElements("li")[0].innerHTML).toEqual("<strong>Titel</strong>");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(menu.shownItem(1).name()).toEqual("Untertitel");
        expect(liElements("li")[1].innerHTML).toEqual("<strong>Untertitel</strong>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2).name()).toEqual("Veröffentlichungsdatum");
        expect(liElements("li")[2].innerHTML).toEqual("<strong>Veröffentlichungsdatum</strong>");
        expect(menu.shownItem(2).active()).toBe(false);

        // Forward
        menu.next();
        const liElements = menu.directElementChildrenByTagName("li");
        expect(menu.prefix()).toEqual("");
        expect(menu.shownItem(0).name()).toEqual("Titel");
        expect(liElements("li")[0].innerHTML).toEqual("<strong>Titel</strong>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(1).name()).toEqual("Untertitel");
        expect(liElements("li")[1].innerHTML).toEqual("<strong>Untertitel</strong>");
        expect(menu.shownItem(1).active()).toBe(true);
        expect(menu.shownItem(2).name()).toEqual("Veröffentlichungsdatum");
        expect(liElements("li")[2].innerHTML).toEqual("<strong>Veröffentlichungsdatum</strong>");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(menu.shownItem(3)).toBe(undefined);

        // Forward
        menu.next();
        const liElements = menu.directElementChildrenByTagName("li");
        expect(menu.prefix()).toEqual("");
        expect(menu.shownItem(0).name()).toEqual("Titel");
        expect(liElements("li")[0].innerHTML).toEqual("<strong>Titel</strong>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(1).name()).toEqual("Untertitel");
        expect(liElements("li")[1].innerHTML).toEqual("<strong>Untertitel</strong>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2).name()).toEqual("Veröffentlichungsdatum");
        expect(liElements("li")[2].innerHTML).toEqual("<strong>Veröffentlichungsdatum</strong>");
        expect(menu.shownItem(2).active()).toBe(true);
        expect(menu.shownItem(3)).toBe(undefined);

        // Forward
        menu.next();
        const liElements = menu.directElementChildrenByTagName("li");
        expect(menu.prefix()).toEqual("");
        expect(menu.shownItem(0).name()).toEqual("Untertitel");
        expect(liElements("li")[0].innerHTML).toEqual("<strong>Untertitel</strong>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(1).name()).toEqual("Veröffentlichungsdatum");
        expect(liElements("li")[1].innerHTML).toEqual("<strong>Veröffentlichungsdatum</strong>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2).name()).toEqual("Länge");
        expect(liElements("li")[2].innerHTML).toEqual("<strong>Länge</strong>");
        expect(menu.shownItem(2).active()).toBe(true);
        expect(menu.shownItem(3)).toBe(undefined);

        // Forward
        menu.next();
        const liElements = menu.directElementChildrenByTagName("li");
        expect(menu.prefix()).toEqual("");
        expect(menu.shownItem(0).name()).toEqual("Veröffentlichungsdatum");
        expect(liElements("li")[0].innerHTML).toEqual("<strong>Veröffentlichungsdatum</strong>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(1).name()).toEqual("Länge");
        expect(liElements("li")[1].innerHTML).toEqual("<strong>Länge</strong>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2).name()).toEqual("Autor");
        expect(liElements("li")[2].innerHTML).toEqual("<strong>Autor</strong>");
        expect(menu.shownItem(2).active()).toBe(true);
        expect(menu.shownItem(3)).toBe(undefined);

        // Forward
        menu.next();
        const liElements = menu.directElementChildrenByTagName("li");
        expect(menu.prefix()).toEqual("");
        expect(menu.shownItem(0).name()).toEqual("Titel");
        expect(liElements("li")[0].innerHTML).toEqual("<strong>Titel</strong>");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(menu.shownItem(1).name()).toEqual("Untertitel");
        expect(liElements("li")[1].innerHTML).toEqual("<strong>Untertitel</strong>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2).name()).toEqual("Veröffentlichungsdatum");
        expect(liElements("li")[2].innerHTML).toEqual("<strong>Veröffentlichungsdatum</strong>");
        expect(menu.shownItem(2).active()).toBe(false);
      });


      it('should be navigatable with a prefix (1)', function () {
        var menu = OwnContainerMenu.create("cnx/", demolist);
        menu._firstActive = true;

        menu.limit(3);

        expect(menu.show()).toBe(true);
        expect(menu.prefix()).toEqual("");

        // Add prefix in uppercase - but check in lowercase
        menu.prefix('El');
        expect(menu.show()).toBe(true);

        const liElements = menu.directElementChildrenByTagName("li");
        expect(menu.prefix()).toEqual("El");
        expect(menu._prefix.active()).toEqual(false);
        expect(menu.shownItem(0).name()).toEqual("Titel");
        expect(liElements("li")[0].innerHTML).toEqual("<strong>Tit<mark>el</mark></strong>");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(menu.shownItem(1).name()).toEqual("Untertitel");
        expect(liElements("li")[1].innerHTML).toEqual("<strong>Untertit<mark>el</mark></strong>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2)).toBe(undefined);

        // Forward
        menu.next();
        const liElements = menu.directElementChildrenByTagName("li");
        expect(menu.prefix()).toEqual("El");
        expect(menu._prefix.active()).toEqual(false);
        expect(menu.shownItem(0).name()).toEqual("Titel");
        expect(liElements("li")[0].innerHTML).toEqual("<strong>Tit<mark>el</mark></strong>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(1).name()).toEqual("Untertitel");
        expect(liElements("li")[1].innerHTML).toEqual("<strong>Untertit<mark>el</mark></strong>");
        expect(menu.shownItem(1).active()).toBe(true);
        expect(menu.shownItem(2)).toBe(undefined);

        // Forward
        menu.next();
        const liElements = menu.directElementChildrenByTagName("li");
        expect(menu.prefix()).toEqual("El");
        expect(menu._prefix.active()).toEqual(true);
        expect(menu.shownItem(0).name()).toEqual("Titel");
        expect(liElements("li")[0].innerHTML).toEqual("<strong>Tit<mark>el</mark></strong>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(1).name()).toEqual("Untertitel");
        expect(liElements("li")[1].innerHTML).toEqual("<strong>Untertit<mark>el</mark></strong>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2)).toBe(undefined);

        // Backward
        menu.prev();
        const liElements = menu.directElementChildrenByTagName("li");
        expect(menu.prefix()).toEqual("El");
        expect(menu._prefix.active()).toEqual(false);
        expect(menu.shownItem(0).name()).toEqual("Titel");
        expect(liElements("li")[0].innerHTML).toEqual("<strong>Tit<mark>el</mark></strong>");
        expect(menu.shownItem(0).active()).toBe(false);

        const liElements = menu.directElementChildrenByTagName("li");
        expect(menu.shownItem(1).name()).toEqual("Untertitel");
        expect(liElements("li")[1].innerHTML).toEqual("<strong>Untertit<mark>el</mark></strong>");
        expect(menu.shownItem(1).active()).toBe(true);
        expect(menu.shownItem(2)).toBe(undefined);
      });


      it('should be navigatable with a prefix (2)', function () {
        var menu = OwnContainerMenu.create("cnx/", demolist);
        menu._firstActive = true;

        menu.limit(3);
        expect(menu.show()).toBe(true);
        expect(menu.prefix()).toEqual("");
        menu.prefix('el');
        expect(menu.show()).toBe(true);

        const liElements = menu.directElementChildrenByTagName("li");
        expect(menu.prefix()).toEqual("el");
        expect(menu._prefix.active()).toEqual(false);
        expect(menu.shownItem(0).name()).toEqual("Titel");
        expect(liElements("li")[0].innerHTML).toEqual("<strong>Tit<mark>el</mark></strong>");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(menu.shownItem(1).name()).toEqual("Untertitel");
        expect(liElements("li")[1].innerHTML).toEqual("<strong>Untertit<mark>el</mark></strong>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2)).toBe(undefined);

        // Backward
        menu.prev();
        expect(menu._prefix.active()).toEqual(true);

        const liElements = menu.directElementChildrenByTagName("li");
        expect(menu.shownItem(0).name()).toEqual("Titel");
        expect(liElements("li")[0].innerHTML).toEqual("<strong>Tit<mark>el</mark></strong>");
        expect(menu.shownItem(0).active()).toBe(false);

        expect(menu.shownItem(1).name()).toEqual("Untertitel");
        expect(liElements("li")[1].innerHTML).toEqual("<strong>Untertit<mark>el</mark></strong>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2)).toBe(undefined);

        // Backward
        menu.prev();
        const liElements = menu.directElementChildrenByTagName("li");
        expect(menu._prefix.active()).toEqual(false);
        expect(menu.shownItem(0).name()).toEqual("Titel");
        expect(liElements("li")[0].innerHTML).toEqual("<strong>Tit<mark>el</mark></strong>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(1).name()).toEqual("Untertitel");
        expect(liElements("li")[1].innerHTML).toEqual("<strong>Untertit<mark>el</mark></strong>");
        expect(menu.shownItem(1).active()).toBe(true);
        expect(menu.shownItem(2)).toBe(undefined);
      });

      it('should be navigatable with a prefix (3)', function () {
        var menu = OwnContainerMenu.create("cnx/", demolist);
        menu._firstActive = true;
        menu.limit(3);
        expect(menu.show()).toBe(true);
        expect(menu.prefix()).toEqual("");
        menu.prefix('el');
        expect(menu.show()).toBe(true);

        const liElements = menu.directElementChildrenByTagName("li");
        expect(menu.prefix()).toEqual("el");
        expect(menu._prefix.active()).toEqual(false);
        expect(menu.shownItem(0).name()).toEqual("Titel");
        expect(liElements("li")[0].innerHTML).toEqual("<strong>Tit<mark>el</mark></strong>");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(menu.shownItem(1).name()).toEqual("Untertitel");
        expect(liElements("li")[1].innerHTML).toEqual("<strong>Untertit<mark>el</mark></strong>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2)).toBe(undefined);

        // Backward
        menu.prev();
        const liElements = menu.directElementChildrenByTagName("li");
        expect(menu._prefix.active()).toEqual(true);
        expect(menu.shownItem(0).name()).toEqual("Titel");
        expect(liElements("li")[0].innerHTML).toEqual("<strong>Tit<mark>el</mark></strong>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(1).name()).toEqual("Untertitel");
        expect(liElements("li")[1].innerHTML).toEqual("<strong>Untertit<mark>el</mark></strong>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2)).toBe(undefined);


        // Forward
        menu.next();
        expect(menu.prefix()).toEqual("el");
        expect(menu._prefix.active()).toEqual(false);
        expect(menu.shownItem(0).name()).toEqual("Titel");
        const liElements = menu.directElementChildrenByTagName("li");
        expect(liElements("li")[0].innerHTML).toEqual("<strong>Tit<mark>el</mark></strong>");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(menu.shownItem(1).name()).toEqual("Untertitel");
        expect(liElements("li")[1].innerHTML).toEqual("<strong>Untertit<mark>el</mark></strong>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2)).toBe(undefined);

      });

      it('should show screens by offset', function () {
        var menu = OwnContainerMenu.create('cnx/', demolist);
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
        var menu = OwnContainerMenu.create('cnx/', demolist);
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
        var menu = OwnContainerMenu.create(demolonglist);
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
        var menu = OwnContainerMenu.create(demolonglist);
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
        var menu = OwnContainerMenu.create(demolonglist);
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
        var menu = OwnContainerMenu.create(demolonglist);
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
        var menu = OwnContainerMenu.create(demolonglist);
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
        var menu = OwnContainerMenu.create(demolist);
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
        var menu = OwnContainerMenu.create(demolist);
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
        var menu = OwnContainerMenu.create(demolonglist);

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
    describe('KorAP.Container', function () {
      it("should be initializable with no additional container items", function () {
        var menu = OwnContainerMenu.create(list);
        var container = menu.container();
        expect(container._containerItemClass).toEqual(OwnContainerItemClass);
        expect(container.element().nodeName).toEqual("ul");
        expect(container.element().classList.contains("menu")).toBeTruthy();
        expect(container.element().classList.contains("visible")).toBeFalsy();
        expect(menu._prefix).toEqual(container._prefix);
        expect(container.length()).toEqual(1);
        expect(container.length()).toEqual(container.items.length);
        expect(container.liveLength()).toEqual(0);
        expect(container.item(0)).toEqual(container._prefix);
        expect(container.active()).toBeFalsy();
        expect(menu.element().directElementChildrenByTagName("pref")).toBeUndefined();
        expect(container.element().getElementsByClassName("pref").length).toBeEqual(1);
        


        menu.prefix("ad");
        expect(container.liveLength()).toEqual(1);
        menu.prev();
        expect(container.active()).toBeTruthy();

        
      });

    });
  });

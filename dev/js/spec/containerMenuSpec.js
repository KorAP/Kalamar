define(
  ['containermenu', 'menu/item', 'menu/prefix', 'menu/lengthField','container/containeritem','container/container'],
  function (containerMenuClass, menuItemClass, prefixClass, lengthFieldClass, containerItemClass, containerClass) {

    // The OwnMenu item
    const OwnMenuItem = {
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
    const OwnContainerItemClass = {
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
      }
    };

    //List of items.
    var ExampleItemList = new Array;
    ExampleItemList.push({value : "CIValue1" , defaultTextValue : "CIText1 "});
    ExampleItemList.push({value : "CIValue2" , defaultTextValue : "CIText2 "});

    //Own container class.
    const OwnContainerClass = {
      create : function (listOfContainerItems, params) {
        //console.log(containerClass);
        return containerClass.create(listOfContainerItems, params)
          .upgradeTo(OwnContainerClass);
      }
    };

    const OwnContainerMenu = {
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
        return obj;
      }
    };

    describe('KorAP.ContainerMenu', function () {

      var list = [
        ["Constituency"],
        ["Lemma"],
        ["Morphology"],
        ["Part-of-Speech"],
        ["Syntax"]
      ];
      
      var listWithEX = [
        ["example 1 Constituency"],
        ["Lemma"],
        ["example 2 Morphology"],
        ["Part-of_Speech"],
        ["Syntax"]
      ];

      var listMultiPrefix = [
        ["Personal Pronoun"],
        ["Personal Pronoun, Plural"],
        ["Personal Pronoun, Plural, Acc."],
        ["Personal Pronoun, Plural, Dative"],
        ["Personal Pronoun, Plural, Direct"],
        ["Personal Pronoun, Plural, Oblique"],
        ["Personal Pronoun, Singular"],
        ["Personal Pronoun, Singular, Accusative"],
        ["Personal Pronoun, Singular, Dative"],
        ["Personal Pronoun, Singular, Direct"],
        ["Personal Pronoun, Singular, Nominative"],
        ["Personal Pronoun, Singular, Oblique"]
      ];
      
      var demolist = [
        ['Titel'],
        ['Untertitel'],
        ['Veröffentlichungsdatum'],
        ['Länge'],
        ['Autor']
      ];

      var demolonglist = [
        ['Titel'],
        ['Untertitel'],
        ['Veröffentlichungsdatum'],
        ['Länge'],
        ['Autor'],
        ['Genre'],
        ['corpusID'],
        ['docID'],
        ['textID'],
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

        var menu = OwnContainerMenu.create(list,ExampleItemList);
        // This is the same with and without additional container items!
        expect(menu.dontHide).toBe(false);
        menu._firstActive = true;
        expect(menu.itemClass()).toEqual(OwnMenuItem);
        expect(menu.element().nodeName).toEqual('UL');
        expect(menu.element().classList.contains('visible')).toBeFalsy();
        expect(menu.container().element().classList.contains('visible')).toBeFalsy();
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
        expect(menu._prefix.element().nodeName).toEqual('SPAN');
        expect(menu._container._containerItemClass).toEqual(OwnContainerItemClass);
        expect(menu._container.items.length).toEqual(3);
      });

      it('should have a reference to the menu', function () {
        var menu = OwnContainerMenu.create(list,ExampleItemList);
        expect(menu.item(0).menu()).toEqual(menu);
        expect(menu.element().menu).toEqual(menu);
        for (item of menu._container.items) {
          expect(item._menu).toEqual(menu);
        };
      });


      it('should be visible', function () {
        var menu = OwnContainerMenu.create(list,ExampleItemList);
        expect(menu.removeItems()).toBe(undefined);
        menu.limit(3);

        expect(menu.show()).toBe(true);
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("Constituency");
        expect(liElements[1].innerHTML).toEqual("Lemma");
        expect(liElements[2].innerHTML).toEqual("Morphology");
        expect(liElements[3]).toBe(undefined);

        // Check boundaries
        expect(liElements[0].classList.contains("no-more")).toBe(true);
        expect(liElements[1].classList.contains("no-more")).toBe(false);
        expect(liElements[2].classList.contains("no-more")).toBe(false);

        var items = menu.container().items;
        expect(items[0].initContent().nodeValue).toEqual("CIText1 ");
        expect(items[1].initContent().nodeValue).toEqual("CIText2 ");
        expect(items[2].element().innerHTML).toEqual(""); //prefix!
        expect(items[3]).toBe(undefined);
      });

      it('should be filterable', function () {
        var menu = OwnContainerMenu.create(list,ExampleItemList);
        menu.limit(3);
        expect(menu.prefix("o").show()).toBe(true);
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(menu.element().getElementsByClassName("pref")[0].innerHTML).toEqual("o");
        expect(liElements[0].innerHTML).toEqual("C<mark>o</mark>nstituency");
        expect(liElements[1].innerHTML).toEqual("M<mark>o</mark>rph<mark>o</mark>l<mark>o</mark>gy");
        expect(liElements[2].innerHTML).toEqual("Part-<mark>o</mark>f-Speech");
        expect(liElements[3]).toBe(undefined);

        // Check boundaries
        expect(liElements[0].classList.contains("no-more")).toBe(true);
        expect(liElements[1].classList.contains("no-more")).toBe(false);
        expect(liElements[2].classList.contains("no-more")).toBe(true);

        menu.limit(2);
        
        expect(menu.prefix("o").show()).toBe(true);
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(menu.element().getElementsByClassName("pref")[0].innerHTML).toEqual("o");
        expect(liElements[0].innerHTML).toEqual("C<mark>o</mark>nstituency");
        expect(liElements[1].innerHTML).toEqual("M<mark>o</mark>rph<mark>o</mark>l<mark>o</mark>gy");
        
        expect(menu.element().getElementsByClassName("pref")[0].innerHTML).toEqual("o");
        expect(liElements[2]).toBe(undefined);

        // Check boundaries
        expect(liElements[0].classList.contains("no-more")).toBe(true);
        expect(liElements[1].classList.contains("no-more")).toBe(false);
        expect(liElements[2]).toBe(undefined);

        expect(menu.prefix("e").show()).toBe(true);
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(menu.element().getElementsByClassName("pref")[0].innerHTML).toEqual("e");
        expect(liElements[0].innerHTML).toEqual("Constitu<mark>e</mark>ncy");
        expect(liElements[2]).toBe(undefined);

        menu.limit(5);
        expect(menu.prefix("a").show()).toBe(true);
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(menu.element().getElementsByClassName("pref")[0].innerHTML).toEqual("a");
        expect(liElements[0].innerHTML).toEqual("Lemm<mark>a</mark>");
        expect(liElements[1].innerHTML).toEqual("P<mark>a</mark>rt-of-Speech");
        expect(liElements[2].innerHTML).toEqual("Synt<mark>a</mark>x");
        expect(liElements[3]).toBe(undefined);

      });
      
      it('should switch to the containers prefix whenever the prefix filters the regular list to be empty', function () {
        /**var list = [
	        ["Constituency"],
	        ["Lemma"],
	        ["Morphology"],
	        ["Part-of-Speech"],
	        ["Syntax"]
        ];
        */
        var menu = OwnContainerMenu.create(list,ExampleItemList);
        menu.container().add("1");
        menu.show(); // Simulates Buttonpress 1
        // See function _keypress in containermenu.js (line 147)
        expect(menu.liveItem()).toBeUndefined(); // no elements in list match "1"
        expect(menu.container().active()).toBeTruthy(); //thus switch to container
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements).toEqual([]);
        expect(menu.container().liveLength()).toEqual(3); //CI1 and 2, prefix
        expect(menu._prefix.active()).toBeTruthy(); //  HERE ONLY
        // We want whichever container item was active before
        // to stay active, default to prefix if none was.

        //simulate _keydown(...) see containermenu.js line 137
        menu.container().chop();
        menu.show();
        menu.prev();
        expect(menu._prefix.active()).toBeFalsy();
        expect(menu.container().item(1).active().toBeTruthy); // at location 1: CIItem 2
        expect(menu.liveLength()).toEqual(5);

        menu.container().add("1");
        menu.show(); // Simulates Buttonpress 1
        // See function _keypress in containermenu.js (line 147)
        expect(menu.liveItem()).toBeUndefined(); // no elements in list match "1"
        expect(menu.container().active()).toBeTruthy();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements).toEqual([]);
        expect(menu.container().liveLength()).toEqual(3); //CI1 and 2, prefix
        expect(menu.container().item(1).active().toBeTruthy); // at location 1: CIItem 2
        // We want whichever container item was active before
        // to stay active, default to prefix if none was.

      });

      it('should allow removing an item from the container list', function () {/**var list = [
        ["Constituency"],
        ["Lemma"],
        ["Morphology"],
        ["Part-of-Speech"],
        ["Syntax"]
      ];
      */
        var menu = OwnContainerMenu.create(list,ExampleItemList);
        menu._firstActive = true;
        menu.limit(3);
        expect(menu.show()).toBe(true);
        menu.next();
        menu.next();
        menu.next();
        menu.next();
        expect(menu.shownItem(2).active()).toBe(true);
        expect(menu.container().item(0).active()).toBe(false);
        expect(menu.container().item(1).active()).toBe(false);
        expect(menu.container().item(2).active()).toBe(false); //prefix
        expect(menu.container().item(2)).toEqual(menu._prefix);
        expect(menu.container().length()).toBe(3);
        menu.container().removeItemByIndex(0);
        expect(menu.shownItem(2).active()).toBe(true);
        expect(menu.container().item(0).active()).toBe(false);
        expect(menu.container().item(1).active()).toBe(false); //prefix
        expect(menu.container().item(1)).toEqual(menu._prefix);
        expect(menu.container().length()).toBe(2);
        menu.next();
        expect(menu.shownItem(2).active()).toBe(false);
        expect(menu.container().item(0).active()).toBe(true);
        expect(menu.container().item(1).active()).toBe(false); //prefix
        expect(menu.container().item(1)).toEqual(menu._prefix);
        expect(menu.container().length()).toBe(2);
        menu.container().removeItemByIndex(0);
        expect(menu.shownItem(2).active()).toBe(false);
        expect(menu.shownItem(0).active()).toBe(true);
        expect(menu.container().item(0).active()).toBe(false); //prefix //would be selected, if it were not ""
        expect(menu.container().item(0)).toEqual(menu._prefix);
        expect(menu.container().length()).toBe(1);

        

      });
      it('should be nextable', function () {
        var menu = OwnContainerMenu.create(list);
        menu._firstActive = true;

        // Show only 3 items
        menu.limit(3);
        expect(menu.show()).toBe(true);
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("Constituency");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(liElements[1].innerHTML).toEqual("Lemma");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(liElements[2].innerHTML).toEqual("Morphology");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(liElements[3]).toBe(undefined);

        // Activate next (1)
        menu.next();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("Constituency");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements[1].innerHTML).toEqual("Lemma");
        expect(menu.shownItem(1).active()).toBe(true);
        expect(liElements[2].innerHTML).toEqual("Morphology");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(liElements[3]).toBe(undefined);

        // Activate next (2)
        menu.next();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("Constituency");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements[1].innerHTML).toEqual("Lemma");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(liElements[2].innerHTML).toEqual("Morphology");
        expect(menu.shownItem(2).active()).toBe(true);
        expect(liElements[3]).toBe(undefined);

        // Activate next (3)
        // scroll!
        menu.next();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("Lemma");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements[1].innerHTML).toEqual("Morphology");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(liElements[2].innerHTML).toEqual("Part-of-Speech");
        expect(menu.shownItem(2).active()).toBe(true);
        expect(liElements[3]).toBe(undefined);

        // Activate next (4)
        menu.next();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("Morphology");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements[1].innerHTML).toEqual("Part-of-Speech");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(liElements[2].innerHTML).toEqual("Syntax");
        expect(menu.shownItem(2).active()).toBe(true);
        expect(liElements[3]).toBe(undefined);

        // Activate next (5) - ROLL
        menu.next();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("Constituency");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(liElements[1].innerHTML).toEqual("Lemma");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(liElements[2].innerHTML).toEqual("Morphology");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(liElements[3]).toBe(undefined);

        // Active next (6)
        menu.next();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("Constituency");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements[1].innerHTML).toEqual("Lemma");
        expect(menu.shownItem(1).active()).toBe(true);
        expect(liElements[2].innerHTML).toEqual("Morphology");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(liElements[3]).toBe(undefined);
      });

      it('should be nextable when there are two containeritems', function () {
        var menu = OwnContainerMenu.create(list,ExampleItemList);
        menu._firstActive = true;

        // Show only 3 items
        menu.limit(3);
        expect(menu.show()).toBe(true);
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("Constituency");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(liElements[1].innerHTML).toEqual("Lemma");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(liElements[2].innerHTML).toEqual("Morphology");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(liElements[3]).toBe(undefined);
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix

        // Activate next (1)
        menu.next();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("Constituency");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements[1].innerHTML).toEqual("Lemma");
        expect(menu.shownItem(1).active()).toBe(true);
        expect(liElements[2].innerHTML).toEqual("Morphology");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(liElements[3]).toBe(undefined);
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix

        // Activate next (2)
        menu.next();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("Constituency");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements[1].innerHTML).toEqual("Lemma");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(liElements[2].innerHTML).toEqual("Morphology");
        expect(menu.shownItem(2).active()).toBe(true);
        expect(liElements[3]).toBe(undefined);
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix

        // Activate next (3)
        // scroll!
        menu.next();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("Lemma");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements[1].innerHTML).toEqual("Morphology");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(liElements[2].innerHTML).toEqual("Part-of-Speech");
        expect(menu.shownItem(2).active()).toBe(true);
        expect(liElements[3]).toBe(undefined);
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix

        // Activate next (4)
        menu.next();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("Morphology");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements[1].innerHTML).toEqual("Part-of-Speech");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(liElements[2].innerHTML).toEqual("Syntax");
        expect(menu.shownItem(2).active()).toBe(true);
        expect(liElements[3]).toBe(undefined);
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix

        // Activate next (4.1) - Jump to container part
        menu.next();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("Morphology");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements[1].innerHTML).toEqual("Part-of-Speech");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(liElements[2].innerHTML).toEqual("Syntax");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(liElements[3]).toBe(undefined);
        expect(menu.container().items[0].active()).toBe(true);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix

        // Activate next (4.2)
        menu.next();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("Morphology");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements[1].innerHTML).toEqual("Part-of-Speech");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(liElements[2].innerHTML).toEqual("Syntax");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(liElements[3]).toBe(undefined);
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(true);
        expect(menu.container().items[2].active()).toBe(false); //prefix

        /** Prefix is not set
        // Activate next (4.3)
        menu.next();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("Morphology");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements[1].innerHTML).toEqual("Part-of-Speech");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(liElements[2].innerHTML).toEqual("Syntax");
        expect(menu.shownItem(2).active()).toBe(true);
        expect(liElements[3]).toBe(undefined);
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(true); //prefix
        */

        // Activate next (5) - ROLL
        menu.next();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("Constituency");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(liElements[1].innerHTML).toEqual("Lemma");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(liElements[2].innerHTML).toEqual("Morphology");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(liElements[3]).toBe(undefined);
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix

        // Active next (6)
        menu.next();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("Constituency");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements[1].innerHTML).toEqual("Lemma");
        expect(menu.shownItem(1).active()).toBe(true);
        expect(liElements[2].innerHTML).toEqual("Morphology");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(liElements[3]).toBe(undefined);
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix
      });

      it('should be nextable without active field', function () {
        var menu = OwnContainerMenu.create(list,ExampleItemList);
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

        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("Constituency");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(liElements[1].innerHTML).toEqual("Lemma");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(liElements[2].innerHTML).toEqual("Morphology");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(liElements[3]).toBe(undefined);

        // Activate prev (1) - roll to bottom
        menu.prev();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("Morphology");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements[1].innerHTML).toEqual("Part-of-Speech");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(liElements[2].innerHTML).toEqual("Syntax");
        expect(menu.shownItem(2).active()).toBe(true);
        expect(liElements[3]).toBe(undefined);

        // Activate prev (2)
        menu.prev();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("Morphology");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements[1].innerHTML).toEqual("Part-of-Speech");
        expect(menu.shownItem(1).active()).toBe(true);
        expect(liElements[2].innerHTML).toEqual("Syntax");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(liElements[3]).toBe(undefined);

        // Activate prev (3)
        menu.prev();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("Morphology");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(liElements[1].innerHTML).toEqual("Part-of-Speech");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(liElements[2].innerHTML).toEqual("Syntax");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(liElements[3]).toBe(undefined);

        // Activate prev (4)
        menu.prev();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("Lemma");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(liElements[1].innerHTML).toEqual("Morphology");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(liElements[2].innerHTML).toEqual("Part-of-Speech");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(liElements[3]).toBe(undefined);

        // Activate prev (5)
        menu.prev();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("Constituency");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(liElements[1].innerHTML).toEqual("Lemma");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(liElements[2].innerHTML).toEqual("Morphology");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(liElements[3]).toBe(undefined);

        // Activate next (1)
        menu.next();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("Constituency");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements[1].innerHTML).toEqual("Lemma");
        expect(menu.shownItem(1).active()).toBe(true);
        expect(liElements[2].innerHTML).toEqual("Morphology");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(liElements[3]).toBe(undefined);

        // Activate prev (6)
        menu.prev();

        // Activate prev (7)
        menu.prev();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("Morphology");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements[1].innerHTML).toEqual("Part-of-Speech");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(liElements[2].innerHTML).toEqual("Syntax");
        expect(menu.shownItem(2).active()).toBe(true);
        expect(liElements[3]).toBe(undefined);
      });

      it('should be prevable with containerItems', function () {
        var menu = OwnContainerMenu.create(list,ExampleItemList);
        menu._firstActive = true;
        menu.limit(3);
        expect(menu.show()).toBe(true);
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("Constituency");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(liElements[1].innerHTML).toEqual("Lemma");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(liElements[2].innerHTML).toEqual("Morphology");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(liElements[3]).toBe(undefined);
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix

        // Activate prev (1) - roll to bottom - base items stay, now container
        menu.prev();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("Constituency");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements[1].innerHTML).toEqual("Lemma");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(liElements[2].innerHTML).toEqual("Morphology");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(liElements[3]).toBe(undefined);
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(true);
        expect(menu.container().items[2].active()).toBe(false); //prefix

        // Activate prev(2) - next container item
        menu.prev();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("Constituency");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements[1].innerHTML).toEqual("Lemma");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(liElements[2].innerHTML).toEqual("Morphology");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(liElements[3]).toBe(undefined);
        expect(menu.container().items[0].active()).toBe(true);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix

        // Activate prev (3) - roll to bottom of normal list
        menu.prev();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("Morphology");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements[1].innerHTML).toEqual("Part-of-Speech");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(liElements[2].innerHTML).toEqual("Syntax");
        expect(menu.shownItem(2).active()).toBe(true);
        expect(liElements[3]).toBe(undefined);
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix

        // Activate prev (4)
        menu.prev();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("Morphology");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements[1].innerHTML).toEqual("Part-of-Speech");
        expect(menu.shownItem(1).active()).toBe(true);
        expect(liElements[2].innerHTML).toEqual("Syntax");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(liElements[3]).toBe(undefined);
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix

        // Activate prev (5)
        menu.prev();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("Morphology");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(liElements[1].innerHTML).toEqual("Part-of-Speech");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(liElements[2].innerHTML).toEqual("Syntax");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(liElements[3]).toBe(undefined);
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix

        // Activate prev (6)
        menu.prev();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("Lemma");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(liElements[1].innerHTML).toEqual("Morphology");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(liElements[2].innerHTML).toEqual("Part-of-Speech");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(liElements[3]).toBe(undefined);
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix

        // Activate prev (7)
        menu.prev();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("Constituency");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(liElements[1].innerHTML).toEqual("Lemma");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(liElements[2].innerHTML).toEqual("Morphology");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(liElements[3]).toBe(undefined);
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix

        // Activate next (8)
        menu.next();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("Constituency");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements[1].innerHTML).toEqual("Lemma");
        expect(menu.shownItem(1).active()).toBe(true);
        expect(liElements[2].innerHTML).toEqual("Morphology");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(liElements[3]).toBe(undefined);
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix

        // Activate prev (9)
        menu.prev();
        menu.prev();
        menu.prev();

        // Activate prev (10)
        menu.prev();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("Morphology");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements[1].innerHTML).toEqual("Part-of-Speech");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(liElements[2].innerHTML).toEqual("Syntax");
        expect(menu.shownItem(2).active()).toBe(true);
        expect(liElements[3]).toBe(undefined);
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix
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

        expect(menu.prefix("o").show()).toBe(true);
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("C<mark>o</mark>nstituency");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(liElements[1].innerHTML).toEqual("M<mark>o</mark>rph<mark>o</mark>l<mark>o</mark>gy");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2)).toBe(undefined);

        // Next (1)
        menu.next();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("C<mark>o</mark>nstituency");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements[1].innerHTML).toEqual("M<mark>o</mark>rph<mark>o</mark>l<mark>o</mark>gy");
        expect(menu.shownItem(1).active()).toBe(true);
        expect(menu.shownItem(2)).toBe(undefined);

        // Next (2)
        menu.next();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("M<mark>o</mark>rph<mark>o</mark>l<mark>o</mark>gy");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements[1].innerHTML).toEqual("Part-<mark>o</mark>f-Speech");
        expect(menu.shownItem(1).active()).toBe(true);
        expect(menu.shownItem(2)).toBe(undefined);

        // Next (3) - to prefix
        menu.next();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("M<mark>o</mark>rph<mark>o</mark>l<mark>o</mark>gy");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements[1].innerHTML).toEqual("Part-<mark>o</mark>f-Speech");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2)).toBe(undefined);

        menu.next();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("C<mark>o</mark>nstituency");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(liElements[1].innerHTML).toEqual("M<mark>o</mark>rph<mark>o</mark>l<mark>o</mark>gy");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2)).toBe(undefined);
      });
      
      it('should be navigatable and filterable (prefix = "o") using containerItems', function () {
        var menu = OwnContainerMenu.create(list,ExampleItemList);
        menu._firstActive = true;
        menu.limit(2);

        expect(menu.prefix("o").show()).toBe(true);
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("C<mark>o</mark>nstituency");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(liElements[1].innerHTML).toEqual("M<mark>o</mark>rph<mark>o</mark>l<mark>o</mark>gy");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2)).toBe(undefined);
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix

        // Next (1)
        menu.next();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("C<mark>o</mark>nstituency");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements[1].innerHTML).toEqual("M<mark>o</mark>rph<mark>o</mark>l<mark>o</mark>gy");
        expect(menu.shownItem(1).active()).toBe(true);
        expect(menu.shownItem(2)).toBe(undefined);
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix

        // Next (2)
        menu.next();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("M<mark>o</mark>rph<mark>o</mark>l<mark>o</mark>gy");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements[1].innerHTML).toEqual("Part-<mark>o</mark>f-Speech");
        expect(menu.shownItem(1).active()).toBe(true);
        expect(menu.shownItem(2)).toBe(undefined);
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix

        // Next (3) - to first container Item
        menu.next();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("M<mark>o</mark>rph<mark>o</mark>l<mark>o</mark>gy");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements[1].innerHTML).toEqual("Part-<mark>o</mark>f-Speech");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2)).toBe(undefined);
        expect(menu.container().items[0].active()).toBe(true);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix

          // Next (4) - to second container Item
        menu.next();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("M<mark>o</mark>rph<mark>o</mark>l<mark>o</mark>gy");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements[1].innerHTML).toEqual("Part-<mark>o</mark>f-Speech");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2)).toBe(undefined);
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(true);
        expect(menu.container().items[2].active()).toBe(false); //prefix

        // Next (5) - to prefix
        menu.next();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("M<mark>o</mark>rph<mark>o</mark>l<mark>o</mark>gy");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements[1].innerHTML).toEqual("Part-<mark>o</mark>f-Speech");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2)).toBe(undefined);
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(true); //prefix

        menu.next();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("C<mark>o</mark>nstituency");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(liElements[1].innerHTML).toEqual("M<mark>o</mark>rph<mark>o</mark>l<mark>o</mark>gy");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2)).toBe(undefined);
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix
      });
      
      it('should be navigatable and filterable (prefix = "ex", "e") with containerItems', function () {
        var menu = OwnContainerMenu.create(listWithEX,ExampleItemList);
        menu._firstActive = true;
        menu.limit(3);

        expect(menu.prefix("ex").show()).toBe(true);
        expect(menu.prefix()).toEqual('ex');
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("<mark>ex</mark>ample 1 Constituency");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(liElements[1].innerHTML).toEqual("<mark>ex</mark>ample 2 Morphology");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(3)).toBe(undefined);
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix

        // Next (1)
        menu.next();
        expect(menu.prefix()).toEqual('ex');
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("<mark>ex</mark>ample 1 Constituency");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements[1].innerHTML).toEqual("<mark>ex</mark>ample 2 Morphology");
        expect(menu.shownItem(1).active()).toBe(true);
        expect(menu.shownItem(3)).toBe(undefined);
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix

        // Next (2)
        menu.next();
        expect(menu.prefix()).toEqual('ex');
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("<mark>ex</mark>ample 1 Constituency");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements[1].innerHTML).toEqual("<mark>ex</mark>ample 2 Morphology");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(3)).toBe(undefined);
        expect(menu.container().items[0].active()).toBe(true);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix

        //Roll to Prefix
        menu.next();
        menu.next();
        expect(menu.prefix()).toEqual('ex');
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("<mark>ex</mark>ample 1 Constituency");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements[1].innerHTML).toEqual("<mark>ex</mark>ample 2 Morphology");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(3)).toBe(undefined);
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(true); //prefix

        // Reset limit
        menu.limit(5);

        // Change show
        expect(menu.prefix("e").show()).toBe(true);
        expect(menu._prefix.active()).toBe(false);
        expect(menu.prefix()).toEqual('e');
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("<mark>e</mark>xampl<mark>e</mark> 1 Constitu<mark>e</mark>ncy");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(liElements[1].innerHTML).toEqual("<mark>e</mark>xampl<mark>e</mark> 2 Morphology");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(3)).toBe(undefined);
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix

        // Next (1)
        menu.next();
        expect(menu._prefix.active()).toBe(false);
        expect(menu.prefix()).toEqual('e');
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("<mark>e</mark>xampl<mark>e</mark> 1 Constitu<mark>e</mark>ncy");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements[1].innerHTML).toEqual("<mark>e</mark>xampl<mark>e</mark> 2 Morphology");
        expect(menu.shownItem(1).active()).toBe(true);
        expect(menu.shownItem(3)).toBe(undefined);
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix

        // Next (2)
        menu.next();
        expect(menu._prefix.active()).toBe(false);
        expect(menu.prefix()).toEqual('e');
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("<mark>e</mark>xampl<mark>e</mark> 1 Constitu<mark>e</mark>ncy");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements[1].innerHTML).toEqual("<mark>e</mark>xampl<mark>e</mark> 2 Morphology");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(3)).toBe(undefined);
        expect(menu.container().items[0].active()).toBe(true);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix


        // Next (3)
        menu.next();
        menu.next();
        expect(menu._prefix.active()).toBe(true);
        expect(menu.prefix()).toEqual('e');
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("<mark>e</mark>xampl<mark>e</mark> 1 Constitu<mark>e</mark>ncy");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements[1].innerHTML).toEqual("<mark>e</mark>xampl<mark>e</mark> 2 Morphology");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(3)).toBe(undefined);
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(true); //prefix
      });


      it('should be filterable (multiple prefix = "pro sin")', function () {
        var menu = OwnContainerMenu.create(listMultiPrefix);
        menu._firstActive = true;

        menu.limit(2);
        expect(menu.prefix("pro sin").show()).toBe(true);
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual(
          "Personal <mark>Pro</mark>noun, <mark>Sin</mark>gular"
        );

        expect(menu.shownItem(0).active()).toBe(true);
        expect(liElements[1].innerHTML).toEqual("Personal <mark>Pro</mark>noun, <mark>Sin</mark>gular, Accusative");
        expect(menu.shownItem(1).active()).toBe(false);

        expect(menu.shownItem(2)).toBe(undefined);
      });

      it('should be filterable (trimming = " p")', function () {
        var menu = OwnContainerMenu.create(listMultiPrefix);
        // menu._firstActive = true;

        menu.limit(2);
        expect(menu.show()).toBe(true);
        menu._prefix.add(" ");
        expect(menu.show()).toBe(true);
        menu._prefix.add("p")
        expect(menu.show()).toBe(true);
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("<mark>P</mark>ersonal <mark>P</mark>ronoun");
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
        var menu = OwnContainerMenu.create(demolist);
        menu._firstActive = true;

        menu.limit(3);

        expect(menu.show()).toBe(true);
        expect(menu.prefix()).toEqual("");

        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("Titel");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(liElements[1].innerHTML).toEqual("Untertitel");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(liElements[2].innerHTML).toEqual("Veröffentlichungsdatum");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(menu.shownItem(3)).toBe(undefined);

        menu._prefix.add('a');
        expect(menu.show()).toBe(true);
        expect(menu.prefix()).toEqual("a");
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("<mark>A</mark>utor");

        menu._prefix.add('u');
        expect(menu.show()).toBe(true);
        expect(menu.prefix()).toEqual("au");
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("<mark>Au</mark>tor");

        menu._prefix.chop();
        expect(menu.show()).toBe(true);
        expect(menu.prefix()).toEqual("a");
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("<mark>A</mark>utor");

        menu._prefix.chop();
        expect(menu.show()).toBe(true);
        expect(menu.prefix()).toEqual("");
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("Titel");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(liElements[1].innerHTML).toEqual("Untertitel");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(liElements[2].innerHTML).toEqual("Veröffentlichungsdatum");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(menu.shownItem(3)).toBe(undefined);

        // Forward
        menu._prefix.chop();
        expect(menu.show()).toBe(true);
        expect(menu.prefix()).toEqual("");
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("Titel");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(liElements[1].innerHTML).toEqual("Untertitel");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(liElements[2].innerHTML).toEqual("Veröffentlichungsdatum");
        expect(menu.shownItem(2).active()).toBe(false);

        // Forward
        menu.next();
        expect(menu.prefix()).toEqual("");
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("Titel");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements[1].innerHTML).toEqual("Untertitel");
        expect(menu.shownItem(1).active()).toBe(true);
        expect(liElements[2].innerHTML).toEqual("Veröffentlichungsdatum");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(menu.shownItem(3)).toBe(undefined);

        // Forward
        menu.next();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(menu.prefix()).toEqual("");
        expect(liElements[0].innerHTML).toEqual("Titel");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements[1].innerHTML).toEqual("Untertitel");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(liElements[2].innerHTML).toEqual("Veröffentlichungsdatum");
        expect(menu.shownItem(2).active()).toBe(true);
        expect(menu.shownItem(3)).toBe(undefined);

        // Forward
        menu.next();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(menu.prefix()).toEqual("");
        expect(liElements[0].innerHTML).toEqual("Untertitel");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements[1].innerHTML).toEqual("Veröffentlichungsdatum");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(liElements[2].innerHTML).toEqual("Länge");
        expect(menu.shownItem(2).active()).toBe(true);
        expect(menu.shownItem(3)).toBe(undefined);

        // Forward
        menu.next();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(menu.prefix()).toEqual("");
        expect(liElements[0].innerHTML).toEqual("Veröffentlichungsdatum");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements[1].innerHTML).toEqual("Länge");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(liElements[2].innerHTML).toEqual("Autor");
        expect(menu.shownItem(2).active()).toBe(true);
        expect(menu.shownItem(3)).toBe(undefined);

        // Forward
        menu.next();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(menu.prefix()).toEqual("");
        expect(liElements[0].innerHTML).toEqual("Titel");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(liElements[1].innerHTML).toEqual("Untertitel");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(liElements[2].innerHTML).toEqual("Veröffentlichungsdatum");
        expect(menu.shownItem(2).active()).toBe(false);
      });

      it('should be navigatable with prefix and containerItems', function () {
        var menu = OwnContainerMenu.create(demolist,ExampleItemList);
        menu._firstActive = true;

        menu.limit(3);

        expect(menu.show()).toBe(true);
        expect(menu.prefix()).toEqual("");

        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("Titel");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(liElements[1].innerHTML).toEqual("Untertitel");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(liElements[2].innerHTML).toEqual("Veröffentlichungsdatum");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(menu.shownItem(3)).toBe(undefined);
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix

        menu._prefix.add('a');
        expect(menu.show()).toBe(true);
        expect(menu.prefix()).toEqual("a");
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("<mark>A</mark>utor");
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix

        menu._prefix.add('u');
        expect(menu.show()).toBe(true);
        expect(menu.prefix()).toEqual("au");
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("<mark>Au</mark>tor");
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix

        menu._prefix.chop();
        expect(menu.show()).toBe(true);
        expect(menu.prefix()).toEqual("a");
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("<mark>A</mark>utor");
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix

        menu._prefix.chop();
        expect(menu.show()).toBe(true);
        expect(menu.prefix()).toEqual("");
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("Titel");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(liElements[1].innerHTML).toEqual("Untertitel");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(liElements[2].innerHTML).toEqual("Veröffentlichungsdatum");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(menu.shownItem(3)).toBe(undefined);
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix

        // Forward
        menu._prefix.chop();
        expect(menu.show()).toBe(true);
        expect(menu.prefix()).toEqual("");
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("Titel");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(liElements[1].innerHTML).toEqual("Untertitel");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(liElements[2].innerHTML).toEqual("Veröffentlichungsdatum");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix

        // Forward
        menu.next();
        expect(menu.prefix()).toEqual("");
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("Titel");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements[1].innerHTML).toEqual("Untertitel");
        expect(menu.shownItem(1).active()).toBe(true);
        expect(liElements[2].innerHTML).toEqual("Veröffentlichungsdatum");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(menu.shownItem(3)).toBe(undefined);
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix

        // Forward
        menu.next();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(menu.prefix()).toEqual("");
        expect(liElements[0].innerHTML).toEqual("Titel");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements[1].innerHTML).toEqual("Untertitel");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(liElements[2].innerHTML).toEqual("Veröffentlichungsdatum");
        expect(menu.shownItem(2).active()).toBe(true);
        expect(menu.shownItem(3)).toBe(undefined);
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix

        // Forward
        menu.next();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(menu.prefix()).toEqual("");
        expect(liElements[0].innerHTML).toEqual("Untertitel");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements[1].innerHTML).toEqual("Veröffentlichungsdatum");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(liElements[2].innerHTML).toEqual("Länge");
        expect(menu.shownItem(2).active()).toBe(true);
        expect(menu.shownItem(3)).toBe(undefined);
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix

        // Forward
        menu.next();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(menu.prefix()).toEqual("");
        expect(liElements[0].innerHTML).toEqual("Veröffentlichungsdatum");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements[1].innerHTML).toEqual("Länge");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(liElements[2].innerHTML).toEqual("Autor");
        expect(menu.shownItem(2).active()).toBe(true);
        expect(menu.shownItem(3)).toBe(undefined);
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix

        // Forward
        menu.next();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(menu.prefix()).toEqual("");
        expect(liElements[0].innerHTML).toEqual("Veröffentlichungsdatum");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements[1].innerHTML).toEqual("Länge");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(liElements[2].innerHTML).toEqual("Autor");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(menu.shownItem(3)).toBe(undefined);
        expect(menu.container().items[0].active()).toBe(true);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix

        // Forward
        menu.next();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(menu.prefix()).toEqual("");
        expect(liElements[0].innerHTML).toEqual("Veröffentlichungsdatum");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements[1].innerHTML).toEqual("Länge");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(liElements[2].innerHTML).toEqual("Autor");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(menu.shownItem(3)).toBe(undefined);
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(true);
        expect(menu.container().items[2].active()).toBe(false); //prefix
        
        // Forward
        menu.next();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(menu.prefix()).toEqual("");
        expect(liElements[0].innerHTML).toEqual("Titel");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(liElements[1].innerHTML).toEqual("Untertitel");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(liElements[2].innerHTML).toEqual("Veröffentlichungsdatum");
        expect(menu.shownItem(2).active()).toBe(false);
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix
      });

      it('should be navigatable with a prefix (1) and containerItems', function () {
        var menu = OwnContainerMenu.create(demolist, ExampleItemList);
        menu._firstActive = true;

        menu.limit(3);

        expect(menu.show()).toBe(true);
        expect(menu.prefix()).toEqual("");

        // Add prefix in uppercase - but check in lowercase
        menu.prefix('El');
        expect(menu.show()).toBe(true);

        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(menu.prefix()).toEqual("El");
        expect(menu._prefix.active()).toEqual(false);
        expect(liElements[0].innerHTML).toEqual("Tit<mark>el</mark>");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(liElements[1].innerHTML).toEqual("Untertit<mark>el</mark>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2)).toBe(undefined);
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix

        // Forward
        menu.next();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(menu.prefix()).toEqual("El");
        expect(menu._prefix.active()).toEqual(false);
        expect(liElements[0].innerHTML).toEqual("Tit<mark>el</mark>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements[1].innerHTML).toEqual("Untertit<mark>el</mark>");
        expect(menu.shownItem(1).active()).toBe(true);
        expect(menu.shownItem(2)).toBe(undefined);
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix

        // Forward
        menu.next();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(menu.prefix()).toEqual("El");
        expect(liElements[0].innerHTML).toEqual("Tit<mark>el</mark>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements[1].innerHTML).toEqual("Untertit<mark>el</mark>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2)).toBe(undefined);
        expect(menu.container().items[0].active()).toBe(true);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix

        menu.next();
        menu.next();

        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(menu.prefix()).toEqual("El");
        expect(liElements[0].innerHTML).toEqual("Tit<mark>el</mark>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements[1].innerHTML).toEqual("Untertit<mark>el</mark>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2)).toBe(undefined);
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(true); //prefix

        // Backward
        menu.prev();
        menu.prev();
        menu.prev();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(menu.prefix()).toEqual("El");
        expect(menu._prefix.active()).toEqual(false);
        expect(liElements[0].innerHTML).toEqual("Tit<mark>el</mark>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements[1].innerHTML).toEqual("Untertit<mark>el</mark>");
        expect(menu.shownItem(1).active()).toBe(true);
        expect(menu.shownItem(2)).toBe(undefined);
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix
      });


      it('should be navigatable with a prefix (2) and containerItems', function () {
        var menu = OwnContainerMenu.create(demolist,ExampleItemList);
        menu._firstActive = true;

        menu.limit(3);
        expect(menu.show()).toBe(true);
        expect(menu.prefix()).toEqual("");
        menu.prefix('el');
        expect(menu.show()).toBe(true);

        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(menu.prefix()).toEqual("el");
        expect(menu._prefix.active()).toEqual(false);
        expect(liElements[0].innerHTML).toEqual("Tit<mark>el</mark>");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(liElements[1].innerHTML).toEqual("Untertit<mark>el</mark>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2)).toBe(undefined);
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix

        // Backward
        menu.prev();
        expect(menu._prefix.active()).toEqual(true);

        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("Tit<mark>el</mark>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements[1].innerHTML).toEqual("Untertit<mark>el</mark>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2)).toBe(undefined);
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(true); //prefix

        // Backward
        menu.prev();
        menu.prev();
        menu.prev();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(menu._prefix.active()).toEqual(false);
        expect(liElements[0].innerHTML).toEqual("Tit<mark>el</mark>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements[1].innerHTML).toEqual("Untertit<mark>el</mark>");
        expect(menu.shownItem(1).active()).toBe(true);
        expect(menu.shownItem(2)).toBe(undefined);
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix
      });

      it('should be navigatable with a prefix (3) and containerItems', function () {
        var menu = OwnContainerMenu.create(demolist,ExampleItemList);
        menu._firstActive = true;
        menu.limit(3);
        expect(menu.show()).toBe(true);
        expect(menu.prefix()).toEqual("");
        menu.prefix('el');
        expect(menu.show()).toBe(true);

        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(menu.prefix()).toEqual("el");
        expect(menu._prefix.active()).toEqual(false);
        expect(liElements[0].innerHTML).toEqual("Tit<mark>el</mark>");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(liElements[1].innerHTML).toEqual("Untertit<mark>el</mark>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2)).toBe(undefined);
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix

        // Backward
        menu.prev();
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(menu._prefix.active()).toEqual(true);
        expect(liElements[0].innerHTML).toEqual("Tit<mark>el</mark>");
        expect(menu.shownItem(0).active()).toBe(false);
        expect(liElements[1].innerHTML).toEqual("Untertit<mark>el</mark>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2)).toBe(undefined);
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(true); //prefix


        // Forward
        menu.next();
        expect(menu.prefix()).toEqual("el");
        expect(menu._prefix.active()).toEqual(false);
        var liElements = directElementChildrenByTagName(menu.element(),"li");
        expect(liElements[0].innerHTML).toEqual("Tit<mark>el</mark>");
        expect(menu.shownItem(0).active()).toBe(true);
        expect(liElements[1].innerHTML).toEqual("Untertit<mark>el</mark>");
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2)).toBe(undefined);
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix

      });

      it('should show screens by offset', function () {
        var menu = OwnContainerMenu.create(demolist,ExampleItemList);
        menu.limit(3);
        expect(menu.show()).toBe(true);

        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2).active()).toBe(false);
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix

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
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix
      });

      it('should show screens by offset when prefixed', function () {
        var menu = OwnContainerMenu.create(demolist,ExampleItemList);
        menu.limit(3);
        expect(menu.prefix("e").show()).toBe(true);
        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2).active()).toBe(false);
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix

        expect(menu.shownItem(0).element().innerHTML).toEqual('Tit<mark>e</mark>l');
        menu.screen(1);
        expect(menu.shownItem(0).element().innerHTML).toEqual('Unt<mark>e</mark>rtit<mark>e</mark>l');
      });


      it('should be page downable', function () {
        var menu = OwnContainerMenu.create(demolonglist,ExampleItemList);
        menu.limit(3);

        expect(menu.show(0)).toBe(true);
        
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix

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
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix
      });

      it('should be page downable with prefix', function () {
        var menu = OwnContainerMenu.create(demolonglist,ExampleItemList);
        menu.limit(3);

        expect(menu.prefix('e').show(0)).toBe(true);

        expect(menu.shownItem(0).active()).toBe(true);
        expect(menu.shownItem(0).lcField()).toEqual(' titel');
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(1).lcField()).toEqual(' untertitel');
        expect(menu.shownItem(2).active()).toBe(false);
        expect(menu.shownItem(2).lcField()).toEqual(' veröffentlichungsdatum');
        expect(menu.shownItem(3)).toBe(undefined);
        
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix

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
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix
      });


      it('should be page upable', function () {
        var menu = OwnContainerMenu.create(demolonglist,ExampleItemList);
        menu.limit(3);

        // Choose the final value
        expect(menu.show(1000)).toBe(true);

        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2).active()).toBe(true);
        expect(menu.shownItem(2).lcField()).toEqual(' textid');
        expect(menu.shownItem(3)).toBe(undefined);
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix

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
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix
      });

      it('should be page upable with prefix', function () {
        var menu = OwnContainerMenu.create(demolonglist,ExampleItemList);
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
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix

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
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix
      });

      it('should be view upable and downable (1)', function () {
        var menu = OwnContainerMenu.create(demolonglist,ExampleItemList);
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
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix

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
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix
      });

      it('should be view upable and downable (2)', function () {

        // List is longer than limit
        var menu = OwnContainerMenu.create(demolist,ExampleItemList);
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
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix

        // Doesn't change anything
        menu.viewUp();

        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(0).lcField()).toEqual(' titel');
        expect(menu.shownItem(1).active()).toBe(true);

        menu.viewDown();

        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(0).lcField()).toEqual(' titel');
        expect(menu.shownItem(1).active()).toBe(true);
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix
      });      

      
      it('should scroll to a chosen value (1)', function () {
        var menu = OwnContainerMenu.create(demolist,ExampleItemList);
        menu.limit(3);

        // Choose value 1
        expect(menu.show(1)).toBe(true);

        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(0).lcField()).toEqual(' titel');
        expect(menu.shownItem(1).active()).toBe(true);
        expect(menu.shownItem(2).active()).toBe(false);
        expect(menu.shownItem(3)).toBe(undefined);
        expect(menu.container().items[0].active()).toBe(false);
        expect(menu.container().items[1].active()).toBe(false);
        expect(menu.container().items[2].active()).toBe(false); //prefix

        // Choose value 2
        expect(menu.show(2)).toBe(true);

        expect(menu.shownItem(0).active()).toBe(false);
        expect(menu.shownItem(0).lcField()).toEqual(' titel');
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2).active()).toBe(true);
        expect(menu.shownItem(3)).toBe(undefined);
      });

      it('should scroll to a chosen value (2)', function () {
        var menu = OwnContainerMenu.create(demolonglist,ExampleItemList);

        // Choose value 3
        expect(menu.limit(3).show(3)).toBe(true);
        expect(menu.shownItem(0).lcField()).toEqual(' länge');
        expect(menu.shownItem(0).active()).toBe(true);
        expect(menu.shownItem(1).active()).toBe(false);
        expect(menu.shownItem(2).active()).toBe(false);
        expect(menu.shownItem(3)).toBe(undefined);
      });

      xit('should scroll to a chosen value after prefixing, if the chosen value is live');
      
      it('should be extendable', function () {
          var menu = OwnContainerMenu.create([],ExampleItemList);
          let entryData = 'empty';
          menu._itemClass = menuItemClass;
          menu.readItems([
          ['a', '', function () { entryData = 'a' }],
          ['bb', '', function () { entryData = 'bb' }],
          ['ccc', '', function () { entryData = 'ccc' }],
        ]);
        expect(menu.limit(3).show(3)).toBe(true);
        expect(menu.shownItem(0).lcField()).toEqual(' a');
        expect(menu.shownItem(1).lcField()).toEqual(' bb');
        expect(menu.shownItem(2).lcField()).toEqual(' ccc');
        expect(entryData).toEqual('empty');
        menu.shownItem(1).element().click();
        expect(entryData).toEqual('bb');
        expect(menu.lengthField().element().innerText).toEqual("a--bb--ccc--")
        expect(menu.slider().length()).toEqual(3);
        let obj = menu.itemClass().create(
          ['dddd','',function () { entryData = 'dddd'} ]
        );
        menu.append(obj);
        expect(menu.limit(2).show(1)).toBe(true);
        expect(menu.shownItem(0).lcField()).toEqual(' a');
        expect(menu.shownItem(1).lcField()).toEqual(' bb');
        menu.next();
        expect(menu.shownItem(1).lcField()).toEqual(' ccc');
        menu.next();
        expect(menu.shownItem(1).lcField()).toEqual(' dddd');
        menu.next();
        menu.next();
        menu.next();
        expect(menu.shownItem(0).lcField()).toEqual(' a');
        expect(menu.lengthField().element().innerText).toEqual("a--bb--ccc--dddd--")
        expect(menu.slider().length()).toEqual(4);
      });
      
      it("should make the prefix active if nothing else can be", function () {

        var list = [
          ["Constituency"],
          ["Lemma"],
          ["Morphology"],
          ["Part-of-Speech"],
          ["Syntax"]
        ];
        
        var ExampleItemList2 = new Array;
        ExampleItemList2.push({defaultTextValue : "CIText1 "});
        ExampleItemList2.push({});
        
        var menu = OwnContainerMenu.create(list,ExampleItemList2);
        menu.container().addItem({ value : "Dynamically added", defaultTextValue : "dynamic"})
        menu.limit(3).show(3);
        menu.focus(); //I don't know which of these above three lines are necessary for the error to occur, but at least one of them is.
        menu.container().add("a"); //These two simulate a keypress of a
        menu.show();
        menu.container().add("s");
        menu.show();
        //item() gets the active item.
        expect(menu.container().item()).toEqual(menu.container()._cItemPrefix);
      });

      it("removeItem and addItem should adjust storage of the currently active items position accordingly", function () {

        var list = [
          ["Constituency"],
          ["Lemma"],
          ["Morphology"],
          ["Part-of-Speech"],
          ["Syntax"]
        ];
        
        var ExampleItemList2 = new Array;
        ExampleItemList2.push({defaultTextValue : "CIText1 "});
        ExampleItemList2.push({});
        
        var menu = OwnContainerMenu.create(list,ExampleItemList2);
        menu.focus();
        menu.show();
        menu.container().add("s"); //make sure the prefix is selectable
        menu.show();
        //item() gets the active item.
        menu.next();//Const
        menu.next();//Lemma
        menu.next();//Morph
        menu.next();//PoS
        menu.next();//Syn
        menu.next();//CIText1
        menu.next();//""
        menu.next();//Prefix
        //menu.container()._cItemPrefix.isPrefix=true; //For debugging the Spec      
        expect(menu.container().item()).toEqual(menu.container()._cItemPrefix);
        menu.container().removeItemByIndex(0);
        expect(menu.container().item()).toEqual(menu.container()._cItemPrefix);
        expect(menu.container()._prefixPosition).toEqual(menu.container().items.indexOf(menu.container()._cItemPrefix));
        menu.container().addItem({defaultTextValue:"Number 3"});
        expect(menu.container().item()).toEqual(menu.container()._cItemPrefix);
        expect(menu.container()._prefixPosition).toEqual(menu.container().items.indexOf(menu.container()._cItemPrefix));
        menu.prev();//make the new item active
        expect(menu.container().item()).toEqual(menu.container().item(menu.container().length()-2));
        menu.container().removeItemByIndex(menu.container().length()-2); //remove the item we just added
        //As this should make the prefix active again.
        expect(menu.container().item()).toEqual(menu.container()._cItemPrefix);
        expect(menu.container()._prefixPosition).toEqual(menu.container().items.indexOf(menu.container()._cItemPrefix));
      });
    });

    describe('KorAP.ContainerMenu.Container', function () {
      it("should be initializable with no additional container items", function () {
        var list = [
          ["Constituency"],
          ["Lemma"],
          ["Morphology"],
          ["Part-of-Speech"],
          ["Syntax"]
        ];
        var menu = OwnContainerMenu.create(list);
        var container = menu.container();
        expect(container._containerItemClass).toEqual(OwnContainerItemClass);
        expect(container.element().nodeName).toEqual("UL");
        expect(container.element().classList.contains("menu")).toBeTruthy();
        expect(container.element().classList.contains("visible")).toBeFalsy();
        expect(menu._prefix).toEqual(container._cItemPrefix);
        expect(container.length()).toEqual(1);
        expect(container.length()).toEqual(container.items.length);
        expect(container.liveLength()).toEqual(0);
        expect(container.item(0)).toEqual(container._cItemPrefix);
        expect(container.active()).toBeFalsy();
        expect(directElementChildrenByTagName(menu.element(),"pref")).toEqual([]);
        expect(container.element().getElementsByClassName("pref").length).toEqual(1);
        


        menu.prefix("ad");
        expect(container.liveLength()).toEqual(1);
        menu.prev();
        expect(container.active()).toBeTruthy();
      });

      it("should support dynamic changing of text content", function () {
        var list = [
          ["Constituency"],
          ["Lemma"],
          ["Morphology"],
          ["Part-of-Speech"],
          ["Syntax"]
        ];
        
        var ExampleItemList2 = new Array;
        ExampleItemList2.push({defaultTextValue : "CIText1 "});
        ExampleItemList2.push({});
        
        var menu = OwnContainerMenu.create(list,ExampleItemList2);
        var container = menu.container();
        expect(container.item(0).initContent().nodeValue).toEqual("CIText1 ");
        expect(container.item(1).initContent().nodeValue).toEqual("");
        expect(container.item(2)).toBeDefined();
        expect(container.item(2).initContent()).toEqual(undefined);
        expect(container._cItemPrefix.element().innerHTML).toEqual("");
        expect(container.item(0).initContent("New1").nodeValue).toEqual("New1");
        expect(container.item(1).initContent("New2").nodeValue).toEqual("New2");
        expect(container._cItemPrefix.element().innerHTML).toEqual("");
        expect(container.item(2)).toBeDefined();
        expect(container.item(2).initContent()).toEqual(undefined);
        expect(container.item(0).initContent().nodeValue).toEqual("CIText1 ");
        expect(container.item(1).initContent().nodeValue).toEqual("");
        expect(container._cItemPrefix.element().innerHTML).toEqual("");
        expect(container.item(2)).toBeDefined();
        expect(container.item(2).initContent()).toEqual(undefined);
        
        
      });

      it("should support dynamic adding of items", function () {

        var list = [
          ["Constituency"],
          ["Lemma"],
          ["Morphology"],
          ["Part-of-Speech"],
          ["Syntax"]
        ];
        
        var ExampleItemList2 = new Array;
        ExampleItemList2.push({defaultTextValue : "CIText1 "});
        ExampleItemList2.push({});
        
        var menu = OwnContainerMenu.create(list,ExampleItemList2);
        var container = menu.container();

        var testElement = container.element().children[0]; // Use this to test wether the HTML elements are in the correct order.

        expect(container.item(0).initContent().nodeValue).toEqual("CIText1 ");
        expect(testElement).toEqual(container.item(0).element())

        testElement = testElement.nextElementSibling;
        expect(container.item(1).initContent().nodeValue).toEqual("");
        expect(testElement).toEqual(container.item(1).element())

        testElement = testElement.nextElementSibling;
        expect(container.item(2).initContent()).toEqual(undefined);
        expect(container.item(2)).toBeDefined();
        expect(testElement).toEqual(container.item(2).element()) // = prefix
        expect(container._cItemPrefix.element().innerHTML).toEqual("");
        expect(container.element().lastChild).toEqual(container._cItemPrefix.element());

        container.addItem({defaultTextValue : "CIText2 "});
        
        var testElement = container.element().children[0]; // Use this to test wether the HTML elements are in the correct order.

        expect(container.item(0).initContent().nodeValue).toEqual("CIText1 ");
        expect(testElement).toEqual(container.item(0).element())

        testElement = testElement.nextElementSibling;
        expect(container.item(1).initContent().nodeValue).toEqual("");
        expect(testElement).toEqual(container.item(1).element())

        testElement = testElement.nextElementSibling;
        expect(container.item(2).initContent().nodeValue).toEqual("CIText2 ");
        expect(testElement).toEqual(container.item(2).element())

        testElement = testElement.nextElementSibling;
        expect(container.item(3)).toBeDefined();
        expect(container.item(3).initContent()).toEqual(undefined);
        expect(testElement).toEqual(container.item(3).element())
        expect(container._cItemPrefix.element().innerHTML).toEqual("");
        expect(container.element().lastChild).toEqual(container._cItemPrefix.element()); //Prefix must always be at the very back.
        
        container.add("a");

        menu.next();
        menu.next();
        menu.next();
        menu.next();
        menu.next();
        expect(container.item(0).active()).toBeTruthy();
        menu.next();
        expect(container.item(1).active()).toBeTruthy();
        menu.next();
        expect(container.item(2).active()).toBeTruthy();
        menu.next();
        expect(container.item(3).active()).toBeTruthy();
        menu.next();
        expect(container.item(3).active()).toBeFalsy();
        menu.prev();
        expect(container.item(3).active()).toBeTruthy();
        menu.prev();
        expect(container.item(2).active()).toBeTruthy();
        menu.prev();
        expect(container.item(1).active()).toBeTruthy();
        menu.prev();
        expect(container.item(0).active()).toBeTruthy();
        menu.prev();
        expect(container.item(0).active()).toBeFalsy();

        
        
      });


    });
  });

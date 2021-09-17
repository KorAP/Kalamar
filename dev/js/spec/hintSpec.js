"use strict";

define(['hint', 'hint/input', 'hint/contextanalyzer', 'hint/menu', 'hint/item'], function (hintClass, inputClass, contextClass, menuClass, menuItemClass) {

  function emitKeyboardEvent (element, type, keyCode) {
    // event type : keydown, keyup, keypress
    // http://stackoverflow.com/questions/596481/simulate-javascript-key-events
    // http://stackoverflow.com/questions/961532/firing-a-keyboard-event-in-javascript
    var keyboardEvent = document.createEvent("KeyboardEvent");
    var initMethod = typeof keyboardEvent.initKeyboardEvent !== 'undefined' ?
        "initKeyboardEvent" : "initKeyEvent";
    keyboardEvent[initMethod](
      type, 
      true,    // bubbles
      true,    // cancelable
      window,  // viewArg: should be window
      false,   // ctrlKeyArg
      false,   // altKeyArg
      false,   // shiftKeyArg
      false,   // metaKeyArg
      keyCode, // keyCodeArg : unsigned long the virtual key code, else 0
      0        // charCodeArgs : unsigned long the Unicode character
      // associated with the depressed key, else 0
    );
    element.dispatchEvent(keyboardEvent);
  };

  var afterAllFunc = function () {
    try {
      var mirrors = document.querySelectorAll(".hint.mirror");
      for (var i in mirrors) {
        mirrors[i].parentNode.removeChild(mirrors[i])
      };
    }
    catch (e) {};
    
    var body = document.body;
    for (var i in body.children) {
      if (body.children[i].nodeType && body.children[i].nodeType === 1) {
        if (!body.children[i].classList.contains("jasmine_html-reporter")) {
          body.removeChild(body.children[i]);
        };
      };
    };
    KorAP.API.getMatchInfo = undefined;
    KorAP.context = undefined;
    // KorAP.annotationHelper = undefined;
  };

  var beforeAllFunc = function () {
    KorAP.annotationHelper = KorAP.annotationHelper || {};
    KorAP.annotationHelper["-"] = [
      ["Base Annotation", "base/s=", "Structure"],
      ["CoreNLP", "corenlp/", "Constituency, Named Entities, Part-of-Speech"]
    ];
    KorAP.annotationHelper["corenlp/"] = [
      ["Named Entity", "ne=" , "Combined"],
      ["Named Entity", "ne_dewac_175m_600=" , "ne_dewac_175m_600"],
      ["Named Entity", "ne_hgc_175m_600=",    "ne_hgc_175m_600"]
    ];
  };

  describe('KorAP.InputField', function () {
    beforeAll(beforeAllFunc);
    afterAll(afterAllFunc);
    let input;

    beforeEach(function () {
      input = document.createElement("input");
      input.setAttribute('type', "text");
      input.setAttribute("value", "abcdefghijklmno");
      input.style.position = 'absolute';
      document.getElementsByTagName('body')[0].appendChild(input);
      input.style.top  = "20px";
      input.style.left = "30px";
      input.focus();
      input.selectionStart = 5;
    });

    afterEach(function () {
      document.getElementsByTagName("body")[0].removeChild(
        input
      );    
    });

    it('should be initializable', function () {
      // Supports: context, searchField
      var inputField = inputClass.create(input);
      expect(inputField._el).not.toBe(undefined);
    });

    it('should have text', function () {
      expect(input.value).toEqual('abcdefghijklmno');
      var inputField = inputClass.create(input);

      expect(inputField.value()).toEqual("abcdefghijklmno");

      expect(input.selectionStart).toEqual(5);
      expect(inputField.element().selectionStart).toEqual(5);
      expect(inputField._split()[0]).toEqual("abcde");
      expect(inputField._split()[1]).toEqual("fghijklmno");

      inputField.insert("xyz");
      expect(inputField.value()).toEqual('abcdexyzfghijklmno');
      expect(inputField._split()[0]).toEqual("abcdexyz");
      expect(inputField._split()[1]).toEqual("fghijklmno");
    });

    it('should be correctly positioned', function () {
      expect(input.value).toEqual('abcdefghijklmno');
      var inputField = inputClass.create(input);
      document.getElementsByTagName("body")[0].appendChild(input);
      inputField.reposition();
      expect(input.style.left).toEqual("30px");
      expect(inputField.mirror().style.left.match(/^(\d+)px$/)[1]).toBeGreaterThan(29);
      expect(inputField.mirror().style.top.match(/^(\d+)px$/)[1]).toBeGreaterThan(20);
    });

    it('should have a correct context', function () {
      expect(input.value).toEqual('abcdefghijklmno');
      var inputField = inputClass.create(input);
      expect(inputField.value()).toEqual("abcdefghijklmno");
      expect(inputField.element().selectionStart).toEqual(5);
      expect(inputField._split()[0]).toEqual("abcde");
      expect(inputField.context()).toEqual("abcde");
    });

    /*
      it('should be correctly triggerable', function () {
      // https://developer.mozilla.org/samples/domref/dispatchEvent.html
      var hint = KorAP.Hint.create({ "inputField" : input });
      emitKeyboardEvent(hint.inputField.element, "keypress", 20);
      });
    */
  });


  describe('KorAP.ContextAnalyzer', function () {
    beforeAll(beforeAllFunc);
    afterAll(afterAllFunc);

    it('should be initializable', function () {
      var analyzer = contextClass.create(")");
      expect(analyzer).toBe(undefined);
      analyzer = contextClass.create(".+?");
      expect(analyzer).not.toBe(undefined);
    });

    it('should check correctly', function () {

      // Intialize KorAP.context
      hintClass.create();

      const analyzer = contextClass.create(KorAP.context);
      expect(analyzer.test("cnx/]cnx/c=")).toEqual("cnx/c=");
      expect(analyzer.test("cnx/c=")).toEqual("cnx/c=");
      expect(analyzer.test("cnx/c=np mate/m=mood:")).toEqual("mate/m=mood:");
      expect(analyzer.test("impcnx/")).toEqual("impcnx/");
      expect(analyzer.test("cnx/c=npcnx/")).toEqual("npcnx/");
      expect(analyzer.test("mate/m=degree:pos corenlp/ne_dewac_175m_600="))
        .toEqual("corenlp/ne_dewac_175m_600=");
      expect(analyzer.test("corenlp/")).toEqual("corenlp/");
      expect(analyzer.test("corenlp/c=")).toEqual("corenlp/c=");
      expect(analyzer.test("corenlp/c=PP-")).toEqual("corenlp/c=PP-");
      expect(analyzer.test("corenlp/c=XY-")).toEqual("corenlp/c=XY-");
      expect(analyzer.test("sgbr/l=")).toEqual("sgbr/l=");
      expect(analyzer.test("sgbr/lv=")).toEqual("sgbr/lv=");
      expect(analyzer.test("sgbr/p=")).toEqual("sgbr/p=");
      expect(analyzer.test("")).toEqual(undefined);
      expect(analyzer.test("abcdecnx/")).toEqual("abcdecnx/");
    });
  });


  describe('KorAP.Hint', function () {

    let input;
    
    beforeAll(beforeAllFunc);
    afterAll(afterAllFunc);

    beforeEach(function () {
      input = document.createElement("input");
      input.setAttribute("type", "text");
      input.setAttribute("value", "abcdefghijklmno");
      input.style.position = 'absolute';
      input.style.top  = "20px";
      input.style.left = "30px";
      input.focus();
      input.selectionStart = 5;
    });

    it('should be initializable', function () {

      // Supports: context, searchField
      var hint = hintClass.create({
        inputField : input
      });

      expect(hint).toBeTruthy();
    });

    
    it('should alert at char pos', function () {
      var hint = hintClass.create({
        inputField : input
      });

      expect(hint.active()).toBeFalsy();

      expect(hint.alert(4, 'That does not work!')).toBeTruthy();

      expect(hint.active()).toBeTruthy();

      var container = hint.inputField().container();
      expect(container.firstChild.classList.contains('hint')).toBe(true);
      expect(container.firstChild.classList.contains('alert')).toBe(true);
      expect(container.firstChild.textContent).toEqual('That does not work!');
      expect(hint.inputField().mirrorValue()).toEqual('abcd');

      expect(hint.alert(4, 'That does not work!')).toBeFalsy();

      // Update - meaning: hide alert
      hint.update();

      expect(hint.alert().active).toBeFalsy();
      expect(hint.active()).toBeFalsy();

      // Show again
      expect(hint.alert(5, 'That does not work!')).toBeTruthy();
      expect(hint.inputField().mirrorValue()).toEqual('abcde');
      expect(hint.alert().active).toBeTruthy();
      expect(hint.active()).toBeTruthy();

      // Show menu, hide alert!
      hint.show(false);
      expect(hint.active()).toBeTruthy();
      expect(hint.inputField().mirrorValue()).toEqual('abcde');
      expect(hint.alert().active).toBeFalsy();

      // Show again
      expect(hint.alert(5, 'That does not work!')).toBeTruthy();
      expect(hint.inputField().mirrorValue()).toEqual('abcde');
      expect(hint.alert().active).toBeTruthy();
      expect(hint.active()).toBeTruthy();

      // Show menu, hide alert!
      hint.show(false);
    });

    it('should work both in Chrome and Firefox', function () {
      var hint = hintClass.create({
        inputField : input
      });
      hint.show(false);
      expect(hint.alert(5, 'That does not work!')).toBeTruthy();

      // Show menu, hide alert!
      hint.show(false);

      expect(hint.active()).toBeFalsy();
    });

    
    it('should view main menu on default', function () {
      var hint = hintClass.create({
        inputField : input
      });

      expect(hint.active()).toBeFalsy();

      hint.inputField().insert('der Baum corenlp/');

      var cont = hint.inputField().container();
      expect(cont.getElementsByTagName('div').length).toBe(1);
      expect(cont.getElementsByTagName('ul').length).toBe(0);
      expect(cont.firstChild).toEqual(cont.firstChild);
      
      // Show menu, if a relevant context exists
      // There is a menu for corenlp/
      hint.show(false);

      expect(cont.getElementsByTagName('ul').length).toEqual(1+1); //+1 from containermenu (see container/container.js)
      expect(cont.getElementsByTagName('li').length).toEqual(3);
      
      // Hide the menu and focus on the input
      hint.unshow();
      
      expect(cont.getElementsByTagName('div').length).toEqual(1);
      expect(cont.getElementsByTagName('li').length).toEqual(0);

      hint.unshow();

      hint.inputField().insert(' hhhh');

      // show with context if possible
      hint.show(false);
      
      expect(cont.getElementsByTagName('div').length).toEqual(4);
      expect(cont.getElementsByTagName('ul').length).toEqual(1+1);//+1 from containermenu (see container/container.js)
      expect(cont.getElementsByTagName('li').length).toEqual(2);

      hint.unshow();
      hint.inputField().insert(' aaaa/');

      // show with context necessarily
      hint.show(true);

      expect(cont.getElementsByTagName('div').length).toEqual(1);
      expect(cont.getElementsByTagName('ul').length).toEqual(0); //here not +1: context doesnt fit
    });


    it('should open menus depending on the context', function () {
      var hint = hintClass.create({
        inputField : input
      });
      hint.inputField().reset();

      expect(hint.active()).toBeFalsy();

      // show with context
      hint.show(false);

      expect(hint.active()).toBeTruthy();
      var cont = hint.inputField().container();
      expect(cont.getElementsByTagName('li')[0].firstChild.innerText).toEqual("Base Annotation");

      // Type in prefix
      hint.active().prefix("cor").show();
      expect(hint.active().prefix()).toEqual("cor");

      // Click first step
      expect(cont.getElementsByTagName('li')[0].firstChild.firstChild.innerText).toEqual("Cor");
      cont.getElementsByTagName('li')[0].click();

      expect(hint.active()).toBeTruthy();
      
      // Click second step
      expect(cont.getElementsByTagName('li')[0].firstChild.innerText).toEqual("Named Entity");
      cont.getElementsByTagName('li')[0].click()

      // Invisible menu
      expect(cont.getElementsByTagName('li')[0]).toBeUndefined();

      // Inactive menu
      expect(hint.active()).toBeFalsy();

      // show with context
      hint.show(false);

      // No prefix
      expect(hint.active().prefix()).toEqual("");
    });

    
    it('should not view main menu if context is mandatory', function () {
      var hint = hintClass.create({
        inputField : input
      });

      expect(hint.active()).toBeFalsy();

      // Fine
      hint.inputField().insert('der Baum corenlp/');
      hint.show(true);
      expect(hint.active()).toBeTruthy();

      // Not analyzable
      hint.inputField().insert('jhgjughjfhgnhfcvgnhj');
      hint.show(true);
      expect(hint.active()).toBeFalsy();

      // Not available
      hint.inputField().insert('jhgjughjfhgnhfcvgnhj/');
      hint.show(true);
      expect(hint.active()).toBeFalsy();
    });


    it('should show the assistant bar on blur', function () {
      var hint = hintClass.create({
        inputField : input
      });
      // Fine
      hint.inputField().insert('der Baum corenlp/');
      hint.show(true);
      expect(hint.active()).toBeTruthy();

      // Blur
      hint.active().hide();
      expect(hint.active()).toBeFalsy();
    });

    it('should support prefix', function () {
      const hint = hintClass.create({
        inputField : input
      });
      hint.inputField().reset();

      expect(hint.active()).toBeFalsy();

      // show with context
      hint.show(false);

      expect(hint.active()).toBeTruthy();

      const menu = hint.active();

      expect(menu.element().nodeName).toEqual('UL');

      menu.limit(8);

      // view
      menu.show();
      
      expect(menu.prefix()).toBe('');
      expect(hint.active()).toBeTruthy();

      // Type in prefix
      hint.active().prefix("cor").show();
      expect(hint.active()._prefix.value()).toBe("cor");
      expect(hint.active().prefix()).toEqual("cor");
      expect(input.value).toEqual("");
      expect(hint.active()._prefix["isSelectable"]).not.toBeNull();
      expect(hint._menu['-']._prefix["isSelectable"]).not.toBeNull();
      expect(hint.active()._prefix).toBe(hint._menu['-']._prefix);
      expect(hint.active()._prefix.element()).toBe(hint._menu['-']._prefix.element());
      hint.active()._prefix.element().click();
      
      
      expect(input.value).toEqual("cor");
      expect(hint.active()).toBeFalsy();

      // view
      menu.show();
      expect(menu.prefix()).toBe('');
      
    });


    
    xit('should remove all menus on escape');
  });

  
  describe('KorAP.HintMenuItem', function () {
    beforeAll(beforeAllFunc);
    afterAll(afterAllFunc);

    it('should be initializable', function () {
      expect(
        function() { menuItemClass.create([]) }
      ).toThrow(new Error("Missing parameters"));

      expect(
        function() { menuItemClass.create(['CoreNLP']) }
      ).toThrow(new Error("Missing parameters"));

      var menuItem = menuItemClass.create(['CoreNLP', 'corenlp/']);
      expect(menuItem.name()).toEqual('CoreNLP');
      expect(menuItem.action()).toEqual('corenlp/');
      expect(menuItem.desc()).toBeUndefined();

      menuItem = menuItemClass.create(
        ['CoreNLP', 'corenlp/', 'It\'s funny']
      );
      expect(menuItem.name()).toEqual('CoreNLP');
      expect(menuItem.action()).toEqual('corenlp/');
      expect(menuItem.desc()).not.toBeUndefined();
      expect(menuItem.desc()).toEqual('It\'s funny');
    });


    it('should have an element', function () {
      var menuItem = menuItemClass.create(['CoreNLP', 'corenlp/']);
      expect(menuItem.element()).not.toBe(undefined);
      expect(menuItem.element().nodeName).toEqual("LI");

      var title = menuItem.element().firstChild;
      expect(title.nodeName).toEqual("SPAN");
      expect(title.firstChild.nodeType).toEqual(3);
      expect(title.firstChild.nodeValue).toEqual("CoreNLP");
      expect(menuItem.element().childNodes[0]).not.toBe(undefined);
      expect(menuItem.element().childNodes[1]).toBe(undefined);

      menuItem = menuItemClass.create(
        ['CoreNLP', 'corenlp/', 'my DescRiption']
      );
      expect(menuItem.element()).not.toBe(undefined);
      expect(menuItem.element().nodeName).toEqual("LI");

      title = menuItem.element().firstChild;
      expect(title.nodeName).toEqual("SPAN");
      expect(title.firstChild.nodeType).toEqual(3); // TextNode
      expect(title.firstChild.nodeValue).toEqual("CoreNLP");

      expect(menuItem.element().childNodes[0]).not.toBe(undefined);
      expect(menuItem.element().childNodes[1]).not.toBe(undefined);

      var desc = menuItem.element().lastChild;
      expect(desc.nodeName).toEqual("SPAN");
      expect(desc.firstChild.nodeType).toEqual(3); // TextNode
      expect(desc.firstChild.nodeValue).toEqual("my DescRiption");
    });


    it('should be activatable and deactivateable by class', function () {
      var menuItem = menuItemClass.create(['CoreNLP', 'corenlp/']);
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

      menuItem = menuItemClass.create(['CoreNLP', 'corenlp/']);
      expect(menuItem.active()).toBe(false);
      expect(menuItem.element().getAttribute("class")).toBe(null);
      menuItem.active(false); // Is not active
      expect(menuItem.active()).toBe(false);
      expect(menuItem.element().getAttribute("class")).toBe(null);
    });


    it('should be set to boundary', function () {
      var menuItem = menuItemClass.create(['CoreNLP', 'corenlp/']);
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
      var menuItem = menuItemClass.create(['CoreNLP', 'corenlp/']);
      menuItem.highlight("ren");
      expect(menuItem.element().innerHTML).toEqual("<span>Co<mark>reN</mark>LP</span>");

      menuItem.lowlight();
      expect(menuItem.element().innerHTML).toEqual("<span>CoreNLP</span>");

      // Starting highlight
      menuItem = menuItemClass.create(['CoreNLP', 'corenlp/']);
      menuItem.highlight("cor");
      expect(menuItem.element().innerHTML).toEqual("<span><mark>Cor</mark>eNLP</span>");

      menuItem.lowlight();
      expect(menuItem.element().innerHTML).toEqual("<span>CoreNLP</span>");

      // Starting highlight - short
      menuItem = menuItemClass.create(['CoreNLP', 'corenlp/']);
      menuItem.highlight("c");
      expect(menuItem.element().innerHTML).toEqual("<span><mark>C</mark>oreNLP</span>");

      menuItem.lowlight();
      expect(menuItem.element().innerHTML).toEqual("<span>CoreNLP</span>");

      // Highlight at the end
      menuItem = menuItemClass.create(['CoreNLP', 'corenlp/']);
      menuItem.highlight("nlp");
      expect(menuItem.element().innerHTML).toEqual("<span>Core<mark>NLP</mark></span>");

      menuItem.lowlight();
      expect(menuItem.element().innerHTML).toEqual("<span>CoreNLP</span>");

      // Highlight at the end - short
      menuItem = menuItemClass.create(['CoreNLP', 'corenlp/']);
      menuItem.highlight("p");
      expect(menuItem.element().innerHTML).toEqual("<span>CoreNL<mark>P</mark></span>");

      menuItem.lowlight();
      expect(menuItem.element().innerHTML).toEqual("<span>CoreNLP</span>");

      // No highlight
      menuItem = menuItemClass.create(['CoreNLP', 'corenlp/']);
      menuItem.highlight("xp");
      expect(menuItem.element().innerHTML).toEqual("<span>CoreNLP</span>");

      menuItem.lowlight();
      expect(menuItem.element().innerHTML).toEqual("<span>CoreNLP</span>");

      // Highlight in the middle - first
      menuItem = menuItemClass.create(['CoreNLP', 'corenlp/', 'This is my Example']);

      menuItem.highlight("ren");
      expect(menuItem.element().innerHTML).toEqual("<span>Co<mark>reN</mark>LP</span><span class=\"desc\">This is my Example</span>");

      menuItem.lowlight();
      expect(menuItem.element().innerHTML).toEqual('<span>CoreNLP</span><span class="desc">This is my Example</span>');

      // Highlight in the middle - second
      menuItem = menuItemClass.create(['CoreNLP', 'corenlp/', 'This is my Example']);
      menuItem.highlight("ampl");
      expect(menuItem.element().innerHTML).toEqual('<span>CoreNLP</span><span class="desc">This is my Ex<mark>ampl</mark>e</span>');

      menuItem.lowlight();
      expect(menuItem.element().innerHTML).toEqual('<span>CoreNLP</span><span class="desc">This is my Example</span>');

      // Highlight in the middle - both
      menuItem = menuItemClass.create(['CoreNLP', 'corenlp/', 'This is my Example']);

      menuItem.highlight("e");
      expect(menuItem.element().innerHTML).toEqual('<span>Cor<mark>e</mark>NLP</span><span class="desc">This is my <mark>E</mark>xampl<mark>e</mark></span>');

      menuItem.lowlight();
      expect(menuItem.element().innerHTML).toEqual("<span>CoreNLP</span><span class=\"desc\">This is my Example</span>");

      // Highlight in the end - second
      menuItem = menuItemClass.create(['CoreNLP', 'corenlp/', 'This is my Example']);
      menuItem.highlight("le");
      expect(menuItem.element().innerHTML).toEqual("<span>CoreNLP</span><span class=\"desc\">This is my Examp<mark>le</mark></span>");

      menuItem.lowlight();
      expect(menuItem.element().innerHTML).toEqual("<span>CoreNLP</span><span class=\"desc\">This is my Example</span>");

      // Highlight at the beginning - second
      menuItem = menuItemClass.create(['CoreNLP', 'corenlp/', 'This is my Example']);
      menuItem.highlight("this");
      expect(menuItem.element().innerHTML).toEqual("<span>CoreNLP</span><span class=\"desc\"><mark>This</mark> is my Example</span>");

      menuItem.lowlight();
      expect(menuItem.element().innerHTML).toEqual("<span>CoreNLP</span><span class=\"desc\">This is my Example</span>");
    });
  });


  describe('KorAP.HintMenu', function () {
    beforeAll(beforeAllFunc);
    afterAll(afterAllFunc);

    var list = [
      ["Constituency", "c=", "Example 1"],
      ["Lemma", "l="],
      ["Morphology", "m=", "Example 2"],
      ["Part-of-Speech", "p="],
      ["Syntax", "syn="]
    ];

    it('should be initializable', function () {
      var menu = menuClass.create(null, "cnx/", list);
      expect(menu.element().nodeName).toEqual('UL');
      // expect(menu.element().style.opacity).toEqual("0");

      menu.limit(8);

      // view
      menu.show();
      expect(menu.prefix()).toBe('');

      // First element in list
      expect(menu.item(0).active()).toBe(true);
      expect(menu.item(0).noMore()).toBe(true);
      
      // Middle element in list
      expect(menu.item(2).active()).toBe(false);
      expect(menu.item(2).noMore()).toBe(false);

      // Last element in list
      expect(menu.item(menu.length() - 1).active()).toBe(false);
      expect(menu.item(menu.length() - 1).noMore()).toBe(true);

      expect(menu.shownItem(0).active()).toBeTruthy();
      expect(menu.shownItem(0).lcField()).toEqual(' constituency example 1');
      expect(menu.shownItem(1).lcField()).toEqual(' lemma');
      expect(menu.shownItem(2).lcField()).toEqual(' morphology example 2');

      menu.next();
      expect(menu.shownItem(1).active()).toBeTruthy();

      menu.next();
      expect(menu.shownItem(2).active()).toBeTruthy();
    });
  });
});

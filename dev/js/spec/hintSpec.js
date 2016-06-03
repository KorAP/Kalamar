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


define(['hint'], function () {

  var hintClass =     require("hint");
  var inputClass =    require("hint/input");
  var contextClass =  require("hint/contextanalyzer");
  var menuClass =     require("hint/menu");
  var menuItemClass = require("hint/item");

  describe('KorAP.InputField', function () {
    var input;

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

    afterAll(function () {
      try {
	var mirrors = document.querySelectorAll(".hint.mirror");
	for (var i in mirrors) {
	  mirrors[i].parentNode.removeChild(mirrors[i])
	};
      }
      catch (e) {};
    });

    it('should be initializable', function () {
      // Supports: context, searchField
      var inputField = inputClass.create(input);
      expect(inputField._element).not.toBe(undefined);
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
    it('should be initializable', function () {
      var analyzer = contextClass.create(")");
      expect(analyzer).toBe(undefined);
      analyzer = contextClass.create(".+?");
      expect(analyzer).not.toBe(undefined);
    });

    it('should check correctly', function () {
      analyzer = contextClass.create(KorAP.context);
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
    KorAP.hintArray = {
      "corenlp/" : [
	["Named Entity", "ne=" , "Combined"],
	["Named Entity", "ne_dewac_175m_600=" , "ne_dewac_175m_600"],
	["Named Entity", "ne_hgc_175m_600=",    "ne_hgc_175m_600"]
      ]
    };

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
    });

    it('should view main menu on default', function () {
      var hint = hintClass.create({
	inputField : input
      });

      expect(hint.active()).toBeFalsy();

      hint.inputField().insert('der Baum corenlp/');
      expect(hint.inputField().container().getElementsByTagName('div').length).toBe(1);
      expect(hint.inputField().container().getElementsByTagName('ul').length).toBe(0);

      // show with context
      hint.unshow();
      hint.show(true);

      expect(hint.inputField().container().getElementsByTagName('div').length).toEqual(4);
      expect(hint.inputField().container().getElementsByTagName('ul').length).toEqual(1);

      hint.inputField().insert(' hhhh');
      // show with context
      hint.unshow();
      hint.show(true);

      expect(hint.inputField().container().getElementsByTagName('div').length).toEqual(4);
      expect(hint.inputField().container().getElementsByTagName('ul').length).toEqual(1);

      hint.unshow();
      hint.inputField().insert(' aaaa/');

      // show with context
      hint.show(true);

      console.log(hint.inputField().container().outerHTML);

      expect(hint.inputField().container().getElementsByTagName('div').length).toEqual(4);
      expect(hint.inputField().container().getElementsByTagName('ul').length).toEqual(1);
    });
  });

  describe('KorAP.HintMenuItem', function () {
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
      expect(menu.element().style.opacity).toEqual("0");

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

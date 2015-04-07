function emitKeyboardEvent (element, type, keyCode) {
  // event type : keydown, keyup, keypress
  // http://stackoverflow.com/questions/596481/simulate-javascript-key-events
  // http://stackoverflow.com/questions/961532/firing-a-keyboard-event-in-javascript
  var keyboardEvent = document.createEvent("KeyboardEvent");
  var initMethod = typeof keyboardEvent.initKeyboardEvent !== 'undefined' ?
    "initKeyboardEvent" : "initKeyEvent";

  keyboardEvent[initMethod](
    type, 
    true, // bubbles
    true, // cancelable
    window, // viewArg: should be window
    false, // ctrlKeyArg
    false, // altKeyArg
    false, // shiftKeyArg
    false, // metaKeyArg
    keyCode, // keyCodeArg : unsigned long the virtual key code, else 0
    0 // charCodeArgs : unsigned long the Unicode character
      // associated with the depressed key, else 0
  );

  element.dispatchEvent(keyboardEvent);
};


describe('KorAP.InputField', function () {
  var input;

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

  afterAll(function () {
    try {
      // document.getElementsByTagName("body")[0].removeChild(input);
      document.getElementsByTagName("body")[0].removeChild(
	document.getElementById("searchMirror")
      );
    }
    catch (e) {};
  });

  it('should be initializable', function () {
    // Supports: context, searchField
    var inputField = KorAP.InputField.create(input);
    expect(inputField._element).not.toBe(undefined);
  });

  it('should have text', function () {
    expect(input.value).toEqual('abcdefghijklmno');
    var inputField = KorAP.InputField.create(input);

    expect(inputField.value()).toEqual("abcdefghijklmno");

    expect(inputField.element().selectionStart).toEqual(5);
    expect(inputField.split()[0]).toEqual("abcde");
    expect(inputField.split()[1]).toEqual("fghijklmno");

    inputField.insert("xyz");
    expect(inputField.value()).toEqual('abcdexyzfghijklmno');
    expect(inputField.split()[0]).toEqual("abcdexyz");
    expect(inputField.split()[1]).toEqual("fghijklmno");
  });

  it('should be correctly positioned', function () {
    expect(input.value).toEqual('abcdefghijklmno');
    var inputField = KorAP.InputField.create(input);
    document.getElementsByTagName("body")[0].appendChild(input);
    inputField.reposition();
    expect(inputField.mirror().style.left).toEqual("30px");
    expect(inputField.mirror().style.top.match(/^(\d+)px$/)[1]).toBeGreaterThan(20);
  });

  it('should have a correct context', function () {
    expect(input.value).toEqual('abcdefghijklmno');
    var inputField = KorAP.InputField.create(input);

    expect(inputField.value()).toEqual("abcdefghijklmno");

    expect(inputField.element().selectionStart).toEqual(5);
    expect(inputField.split()[0]).toEqual("abcde");
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
    var analyzer = KorAP.ContextAnalyzer.create(")");
    expect(analyzer).toBe(undefined);

    analyzer = KorAP.ContextAnalyzer.create(".+?");
    expect(analyzer).not.toBe(undefined);

  });

  it('should check correctly', function () {
    analyzer = KorAP.ContextAnalyzer.create(KorAP.context);
    expect(analyzer.test("cnx/]cnx/c=")).toEqual("cnx/c=");
    expect(analyzer.test("cnx/c=")).toEqual("cnx/c=");
    expect(analyzer.test("cnx/c=np mate/m=mood:")).toEqual("mate/m=mood:");
    expect(analyzer.test("impcnx/")).toEqual("impcnx/");
    expect(analyzer.test("cnx/c=npcnx/")).toEqual("npcnx/");
    expect(analyzer.test("mate/m=degree:pos corenlp/ne_dewac_175m_600="))
      .toEqual("corenlp/ne_dewac_175m_600=");
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
    var hint = KorAP.Hint.create({
      inputField : input
    });

    expect(hint).toBeTruthy();
  });
});











xdescribe('KorAP.MenuItem', function () {
  it('should be initializable', function () {

    expect(
      function() { KorAP.MenuItem.create([]) }
    ).toThrow(new Error("Missing parameters"));

    expect(
      function() { KorAP.MenuItem.create(['CoreNLP']) }
    ).toThrow(new Error("Missing parameters"));

    var menuItem = KorAP.MenuItem.create(['CoreNLP', 'corenlp/']);
    expect(menuItem.name).toEqual('CoreNLP');
    expect(menuItem.action).toEqual('corenlp/');
    expect(menuItem.desc).toBeUndefined();
    expect(menuItem.lcfield).toEqual(' corenlp');

    menuItem = KorAP.MenuItem.create(['CoreNLP', 'corenlp/', 'It\'s funny']);
    expect(menuItem.name).toEqual('CoreNLP');
    expect(menuItem.action).toEqual('corenlp/');
    expect(menuItem.desc).not.toBeUndefined();
    expect(menuItem.desc).toEqual('It\'s funny');
    expect(menuItem.lcfield).toEqual(' corenlp it\'s funny');
  });

  it('should have an element', function () {
    var menuItem = KorAP.MenuItem.create(['CoreNLP', 'corenlp/']);
    expect(menuItem.element).not.toBe(undefined);
    expect(menuItem.element.nodeName).toEqual("LI");
    expect(menuItem.element.getAttribute("data-action")).toEqual("corenlp/");

    var title = menuItem.element.firstChild;
    expect(title.nodeName).toEqual("STRONG");
    expect(title.firstChild.nodeType).toEqual(3);
    expect(title.firstChild.nodeValue).toEqual("CoreNLP");

    expect(menuItem.element.childNodes[0]).not.toBe(undefined);
    expect(menuItem.element.childNodes[1]).toBe(undefined);

    menuItem = KorAP.MenuItem.create(['CoreNLP', 'corenlp/', 'my DescRiption']);
    expect(menuItem.element).not.toBe(undefined);
    expect(menuItem.element.nodeName).toEqual("LI");
    expect(menuItem.element.getAttribute("data-action")).toEqual("corenlp/");

    title = menuItem.element.firstChild;
    expect(title.nodeName).toEqual("STRONG");
    expect(title.firstChild.nodeType).toEqual(3); // TextNode
    expect(title.firstChild.nodeValue).toEqual("CoreNLP");

    expect(menuItem.element.childNodes[0]).not.toBe(undefined);
    expect(menuItem.element.childNodes[1]).not.toBe(undefined);

    var desc = menuItem.element.lastChild;
    expect(desc.nodeName).toEqual("SPAN");
    expect(desc.firstChild.nodeType).toEqual(3); // TextNode
    expect(desc.firstChild.nodeValue).toEqual("my DescRiption");

    expect(menuItem.lcfield).toEqual(' corenlp my description');
  });

  it('should be activatable and deactivateable by class', function () {
    var menuItem = KorAP.MenuItem.create(['CoreNLP', 'corenlp/']);
    expect(menuItem.active()).toBe(false);
    expect(menuItem.element.getAttribute("class")).toBe(null);
    menuItem.active(true);
    expect(menuItem.active()).toBe(true);
    expect(menuItem.element.getAttribute("class")).toEqual("active");
    menuItem.active(false); // Is active
    expect(menuItem.active()).toBe(false);
    expect(menuItem.element.getAttribute("class")).toEqual("");
    menuItem.active(true);
    expect(menuItem.active()).toBe(true);
    expect(menuItem.element.getAttribute("class")).toEqual("active");

    menuItem = KorAP.MenuItem.create(['CoreNLP', 'corenlp/']);
    expect(menuItem.active()).toBe(false);
    expect(menuItem.element.getAttribute("class")).toBe(null);
    menuItem.active(false); // Is not active
    expect(menuItem.active()).toBe(false);
    expect(menuItem.element.getAttribute("class")).toBe(null);
  });

  it('should be set to boundary', function () {
    var menuItem = KorAP.MenuItem.create(['CoreNLP', 'corenlp/']);
    expect(menuItem.active()).toBe(false);
    expect(menuItem.element.getAttribute("class")).toBe(null);

    // Set active
    menuItem.active(true);
    expect(menuItem.active()).toBe(true);
    expect(menuItem.noMore()).toBe(false);
    expect(menuItem.element.getAttribute("class")).toEqual("active");

    // Set no more
    menuItem.noMore(true);
    expect(menuItem.active()).toBe(true);
    expect(menuItem.noMore()).toBe(true);
    expect(menuItem.element.getAttribute("class")).toEqual("active no-more");

    // No no more
    menuItem.noMore(false);
    expect(menuItem.active()).toBe(true);
    expect(menuItem.noMore()).toBe(false);
    expect(menuItem.element.getAttribute("class")).toEqual("active");


    // Set no more, deactivate
    menuItem.noMore(true);
    menuItem.active(false);
    expect(menuItem.active()).toBe(false);
    expect(menuItem.noMore()).toBe(true);
    expect(menuItem.element.getAttribute("class")).toEqual("no-more");

    // Set active
    menuItem.active(true);
    expect(menuItem.active()).toBe(true);
    expect(menuItem.noMore()).toBe(true);
    expect(menuItem.element.getAttribute("class")).toEqual("no-more active");
  });


  it('should be highlightable', function () {
    // Highlight in the middle
    var menuItem = KorAP.MenuItem.create(['CoreNLP', 'corenlp/']);
    menuItem.highlight("ren");
    expect(menuItem.element.innerHTML).toEqual("<strong>Co<em>reN</em>LP</strong>");

    menuItem.lowlight();
    expect(menuItem.element.innerHTML).toEqual("<strong>CoreNLP</strong>");

    // Starting highlight
    menuItem = KorAP.MenuItem.create(['CoreNLP', 'corenlp/']);
    menuItem.highlight("cor");
    expect(menuItem.element.innerHTML).toEqual("<strong><em>Cor</em>eNLP</strong>");

    menuItem.lowlight();
    expect(menuItem.element.innerHTML).toEqual("<strong>CoreNLP</strong>");

    // Starting highlight - short
    menuItem = KorAP.MenuItem.create(['CoreNLP', 'corenlp/']);
    menuItem.highlight("c");
    expect(menuItem.element.innerHTML).toEqual("<strong><em>C</em>oreNLP</strong>");

    menuItem.lowlight();
    expect(menuItem.element.innerHTML).toEqual("<strong>CoreNLP</strong>");

    // Highlight at the end
    menuItem = KorAP.MenuItem.create(['CoreNLP', 'corenlp/']);
    menuItem.highlight("nlp");
    expect(menuItem.element.innerHTML).toEqual("<strong>Core<em>NLP</em></strong>");

    menuItem.lowlight();
    expect(menuItem.element.innerHTML).toEqual("<strong>CoreNLP</strong>");

    // Highlight at the end - short
    menuItem = KorAP.MenuItem.create(['CoreNLP', 'corenlp/']);
    menuItem.highlight("p");
    expect(menuItem.element.innerHTML).toEqual("<strong>CoreNL<em>P</em></strong>");

    menuItem.lowlight();
    expect(menuItem.element.innerHTML).toEqual("<strong>CoreNLP</strong>");

    // No highlight
    menuItem = KorAP.MenuItem.create(['CoreNLP', 'corenlp/']);
    menuItem.highlight("xp");
    expect(menuItem.element.innerHTML).toEqual("<strong>CoreNLP</strong>");

    menuItem.lowlight();
    expect(menuItem.element.innerHTML).toEqual("<strong>CoreNLP</strong>");

    // Highlight in the middle - first
    menuItem = KorAP.MenuItem.create(['CoreNLP', 'corenlp/', 'This is my Example']);
    menuItem.highlight("ren");
    expect(menuItem.element.innerHTML).toEqual("<strong>Co<em>reN</em>LP</strong><span>This is my Example</span>");

    menuItem.lowlight();
    expect(menuItem.element.innerHTML).toEqual("<strong>CoreNLP</strong><span>This is my Example</span>");

    // Highlight in the middle - second
    menuItem = KorAP.MenuItem.create(['CoreNLP', 'corenlp/', 'This is my Example']);
    menuItem.highlight("ampl");
    expect(menuItem.element.innerHTML).toEqual("<strong>CoreNLP</strong><span>This is my Ex<em>ampl</em>e</span>");

    menuItem.lowlight();
    expect(menuItem.element.innerHTML).toEqual("<strong>CoreNLP</strong><span>This is my Example</span>");

    // Highlight in the middle - both
    menuItem = KorAP.MenuItem.create(['CoreNLP', 'corenlp/', 'This is my Example']);
    menuItem.highlight("e");
    expect(menuItem.element.innerHTML).toEqual("<strong>Cor<em>e</em>NLP</strong><span>This is my <em>E</em>xample</span>");

    menuItem.lowlight();
    expect(menuItem.element.innerHTML).toEqual("<strong>CoreNLP</strong><span>This is my Example</span>");

    // Highlight in the end - second
    menuItem = KorAP.MenuItem.create(['CoreNLP', 'corenlp/', 'This is my Example']);
    menuItem.highlight("le");
    expect(menuItem.element.innerHTML).toEqual("<strong>CoreNLP</strong><span>This is my Examp<em>le</em></span>");

    menuItem.lowlight();
    expect(menuItem.element.innerHTML).toEqual("<strong>CoreNLP</strong><span>This is my Example</span>");

    // Highlight at the beginning - second
    menuItem = KorAP.MenuItem.create(['CoreNLP', 'corenlp/', 'This is my Example']);
    menuItem.highlight("this");
    expect(menuItem.element.innerHTML).toEqual("<strong>CoreNLP</strong><span><em>This</em> is my Example</span>");

    menuItem.lowlight();
    expect(menuItem.element.innerHTML).toEqual("<strong>CoreNLP</strong><span>This is my Example</span>");
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

    var menu = KorAP.HintMenu.create(null, "cnx/", list);
    expect(menu.context()).toEqual('cnx/');
    expect(menu.element().nodeName).toEqual('UL');
    expect(menu.element().style.opacity).toEqual("0");

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
});

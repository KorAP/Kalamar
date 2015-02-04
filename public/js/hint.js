"use strict";

/*
 * Todo:
 * - limit the view based on prefix matches
 * - highlight matching substrings
 * - http://www.cryer.co.uk/resources/javascript/script20_respond_to_keypress.htm
 * - document.removeEventListener("click",arguments.callee,false);
 */

// Don't let events bubble up
Event.prototype.halt = function () {
  this.stopPropagation();
  this.preventDefault();
};

// http://www.nlpado.de/~sebastian/software/ner_german.shtml
// http://www.cnts.ua.ac.be/conll2003/ner/
var namedEntities = [
  ["I-LOC",  "I-LOC ",  "Location"],
  ["I-MISC", "I-MISC ", "Miscellaneous"],
  ["I-ORG",  "I-ORG ",  "Organization"],
  ["I-PER",  "I-PER ",  "Person"]
];

// http://www.ids-mannheim.de/cosmas2/projekt/referenz/stts/morph.html
// http://nachhalt.sfb632.uni-potsdam.de/owl-docu/stts.html
var sttsArray = [
  // "$.", "$(", "$,"
  ["ADJA","ADJA ", "Attributive Adjective"],
  ["ADJD","ADJD ", "Predicative Adjective"],
  ["ADV","ADV ", "Adverb"],
  ["APPO","APPO ", "Postposition"],
  ["APPR","APPR ", "Preposition"],
  ["APPRART","APPRART ", "Preposition with Determiner"],
  ["APZR","APZR ","Right Circumposition"],
  ["ART","ART ", "Determiner"],
  ["CARD","CARD ", "Cardinal Number"],
  ["FM","FM ", "Foreign Material"],
  ["ITJ","ITJ ", "Interjection"],
  ["KOKOM","KOKOM ", "Comparison Particle"],
  ["KON","KON ", "Coordinating Conjuncion"],
  ["KOUI","KOUI ", "Subordinating Conjunction with 'zu'"],
  ["KOUS","KOUS ", "Subordinating Conjunction with Sentence"],
  ["NE","NE ", "Named Entity"],
  ["NN","NN ", "Normal Nomina"],
  ["PAV", "PAV ", "Pronominal Adverb"],
  ["PDAT","PDAT ","Attributive Demonstrative Pronoun"],
  ["PDS","PDS ", "Substitutive Demonstrative Pronoun"],
  ["PIAT","PIAT ", "Attributive Indefinite Pronoun without Determiner"],
  ["PIDAT","PIDAT ", "Attributive Indefinite Pronoun with Determiner"],
  ["PIS","PIS ", "Substitutive Indefinite Pronoun"],
  ["PPER","PPER ", "Personal Pronoun"],
  ["PPOSAT","PPOSAT ", "Attributive Possessive Pronoun"],
  ["PPOSS","PPOSS ", "Substitutive Possessive Pronoun"],
  ["PRELAT","PRELAT ", "Attributive Relative Pronoun"],
  ["PRELS","PRELS ", "Substitutive Relative Pronoun"],
  ["PRF","PRF ", "Reflexive Pronoun"],
  ["PROAV","PROAV ", "Pronominal Adverb"],
  ["PTKA","PTKA ","Particle with Adjective"],
  ["PTKANT","PTKANT ", "Answering Particle"],
  ["PTKNEG","PTKNEG ", "Negation Particle"],
  ["PTKVZ","PTKVZ ", "Separated Verbal Particle"],
  ["PTKZU","PTKZU ", "'zu' Particle"],
  ["PWAT","PWAT ", "Attributive Interrogative Pronoun"],
  ["PWAV","PWAV ", "Adverbial Interrogative Pronoun"],
  ["PWS","PWS ", "Substitutive Interrogative Pronoun"],
  ["TRUNC","TRUNC ","Truncated"],
  ["VAFIN","VAFIN ", "Auxiliary Finite Verb"],
  ["VAINF","VAINF ", "Auxiliary Infinite Verb"],
  ["VAIMP","VAIMP ", "Auxiliary Finite Imperative Verb"],
  ["VAPP","VAPP ", "Auxiliary Perfect Participle"],
  ["VMFIN","VMFIN ", "Modal Finite Verb"],
  ["VMINF","VMINF ", "Modal Infinite Verb"],
  ["VMPP","VMPP ", "Modal Perfect Participle"],
  ["VVFIN","VVFIN ","Finite Verb"],
  ["VVIMP","VVIMP ", "Finite Imperative Verb"],
  ["VVINF","VVINF ", "Infinite Verb"],
  ["VVIZU","VVIZU ", "Infinite Verb with 'zu'"],
  ["VVPP","VVPP ", "Perfect Participle"],
  ["XY", "XY ", "Non-Word"]
];

var mateSttsArray = sttsArray.slice(0);
mateSttsArray.push(
  ["<root-POS>","<root-POS>","Root Part of Speech"]
);


var hintArray = {
  "-" : [
    ["Connexor",   "cnx/",     "Constituency, Lemma, Morphology, Part-of-Speech, Syntax"],
    ["CoreNLP",    "corenlp/", "Named Entities"],
    ["Mate",       "mate/",     "Lemma, Morphology, Part-of-Speech"],
    ["OpenNLP",    "opennlp/", "Part-of-Speech"],
    ["TreeTagger", "tt/",      "Lemma, Part-of-Speech"],
    ["Xerox Parser", "xip/",   "Constituency, Lemma, Part-of-Speech"]
  ],
  "corenlp/" : [
    ["Named Entity", "ne=" , "Combined"],
    ["Named Entity", "ne_dewac_175m_600=" , "ne_dewac_175m_600"],
    ["Named Entity", "ne_hgc_175m_600=",    "ne_hgc_175m_600"]
  ],
  "corenlp/ne=" : namedEntities,
  "corenlp/ne_dewac_175m_600=" : namedEntities,
  "corenlp/ne_hgc_175m_600=" : namedEntities,
  "cnx/" : [
    ["Constituency", "c="],
    ["Lemma", "l="],
    ["Morphology", "m="],
    ["Part-of-Speech", "p="],
    ["Syntax", "syn="]
  ],
  "cnx/c=" : [
    ["np", "np ", "Nominal Phrase"]
  ],
  // http://www.ids-mannheim.de/cosmas2/projekt/referenz/connexor/morph.html
  "cnx/m=" : [
    ["Abbr","Abbr ", "Nouns: Abbreviation"],
    ["CMP","CMP ", "Adjective: Comparative"],
    ["IMP", "IMP ", "Mood: Imperative"],
    ["IND", "IND ", "Mood: Indicative"],
    ["INF", "INF ", "Infinitive"],
    ["ORD","ORD ", "Numeral: Ordinal"],
    ["PAST", "PAST ", "Tense: past"],
    ["PCP", "PCP ", "Participle"],
    ["PERF", "PERF ", "Perfective Participle"],
    ["PL","PL ", "Nouns: Plural"],
    ["PRES", "PRES ", "Tense: present"],
    ["PROG", "PROG ", "Progressive Participle"],
    ["Prop","Prop ", "Nouns: Proper Noun"],
    ["SUB", "SUB ", "Mood: Subjunctive"],
    ["SUP","SUP ", "Adjective: Superlative"]
  ],
  // http://www.ids-mannheim.de/cosmas2/projekt/referenz/connexor/morph.html
  "cnx/p=" : [
    ["A", "A ", "Adjective"],
    ["ADV", "ADV ", "Adverb"],
    ["CC", "CC ", "Coordination Marker"],
    ["CS", "CS ", "Clause Marker"],
    ["DET", "DET ", "Determiner"],
    ["INTERJ", "INTERJ ", "Interjection"],
    ["N", "N ", "Noun"],
    ["NUM", "NUM ", "Numeral"],
    ["PREP", "PREP ", "Preposition"],
    ["PRON", "PRON ", "Pro-Nominal"],
    ["V", "V ", "Verb"]
  ],
  // http://www.ids-mannheim.de/cosmas2/projekt/referenz/connexor/syntax.html
  "cnx/syn=" : [
    ["@ADVL", "@ADVL ", "Adverbial Head"],
    ["@AUX", "@AUX ", "Auxiliary Verb"],
    ["@CC", "@CC ", "Coordination"]
    ["@MAIN", "@MAIN ", "Main Verb"],
    ["@NH", "@NH ", "Nominal Head"],
    ["@POSTMOD", "@POSTMOD ", "Postmodifier"],
    ["@PREMARK", "@PREMARK ", "Preposed Marker"],
    ["@PREMOD", "@POSTMOD ", "Premodifier"]
  ],
  "opennlp/" : [
    ["Part-of-Speech", "p="]
  ],
  "opennlp/p=" : sttsArray,
  "xip/" : [
    ["Constituency", "c="],
    // Inactive: ["Dependency", "d="],
    ["Lemma", "l="],
    ["Part-of-Speech", "p="],
  ],
  // "xip/c=" : [],
  // Inactive: "xip/d=" : [],
  // "xip/p=" : [],
  "tt/" : [
    ["Lemma", "l="],
    ["Part-of-Speech", "p="]
  ],
  "tt/p=" : sttsArray,
  "mate/" : [
    // Inactive: "d" : ["d=", "Dependency"],
    ["Lemma", "l="],
    ["Morphology", "m="],
    ["Part-of-Speech", "p="]
  ],
  // Inactive: mate/d=
  "mate/p=" : mateSttsArray,
  "mate/m=" : [
    ["Case", "case:"],
    ["Degree", "degree:"],
    ["Gender", "gender:"],
    ["Mood", "mood:"],
    ["Number", "number:"],
    ["Person", "person:"],
    ["Tense","tense:"],
    ["No type", "<no-type> "]
  ],
  "mate/m=case:" : [
    ["acc", "acc ", "Accusative"],
    ["dat","dat ", "Dative"],
    ["gen", "gen ","Genitive"],
    ["nom","nom ", "Nominative"],
    ["*","* ", "Undefined"]
  ],
  "mate/m=degree:" : [
    ["comp","comp ", "Comparative"],
    ["pos","pos ", "Positive"],
    ["sup","sup ", "Superative"]
  ],
  "mate/m=gender:" : [
    ["fem", "fem ", "Feminium"],
    ["masc", "masc ", "Masculinum"],
    ["neut","neut ", "Neuter"],
    ["*","* ","Undefined"]
  ],
  "mate/m=mood:" : [
    ["imp","imp ", "Imperative"],
    ["ind","ind ", "Indicative"],
    ["subj","subj ", "Subjunctive"]
  ],
  "mate/m=number:" : [
    ["pl","pl ","Plural"],
    ["sg","sg ","Singular"],
    ["*","* ","Undefined"]
  ],
  "mate/m=person:" : [
    ["1","1 ", "First Person"],
    ["2","2 ", "Second Person"],
    ["3","3 ", "Third Person"]
  ],
  "mate/m=tense:" : [
    ["past","past ", "Past"],
    ["pres","pres ", "Present"]
  ]
};


/**
 * Analyze strings for prefixes
 */
var PrefixAnalyzer = {
  _regex : new RegExp(
    "(?:^|[^-_a-zA-Z0-9])" +   // Anchor
    "((?:[-_a-zA-Z0-9]+?)\/" + // Foundry
    "(?:" +
    "(?:[-_a-zA-Z0-9]+?)=" +   // Layer
    "(?:(?:[^:=\/ ]+?):)?" +  // Key
    ")?" +
    ")$"),
  analyze : function (text) {
    if (!this._regex.exec(text))
      return undefined;
    return RegExp.$1
  }
};

function codeFromEvent (e) {
  if ((e.charCode) && (e.keyCode==0))
    return e.charCode
  return e.keyCode;
};


/*
 * Event handling after a key is down
 * for arrows!
 */
function updateKeyDown (that, e) {
  var code = codeFromEvent(e);
  var menu = that.menu();

  /*
   * keyCodes:
   * - Down  = 40
   * - Esc   = 27
   * - Up    = 38
   * - Enter = 13
   * - shift = 16
   * for characters use e.key
   */
  switch (code) {
  case 27: // 'Esc'
    // Hide menu
    menu.hide();
    break;
  case 40: // 'Down'
    e.halt(); // No event propagation

    // Menu is not active
    if (!menu.active) {
      that.popUp()
    }
    // Menu is active
    else {
      that.removePrefix();
      menu.next();
    };

    break;
  case 38: // "Up"
    if (!menu.active)
      break;
    e.halt(); // No event propagation
    that.removePrefix();
    menu.prev();
    break;
  case 13: // "Enter"
    if (!menu.active)
      break;
    e.halt(); // No event propagation
    that.insertText(menu.getActiveItem().getAction());
    that.removePrefix();
    
    // Remove menu
    menu.hide();

    // Fill this with the correct value
    // Todo: This is redundant with click function
    var show;
    if ((show = that.analyzeContext()) != "-") {
      menu.show(show);
      menu.update(
        e.target.getBoundingClientRect().right
      );
    };
    
    break;
  default:
    if (!menu.active)
      return;

    // Surpress propagation in firefox
    if (e.key !== undefined && e.key.length != 1) {
      menu.hide();
    };
  };
};

/**
 * Event handling after a key pressed
 * for characters!
 */
function updateKeyPress (that, e) {
  var character = String.fromCharCode(codeFromEvent(e));
  var menu = that.menu();

  if (!menu.active)
    return;

  e.halt(); // No event propagation
    
  // Try to identify prefix
  if (menu.skipToPrefix(character))
    return;

  // Prefix not found
  that.insertPrefix();
  menu.hide();
};



// new hint object
var Hint = {
  _search   : undefined,   // Return the search element
  _mirror   : undefined,   // Return the mirror element
  _menu     : undefined,
  _analyzer : undefined,
  firstTry  : true,
  menu : function () {
    // In case this wasn't defined yet
    if (this._menu === undefined) {
      this._menu = Object.create(Menu).init();
      this._mirror.appendChild(this._menu.getElement());
    };
    return this._menu;
  },

  // Initialize the object
  init : function () {
    this._search = document.getElementById("q-field");
    this._mirror = document.createElement("div");
    this._mirror.setAttribute("id", "searchMirror");
    this._mirror.appendChild(document.createElement("span"));
    document.getElementsByTagName("body")[0].appendChild(this._mirror);

    this._analyzer = Object.create(PrefixAnalyzer);

    // Update positional information, in case the windows size changes    
    var that = this;
    window.onresize = function () { that.reposition() };

    // Add event listener for key pressed down
    this._search.addEventListener(
      "keypress",
      function (e) {
	updateKeyPress(that, e)
      },
      false
    );

    // Add event listener for key pressed down
    this._search.addEventListener(
      "keydown",
      function (e) {
	updateKeyDown(that, e)
      },
      false
    );

    // Reposition the mirror
    this.reposition();

    // Return object for chaining
    return this;
  },

  // Popup method
  popUp : function () {
    if (this.active)
      return;

    // Reposition hint list on first try
    if (this.firstTry)
      this.reposition().firstTry = false;

    // Update view
    this.update();

    // Fill this with the correct value
    if (this.menu().show(this.analyzeContext())) {
      this.update(
        this._search.getBoundingClientRect().right
      );
    }
    else {
      this.menu().hide();
    };

    this._search.focus();
  },

  // Reposition the mirror object
  reposition : function () {

    // Update style properties
    var searchRect  = this._search.getBoundingClientRect();
    var searchStyle = window.getComputedStyle(this._search, null);
    var mStyle = this._mirror.style;
    mStyle.left = searchRect.left + "px";
    mStyle.top  = searchRect.bottom + "px";
    mStyle.borderLeftColor = "transparent";
    mStyle.height          = "1px";
    mStyle.paddingLeft     = searchStyle.getPropertyValue("padding-left");
    mStyle.marginLeft      = searchStyle.getPropertyValue("margin-left");
    mStyle.borderLeftWidth = searchStyle.getPropertyValue("border-left-width");
    mStyle.borderLeftStyle = searchStyle.getPropertyValue("border-left-style");
    mStyle.fontSize        = searchStyle.getPropertyValue("font-size");
    mStyle.fontFamily      = searchStyle.getPropertyValue("font-family");
    return this;
  },

  // Reposition the menu object
  update : function () {
    var s = this._search;
    var start = s.selectionStart;
    this._mirror.firstChild.textContent = s.value.substring(0, start);
  },

  analyzeContext : function () {
    var context = this._splitInputText()[0];
    if (context === undefined || context.length === 0)
      return "-";
    context = this._analyzer.analyze(context);
    if (context === undefined || context.length === 0)
      return "-";

    if (!hintArray[context])
      return "-";

    return context;
  },

  _splitInputText : function () {
    var s = this._search;
    var value = s.value;
    var start = s.selectionStart;
    var begin = value.substring(0, start);
    var end   = value.substring(start, value.length);
    return new Array(begin, end);
  },

  // Insert text at the current cursor position
  insertText : function (text) {
    var s = this._search;
    var splitText = this._splitInputText();
    s.value          = splitText[0] + text + splitText[1];
    s.selectionStart = (splitText[0] + text).length
    s.selectionEnd   = s.selectionStart;
    this._mirror.firstChild.textContent = splitText[0] + text;
  },

  // Remove stored prefix 
  removePrefix : function () {
    this.menu()._prefix = undefined;
  },

  // Insert stored prefix at current cursor position
  insertPrefix : function () {
    if (this.menu()._prefix === undefined)
      return;
    this.insertText(this.menu()._prefix);
  }
};


/**
* Menu list
*/
var Menu = {
  active     : false,
  _element   : undefined,
  _position  : 0,   // Position of menu item
  _offset    : 0,   // Visual offset for chosen highlight
  _size      : 8,  // Number of items to be shown
  _items     : [],  // Items for menu
  _name      : undefined,
  _prefix    : undefined,
  getElement : function () {
    return this._element;
  },
  init : function () {
    this._element = document.createElement("ul");

    // Add onclick event
    this._element.addEventListener("click", chooseHint, false);

    this._element.style.opacity = 0;
    this.active = false;
    this._setDefaults();
    return this;
  },
  update : function (searchRightPosition) {
    var infoRightPosition = this._element.getBoundingClientRect().right;
    if (infoRightPosition > searchRightPosition) {
      this._element.style.marginLeft = '-' + (infoRightPosition - searchRightPosition) + 'px';
    };
    return this;
  },
  next : function () {
    if (!this.active)
      return;
    this._clearView();
    this._position++;

    // In case the list is bigger than the view
    if (this._items.length > this._size) {
      if (this._position >= this._items.length) {
	// Roll to top
	this._offset = 0;
	this._position = 0;
	this._showItems(0);
      }
      else if (this._position >= (this._size + this._offset)) {
	// Roll down
	this._element.removeChild(this._element.firstChild);
	this._offset++;
	this._element.appendChild(this.getItem(this._position).getElement());
      };
    }
    else if (this._position >= this._items.length) {
      this._position = 0;
    };
    this._updateView();
  },
  prev : function () {
    if (!this.active)
      return;
    this._clearView();
    this._position--;

    // In case the list is bigger than the view
    if (this._items.length > this._size) {
      if (this._position < 0) {
	// roll to bottom
	this._setToLast();
	this._offset = (this._position - this._size) + 1;
	this._showLastItems();
      }
      else if (this._position < this._offset) {
	// roll up
	this._element.removeChild(this._element.lastChild);
	this._offset--;
	this._element.insertBefore(
	  this.getItem(this._position).getElement(),
	  this._element.firstChild
	);
      };
    }
    else if (this._position < 0) {
      this._setToLast();
    };
    this._updateView();
  },
  skipToPrefix : function (prefix) {
    if (this._prefix === undefined)
      this._prefix = prefix.toLocaleLowerCase();
    else
      this._prefix += prefix.toLocaleLowerCase();

    var pos = 0;
    var found = false;
    var good = -1;
    var test;
    for (; pos < this._items.length; pos++) {
      if ((test = this.getItem(pos).getLCName().indexOf(this._prefix)) != -1) {
	if (test == 0) {
	  found = true;
	  break;
	};
	good = pos;
      };
    };

    // Perfect prefix
    if (found)
      return this.skipToPos(pos);
    // At least infix
    else if (good != -1)
      return this.skipToPos(good);
    // No
    return false;
  },
  skipToPos : function (index) {
    if (!this.active)
      return false;
    if (index < 0 || index >= this._items.length)
      return false;

    this._clearView();
    this._position = index;

    if (index < this._offset || index >= (this._offset + this._size)) {

      // Index is in the final frame
      if (index >= (this._items.length - this._size)) {
	this._offset = this._items.length - this._size;
	this._showLastItems();
      }

      // Index is in the final frame
      else {
	this._offset = index;
	this._showItems(index);
      };
    };

    // Activate new position
    this._updateView();
    return true;
  },
  show : function (name) {
    // The element is already given
    if (this._name != name) {

      // Todo: store hints in hash

      // Delete items
      this._items.length = 0;

      var items = hintArray[name];

      // Hints not found
      if (items === undefined)
	return undefined;

      var i;
      for (i in items) {
	var item = Object.create(MenuItem).init(items[i]);
	this._items.push(item);
      };

      // Add classes for rolling menus
      this.getItem(0).getElement().classList.add("no-more");
      this.getItem(i).getElement().classList.add("no-more");

      this._name = name;
    };
    this._showItems(0);
    this._element.style.opacity = 1;
    this._setDefaults();
    this.active = true;
    this._updateView();
    return true;
  },
  hide : function () {
    this._element.style.opacity = 0;
    if (this.active)
      this.getActiveItem().deactivate();
    this._setDefaults();
    this.active = false;
  },
  getActiveItem : function () {
    return this._items[this._position];
  },
  getItem : function (index) {
    return this._items[index];
  },
  getPrefix : function () {
    return this._prefix;
  },
  _setDefaults : function () {
    this._offset = 0;
    this._position = 0;
    this._prefix = undefined;
  },
  // Remove all visible list items
  _deleteMenu : function () {
    var child;
    while (child = this._element.firstChild)
      this._element.removeChild(child);
  },
  _clearView : function () {
    var active = this.getActiveItem();
    if (active !== undefined)
      active.deactivate();
  },
  _updateView : function () {
    var active = this.getActiveItem();
    if (active !== undefined)
      active.activate();
  },

  // Make all list items visible starting at a certain offset
  _showItems : function (offset) {
    this._deleteMenu();
    for (var i = offset; i < this._size + offset; i++) {
      if (i >= this._items.length)
	break;
      this._element.appendChild(
	this._items[i].getElement()
      )
    };
  },

  // Make all final list items visible
  _showLastItems : function () {
    this._deleteMenu();
    for (var i = (this._items.length - 1); i >= (this._items.length - this._size); i--) {
      if (i < 0)
	break;
      if (!this._element.firstChild)
	this._element.appendChild(this._items[i].getElement());
      else
	this._element.insertBefore(
	  this._items[i].getElement(),
	  this._element.firstChild
	);
    };
  },
  _setToLast : function () {
    this._position = this._items.length - 1;
  }
};

function chooseHint (e) {
/*
  var element = e.target;
  while (element.nodeName == "STRONG" || element.nodeName == "SPAN") {
    element = element.parentNode;
  };
  if (element === undefined || element.nodeName != "LI")
    return;
*/

  var action = this.getAttribute('data-action');
  hint.insertText(action);
  var menu = hint.menu();
  menu.hide();

  // Fill this with the correct value
  var show;
  if ((show = hint.analyzeContext()) != "-") {
    menu.show(show);
    menu.update(
      hint._search.getBoundingClientRect().right
    );
  };

  hint._search.focus();
};

var MenuItem = {
  _name    : undefined,
  _lcname  : undefined,
  _desc    : undefined,
  _element : undefined,
  _action  : "",
  activate : function () {
    this._element.classList.add("active");
  },
  deactivate : function () {
    this._element.classList.remove("active");
  },
  // Initialize this item
  init : function (param) {
    this._name = param[0];
    this._action = param[1];
    this._lcname = this._name.toLocaleLowerCase();

    if (param.length > 2) {
      this._desc = param[2];
      this._lcname += " " + this._desc.toLocaleLowerCase();
    };

    return this;
  },

  // Created element of this item
  getElement : function () {
    if (this._element !== undefined)
      return this._element;

    var li = document.createElement("li");

    li.setAttribute("data-action", this._action);

    var name = document.createElement("strong");

    name.appendChild(document.createTextNode(this._name));
    li.appendChild(name);
    if (this._desc !== undefined) {
      var desc = document.createElement("span");
      desc.appendChild(document.createTextNode(this._desc));
      li.appendChild(desc);
    };
    this._element = li;
    return this._element;
  },

  // Name of this item
  getName : function () {
    return this._name;
  },

  getLCName : function () {
    return this._lcname;
  },

  // Description of this item
  getDesc : function () {
    return this._desc;
  },


  getAction : function () {
    return this._action;
  }
};

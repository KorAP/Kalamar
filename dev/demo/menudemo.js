requirejs.config({
  baseUrl: '../js/src'
});

require(['menu','menu/item', 'menu/prefix', 'menu/lengthField', 'selectMenu', 'hint/item', 'hint/lengthField', 'multimenu'], function (menuClass, itemClass, prefixClass, lengthFieldClass, selectMenuClass, hintItemClass, hintLengthField, multiMenuClass) {

  /**
   * Create own menu item class.
   */
  var OwnMenuItemClass = {
    create : function (params) {
      return Object.create(itemClass).upgradeTo(this)._init(params);
    },

    // content function
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

    // initialize item
    _init : function (params) {
      if (params[0] === undefined)
	throw new Error("Missing parameters");

      this._name = params[0];
      this._content = document.createTextNode(this._name);
      this._lcField = ' ' + this.content().textContent.toLowerCase();
      return this;
    }
  };

  /**
   * Create own prefix class.
   */
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

  /**
   * Create own menu class.
   */
  var OwnMenu = {
    create : function (list) {
      var obj = Object.create(menuClass)
      .upgradeTo(this)
      ._init(list, {
	itemClass : OwnMenuItemClass,
	prefixClass : OwnPrefixClass,
	lengthFieldClass : lengthFieldClass
      });
      obj._firstActive = true;
      return obj;
    }
  };

  var menu = OwnMenu.create([
    ['Titel', 'title', 'string'],
    ['Untertitel', 'subTitle', 'string'],
    ['Beschreibung', 'desc', 'string'],
    ['Veröffentlichungsdatum', 'pubDate', 'date'],
    ['Länge', 'length', 'integer'],
    ['Autor', 'author', 'string'],
    ['Genre', 'genre', 'string'],
    ['corpusID', 'corpusID', 'string'],
    ['docID', 'docID', 'string'],
    ['textID', 'textID', 'string']
  ]);

  var largeMenu = menuClass.create([
    // http://www.ids-mannheim.de/cosmas2/projekt/referenz/stts/morph.html
    // http://nachhalt.sfb632.uni-potsdam.de/owl-docu/stts.html
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
    ["VAIMP","VAIMP ", "Auxiliary Finite Imperative Verb"],
    ["VAINF","VAINF ", "Auxiliary Infinite Verb"],
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
  ], { 'itemClass' : hintItemClass, 'lengthField' : hintLengthField });

  var multiMenu = multiMenuClass.create([
    ["textSigle", "textSigle"],
    ["author", "author"]
  ]);

  
  document.getElementById('menu').appendChild(menu.element());
  document.getElementById('largemenu').appendChild(largeMenu.element());
  document.getElementById('multimenu').appendChild(multiMenu.element());

  menu.limit(3).show(3);
  menu.focus();

  selectMenuClass.create(document.getElementById('choose-ql')).limit(5); // .show();
  largeMenu.limit(8).show(3);
});

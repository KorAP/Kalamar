import '../../../../scss/kalamar.scss';
import containerMenuClass from '../containermenu.js';
import itemClass from '../../menu/menu/item.js';
import prefixClass from '../../menu/menu/prefix.js';
import lengthFieldClass from '../../menu/menu/lengthField.js';
import containerClass from '../../container/container.js';
import containerItemClass from '../../container/containeritem.js';

  /**
   * Create own menu item class.
   */
  class OwnMenuItemClass extends itemClass {
    constructor (params) {
      super();

      if (params === undefined || params[0] === undefined)
        throw new Error("Missing parameters");

      this._name = params[0];
      this._content = document.createTextNode(this._name);
      this._lcField = ' ' + this.content().textContent.toLowerCase();
      this.newLimit = 0;
    }

    // content function
    content (content) {
      if (arguments.length === 1) {
        this._content = content;
      };
      return this._content;
    }

    // enter or click
    onclick () {
      console.log(this._name);
    }

    // right arrow
    further () {
      console.log("Further: " + this._name);
    }
  };


  /**
   * Create own conainerItem class.
   */
  class OwnContainerItemClass extends containerItemClass {
    constructor () {
      super();
      this.value = "";
      this.defaultTextValue = "CI";
    }
    add (letter) {
      this.value += letter;
    }
    clear () {
      this.value = "";
    }
    further () {
      this.value = this.value + this.value;
    }
    onclick () {
      console.log('ContainerItem ' + this.value);
      console.log(this.newLimit);
      this._menu.limit(this.newLimit);
      this._menu.show();
    }
  };

  // List of items. The container merges these properties into
  // new OwnContainerItemClass instances (see Container.addItem()).
  var ExampleItemList = [
    { value : "Example Item 1", newLimit : 3 },
    { newLimit : 4 },
    {
      value : "Remove the Prefix Test",
      newLimit : 5,
      onclick : function (e) {
        this._menu.container().addItem({defaultTextValue: "new", newLimit:4 })
        this.initContent("I created a new item");
        this._menu.container().removeItemByIndex(0);
      }
    }
  ];

  //Own container class.
  class OwnContainerClass extends containerClass {
    //Dont know what you would want to add though
    // You could add the containerItemClass parameter here *if* you really wanted to.
  };

  /**
   * Create own menu class.
   */
  class OwnMenu extends containerMenuClass {
    constructor (list) {
      const params = {
        itemClass : OwnMenuItemClass,
        prefixClass : prefixClass,
        lengthFieldClass : lengthFieldClass,
        containerClass : OwnContainerClass,
        containerItemClass : OwnContainerItemClass
      };
      super(list, params, ExampleItemList);
      this._firstActive = true;
    }
  };

  var list = [
    ["Constituency"],
    ["Lemma"],
    ["Morphology"],
    ["Part-of-Speech"],
    ["Syntax"]
  ];

  /**
  var list = [
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
  ];
  */

  var menu = new OwnMenu(list);

  /** 
  var largeMenu = new OwnMenu([
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
  ]);
  */
  document.getElementById('menu').appendChild(menu.element());
  //document.getElementById('largemenu').appendChild(largeMenu.element());

  menu.container().addItem({ value : "Dynamically added", defaultTextValue : "dynamic", newLimit : 5})

  menu.limit(3).show(3);
  menu.focus();
  
  //largeMenu.limit(8).show(3);

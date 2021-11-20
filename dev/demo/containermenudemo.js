requirejs.config({
  baseUrl: '../js/src'
});
          // here alwaysmenu instead of normal menu, then + alwaysEntry
require(['containermenu','menu/item', 'menu/prefix', 'menu/lengthField', 'selectMenu', 'hint/item', 'hint/lengthField',
'container/container', 'container/containeritem'
  ],
function (containerMenuClass, itemClass, prefixClass, lengthFieldClass, selectMenuClass, hintItemClass, hintLengthField, containerClass, containerItemClass) {

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
    onclick : function (event) {
      console.log(this._name);
      event.halt();
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
      this._i=0;
      return this;
    }
  };


  /**
   * Create own conainerItem class.
   */
  var OwnContainerItemClass = {
    create : function () {
      var obj = containerItemClass.create()
        .upgradeTo(this);
        //._init();
      obj.value="";
      obj.defaultTextValue = "CI";
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
    isSelectable : function () {
      return (this.value !== "");
    },
    chop : function () {
      console.log("chop");
      console.log(this.content(this.value));
    },
    onclick : function () {
      console.log('ContainerItem ' + this.value);
      console.log(this._i);
      this._menu.limit(this._i);
      this._menu.show();
    },
    
    //This becomes unnecessary thanks to the content function. Instead we only need the defaultTextValue attribute.
    /**
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
     */
  };
  //List of items.
  var ExampleItemList = new Array;
  ExampleItemList.push(OwnContainerItemClass.create());
  ExampleItemList.push(OwnContainerItemClass.create());
  ExampleItemList.push(OwnContainerItemClass.create());
  ExampleItemList[0].value = "Example Item 1";
  ExampleItemList[0]._i = 3;
  ExampleItemList[1]._i = 4;
  ExampleItemList[2].value = "Remove the Prefix Test";
  ExampleItemList[2]._i=5;
  ExampleItemList[2].onclick = function (e) {
    this._menu.container().addItem({defaultTextValue: "new", _i:4 })
    this.content("I created a new item");
    this._menu.container().removeItemByIndex(0);
  };

  //Own container class.
  var OwnContainerClass = {
    create : function (listOfContainerItems, params) {
      console.log(containerClass);
      return containerClass.create(listOfContainerItems, params)
        .upgradeTo(this);
    }
    //Dont know what you would want to add though
    // You could add the containerItemClass parameter here *if* you really wanted to.
  };

  /**
   * Create own menu class.
   */
  
  var OwnMenu = {
    create : function (list) {
      const params = {
        itemClass : OwnMenuItemClass,
        prefixClass : prefixClass,
        lengthFieldClass : lengthFieldClass,
        containerClass : OwnContainerClass,
        containerItemClass : OwnContainerItemClass
      };
      console.log("Am now in OwnMenu create",containerMenuClass);
      console.log(ExampleItemList); // we learn, that it definetly has all the functions defined in alwaysmenu.js
      var obj = containerMenuClass.create(list,params,ExampleItemList)
          .upgradeTo(this);
          //._init(list, params);
      obj._firstActive = true;
      console.log("OwnMenu Element",obj._el);
      return obj;
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

  var menu = OwnMenu.create(list);

  /** 
  var largeMenu = OwnMenu.create([
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

  menu.container().addItem({ value : "Dynamically added", defaultTextValue : "dynamic", _i : 5})

  menu.limit(3).show(3);
  menu.focus();
  
  //largeMenu.limit(8).show(3);
});

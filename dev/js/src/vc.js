/**
 * Create virtual corpora with a visual user interface. This resembles the
 * corpus/collection type objects of a KoralQuery "collection"/"corpus" object.
 * 
 * KoralQuery v0.3 is expected.
 * 
 * @author Nils Diewald
 */
/*
 * This replaces a previous version written by Mengfei Zhou
 */

/*
  TODO: Disable "and" or "or" in case it's followed 
        by an unspecified document
  TODO: Add "and"-method to root to add further constraints 
        based on match-input (like clicking on a pubDate timestamp in a match) 
  TODO: Implement "persistence"-Option, injecting the current creation 
        date stamp 
  TODO: Implement vec-Type for document-id vectors like docID in [1,2,3,4 ...]

  Error codes: 
  701: "JSON-LD group has no @type attribute" 
  704: "Operation needs operand list" 
  802: "Match type is not supported by value type" 
  804: "Unknown value type" 
  805: "Value is invalid" 
  806: "Value is not a valid date string" 
  807: "Value is not a valid regular expression" 
  810: "Unknown document group operation" (like 711) 
  811: "Document group expects operation" (like 703) 
  812: "Operand not supported in document group" (like 744) 
  813: "Collection type is not supported" (like 713) 
  814: "Unknown rewrite operation" 
  815: "Rewrite expects source"
  
  Localization strings: 
  KorAP.Locale = {
    EMPTY : '...', 
    AND : 'and', 
    OR : 'or',
   DELETE : 'x' }
   
   and various field names with the prefix 'VC_'
 */
"use strict";

define([
  'vc/unspecified',
  'vc/doc',
  'vc/docgroup',
  'vc/docgroupref',
  'vc/menu',
  'vc/statistic',
  'datepicker',
  'buttongroup',
  'panel/vc',
  'view/vc/corpstatv',
  'buttongroup',
  'util'
], function(
  unspecDocClass,
  docClass,
  docGroupClass,
  docGroupRefClass,
  menuClass,
  statClass,
  dpClass,
  buttonGrClass,
  vcPanelClass,
  corpStatVClass,
  buttonGroupClass) {

  KorAP._validUnspecMatchRE = new RegExp(
    "^(?:eq|ne|contains(?:not)?|excludes)$");
  KorAP._validStringMatchRE = new RegExp("^(?:eq|ne)$");
  KorAP._validTextMatchRE = KorAP._validUnspecMatchRE;
  KorAP._validTextOnlyMatchRE = new RegExp(
    "^(?:contains(?:not)?|excludes)$");
  KorAP._overrideStyles = false;
  // KorAP._validDateMatchRE is defined in datepicker.js!

  const loc = KorAP.Locale;
  loc.SHOW_STAT        = loc.SHOW_STAT        || 'Statistics';
  loc.VERB_SHOWSTAT    = loc.VERB_SHOWSTAT    || 'Corpus Statistics';
  loc.VC_allCorpora    = loc.VC_allCorpora    || 'all corpora';
  loc.VC_oneCollection = loc.VC_oneCollection || 'a virtual corpus';
  loc.MINIMIZE         = loc.MINIMIZE         || 'Minimize';

  KorAP._vcKeyMenu = undefined;
  KorAP._vcDatePicker = dpClass.create();

  // Create match menus ....
  KorAP._vcMatchopMenu = {
    'string' : menuClass.create([
      [ 'eq', null ],
      [ 'ne', null ]
    ]),
    'text' : menuClass.create([
      [ 'eq', null ], // Requires exact match
      [ 'ne', null ],
      [ 'contains', null ], // Requires token sequence match
      [ 'containsnot', null ]
    ]),
    'date' : menuClass.create([
      [ 'eq', null ],
      [ 'ne', null ],
      [ 'geq', null ],
      [ 'leq', null ]
    ]),
    'regex' : menuClass.create([
      [ 'eq', null ],
      [ 'ne', null ]
    ])
  };


  /**
   * Virtual corpus
   */
  return {

    /**
     * The JSON-LD type of the virtual corpus
     */
    ldType : function() {
      return null;
    },


    // Initialize virtual corpus
    _init : function(keyList) {

      // Inject localized css styles
      if (!KorAP._overrideStyles) {

        const sheet = KorAP.newStyleSheet();

        // Add css rule for OR operations
        sheet.insertRule('.vc .docGroup[data-operation=or] > .doc::before,'
                         + '.vc .docGroup[data-operation=or] > .docGroup::before '
                         + '{ content: "' + loc.OR + '" }', 0);

        // Add css rule for AND operations
        sheet.insertRule(
          '.vc .docGroup[data-operation=and] > .doc::before,'
            + '.vc .docGroup[data-operation=and] > .docGroup::before '
            + '{ content: "' + loc.AND + '" }', 1);

        KorAP._overrideStyles = true;
      };

      let l;
      if (keyList) {
        l = keyList.slice();
        l.unshift(['referTo', 'ref']);
      }
      else {
        l = [['referTo', 'ref']];
      }
      
      // Create key menu
      KorAP._vcKeyMenu = menuClass.create(l);
      KorAP._vcKeyMenu.limit(6);

      return this;
    },


    /**
     * Create a new virtual corpus
     */
    create : function (keyList) {
      const obj = Object.create(this)._init(keyList);
      obj._root = unspecDocClass.create(obj);
      return obj;
    },


    /**
     * Create and render a new virtual corpus based on a KoralQuery
     * corpus document
     */
    fromJson : function(json) {

      let obj;
      
      if (json !== undefined) {

        // Parse root document
        if (json['@type'] == 'koral:doc') {
          obj = docClass.create(this, json);
        }

        // parse root group
        else if (json['@type'] == 'koral:docGroup') {
          obj = docGroupClass.create(this, json);
        }

        // parse root reference
        else if (json['@type'] == 'koral:docGroupRef') {
          obj = docGroupRefClass.create(this, json);
        }
        
        // Unknown collection type
        else {
          KorAP.log(813, "Collection type is not supported");
          return;
        };
      }

      else {
        // Add unspecified object
        obj = unspecDocClass.create(this);
      };

      // Init element and update
      this.root(obj);   
 
      return this;
    },


    // Check if the virtual corpus contains a rerite
    wasRewritten : function (obj) {

      if (arguments.length !== 1) {
        obj = this._root;
      };

      // Check for rewrite
      if (obj.rewrites() && obj.rewrites().length() > 0) {
        return true;
      }

      // Check recursively
      else if (obj.ldType() === 'docGroup') {

        // If there was a rewritten object
        if (obj.operands().find(op => this.wasRewritten(op)) !== undefined) {
          return true;
        };
      };
      
      return false;
    },

    
    /**
     * Clean the virtual document to unspecified doc.
     */
    clean : function() {
      const t = this;
      if (t._root.ldType() !== "non") {
        t._root.destroy();
        t.root(unspecDocClass.create(t));
      };

      // update for graying corpus statistic by deleting the first line of the vc builder
      t.update();
      return t;
    },


    /**
     * Get or set the root object of the virtual corpus
     */
    root : function(obj) {
      if (arguments.length === 1) {
        const e = this.builder();
        
        if (e.firstChild !== null) {

          // Object not yet set
          if (e.firstChild !== obj.element()) {
            e.replaceChild(obj.element(), e.firstChild);
          };
        }

        // Append root element
        else {
          e.appendChild(obj.element());
        };

        // Update parent child relations
        this._root = obj;
        obj.parent(this);

        this.update();
      };

      return this._root;
    },


    /**
     * Get the wrapper element associated with the vc
     */
    builder : function () {
      const t = this;

      // Initialize if necessary
      if (t._builder !== undefined)
        return t._builder;

      t.element();
      return t._builder;
    },
    

    /**
     * Get the element associated with the virtual corpus
     */
    element : function() {
      const t = this;
      let e = t._element;

      if (e !== undefined)
        return e;


      e = t._element = document.createElement('div');
      e.classList.add('vc');


      t._builder = e.addE('div');
      t._builder.setAttribute('class', 'builder');

      const btn = buttonGroupClass.create(
        ['action','button-view']
      );

      btn.add(loc.MINIMIZE, {'cls':['button-icon','minimize']}, function () {
        this.minimize();
      }.bind(t));

      e.appendChild(btn.element());
      
      // Initialize root
      t._builder.appendChild(t._root.element());      
      
      // Add panel to display corpus statistic, ...
      t.addVcInfPanel();
      
      //Adds EventListener for corpus changes
      t._element.addEventListener('vcChange', function (e) {
        this.checkStatActive(e.detail);
      }.bind(t), false);
      
      return e;
    },


    /**
     * Check, if the VC is open
     */
    isOpen : function () {
      if (!this._element)
        return false;
      return this._element.classList.contains('active');
    },
    

    /**
     * Open the VC view
     */
    open : function () {
      this.element().classList.add('active');
      if (this.onOpen)
        this.onOpen();
    },


    /**
     * Minimize the VC view
     */
    minimize : function () {
      this.element().classList.remove('active');
      if (this.onMinimize)
        this.onMinimize();
    },

    
    /**
     * Update the whole object based on the underlying data structure
     */    
    update : function() {
      this._root.update();
      if (KorAP.vc) {
        this.element().dispatchEvent(
          new CustomEvent('vcChange', {'detail':this})
        );
      };
      return this;
    },


    /**
     * Make the vc persistant by injecting the current timestamp as a
     * creation date limit criterion.
     * THIS IS CURRENTLY NOT USED
     */
    /*
    makePersistant : function() {
      // this.root().wrapOnRoot('and');
      var todayStr = KorAP._vcDatePicker.today();
      var doc = docClass.create();
      var root = this.root();

      if (root.ldType() === 'docGroup' && root.operation === 'and') {
        root.append(cond);
      } else {
        root.wrapOnRoot('and');
        root.append(doc);
      };

      doc.key("creationDate");
      doc.type("date");
      doc.matchop("leq");
      doc.value(todayStr);

      // { "@type" : "koral:doc", "key" : "creationDate", "type" :
      // "type:date", "match" : "match:leq", "value" : todayStr }
      // this.root().append(cond);
      this.update();
    },
    */


    // Get the reference name
    getName : function () {
      if (this._root.ldType() === 'non') {
        return loc.VC_allCorpora;
      }
      else if (this._root.ldType() === 'docGroupRef') {
        return this._root.ref();
      }
      else {
        return loc.VC_oneCollection;
      }
    },


    // Add "and" constraint to VC
    addRequired : function (doc) {
      const root = this.root();
      const ldType = root.ldType();
      const parent = root.parent();

      if (ldType === 'non') {
        parent.root(doc);
      }

      // root is doc
      else if (
        ldType === 'doc' ||
          ldType === 'docGroupRef' ||
          (ldType === 'docGroup' &&
           root.operation() === 'or'
          )) {
        const group = require('vc/docgroup').create(
          parent
        );
        group.operation("and");
        group.append(root);
        group.append(doc);
        group.element(); // Init (seems to be necessary)
        parent.root(group);
      }
      
      // root is a docGroup
      // and is already an 'and'-Group
      else if (ldType === 'docGroup') {
        root.append(doc);
      }

      // Unknown
      else {
        console.log("Unknown root object");
      };

      // Init element and update
      this.update();
    },
    

    /**
     * Get the generated json string
     */
    toJson : function () {
      return this._root.toJson();
    },


    /**
     * Get the generated query string
     */
    toQuery : function () {
      return this._root.toQuery();
    },

    
    /**
     * Add panel to display virtual corpus information
     */
    addVcInfPanel : function () {
      // Create panel  
      this.panel = vcPanelClass.create(this); 
      this._element.addE('div').appendChild(this.panel.element());
      
    },
    
    /**
     * Checks if corpus statistic has to be disabled,
     * and to be updated after clicking at the "reload-button"
     */
    checkStatActive : function (){
      if (this.panel !== undefined && this.panel.statView !== undefined){
        this.panel.statView.checkStatActive();
      };
    }
  };
});

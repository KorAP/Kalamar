/**
 * Create virtual collections with a visual user interface. This resembles the
 * collection type objects of a KoralQuery "collection" object.
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

define([
  'vc/unspecified',
  'vc/doc',
  'vc/docgroup',
  'vc/docgroupref',
  'vc/menu',
  'vc/statistic',
  'datepicker',
  'buttongroup',
  'panel',
  'view/corpstatv',
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
  panelClass,
  corpStatVClass,
  buttonGroupClass) {
  "use strict";

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
   * Virtual Collection
   */
  return {

    /**
     * The JSON-LD type of the virtual collection
     */
    ldType : function() {
      return null;
    },

    // Initialize virtual collection
    _init : function(keyList) {

      // Inject localized css styles
      if (!KorAP._overrideStyles) {
        var sheet = KorAP.newStyleSheet();

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

      var l;
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
     * Create a new virtual collection.
     */
    create : function(keyList) {
      var obj = Object.create(this)._init(keyList);
      obj._root = unspecDocClass.create(obj);
      return obj;
    },


    /**
     * Create and render a new virtual collection based on a KoralQuery
     * collection document
     */
    fromJson : function(json) {
      if (json !== undefined) {
        // Parse root document
        if (json['@type'] == 'koral:doc') {
          this._root = docClass.create(this, json);
        }
        // parse root group
        else if (json['@type'] == 'koral:docGroup') {
          this._root = docGroupClass.create(this, json);
        }

        // parse root reference
        else if (json['@type'] == 'koral:docGroupRef') {
          this._root = docGroupRefClass.create(this, json);
        }
        
        // Unknown collection type
        else {
          KorAP.log(813, "Collection type is not supported");
          return;
        };
      }

      else {
        // Add unspecified object
        this._root = unspecDocClass.create(this);
      };

      // Init element and update
      this.update();

      return this;
    },


    // Check if the virtual corpus contains a rerite
    wasRewritten : function (obj) {

      var obj;
      if (arguments.length === 1) {
        obj = arguments[0];
      }
      else {
        obj = this._root;
      };

      // Check for rewrite
      if (obj.rewrites() && obj.rewrites().length() > 0) {
        return true;
      }

      // Check recursively
      else if (obj.ldType() === 'docGroup') {
        for (var i in obj.operands()) {
          if (this.wasRewritten(obj.getOperand(i))) {
            return true;
          }
        };
      };

      return false;
    },

    
    /**
     * Clean the virtual document to uspecified doc.
     */
    clean : function() {
      if (this._root.ldType() !== "non") {
        this._root.destroy();
        this.root(unspecDocClass.create(this));
      };
      return this;
    },

    /**
     * Get or set the root object of the virtual collection.
     */
    root : function(obj) {
      if (arguments.length === 1) {
        var e = this.builder();

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

      // Initialize if necessary
      if (this._builder !== undefined)
        return this._builder;

      this.element();
      return this._builder;
    },
    
    /**
     * Get the element associated with the virtual corpus
     */
    element : function() {
      if (this._element !== undefined) {
        return this._element;
      };

      this._element = document.createElement('div');
      this._element.classList.add('vc');


      this._builder = this._element.addE('div');
      this._builder.setAttribute('class', 'builder');

      var btn = buttonGroupClass.create(
        ['action','button-view']
      );
      var that = this;
      btn.add(loc.MINIMIZE, ['button-icon','minimize'], function () {
        that.minimize();
      });
      this._element.appendChild(btn.element());
      
      

      // Initialize root
      this._builder.appendChild(this._root.element());      
      
      // Add panel to display corpus statistic, ...
      this.addVcInfPanel();
      
      return this._element;
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
      return this;
    },

    /**
     * Make the vc persistant by injecting the current timestamp as a
     * creation date limit criterion.
     * THIS IS CURRENTLY NOT USED
     */
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

      /*
       * { "@type" : "koral:doc", "key" : "creationDate", "type" :
       * "type:date", "match" : "match:leq", "value" : todayStr }
       * this.root().append(cond);
       */
      this.update();
    },


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

    
    /**
     * Get the generated json string
     */
    toJson : function() {
      return this._root.toJson();
    },

    /**
     * Get the generated query string
     */
    toQuery : function() {
      return this._root.toQuery();
    },


    /*
     * Add panel to display virtual corpus information
     */
    addVcInfPanel : function() {

      var dv = this._element.addE('div');
      var panel = panelClass.create([ 'vcinfo' ]);
      dv.appendChild(panel.element());
      
      var that = this;
      var actions = panel.actions;
      var statView;
      
      actions.add(loc.SHOW_STAT, [ 'statistic' ], function() {
        if (statView === undefined || !statView.shown()) {
          statView = corpStatVClass.create(that);
          panel.add(statView);
        }
      });
    }
  };
});

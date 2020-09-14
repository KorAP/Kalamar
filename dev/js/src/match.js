/**
 * Get information on matches,
 * generate annotation tables and trees.
 *
 * @author Nils Diewald
 */
/*
 * - Highlight (at least mark as bold) the match
 * - Scroll to match vertically per default
 * - A click on a table field and a tree node should at the field description to the fragments list.
 */
define([
  'buttongroup',
  'panel/match',
	'util'
], function (buttonGroupClass,matchPanelClass) { //, refClass) {

  // Localization values
  const loc   = KorAP.Locale;
  loc.MINIMIZE     = loc.MINIMIZE  || 'Minimize';
  
  // 'corpusID', 'docID', 'textID'
  const _matchTerms  = ['textSigle', 'matchID', 'available'];

  const d = document;

  /**
   * Match object
   */
  return {

    /**
     * Create a new match object.
     * Expects an element with match descriptions.
     */
    create : function (match) {
      return Object.create(this)._init(match);
    },


    /**
     * Initialize match.
     */
    _init : function (match) {
      this._element = null;
      this._initialized = false;

      // No match defined
      if (arguments.length < 1 ||
          match === null ||
          match === undefined) {
        throw new Error('Missing parameters');
      }

      // Match defined as a node
      else if (match instanceof Node) {
        this._element  = match;

        // Circular reference !!
        match["_match"] = this;

        /*
          this.corpusID  = match.getAttribute('data-corpus-id'),
          this.docID     = match.getAttribute('data-doc-id'),
          this.textID    = match.getAttribute('data-text-id'),
        */
        if (match.hasAttribute('data-text-sigle')) {
          this.textSigle = match.getAttribute('data-text-sigle')
        }
        else {
          this.textSigle = match.getAttribute('data-corpus-id') +
            '/' +
            match.getAttribute('data-doc-id') +
            '/' +
            match.getAttribute('data-text-id');
        };

        this.matchID   = match.getAttribute('data-match-id');

        // List of available annotations
        this.available = match.getAttribute('data-available-info').split(' ');
      }

      // Match as an object
      else {

        // Iterate over allowed match terms
        for (var i in _matchTerms) {
          var term = _matchTerms[i];
          this[term] = match[term] !== undefined ? match[term] : undefined;
        };
      };
      
      this._avail = {
        tokens : [],
        spans  : [],
        rels   : []
      };

      // Iterate over info layers
      for (var i = 0; i < this.available.length; i++) {
        var term = this.available[i];

        // Create info layer objects
        try {
          var layer = require('match/infolayer').create(term);
          this._avail[layer.type].push(layer);
        }
        catch (e) {
          continue;
        };
      };
      
      return this;
    },

    /**
     * Return a list of parseable tree annotations.
     */
    getSpans : function () {
      return this._avail.spans;
    },


    /**
     * Return a list of parseable token annotations.
     */
    getTokens : function () {
      return this._avail.tokens;
    },


    /**
     * Return a list of parseable relation annotations.
     */
    getRels : function () {
      return this._avail.rels;
    },

    /**
     * Initialize match
     */
    init : function () {
      if (this._initialized)
        return this;

      // Add actions unless it's already activated
      var element = this._element;

      // There is an element to open
      if (element === undefined || element === null)
        return undefined;
      
      // Add meta button
      var refLine = element.querySelector("p.ref");

      // No reference found
      if (!refLine)
        return undefined;

      // Create panel
      this.panel = matchPanelClass.create(this);

      this._element.insertBefore(
        this.panel.element(),
        this._element.querySelector("p.ref")
      );

      // Insert before reference line
      refLine.insertBefore(
        this.panel.actions.element(),
        refLine.firstChild
      );

      this._initialized = true;
      return this;
    },

    /**
     * Open match
     */
    open : function () {
      
      // Add actions unless it's already activated
      var element = this._element;

      // There is an element to open
      if (element === undefined || element === null)
        return false;

      // The element is already opened
      if (element.classList.contains('active'))
        return false;
      
      // Add active class to element
      element.classList.add('active');

      var btn = buttonGroupClass.create(
        ['action','button-view']
      );

      var that = this;
      btn.add(loc.MINIMIZE, {'cls':['button-icon','minimize']}, function () {
        that.minimize();
      });
      element.appendChild(btn.element());
      
      if (this.init() == undefined) {
        return false;
      };
      
      return true;
    },

    
    // Todo: Test toggle
    toggle : function () {
      if (this._element.classList.contains('active'))
        this.minimize();
      else
        this.open();
    },


    /**
     * Minimize info view
     */
    minimize : function () {
      this._element.classList.remove('active');
    },

    
    /**
     * Get match element.
     */
    element : function () {
      return this._element; // May be null
    }
  };
});

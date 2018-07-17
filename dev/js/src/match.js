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
  // loc.SHOWINFO  = loc.SHOWINFO  || 'Show information';
  // loc.ADDTREE   = loc.ADDTREE   || 'Relations';
  // loc.SHOWANNO  = loc.SHOWANNO  || 'Tokens';
  loc.CLOSE     = loc.CLOSE     || 'Close';
  // loc.SHOW_META = loc.SHOW_META || 'Metadata';
  
  // 'corpusID', 'docID', 'textID'
  const _matchTerms  = ['textSigle', 'matchID', 'available'];

  const d = document;

  /**
   * Match object
   */
  return {

    /**
     * Create a new annotation object.
     * Expects an array of available foundry/layer=type terms.
     * Supported types are 'spans', 'tokens' and 'rels'.
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
     * Open match
     */
    open : function () {

      // Add actions unless it's already activated
      var element = this._element;

      // There is an element to open
      if (this._element === undefined || this._element === null)
        return false;

      // The element is already opened
      if (element.classList.contains('active'))
        return false;
      
      // Add active class to element
      element.classList.add('active');

      // Already there
      /*
        if (element.classList.contains('action'))
        return true;
      */
      if (this._initialized)
        return true;
      
      var btn = buttonGroupClass.create(
        ['action','button-view']
      );

      var that = this;
      btn.add(loc.CLOSE, ['button-icon','close'], function () {
        that.close();
      });
      element.appendChild(btn.element());

      // Add meta button
      var refLine = element.querySelector("p.ref");

      // No reference found
      if (!refLine)
        return;
      
      var panel = matchPanelClass.create(this);

      this._element.insertBefore(
        panel.element(),
        this._element.querySelector("p.ref")
      );

      // Insert before reference line
      refLine.insertBefore(
        panel.actions.element(),
        refLine.firstChild
      );

      this._initialized = true;
      
      return true;
    },

    
    // Todo: Test toggle
    toggle : function () {
      if (this._element.classList.contains('active'))
        this.close();
      else
        this.open();
    },


    /**
     * Close info view
     */
    close : function () {
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

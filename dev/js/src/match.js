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

"use strict";
define([
  'buttongroup',
  'panel/match',
	'util'
], function (buttonGroupClass,matchPanelClass) {

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
      const t= this;
      t._element = null;
      t._initialized = false;

      // No match defined
      if (arguments.length < 1 ||
          match === null ||
          match === undefined) {
        throw new Error('Missing parameters');
      }

      // Match defined as a node
      else if (match instanceof Node) {
        t._element  = match;

        // Circular reference !!
        match["_match"] = t;

        if (match.hasAttribute('data-text-sigle')) {
          t.textSigle = match.getAttribute('data-text-sigle')
        }
        else {
          t.textSigle = match.getAttribute('data-corpus-id') +
            '/' +
            match.getAttribute('data-doc-id') +
            '/' +
            match.getAttribute('data-text-id');
        };

        t.matchID   = match.getAttribute('data-match-id');
        
        // List of available annotations
        t.available = match.getAttribute('data-available-info').split(' ');
      }

      // Match as an object
      else {

        // Iterate over allowed match terms
        _matchTerms.forEach(function(term) {
          this[term] = match[term] !== undefined ? match[term] : undefined;
        }, t);
      };
      
      t._avail = {
        tokens : [],
        spans  : [],
        rels   : []
      };

      // Iterate over info layers
      let layer;
      t.available.forEach(function(term){

        // Create info layer objects
        try {
          layer = require('match/infolayer').create(term);
          this._avail[layer.type].push(layer);
        }
        catch (e) {
          return;
        };
      }, t);
      
      return t;
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
      const t = this;
      if (t._initialized)
        return t;

      // Add actions unless it's already activated
      const element = t._element;

      // There is an element to open
      if (element === undefined || element === null)
        return undefined;
      
      // Add meta button
      const refLine = element.querySelector("p.ref");

      // No reference found
      if (!refLine)
        return undefined;

      // Create panel
      t.panel = matchPanelClass.create(t);

      t._element.insertBefore(
        t.panel.element(),
        t._element.querySelector("p.ref")
      );

      // Insert before reference line
      refLine.insertBefore(
        t.panel.actions.element(),
        refLine.firstChild
      );

      t._initialized = true;
      return t;
    },

    /**
     * Open match
     */
    open : function () {
      
      // Add actions unless it's already activated
      const element = this._element;

      // There is an element to open
      if (element === undefined || element === null)
        return false;

      // The element is already opened
      if (element.classList.contains('active'))
        return false;
      
      // Add active class to element
      element.classList.add('active');

      const btn = buttonGroupClass.create(
        ['action','button-view']
      );

      const that = this;
      btn.add(loc.MINIMIZE, {'cls':['button-icon','minimize']}, function () {
        that.minimize();
      });
      element.appendChild(btn.element());
      
      if (this.init() == undefined) {
        return false;
      };
      
      return true;
    },

    
    /**
     * Toggle match view
     */
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

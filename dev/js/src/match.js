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
  'match/info',      // rename to anno
  'match/treemenu',
	'util'
], function (infoClass,matchTreeMenuClass) { //, refClass) {

  // Localization values
  const loc   = KorAP.Locale;
  loc.SHOWINFO  = loc.SHOWINFO  || 'Show information';
  loc.ADDTREE   = loc.ADDTREE   || 'Relations';
  loc.SHOWANNO  = loc.SHOWANNO  || 'Tokens';
  loc.CLOSE     = loc.CLOSE     || 'Close';
  loc.SHOW_META = loc.SHOW_META || 'Metadata';
  
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
      if (element.classList.contains('action'))
        return true;

      // Create action buttons
      var ul = d.createElement('ul');
      ul.classList.add('action', 'right');

      element.appendChild(ul);
      element.classList.add('action');

      // Todo: Open in new frame

      // Add close button
      var close = d.createElement('li');
      close.addE('span').addT(loc.CLOSE);
      close.classList.add('close');
      close.setAttribute('title', loc.CLOSE);
      
      var that = this;

      // Add meta button
      var refLine = element.querySelector("p.ref");

      // No reference found
      if (!refLine)
        return;
      
      var ops = d.createElement('div');
      ops.classList.add('action', 'bottom', 'button-group');

      /*
      var meta = ops.addE('span');
      meta.addT('Meta');
      meta.setAttribute('title', loc.SHOW_META);
      meta.classList.add('meta');
      */

      // TODO: Rename anno
      var info = ops.addE('span');
      info.addT(loc.SHOWANNO);
      info.setAttribute('title', loc.SHOWANNO);
      info.classList.add('info');

      var tree = ops.addE('span');
      tree.addT(loc.ADDTREE);
      tree.setAttribute('title', loc.ADDTREE);
      tree.classList.add('tree');

      // Insert before reference line
      refLine.insertBefore(
        ops,
        refLine.firstChild
      );

      // Click on meta - add meta (unless already there)
      /*
      meta.addEventListener(
        'click', function (e) {
          e.halt();
          that.info().showMeta();
        }
      );
      */

      // Click on token annotations - add token annotations (unless already there)
      info.addEventListener(
        'click', function (e) {
          e.halt();
          that.info().showTable();
        }
      );

      // Click to show tree menu
      tree.addEventListener(
        'click', function (e) {
          e.halt();

          if (KorAP.TreeMenu === undefined) {
            KorAP.TreeMenu = matchTreeMenuClass.create([]);
          };

          var tm = KorAP.TreeMenu;

          // Reread list
          tm.info(that.info());
          tm.readItems(that.treeMenuList());

          // Reposition and show menu
          tm.show();
          tm.attachTo(this);
          tm.focus();
        }
      );

      // Close match
      close.addEventListener('click', function (e) {
        e.halt();
        that.close()
      });

      ul.appendChild(close);

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
      /*
      if (this._info !== undefined) {
        this._info.destroy();
      };
      */
    },


    /**
     * Get and open associated match infos.
     */
    info : function () {

      // Create match info
      if (this._info === undefined)
        this._info = infoClass.create(this);

      // There is an element to append
      if (this._element === undefined ||
          this._element === null)
        return this._info;
      
      // Info is already activated
      if (this._info._element !== undefined)
        return this._info;

      var refLine = this._element.querySelector("p.ref");
      this._element.insertBefore(
        this._info.element(),
        refLine
      );
      
      return this._info;
    },


    // Return tree menu list
    treeMenuList : function () {

      if (this._menuList)
        return this._menuList;

      // Join spans and relations
      var treeLayers = []
      var spans = this.getSpans();
      var rels = this.getRels();
      var i;
      for (i in spans) {
        treeLayers.push(spans[i]);
      };
      for (i in rels) {
        treeLayers.push(rels[i]);
      };

      // Get spans
      treeLayers = treeLayers.sort(
        function (a, b) {
          if (a.foundry < b.foundry) {
            return -1;
          }
          else if (a.foundry > b.foundry) {
            return 1;
          }
          else if (a.layer < b.layer) {
            return -1;
          }
          else if (a.layer > b.layer) {
            return 1;
          };
          return 0;
        });
      
      var menuList = [];
      
      // Show tree views
      for (var i = 0; i < treeLayers.length; i++) {
        var span = treeLayers[i];
        
        // Add foundry/layer to menu list
        menuList.push([
          span.foundry + '/' + span.layer,
          span.foundry,
          span.layer,
          span.type
        ]);
      };

      // Create tree menu
      this._menuList = menuList;
      return menuList;
    },

    
    /**
     * Get match element.
     */
    element : function () {
      return this._element; // May be null
    }
  };
});

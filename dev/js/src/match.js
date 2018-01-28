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
  var loc   = KorAP.Locale;
  loc.ADDTREE   = loc.ADDTREE   || 'Add tree view';
  loc.SHOWINFO  = loc.SHOWINFO  || 'Show information';
  loc.CLOSE     = loc.CLOSE     || 'Close';
  loc.SHOW_META = loc.SHOW_META || 'Show metadata';
  
  // 'corpusID', 'docID', 'textID'
  var _matchTerms  = ['textSigle', 'matchID', 'available'];

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
      var ul = document.createElement('ul');
      ul.classList.add('action', 'right');

      element.appendChild(ul);
      element.classList.add('action');

      // Todo: Open in new frame

      // Add close button
      var close = document.createElement('li');
      close.appendChild(document.createElement('span'))
        .appendChild(document.createTextNode(loc.CLOSE));
      close.classList.add('close');
      close.setAttribute('title', loc.CLOSE);
      
      // Add info button
      /*
      var info = document.createElement('li');
      info.appendChild(document.createElement('span'))
        .appendChild(document.createTextNode(loc.SHOWINFO));
      info.classList.add('info');
      info.setAttribute('title', loc.SHOWINFO);
      */

      var that = this;

      // Add meta button
      var refLine = element.querySelector("p.ref");

      // There is a reference line
      if (refLine) {

        // Temporary
        var ops = document.createElement('div');
        ops.classList.add('action', 'bottom', 'button-group');

        var meta = document.createElement('span');
        ops.appendChild(meta);
        meta.appendChild(document.createTextNode('+ Meta'));
        meta.setAttribute('title', loc.SHOW_META);
        meta.classList.add('meta');

        var info = document.createElement('span');
        ops.appendChild(info);
        info.appendChild(document.createTextNode('+ Anno'));
        info.setAttribute('title', loc.SHOWINFO);
        info.classList.add('info');

        var tree = document.createElement('span');
        ops.appendChild(tree);
        tree.appendChild(document.createTextNode('+ Tree'));
        tree.setAttribute('title', loc.ADDTREE);
        tree.classList.add('tree');
        
        refLine.insertBefore(
          ops,
          refLine.firstChild
        );

        /*
        var meta = document.createElement('span');
        meta.appendChild(
          document.createElement('span')
        ).appendChild(
          document.createTextNode(loc.SHOW_META)
        );
        meta.setAttribute('title', loc.SHOW_META);
        meta.classList.add('meta');
        refLine.insertBefore(
          meta,
          refLine.firstChild
        );
        */

        meta.addEventListener(
          'click', function (e) {
            e.halt();
            that.info().addMeta();
          }
        );

        // Add information, unless it already exists
        info.addEventListener(
          'click', function (e) {
            e.halt();
            that.info().addTable();
          }
        );

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
            tm.attachTo(this);

            // Not yet initialized
            /*
              if (that._treemenu === undefined) {
              that._treemenu = that.initTreeMenu();

              // TODO:
              // Do not add the tree menu to the button!
              // Only reposition a global treemenu element there,
              // that is positioned below the annotation helper!
              this.appendChild(that._treemenu.element());
            };
            var tm = that._treemenu;
            */
            tm.show();
            tm.focus();
          }
        );
      };

      // Close match
      close.addEventListener('click', function (e) {
        e.halt();
        that.close()
      });

      // Add information, unless it already exists
      /*
      info.addEventListener('click', function (e) {
        e.halt();
        that.info().addTable();
      });
      */

      ul.appendChild(close);
      // ul.appendChild(info);

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
      /* if (this._info !== undefined) {
       *   this._info.destroy();
       * };
       */
    },


    /**
     * Get and open associated match info.
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

      /*
        this.element().appendChild(
        this._info.element()
      );
      */
      var refLine = this._element.querySelector("p.ref");
      this._element.insertBefore(
        this._info.element(),
        refLine
      );
      
      return this._info;
    },


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
      /*
      var span = document.createElement('p');
      span.classList.add('addtree');
      span.appendChild(document.createTextNode(loc.ADDTREE));
      var treeElement = treemenu.element();
      span.appendChild(treeElement);

      span.addEventListener('click', function (e) {
        treemenu.show();
        treemenu.focus();
      });
      */
    },

        
    /**
     * Get tree menu.
     * There is only one menu rendered
     * - no matter how many trees exist
     */
    /*
    treeMenu : function (list) {
      if (this._treeMenu !== undefined)
        return this._treeMenu;
      
      return this._treeMenu = matchTreeMenuClass.create(this, list);
    },
    */
    
    /**
     * Get match element.
     */
    element : function () {
      return this._element; // May be null
    }
  };
});

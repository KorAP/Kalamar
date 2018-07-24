/**
 * The match panel.
 *
 * @author Nils Diewald
 */
define([
  'panel',
  'match/treeitem',
  'view/match/tokentable',
  'view/match/meta',
  'view/match/relations',
  'buttongroup/menu',
], function (panelClass,treeItemClass,tableView,metaView,relationsView,buttonGroupMenuClass) {

  // Override 
  KorAP.API.getMatchInfo = KorAP.API.getMatchInfo || function () {
    KorAP.log(0, 'KorAP.API.getMatchInfo() not implemented')
    return {};
  };

  const loc = KorAP.Locale;

  loc.SHOWANNO  = loc.SHOWANNO  || 'Tokens';
  loc.SHOW_META = loc.SHOW_META || 'Metadata';
  loc.ADDTREE   = loc.ADDTREE   || 'Relations';

  return {
    create : function (match) {
      return Object.create(panelClass)._init(['matchinfo']).upgradeTo(this)._init(match);
    },

    // Initialize match panel
    _init : function (match) {

      this._match = match;

      var a = this.actions;

      // TODO:
      //   Ugly hack!
      var cl= a.element().classList;
      cl.remove('matchinfo');
      cl.add('button-matchinfo');

      // Add meta button
      a.add(
        loc.SHOW_META, ['metatable'], function (e) {
          this.addMeta();
        }
      );

      // Add token annotation button
      a.add(
        loc.SHOWANNO, ['info'], function (e) {
          this.addTable();
        }
      );

      // Add relations button
      a.add(
        loc.ADDTREE, ['tree'], function (e) {

          // Get global tree menu
          if (KorAP.TreeMenu === undefined) {
            KorAP.TreeMenu = buttonGroupMenuClass.create([], treeItemClass);
            KorAP.TreeMenu.element().setAttribute('id', 'treeMenu');
          };

          var tm = KorAP.TreeMenu;

          // Set panel
          tm.panel(this);

          // Reread list
          tm.readItems(this._treeMenuList());

          // Reposition and show menu
          tm.show();
          tm.button(this.button);
          tm.focus();
        }
      );

      // If plugins are enabled, add all buttons for the match panel
      if (KorAP.Plugin) {
        var matchButtons = KorAP.Plugin.buttonGroup("match");
        if (matchButtons) {

          // Add all matchbuttons in order
          for (i in matchButtons) {
            a.add.apply(a, matchButtons[i]);
          }
        };
      };

      return this;
    },

    
    /**
     * Add meta view to panel
     */
    addMeta : function () {
      if (this._metaView && this._metaView.shown())
        return;
      this._metaView = metaView.create(this._match);
      this.add(this._metaView);
    },

    
    /**
     * Add table view to panel
     */
    addTable : function () {
      if (this._tableView && this._tableView.shown())
        return;
      this._tableView = tableView.create(this._match);
      this.add(this._tableView);
    },

    /**
     * Add Tree view to panel
     */
    addTree : function (foundry, layer, type) {
      this.add(
        relationsView.create(this._match, foundry, layer, type)
      );
      
    },


    // Return tree menu list
    _treeMenuList : function () {
     
      if (this._menuList)
        return this._menuList;

      var match = this._match;

      // Join spans and relations
      var treeLayers = []
      var spans = match.getSpans();
      var rels = match.getRels();
      
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
    }   
  }
});

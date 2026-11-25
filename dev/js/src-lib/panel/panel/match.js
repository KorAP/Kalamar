/**
 * The match panel.
 *
 * @author Nils Diewald
 */
import panelClass from '../panel.js';
import treeItemClass from '../../match/treeitem.js';
import tableView from '../../view/match/tokentable.js';
import metaView from '../../view/match/meta.js';
import relationsView from '../../view/match/relations.js';
import buttonGroupMenuClass from '../../buttongroup/buttongroup/menu.js';
import '../../util/util.js';

  // Override 
  KorAP.API.getMatchInfo = KorAP.API.getMatchInfo || function () {
    KorAP.log(0, 'KorAP.API.getMatchInfo() not implemented')
    return {};
  };

  const loc = KorAP.Locale;

  loc.SHOWANNO  = loc.SHOWANNO  || 'Tokens';
  loc.SHOW_META = loc.SHOW_META || 'Metadata';
  loc.ADDTREE   = loc.ADDTREE   || 'Relations';

  export default class MatchPanel extends panelClass {
    type = 'match';
    
    // Initialize match panel
    constructor (match) {
      super(['matchinfo']);

      this._match = match;

      const a = this.actions();

      // TODO:
      //   Ugly hack!
      const cl = a.element().classList;
      cl.remove('matchinfo');
      cl.add('button-matchinfo');

      // Add meta button
      a.add(
        loc.SHOW_META, {'cls':['metatable']}, function (e) {
          this.addMeta();
        }
      );

      // Add token annotation button
      a.add(
        loc.SHOWANNO, {'cls':['info']}, function (e) {
          this.addTable();
        }
      );

      // Add relations button
      a.add(
        loc.ADDTREE, {'cls':['tree']}, function (e) {

          // Get global tree menu
          if (KorAP.TreeMenu === undefined) {
            KorAP.TreeMenu = new buttonGroupMenuClass([], treeItemClass);
            KorAP.TreeMenu.element().setAttribute('id', 'treeMenu');
          };

          const tm = KorAP.TreeMenu;

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
        const matchButtons = KorAP.Plugin.buttonGroup("match");
        if (matchButtons) {

          // Add all matchbuttons in order
          matchButtons.forEach(m => a.add.apply(a, m));
        };
      };
    }

    
    /**
     * Add meta view to panel
     */
    addMeta () {
      const t = this;
      if (t._metaView && t._metaView.shown())
        return;

      t._metaView = new metaView(t._match);
      t.add(t._metaView);
    }

    
    /**
     * Add table view to panel
     */
    addTable () {
      const t = this;
      if (t._tableView && t._tableView.shown())
        return;
      t._tableView = new tableView(t._match);
      t.add(t._tableView);
    }


    /**
     * Add Tree view to panel
     */
    addTree (foundry, layer, type) {
      this.add(
        new relationsView(this._match, foundry, layer, type)
      );
      
    }


    // Return tree menu list
    _treeMenuList () {
     
      if (this._menuList)
        return this._menuList;

      // Join spans and relations
      let treeLayers = []

      const match = this._match;
      match.getSpans().forEach(i => treeLayers.push(i));
      match.getRels().forEach(i => treeLayers.push(i));

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
      
      let menuList = [];
      
      // Show tree views
      treeLayers.forEach(
        s => 
          // Add foundry/layer to menu list
          menuList.push([
            s.foundry + '/' + s.layer,
            s.foundry,
            s.layer,
            s.type
          ]));

      // Create tree menu
      this._menuList = menuList;
      return menuList;
    }   
  }

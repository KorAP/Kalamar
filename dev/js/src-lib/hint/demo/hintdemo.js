import '../../../../scss/kalamar.scss';
import hintClass from '../hint.js';
import foundriesClass from '../hint/foundries.js';
import '../hint/foundries/cnx.js';
// TODO: Uncomment when panel/query and plugin/server are migrated
// import pluginClass from '../../plugin/server.js';
// import queryPanelClass from '../../panel/query.js';

/**
 * Demo for Hint component
 */

KorAP.hintArray = foundriesClass;
KorAP.Hint = null;

KorAP.Hint = new hintClass();

var newItem = {
  onclick : function (e) { console.log("CI click"); console.log(this.element()); console.log("'" + this._menu.prefix() + "'" + " <-- If this returns the empty string when\
 it should not, we know that the click event listener in container.js gets called too early and overwrites the prefix before we can read it.");},
  chop : function () { console.log("chop"); },
  defaultTextValue : "Text Example"
};
KorAP.Hint.menu("-").container().addItem(newItem); //must be added to a specific context menu.

// Note: Query panel and plugin functionality not yet migrated to ES6
// TODO: Uncomment when panel/query and plugin/server are migrated
/*
// Add query panel
var queryPanel = queryPanelClass.create();

// Get input field
var sform = document.getElementById("searchform");
var vcView = document.getElementById('vc-view')
if (sform && vcView) {
  // The views are below the query bar
  sform.insertBefore(queryPanel.element(),vcView);
  KorAP.Panel = KorAP.Panel || {};
  KorAP.Panel['query'] = queryPanel;
}

// Load plugin server
KorAP.Plugin = pluginClass.create();

// Register match plugin
KorAP.Plugin.register({
  'name' : 'Example New',
  'desc' : 'Some content about cats',
  'embed' : [{
    'panel' : 'query',
    'title' : 'Translate',
    'classes' : ['translate'],
    'onClick' : {
      "template" : "http://localhost:3003/demo/plugin-client.html"
    }
  },{
    'panel' : 'query',
    'title' : 'Glemm',
    'classes' : ['glemm'],
    'onClick' : {
      "action":"toggle",
      "template" : "http://localhost:3003/demo/plugin-client.html"
    }
  }]
});

// Register match plugin
KorAP.Plugin.register({
  'name' : 'Glimpse',
  'desc' : 'Shorten all queries',
  'embed' : [{
    'panel' : 'query',
    'title' : 'Glimpse',
    'classes' : ['glimpse'],
    'onClick' : {
      "action" : "toggle",
      "template" : "http://localhost:3003/demo/plugin-client.html"
    }
  }]
});
*/

console.log('KorAP.Hint initialized:', KorAP.Hint);

window.demoAlert = function (pos, msg) {
  if (KorAP.Hint !== undefined) {
    KorAP.Hint.alert(pos, msg);
    console.log(KorAP.Hint);
  }
};

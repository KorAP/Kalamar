/**
 * Export Demo
 * 
 * @author Helge
 * 
 */

requirejs.config({
  baseUrl: '../js/src',
  paths : {
    'lib': '../lib'
  }
});

require([ 'plugin/server', 'panel/result', 'init' ], function(pluginClass, resultPanelClass) {

  KorAP.Plugin = pluginClass.create();

  // Add services container to head
  document.head.appendChild(KorAP.Plugin.element());

  // Register result plugin
  KorAP.Plugin.register({
    'name' : 'Export',
    'desc' : 'Exports Kalamar results',
    // 'about' : 'https://localhost:5678/',
    'embed' : [ {
      'panel' : 'result',
      'title' : 'exports KWICs and snippets',
      //Unicode-Code of the plugins button-icon, Font: Font Awesome 
      'icon' : "\uf019",
      'classes' : [ 'button-icon', 'plugin' ],
      'onClick' : {
        'action' : 'setWidget',
        'template' : 'http://localhost:7777/export',
        'permissions': ['scripts', 'forms']
      }
    } ]
  });

  //Add result panel
  var show = {};
  var resultPanel = resultPanelClass.create(show);

  var resultInfo = document.getElementById('resultinfo');
  if (resultInfo != null) {
    // Move buttons to resultinfo
    resultInfo.appendChild(resultPanel.actions.element());
    // The views are at the top of the search results
    var sb = document.getElementById('search');
    sb.insertBefore(resultPanel.element(), sb.firstChild);
  };

  // There is a koralQuery
  if (KorAP.koralQuery !== undefined) {

    if (KorAP.koralQuery["errors"]) {
      var errors = KorAP.koralQuery["errors"];
      for ( var i in errors) {

        // Malformed query
        if (errors[i][0] === 302 && errors[i][2]) {
          obj.hint = hintClass.create();
          obj.hint.alert(errors[i][2], errors[i][1]);
          break;
        }

        // no query
        else if (errors[i][0] === 301) {
          obj.hint = hintClass.create();
          obj.hint.alert(0, errors[i][1]);
        }
      }
    };
  };
});

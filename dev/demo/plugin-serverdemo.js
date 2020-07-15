requirejs.config({
  baseUrl: '/js/src',
  paths : {
    'lib': '../lib'
  }
});


KorAP.Plugins = [{
  'name' : 'Export',
  'desc' : 'Exports Kalamar results',
  // 'about' : 'https://localhost:5678/',
  'embed' : [{
    'panel' : 'result',
    'title' : 'Export',
    'icon' : "\uf019",
    'classes' : [ 'button-icon', 'plugin', 'export' ],
    'onClick' : {
      'action' : 'addWidget',
      'template' : 'http://localhost:3003/demo/plugin-client.html',
    }
  },{
    'panel' : 'result',
    'title' : 'Glemm',
    'onClick' : {
      'action' : 'toggle',
      'state' : 'glemm',
      'template' : 'http://localhost:3003/demo/plugin-client.html',
    }
  }]
},{
  'name' : 'Example New',
  'desc' : 'Some content about cats',
  // 'about' : 'https://localhost:5678/',
  'embed' : [{
    'panel' : 'match',
    'title' : 'Translate',
    'classes' : ['translate'],
    'onClick' : {
      'action' : 'addWidget',
      'template' : 'http://localhost:3003/demo/plugin-client.html',
    }
  }]
}]; 


require(['app/en','init']);

requirejs.config({
  baseUrl: '../js/src',
  paths : {
    'lib': '../lib'
  }
});

var gTagger;

require(['tagger', 'lib/domReady'], function (tagger, domReady) {
  domReady(function(){
    gTagger = tagger.create(document.getElementById('tagger'));
  });
});


requirejs.config({
  baseUrl: '../js/src',
  paths : {
    'lib': '../lib'
  }
});

var gTagger;

require(['tagger', 'lib/domReady'], function (tagger, domReady) {
  domReady(function(){
    console.log('Hey');
    var t = document.getElementById('tagger');
    gTagger = tagger.create(t);
  });
});


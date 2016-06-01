
function addToBody (msg) {
  var body = document.getElementsByTagName('body')[0];
  var p = body.appendChild(document.createElement('p'))
  p.appendChild(document.createTextNode(msg));
};

define({
  menuSuite : function (menuClass) {
    // add tests
    var suite = new Benchmark.Suite;
    var menu;
    suite.add('Menu#creation', function () {

      menu = menuClass.create([
	['Titel', 'title'],
	['Untertitel', 'subTitle'],
	['Veröffentlichungsdatum', 'pubDate'],
	['Länge', 'length'],
	['Autor', 'author']
      ]);

      menu.limit(3).show();
    });

    suite.add('Menu#next', function () {
      // Some actions
      menu.next();
    });

    suite.add('Menu#prev', function () {
      menu.prev();
    });

    suite.add('Menu#paging', function () {
      var j = 0;
      while (j < 2) {
	var i = 0;
	while (i < 5) {
	  menu.pageUp();
	  i++;
	};
	while (i > 0) {
	  menu.pageDown();
	  i--;
	};
	j++;
      };
    });

    suite.add('Menu#prefix', function () {
      menu.prefix('e').show(4);
      menu.next();
      menu.next();
      menu.next();
      menu.prev();
      menu.prev();
      menu.prev();
    });

    suite.on('error', function(event) {
      console.log(event.target.error);
    });
    suite.on('cycle', function(event) {
      addToBody(String(event.target));
    });

    return suite;
  }
});

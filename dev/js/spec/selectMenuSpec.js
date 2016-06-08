define(
  ['selectMenu'],
  function (selectMenuClass) {

    describe('KorAP.SelectMenu', function () {
      var list = [
	{
	  content : 'Poliqarp',
	  value : 'poliqarp',
	  desc : 'The Polish National Corpus QL'
	},
	{
	  content : 'Cosmas II',
	  value : 'cosmas2',
	  desc : 'The Polish National Corpus QL'
	},
	{
	  content : 'Annis',
	  value : 'annis'
	},
	{
	  content : 'CQL v1.2',
	  value : 'cql'
	}
      ];

      it('should replace a select element', function () {
	var div = document.createElement('div');
	var element = div.appendChild(document.createElement('select'));
	for (i in list) {
	  var opt = element.appendChild(document.createElement('option'));
	  opt.setAttribute('value', list[i].value);
	  opt.appendChild(document.createTextNode(list[i].content));
	};

	var menu = selectMenuClass.create(element);

	expect(element.style.display).toEqual('none');

	menu.show();

	expect(menu.item(0).active()).toBe(true);
	expect(menu.item(0).noMore()).toBe(true);

	// TODO: Improve lcfield!!!!!!
	expect(menu.shownItem(0).lcField()).toEqual(' poliqarp');
      });
    });
  }
);

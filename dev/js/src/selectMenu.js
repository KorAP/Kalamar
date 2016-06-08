define(
  ['menu', 'menu/item', 'menu/prefix', 'menu/lengthField'],
  function (menuClass, menuItemClass, prefixClass, lengthFieldClass) {

    return {
      create : function (element) {
	var obj = Object.create(menuClass);

	obj._shadow = element;

	var list = [];
	var options = element.getElementsByTagName('option');

	for (var i = 0; i < options.length; i++) {

	  var item = options.item(i);
	  var opt = [
	    item.textContent,
	    item.getAttribute('value')
	  ];

	  if (item.hasAttribute('desc'))
	    opt.push(item.getAttribute('desc'));

	  list.push(opt);
	};


	obj = obj.upgradeTo(this)
	  ._init(menuItemClass, prefixClass, lengthFieldClass, list);

	obj._firstActive = true;

	element.style.display = 'none';

	if (element.parentNode)
	  element.parentNode.appendChild(obj.element());

	return obj;
      }
    }
  }
);

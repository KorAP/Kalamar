function setTutorialPage(obj) {
  var page = obj;
  if (typeof page != 'string') {
    page = window.location.pathname + window.location.search;
    for (i = 1; i < 5; i++) {
      if (obj.nodeName === 'SECTION') {
	if (obj.hasAttribute('id'))
	  page += '#' + obj.getAttribute('id');
	break;
      }
      else if (obj.nodeName === 'PRE' && obj.hasAttribute('id')) {
	page += '#' + obj.getAttribute('id');
	break;
      }
      else {
	obj = obj.parentNode;
      };
    };
  };
  document.cookie = 'tutorial_page=' + page + '; path=/'; 
};

function getTutorialPage() {
  var pc = 'tutorial_page';
  var c_value = document.cookie;
  var c_start = c_value.indexOf(" " + pc + "=");
  if (c_start == -1)
    c_start = c_value.indexOf(pc + "=");
  
  if (c_start == -1) {
    c_value = '/tutorial?embedded=1';
  }
  else {
    c_start = c_value.indexOf("=", c_start) + 1;
    var c_end = c_value.indexOf(";", c_start);

    if (c_end == -1)
      c_end = c_value.length;

    c_value = unescape(c_value.substring(c_start,c_end));
  };
  return c_value;
};

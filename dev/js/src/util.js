window.KorAP = window.KorAP || {};

// Don't let events bubble up
if (Event.halt === undefined) {
  // Don't let events bubble up
  Event.prototype.halt = function () {
    this.stopPropagation();
    this.preventDefault();
  };
};

var _quoteRE = new RegExp("([\"\\\\])", 'g');
String.prototype.quote = function () {
  return this.replace(_quoteRE, '\\$1');
};

// Add toggleClass method similar to jquery
HTMLElement.prototype.toggleClass = function (c1, c2) {
  var cl = this.classList;
  if (cl.contains(c1)) {
    cl.add(c2);
    cl.remove(c1);
  }
  else {
    cl.remove(c2);
    cl.add(c1);
  };
};


// Utility for removing all children of a node
function _removeChildren (node) {
  // Remove everything underneath
  while (node.firstChild)
    node.removeChild(node.firstChild);
};

// Utility to get either the charCode
// or the keyCode of an event
function _codeFromEvent (e) {
  if ((e.charCode) && (e.keyCode==0))
    return e.charCode
  return e.keyCode;
};


define(function () {
  // Todo: That's double now!
  KorAP.API = KorAP.API || {};
  KorAP.Locale = KorAP.Locale || {};

  var loc = KorAP.Locale;
  loc.OR  = loc.OR  || 'or';
  loc.AND = loc.AND || 'and';

  // Add new stylesheet object lazily to document
  KorAP.newStyleSheet = function () {
    if (KorAP._sheet === undefined) {
      var sElem = document.createElement('style');
      document.head.appendChild(sElem);
      KorAP._sheet = sElem.sheet;
    };
    return KorAP._sheet;
  };


  // Default log message
  KorAP.log = KorAP.log || function (type, msg) {
    console.log(type + ": " + msg);
  };

  return KorAP;
});

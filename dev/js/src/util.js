var KorAP = KorAP || {};

// TODO: Make this part of util!
// Don't let events bubble up
if (Event.halt === undefined) {
  // Don't let events bubble up
  Event.prototype.halt = function () {
    this.stopPropagation();
    this.preventDefault();
  };
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


define(function () {
  KorAP.API = KorAP.API || {};
  KorAP.Locale = KorAP.Locale || {};

  // Default log message
  KorAP.log = KorAP.log || function (type, msg) {
    console.log(type + ": " + msg);
  };

  return KorAP;
});

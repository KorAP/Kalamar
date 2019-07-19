window.KorAP = window.KorAP || {};

// Don't let events bubble up
if (Event.halt === undefined) {
  // Don't let events bubble up
  Event.prototype.halt = function () {
    this.stopPropagation();
    this.preventDefault();
  };
};

const _quoteRE = new RegExp("([\"\\\\])", 'g');
String.prototype.quote = function () {
  return '"' + this.replace(_quoteRE, '\\$1') + '"';
};

const _escapeRE = new RegExp("([\/\\\\])", 'g');
String.prototype.escapeRegex = function () {
  return this.replace(_escapeRE, '\\$1');
};

const _slug1RE = new RegExp("[^-a-zA-Z0-9_\\s]+", 'g');
const _slug2RE = new RegExp("[-\\s]+", 'g');
String.prototype.slugify = function () {
  return this.toLowerCase().replace(_slug1RE, '').replace(_slug2RE, '-');
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

// Append element by tag name
HTMLElement.prototype.addE = function (tag) {
  return this.appendChild(document.createElement(tag));
};

// Append text node
HTMLElement.prototype.addT = function (text) {
  return this.appendChild(document.createTextNode(text));
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

function _dec2hex (dec) {
  return ('0' + dec.toString(16)).substr(-2)
};


/**
 * Create random identifiers
 */
/*
 * code based on
 * https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript#8084248
 */
function randomID (len) {
  var arr = new Uint8Array((len || 40) / 2)
  window.crypto.getRandomValues(arr)
  return Array.from(arr, _dec2hex).join('')
};


define(function () {
  // Todo: That's double now!
  KorAP.API = KorAP.API || {};
  KorAP.Locale = KorAP.Locale || {};

  const loc = KorAP.Locale;
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
  KorAP.log = KorAP.log || function (type, msg, src) {
    if (src) msg += ' from ' + src;
    console.log(type + ": " + msg);
  };

  return KorAP;
});

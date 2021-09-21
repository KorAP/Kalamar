"use strict";

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

/**
 * Upgrade this object to another object,
 * while private data stays intact.
 *
 * @param {Object} An object with properties.
 */
Object.prototype.upgradeTo  = function (props) {
  for (let prop in props) {
    this[prop] = props[prop];
  };
  return this;
};


// Add toggleClass method similar to jquery
HTMLElement.prototype.toggleClass = function (c1, c2) {
  const cl = this.classList;
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
  const arr = new Uint8Array((len || 40) / 2)
  window.crypto.getRandomValues(arr)
  return Array.from(arr, _dec2hex).join('')
};


/**
 * Add option to show passwords.
 */
function initTogglePwdVisibility (element) {
    const el = element.querySelectorAll("input[type=password].show-pwd");
    for (let x = 0; x < el.length; x++) {     
        const pwd = el[x];

        const a = document.createElement('a');
        a.classList.add('show-pwd');         
        a.addEventListener('click', function () {
            if (pwd.getAttribute("type") === "password") {
                pwd.setAttribute("type", "text");
                a.classList.add('hide');
                return;
            };
            pwd.setAttribute("type", "password");
            a.classList.remove('hide');
        });
        pwd.parentNode.insertBefore(a, pwd.nextSibling);
    };
};


/**
 * Add option to copy to clipboard.
 */
function initCopyToClipboard (element) {
    const el = element.querySelectorAll("input.copy-to-clipboard");
    for (let x = 0; x < el.length; x++) {     
        const text = el[x];
        const a = document.createElement('a');
        a.classList.add('copy-to-clipboard');         
        a.addEventListener('click', function () {
            let back = false;
            if (text.getAttribute("type") === 'password') {
                text.setAttribute("type", "text");
                back = true;
            };
            text.select();
            text.setSelectionRange(0, 99999);
            document.execCommand("copy");
            if (back) {
                text.setAttribute("type", "password");
            };
        });
        text.parentNode.insertBefore(a, text.nextSibling);
    };
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
      const sElem = document.createElement('style');
      document.head.appendChild(sElem);
      KorAP._sheet = sElem.sheet;
    };
    return KorAP._sheet;
  };


  // Default log message
  KorAP.log = KorAP.log || function (type, msg, src) {
    if (src)
      msg += ' from ' + src;
    console.log(type + ": " + msg);
  };

  return KorAP;
});

/**
 * A Method for generating an array of nodes, that are direct descendants of the passed
 * element node, using a tag tagName as a parameter. Supposed to be used by the specification only.
 * @param {HTMLNode} element The HTMLNode / element object whose children we are fetching
 * @param {String} tagName The tag the children are looked for by
 * @returns An array of children nodes with tag tagName
 */
function directElementChildrenByTagName (element, tagName) {
  const tagElementsCollection=element.getElementsByTagName(tagName);
  //var tagElements = Array.from(tagElementsCollection);
  //var tagElements = [...tagElementsCollection];
  //This one has the best compatability:
  var tagElements = Array.prototype.slice.call(tagElementsCollection);
  //filter by actually being direct child node
  tagElements = tagElements.filter(subElement => subElement.parentNode === element);
  return tagElements;
};

/**
 * A Method for generating an array of nodes, that are direct descendants of the passed
 * element node, using a class className as a parameter. Supposed to be used by the specification only.
 * @param {HTMLNode} element The HTMLNode / element object whose children we are fetching
 * @param {String} className The class the children are looked for by
 * @returns An array of children nodes with class className
 */
 function directElementChildrenByClassName (element, className) {
  const classElementsCollection=element.getElementsByTagName(className);
  //var classElements = Array.from(classElementsCollection);
  //var classElements = [...classElementsCollection];
  //This one has the best compatability:
  var classElements = Array.prototype.slice.call(classElementsCollection);
  //filter by actually being direct child node
  classElements = classElements.filter(subElement => subElement.parentNode === element);
  return classElements;
};

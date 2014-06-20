/*
TODO:
  - Limit the size to a certain number of elements
  - addEventListener("click", ... , false);
  - addEventListener("paste", ... , false);
*/

var Hint = function (param) {
  var foundryRegex = new RegExp("(?:^|[^a-zA-Z0-9])([-a-zA-Z0-9]+?)\/(?:([^=]+?)=)?$");

  var search = document.getElementById(param["ref"]);
  var mirror = document.createElement("div");
  var hint = document.createElement("ul");
  var hintSize = param["hintSize"] ? param["hintSize"] : 10;
  var hints = param["hints"];
  var that = this;

  // Build the mirror element
  // <div id="searchMirror"><span></span><ul></ul></div>
  mirror.setAttribute("id", "searchMirror");
  mirror.appendChild(document.createElement("span"));
  mirror.appendChild(hint);
  search.parentNode.insertBefore(mirror, search);

  // Default active state
  this.active = -2;

  // Show hint table
  this.show = function (topic) {
    if (!hints[topic])
      return;
    this.active = -1;
    this.list(hints[topic]);
    var searchRight = search.getBoundingClientRect().right;
    var infoRight = hint.getBoundingClientRect().right;
    if (infoRight > searchRight) {
      hint.style.marginLeft = '-' + (infoRight - searchRight) + 'px';
    };
    hint.style.opacity = 1;
  };

  // Initialize the mirror element
  function init () {
    // Copy input style
    var searchRect = search.getBoundingClientRect();
    var searchStyle = window.getComputedStyle(search, null);

    with (mirror.style) {
      left = searchRect.left + "px";
      top = searchRect.bottom + "px";
      borderLeftColor = "transparent";
      paddingLeft     = searchStyle.getPropertyValue("padding-left");
      marginLeft      = searchStyle.getPropertyValue("margin-left");
      borderLeftWidth = searchStyle.getPropertyValue("border-left-width");
      borderLeftStyle = searchStyle.getPropertyValue("border-left-style");
      fontSize        = searchStyle.getPropertyValue("font-size");
      fontFamily      = searchStyle.getPropertyValue("font-family");
    };
  };

  // Hide hint table
  this.hide = function () {
    this.active = -2;
    hint.style.opacity = 0;
    hint.style.marginLeft = 0;

    // Remove all children
    var lis = hint.childNodes;
    for (var li = lis.length - 1; li >= 0; li--) {
      hint.removeChild(lis[li])
    };
  };

  // List elements in the hint table
  this.list = function (hintList) {
    var li, title;
    var arrayType = hintList instanceof Array;
    for (var i in hintList) {
      // Create list items
      li = document.createElement("li");
      li.setAttribute("data-action", arrayType ? hintList[i] : hintList[i][0]);
      title = document.createElement("strong");
      title.appendChild(document.createTextNode(arrayType ? hintList[i] : i));
      li.appendChild(title);
      hint.appendChild(li);

      // Include descriptions
      if (!arrayType && hintList[i][1]) {
        var desc = document.createElement("span");
        desc.appendChild(document.createTextNode(hintList[i][1]));
        li.appendChild(desc);
      };
    };
  };

  // Choose next item in list
  this.next = function () {
    if (this.active === -2)
      return;
    var lis = hint.getElementsByTagName("li");
    if (this.active === -1) {
      lis[0].setAttribute("class", "active");
      this.active = 0;
    }
    else if (this.active === lis.length - 1) {
      lis[this.active].removeAttribute("class");
      lis[0].setAttribute("class", "active");
      this.active = 0;
    }
    else {
      lis[this.active].removeAttribute("class");
      lis[++this.active].setAttribute("class", "active");
    };
  };

  // Choose previous item in list
  this.previous = function () {
    if (this.active === -2)
      return;

    var lis = hint.getElementsByTagName("li");
    if (this.active === -1) {
      this.active = lis.length - 1;
      lis[this.active].setAttribute("class", "active");
    }
    else if (this.active === 0) {
      lis[0].removeAttribute("class");
      this.active = lis.length - 1;
      lis[this.active].setAttribute("class", "active");
    }
    else {
      lis[this.active].removeAttribute("class");
      lis[--this.active].setAttribute("class", "active");
    };
  };

  // Choose item from list
  this.choose = function () {
    if (this.active < 0)
      return;

    var action = hint.getElementsByTagName("li")[this.active].getAttribute("data-action");

    var value = search.value;
    var start = search.selectionStart;
    var begin = value.substring(0, start);
    var end = value.substring(start, value.length);
    search.value = begin + action + end;
    search.selectionStart = search.selectionEnd = (begin + action).length;

    this.hide();

    // Check for new changes
    mirror.firstChild.innerHTML = begin + action;
    if (foundryRegex.exec(begin + action))
      this.show(RegExp.$1 + (RegExp.$2 ? '/' + RegExp.$2 : ''));
  };

  function changed (e) {
    var el = e.target;

    if (e.key === '/' || e.key === '=') {
      var start = el.selectionStart;
      mirror.firstChild.innerHTML = el.value.substring(0, start);
      var sub = el.value.substring(start - 128 >= 0 ? start - 128 : 0, start);

      if (foundryRegex.exec(sub))
	that.show(RegExp.$1 + (RegExp.$2 ? '/' + RegExp.$2 : ''));
    }
    else if (e.key !== 'Shift' &&
             e.key !== 'Up'    &&
             e.key !== 'Down'  &&
             e.key !== 'Enter') {
      that.hide();
    };
  };

  // Select item from suggestion list
  function select (e) {
    if (that.active === -2)
      return;
    if (e.key === 'Down') {
      that.next();
    }
    else if (e.key === 'Up') {
      that.previous();
    }
    else if (e.key === 'Enter') {
      that.choose();
      e.stopPropagation();
      e.preventDefault();
      return false;
    };
  };

  // Initialize style
  init();
  search.addEventListener("keyup", changed, false);
  search.addEventListener("keypress", select, false);
};

"use strict";

// https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
// https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest
// r.addEventListener("progress", updateProgress, false);
var Ajax = {
  getJSON : function (url, onload) {
    var r = new XMLHttpRequest();
    r.open('GET', url, true);
    r.setRequestHeader("Accept", "application/json");
    r.setRequestHeader('X-Requested-With', 'XMLHttpRequest'); 
    r.onreadystatechange = function () {
      if (this.readyState == 4)
	onload(JSON.parse(this.responseText));
    };
    r.send();
  }
};


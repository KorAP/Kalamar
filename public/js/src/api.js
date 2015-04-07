var KorAP = KorAP || {};

(function (KorAP) {
  "use strict";

  // Default log message
  KorAP.log = KorAP.log || function (type, msg) {
    console.log(type + ": " + msg);
  };

  KorAP.URL = KorAP.URL || 'http://korap.ids-mannheim.de/kalamar';

  // TODO: https://github.com/honza/140medley/blob/master/140medley.js
  // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
  // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest
  // r.addEventListener("progress", updateProgress, false);
  // http://www.javascriptkit.com/javatutors/loadjavascriptcss.shtml
  // http://stackoverflow.com/questions/6112744/load-javascript-on-demand

  KorAP.API = {
    getMatchInfo : function (match, param, cb) {
      // match is a KorAP.Match object

      var url = KorAP.URL;
      url += '/corpus';
      url += '/' + match.corpusID;
      url += '/' + match.docID + '.' + match.textID; // TODO
      url += '/' + match.matchID;

      // { spans: true, layer:x, foundry : y}
      if (param['spans'] == true) {
	url += '?spans=true';
	if (param['foundry'] !== undefined)
	  url += '&foundry=' + param['foundry'];
	if (param['layer'] !== undefined)
	  url += '&layer=' + param['layer'];
      }

      // { spans : false, layer: [Array of KorAP.InfoLayer] }
      else {
	// TODO
	url += '?spans=false';
      }

      this.getJSON(url, cb);
    },
    getJSON : function (url, onload) {
      var req = new XMLHttpRequest();

      console.log('Request url: ' + url);

      req.open("GET", url, true);


      req.setRequestHeader("Accept", "application/json");
      req.setRequestHeader('X-Requested-With', 'XMLHttpRequest'); 
      req.onreadystatechange = function () {
	/*
	  States:
	  0 - unsent (prior to open)
	  1 - opened (prior to send)
	  2 - headers received
	  3 - loading (responseText has partial data)
	  4 - done
	 */
	if (this.readyState == 4) {
	  if (this.status === 200)
	    onload(JSON.parse(this.responseText));
	  else
	    KorAP.log(this.status, this.statusText);
	}
      };
      req.ontimeout = function () {
	KorAP.log(0, 'Request Timeout');
      };
      req.send();
    }
  };

}(this.KorAP));

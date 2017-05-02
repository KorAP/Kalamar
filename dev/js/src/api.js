define(['util'], function () {
  // TODO: https://github.com/honza/140medley/blob/master/140medley.js
  // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
  // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest
  // r.addEventListener("progress", updateProgress, false);
  // http://www.javascriptkit.com/javatutors/loadjavascriptcss.shtml
  // http://stackoverflow.com/questions/6112744/load-javascript-on-demand

  KorAP.URL = KorAP.URL !== undefined ? KorAP.URL : 'http://korap.ids-mannheim.de/kalamar';

  KorAP.API = KorAP.API || {};

  /**
   * Retrieve information about a match
   */
  KorAP.API.getMatchInfo = function (match, param, cb) {

    // match is a KorAP.Match object
    var url = KorAP.URL;
    url += '/corpus';
/*
    url += '/' + match.corpusID;
    url += '/' + match.docID;
    url += '/' + match.textID;
*/

    var legacySigle = new RegExp('^([^_]+)_([^\.]+)\.(.+?)$');

    // This is for legacy support
    var legacy = legacySigle.exec(match.textSigle);
    if (legacy !== null && legacy[0]) {
      url += '/' + legacy[1] + '/' + legacy[2] + '/' + legacy[3];
    }
    else {
      url += '/' + match.textSigle;
    }
    
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

    KorAP.API.getJSON(url, cb);
  };

  /**
   * Retrieve information about collections
   */
  KorAP.API.getCollections = function (cb) {
    KorAP.API.getJSON(KorAP.URL + '/collection', cb);
  };

  /**
   * General method to retrieve JSON information
   */
  KorAP.API.getJSON = function (url, onload) {
    var req = new XMLHttpRequest();
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

        var json = JSON.parse(this.responseText);
	      if (json !== null && json["errors"] !== null) {
	        for (var i in json["errors"]) {
	          KorAP.log(json["errors"][i][0], json["errors"][i][1] || "Unknown");
	        };
	      }
        else if (this.status !== 200) {
        	KorAP.log(this.status, this.statusText);
        };

	      if (this.status === 200) {
	        onload(json);
	      }
	      else {
          onload(undefined);
        };
      }
    };
    req.ontimeout = function () {
      KorAP.log(0, 'Request Timeout');
    };
    req.send();
  }
});

define(['util'], function () {
  // TODO: https://github.com/honza/140medley/blob/master/140medley.js
  // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
  // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest
  // r.addEventListener("progress", updateProgress, false);
  // http://www.javascriptkit.com/javatutors/loadjavascriptcss.shtml
  // http://stackoverflow.com/questions/6112744/load-javascript-on-demand

  KorAP.URL = KorAP.URL !== undefined ? KorAP.URL : '';

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

    var legacySigle = new RegExp('^([^_]+)_([^\\.]+)\\.(.+?)$');

    // This is for legacy support
    var legacy = legacySigle.exec(match.textSigle);
    var docFragment = "";
    if (legacy !== null && legacy[0]) {
      docFragment = legacy[1] + '/' + legacy[2] + '/' + legacy[3];
    }
    else {
      docFragment = match.textSigle;
    }

    docFragment += '/' + match.matchID;
    url += '/' + docFragment;

    // { spans: true, layer:x, foundry : y}
    if (param['spans'] == true) {
      url += '?spans=true';
      docFragment += ' +spans ';
      if (param['foundry'] !== undefined) {
	      url += '&foundry=' + param['foundry'];
        docFragment += param['foundry'];
      };
      if (param['layer'] !== undefined) {
	      url += '&layer=' + param['layer'];
        docFragment += '/'+param['layer'];
      }
    }
    
    // { spans : false, layer: [Array of KorAP.InfoLayer] }
    else {
      // TODO
      docFragment += ' -spans';
      url += '?spans=false';
    }

    KorAP.API.getJSON(url, cb, "MatchInfo: " + docFragment);
  };


  /**
   * Retrieve information about a document.
   */
  KorAP.API.getTextInfo = function (doc, param, cb) {

    // doc is a KorAP.Match object
    var url = KorAP.URL;
    url += '/corpus';
    url += '/' + doc.textSigle;

    if (param['fields'] !== undefined) {
      url += '?fields='; // TODO!
    }
    else {
      url += '?fields=@all'; // TODO: Maybe '*'?
    }
    KorAP.API.getJSON(url, cb, "TextInfo: " + doc.textSigle);
  };


  /**
   * Retrieve information about collections
   */
  KorAP.API.getCollections = function (cb) {
    KorAP.API.getJSON(KorAP.URL + '/collection', cb, "CorpusInfo");
  };


  /**
   * Retrieve information about corpus statistic
   * 
   * Development mode:
   * URL = http://localhost:8089/api 
   * 
   * collectionQuery has be changed to corpusQuery 
   */
  /* KorAP.API.getCorpStat = function (collQu, cb){
  	//development mode:
  	var url = "http://localhost:8089/api/";
  	url  = url + "statistics";
  	url = url + "?cq=";
  	url = url + collQu;
  	KorAP.API.getJSON(url, cb);
  };*/

  
  /**
   * Retrieve information about corpus statistic
   * 
   * Example URL:  /corpus?cq=availability+%3D+%2FCC-BY.*%2F+%26+textClass+%3D+%22kultur%22
   * 
   * cq = corpus query (formerly collectionQuery)
   * 
   * Adress the MOJO-Endpoint for example with
   * http://localhost:3000/corpus?cq=availability+%3D+%2FCC-BY.*%2F+%26+textClass+%3D+%22kultur%22
   */
  KorAP.API.getCorpStat = function (cq, cb){
  	var url  =  KorAP.URL;
    url += "/corpus?cq=" + encodeURIComponent(cq);
  	KorAP.API.getJSON(url, cb, "CorpusInfo: " + cq);
  };
  
  /**
   * General method to retrieve JSON information
   */
  KorAP.API.getJSON = function (url, onload, title) {
    var req = new XMLHttpRequest();
    req.open("GET", url, true);

    // Dispatch global "window" event
    var reqE = new CustomEvent('korapRequest', {
      bubbles : false,
      detail: {
        "url" : url,
        "title" : title
      }
    });
    window.dispatchEvent(reqE);
    
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

        var json;
        try {
          json = JSON.parse(this.responseText);
        }
        catch (e) {
          KorAP.log(0, e);
          console.log(e);
          onload(undefined);
          return;
        };
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

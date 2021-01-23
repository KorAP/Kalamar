"use strict";

define(['util'], function () {

  // TODO:
  // - https://github.com/honza/140medley/blob/master/140medley.js
  // - https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
  // - https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest
  // - r.addEventListener("progress", updateProgress, false);
  // - http://www.javascriptkit.com/javatutors/loadjavascriptcss.shtml
  // - http://stackoverflow.com/questions/6112744/load-javascript-on-demand

  // See https://flaviocopes.com/http-request-headers/ for a list of headers

  KorAP.URL = KorAP.URL !== undefined ? KorAP.URL : '';
  KorAP.API = KorAP.API || {};

  const legacySigle = new RegExp('^([^_]+)_([^\\.]+)\\.(.+?)$');

  /**
   * Retrieve information about a match
   */
  KorAP.API.getMatchInfo = function (match, param, cb) {

    // match is a KorAP.Match object
    let url = KorAP.URL + '/corpus';
    /*
      url += '/' + match.corpusID;
      url += '/' + match.docID;
      url += '/' + match.textID;
    */

    // This is for legacy support
    const legacy = legacySigle.exec(match.textSigle);
    let docFragment = "";
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
    let url = KorAP.URL + '/corpus' + '/' + doc.textSigle;

    if (param['fields'] !== undefined) {
      url += '?fields='; // TODO!
    }
    else {
      url += '?fields=@all'; // TODO: Maybe '*'?
    }

    KorAP.API.getJSON(url, cb, "TextInfo: " + doc.textSigle);
  };


  /**
   * Retrieve information about virtual corpora
   */
  KorAP.API.getCollections = function (cb) {
    KorAP.API.getJSON(KorAP.URL + '/collection', cb, "CorpusInfo");
  };

  
  /**
   * Retrieve information about corpus statistic
   * 
   * Example URL:  /corpus?cq=availability+%3D+%2FCC-BY.*%2F+%26+textClass+%3D+%22kultur%22
   * 
   * @param cq corpus query (formerly collectionQuery)
   * 
   * Adress the MOJO-Endpoint for example with
   * http://localhost:3000/corpus?cq=availability+%3D+%2FCC-BY.*%2F+%26+textClass+%3D+%22kultur%22
   */
  KorAP.API.getCorpStat = function (cq, cb){
  	let url  =  KorAP.URL + "/corpus?cq=" + encodeURIComponent(cq);
  	KorAP.API.getJSON(url, cb, "CorpusInfo: " + cq);
  };
  

  /**
   * General method to retrieve JSON information.
   * 
   * @param {String} url The url at which the JSON File is located
   * @param {function} onload The callback function that recieves the retrieved JSON as a parameter, or undefined if none is eligible
   * @param {String} title How to store this request in the logs
   */ 
  KorAP.API.getJSON = function (url, onload, title) {
    const req = new XMLHttpRequest();
    req.open("GET", url, true);

    // Dispatch global "window" event
    const reqE = new CustomEvent('korapRequest', {
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

        let json;
        try {
          json = JSON.parse(this.responseText);
        }
        catch (e) {
          KorAP.log(0, e);
          console.log(e);
          onload(undefined);
          return;
        };

	      if (json !== undefined && json["errors"] !== undefined) {
	        json["errors"].forEach(
            e => KorAP.log(e[0], e[1] || "Unknown")
	        );
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

    /*D As the default value for .timeout is 0, 
    which means unlimited/there is no timeout, this does not have an effect */
    req.ontimeout = function () {
      KorAP.log(0, 'Request Timeout');
    };
    req.send();
  };


  /**
   * General method to put JSON information.
   * 
   * @param {String} url The url at which the JSON File will be located
   * @param {JSON} json The JSON that is getting transfered. Be sure to have this be a JSON (stringify)
   * @param {String} title How to store this request in the logs
   */ 
  KorAP.API.putJSON = function (url, json, title) {
    const req = new XMLHttpRequest();
    req.open("PUT", url, true); //D PUT is not cacheable, but I hope that doesn't matter: https://developer.mozilla.org/en-US/docs/Glossary/Cacheable
                                // There is also POST, I couldn't decide why not to use PUT, though POST may be safer to use

    // Dispatch global "window" event. //D I don't know what this does.
    const reqE = new CustomEvent('korapRequest', {
      bubbles : false,
      detail: {
        "url" : url,
        "title" : title
      }
    });
    window.dispatchEvent(reqE);
    
    req.setRequestHeader("Accept", "application/json"); //Do I need this?
    req.setRequestHeader("Content-Type", "application/json");
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

        //There is no return value, so we do not need to create a JSON.
	      
        if (this.status === 200) {
          KorAP.log(this.status, "api.js says: A HTTP PUT Method was invoked such that error status 200 was recieved.\
          This should not be possible, 201 should be returned.\n" + this.statusText)
        }
        else if (this.status !== 201) {
          KorAP.log(this.status, this.statusText);
          //TODO Show the user his request failed!
        };

	      //D I believe no further actions are necessary
      }
    };

    /*D As the default value for .timeout is 0, 
    which means unlimited/there is no timeout, this does not have an effect */
    req.ontimeout = function () {
      KorAP.log(0, 'Request Timeout');
    };
    req.send(json);
  };


  /**
   * General method to delete a file at a specific URL
   * 
   * @param {String} url The url at which the to be deleted file is located
   * @param {String} title How to store this request in the logs
   * @param {function} cb Optional. Callback function for error handling, recieves JS object with status and statusText attribute
   */ 
  KorAP.API.deleteAtURL = function (url, title, cb) {
    const req = new XMLHttpRequest();
    req.open("DELETE", url, true);

    // Dispatch global "window" event. //D I don't know what this does.
    const reqE = new CustomEvent('korapRequest', {
      bubbles : false,
      detail: {
        "url" : url,
        "title" : title
      }
    });
    window.dispatchEvent(reqE);
    
    req.setRequestHeader("Accept", "application/json"); //Could this be bad? Maybe we want to delete non JSON files later.
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

        //There is no return value, so we do not need to create a JSON.
        
        //If we add a callback function for error handling to put and get, I would do it exactly like this.
        //It being the last parameter means calls of getJSON don't need to be changed.

        if (this.status !== 200) {
          KorAP.log(this.status, this.statusText)
          if (typeof(cb) === "function"){
            cb({
              "status" : this.status,
              "statusText" : this.statusText
            });
          };
        }
        else if (this.status === 200) { //D Does this achieve anything?
          if (typeof(cb) === "function"){
            cb({
              "status" : this.status,
              "statusText" : this.statusText
            });
          };
        };
        //TODO show the user his request failed.

	      //D I believe no further actions are necessary
      }
    };

    /*D As the default value for .timeout is 0, 
    which means unlimited/there is no timeout, this does not have an effect */
    req.ontimeout = function () {
      KorAP.log(0, 'Request Timeout');
    };
    req.send();
  };


  // Stored query related functions
  /**
   * Retrieve saved list of queries
   * 
   * @param {function} cb The callback function that recieves the JSON Listof queries
   */
  KorAP.API.getQueryList = function (cb){
    KorAP.getJSON(KorAP.URL + "/query/", cb, "getSavedQueryList");
  };

  /**
   * Retrieve specific saved query by query name
   * 
   * @param {String} qn The name of the query to be retrieved. Must be a string
   * @param {function} cb The callback function that recieves the query JSON Object
   */
  KorAP.API.getQuery = function (qn, cb){
    KorAP.getJSON(KorAP.URL + "/query/" + qn, cb, "getSavedQuery of name "+ qn);
  };

  /**
   * Put new query by query name
   * 
   * @param {String} qn The name of the new query
   * @param {function} json The query. Be sure to have this be a JSON (stringify)
   */
  KorAP.API.putQuery = function (qn, json){
    KorAP.putJSON(KorAP.URL + "/query/" + qn, json, "putQuery of name "+ qn);
  };

  /**
   * delete query by query name
   * 
   * @param {String} qn The name of the to be deleted query
   * @param {function} cb Optional. Callback function for error handling, recieves JS object with status and statusText attribute
   */
  KorAP.API.deleteQuery = function (qn, cb){
    KorAP.deleteAtURL(KorAP.URL + "/query/" + qn, "deleteQuery of name "+ qn, cb);
  };
});
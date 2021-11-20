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
   * Retrieve a list of all plugin objects to
   * establish in the frontend.
   */
  KorAP.API.getPluginList = function (url, cb) {
    KorAP.API.getJSON(url, cb, "Plugin-List")
  };

  /**
   * General function to communicate JS Objects with the server
   * 
   * @param {HTTMLRequestType} requestType Should be "GET", "PUT", "POST" or "DELETE"
   * @param {String} url The url that specifies where the JSON file is ("GET"), will be ("PUT" and "POST") or will have been ("DELETE")
   * @param {String} title How to store this request in the logs
   * @param {JSObj} jsObj For "PUT" and "POST". The JS Object that is getting transfered. This function stringifies it.
   * @param {function} returnValueCB For "GET". The callback function that receives the retrieved JS object (already parsed) as a parameter, or undefined if none is eligible
   * @param {function} errorCB Optional. Callback function for error handling, receives JS object with status and statusText attribute
   */ 
  function _actionJSON (requestType, url, title, jsObj, returnValueCB, errorCB) {
    console.log(arguments);
    const req = new XMLHttpRequest();
    req.open(requestType, url, true); 
    // Dispatch global "window" event. See Kalamar::Plugin::Piwik
    const reqE = new CustomEvent('korapRequest', {
      bubbles : false,
      detail: {
        "url" : url,
        "title" : title
      }
    });
    window.dispatchEvent(reqE);
    
    req.setRequestHeader("Accept", "application/json");
    req.setRequestHeader("Content-Type", "application/json");
    req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    //req.setRequestHeader('Origin',"API");
    //req.onload = function () {
    //  console.log(req.responseText); //TODO this needs to be done also
    //}
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

        if (requestType === "GET") { //GET
          let retJSObj;
          try {
            retJSObj = JSON.parse(this.responseText);
          }
          catch (e) {
            KorAP.log(0, e);
            console.log(e);
            returnValueCB(undefined);
            //errorCB({"status" : 0, "statusText": e + " - Could not parse returned Object."}); // Is this required???
            return;
          };

          if (retJSObj !== undefined && retJSObj["errors"] !== undefined) {
            retJSObj["errors"].forEach(
              e => KorAP.log(e[0], e[1] || "Unknown")
            );
          }

          else if (this.status !== 200) {
            KorAP.log(this.status, this.statusText, "Remote service error (XMLHttpRequest) under URL: " + url);
          };

          if (this.status === 200) {
            returnValueCB(retJSObj);
          }

          else {
            returnValueCB(undefined);
          };

        } else { // PUT, POST, DELETE
          if (this.status >= 300 || this.status < 200) { //Error
            KorAP.log(this.status, this.statusText, "Remote service error (XMLHttpRequest) under URL: " + url);
          };
        };
        // Call the callback function (no matter requestType) if one is given.
        if (typeof(errorCB) === "function"){
          var statusTextErrors = ""; // For some reason, the errors created in QueryReference.pm have their text stored in this.responseText.
          // Here we try to extract this information
          try {
              JSON.parse(this.responseText).errors.forEach(
                e => statusTextErrors = statusTextErrors + e["message"] || ""
              );
          } catch {
            try {
              if (requestType !== "GET"){
                statusTextErrors += JSON.parse(this.responseText);
              }
            } catch {
              //Nothing
            }
          }
          errorCB({
            "status" : this.status,
            "statusText" : this.statusText + " - " + (statusTextErrors || "")
            //responseText: A DOMString which contains either the textual data received using the 
            // XMLHttpRequest or null if the request failed or "" if the request has not yet been sent by calling send(). 
          });
        }; 
      };
    };

    /*Set a value for .timeout to use this functionality */
    //req.ontimeout = function () {
    //  KorAP.log(0, 'Request Timeout');
    //};
    if (requestType === "POST" || requestType === "PUT") {
      req.send(JSON.stringify(jsObj));
    } else { //GET, DELETE
      req.send();
    };
  };

  /**
   * General method to get JSON information.
   * 
   * @param {String} url The url at which the JSON File will be located
   * @param {function} returnValueCB The callback function that receives the retrieved JS object (already parsed) as a parameter, or undefined if none is eligible
   * @param {String} title How to store this request in the logs
   * @param {function} errorCB Optional. Callback function for error handling, receives JS object with status and statusText attribute
   */ 
  KorAP.API.getJSON = function (url, returnValueCB, title, errorCB) {
    _actionJSON("GET", url, title, undefined, returnValueCB, errorCB);
  };

  /**
   * General method to put JSON information.
   * 
   * @param {String} url The url at which the JSON File will be located
   * @param {JSObj} jsObj The JS object that is getting transfered. This will be stringified
   * @param {String} title How to store this request in the logs
   * @param {function} errorCB Optional. Callback function for error handling, receives JS object with status and statusText attribute
   */ 
  KorAP.API.putJSON = function (url, jsObj, title, errorCB) {
    _actionJSON("PUT", url, title, jsObj, undefined, errorCB);
  };

  /**
   * General method to post JSON information.
   * 
   * @param {String} url The url at which the JSON File will be located
   * @param {JSObj} jsObj The JS object that is getting transfered. This will be stringified
   * @param {String} title How to store this request in the logs
   * @param {function} errorCB Optional. Callback function for error handling, receives JS object with status and statusText attribute
   */ 
  KorAP.API.postJSON = function (url, jsObj, title, errorCB) {
    _actionJSON("POST", url, title, jsObj, undefined, errorCB);
  };

  /**
   * General method to delete a file at a specific URL
   * 
   * @param {String} url The url at which the to be deleted file is located
   * @param {String} title How to store this request in the logs
   * @param {function} errorCB Optional. Callback function for error handling, receives JS object with status and statusText attribute
   */ 
  KorAP.API.deleteJSON = function (url, title, errorCB) {
    _actionJSON("DELETE", url, title, undefined, undefined, errorCB);
  };


  // Stored query related functions

  /**
   * Retrieve saved list of queries
   * 
   * @param {function} returnValueCB The callback function that receives the JS object Listof queries, already parsed
   * @param {function} errorCB Optional. Callback function for error handling, receives JS object with status and statusText attribute
   */
  KorAP.API.getQueryList = function (returnValueCB, errorCB){
    KorAP.API.getJSON(KorAP.URL + "/query/", returnValueCB, "getSavedQueryList", errorCB);
  };

  /**
   * Retrieve specific saved query by query name
   * 
   * @param {String} qn The name of the query to be retrieved. Must be a string
   * @param {function} returnValueCB The callback function that receives the query JS object Object, already parsed
   * @param {function} errorCB Optional. Callback function for error handling, receives JS object with status and statusText attribute
   */
  KorAP.API.getQuery = function (qn, returnValueCB, errorCB){
    KorAP.API.getJSON(KorAP.URL + "/query/" + qn, returnValueCB, "getSavedQuery of name "+ qn, errorCB);
  };

  /**
   * Put new query by query name
   * 
   * @param {String} qn The name of the new query
   * @param {JSObj} jsObj The query. This will be stringified
   * @param {function} errorCB Optional. Callback function for error handling, receives JS object with status and statusText attribute
   */
  KorAP.API.putQuery = function (qn, jsObj, errorCB){
    KorAP.API.putJSON(KorAP.URL + "/query/" + qn, jsObj, "putQuery of name "+ qn, errorCB);
  };

  /**
   * Post new query by query name
   * CAUTION: Currently not supported by the QueryReference Plugin.
   * 
   * @param {String} qn The name of the new query
   * @param {JSObj} jsObj The query. This will be stringified
   * @param {function} errorCB Optional. Callback function for error handling, receives JS object with status and statusText attribute
   */
  KorAP.API.postQuery = function (qn, jsObj, errorCB){
    KorAP.API.postJSON(KorAP.URL + "/query/" + qn, jsObj, "postQuery of name "+ qn, errorCB);
  };

  /**
   * delete query by query name
   * 
   * @param {String} qn The name of the to be deleted query
   * @param {function} errorCB Optional. Callback function for error handling, receives JS object with status and statusText attribute
   */
  KorAP.API.deleteQuery = function (qn, errorCB){
    KorAP.API.deleteJSON(KorAP.URL + "/query/" + qn, "deleteQuery of name "+ qn, errorCB);
  };
});
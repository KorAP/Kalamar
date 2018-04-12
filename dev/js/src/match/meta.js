define(['util'], function () {

  // Localization values
  const loc   = KorAP.Locale;
  loc.METADATA = loc.METADATA || 'Metadata';

  return {

    /**
     * Create new match object
     */
    create : function (match, fields) {
      return Object.create(this)._init(match, fields);
    },

    /**
     * Initialize object
     */
    _init : function (match, fields) {
      this._match = match;
      this._fields = fields;
      // this.opened = false;
      return this;
    },

    /**
     * Get match object
     */
    match : function () {
      return this._match;
    },

    /**
     * Create match reference view.
     */
    element : function () {
      if (this._element !== undefined)
        return this._element;

      if (this._fields === null)
        return;

      var metaDL = document.createElement('dl');

      this._element = metaDL;

      var fields = this._fields;

      // TODO:
      // This should only remember array positions by index
      // and keep all other field information intact
      var metaInfo = {};
      for (var i in fields) {
        var value = fields[i].value;      	
        metaInfo[fields[i].key] = value;	
      };
    
      // console.log(fields);   
      
      // TODO: Meta fields should be separated
      var keys = Object.keys(metaInfo);  
      
      for (var i in keys.sort()) {
        var k = keys[i];
        if (k !== "UID" &&
            k !== "corpusID" &&
            k !== "docID" &&
            k !== "textID" &&
            /*
            k !== "corpusSigle" &&
            k !== "docSigle" &&
            */
            k !== "layerInfos") {

          var metaL = document.createElement('div');
          
          var dt = metaL.addE('dt');
          dt.addT(k);
          dt.setAttribute("title", k);
          
          var metaDescr = metaInfo[k];
          metaDD =  metaL.addE('dd');
          
          if(metaDescr instanceof Array){
        	metaDD.classList.add("metakeyvalues");  
        	for(i = 0; i < metaDescr.length; i++){
        	metaDD.addE('div').addT(metaDescr[i]);
        	} 
          }
          else{
          metaDD.addT(metaInfo[k]);
          }
      
          metaDL.appendChild(metaL);
        };
      };
      return this._element;
    }
  };
});

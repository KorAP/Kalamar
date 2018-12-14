define(['match/corpusByMatch','match/attachement','util'], function (cbmClass, attClass) {

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
      metaDL.classList.add("flex");

      this._element = metaDL;

      let fields = this._fields;

      // Copy original array position to object
      // before sorting by key title
      let posInMetaArray = {};
      for (let i = 0; i < fields.length; i++) {
        posInMetaArray[fields[i]["key"]] = i;

      };
      
      // TODO: Meta fields should be separated
      const keys = Object.keys(posInMetaArray);

      // Sort all meta keys alphabetically
      for (let i in keys.sort()) {
        let k = keys[i];                             // This is the title
        let field = fields[posInMetaArray[keys[i]]]; // This is the object

        // Ignore internal IDs
        if (k !== "UID" &&
            k !== "corpusID" &&
            k !== "docID" &&
            k !== "textID" &&
            /*
              k !== "corpusSigle" &&
              k !== "docSigle" &&
            */
            k !== "layerInfos") {

          const metaL = document.createElement('div');
          
          const dt = metaL.addE('dt');
          dt.addT(k);
          dt.setAttribute("title", k);
          
          let metaDescr = field["value"];
          metaDD = metaL.addE('dd');
          metaDD.setAttribute('data-type', field["type"]);

          if(metaDescr instanceof Array){
        	  metaDD.classList.add("metakeyvalues");  
        	  for (i = 0; i < metaDescr.length; i++){

              if (field["type"] === 'type:attachement') {
                let att = attClass.create(metaDescr[i]);
                if (att)
        	        metaDD.addE('div').appendChild(att.inline());
              }
              else {
        	      metaDD.addE('div').addT(metaDescr[i]);
              }
        	  } 
          }
          else{
            if (field["type"] === 'type:attachement') {
              let att = attClass.create(field["value"]);
              if (att)
              metaDD.appendChild(att.inline());
            }
            else {
              metaDD.addT(field["value"]);
            };
          }
          
          metaDL.appendChild(metaL);
        };
      };

      // Add corpusByMatch assistant
      this._corpusByMatch = cbmClass.create(this._element);

      return this._element;
    }
  };
});

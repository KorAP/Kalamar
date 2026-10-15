import cbmClass from '../corpusByMatch/corpusByMatch.js';
import attClass from '../attachement/attachement.js';
import '../../util/util.js';

  // Localization values
  const loc   = KorAP.Locale;
  loc.METADATA = loc.METADATA || 'Metadata';

  export default class Meta {

    /**
     * Create new match object
     */
    constructor (match, fields) {
      this._match = match;
      this._fields = fields;
    }


    /**
     * Get match object
     */
    match () {
      return this._match;
    }


    /**
     * Create match reference view.
     */
    element () {
      if (this._el !== undefined)
        return this._el;

      if (this._fields === null)
        return;

      const metaDL = document.createElement('dl');
      metaDL.classList.add("flex");

      this._el = metaDL;

      const fields = this._fields;

      // Copy original array position to object
      // before sorting by key title
      const posInMetaArray = {};
      fields.forEach((f,i) => posInMetaArray[f["key"]] = i);

      // TODO: Meta fields should be separated

      // Sort all meta keys alphabetically
      Object.keys(posInMetaArray).sort().forEach(function(k) {
        let field = fields[posInMetaArray[k]]; // This is the object

        let metaL, dt, metaDescr, metaDD, att;
        const isNotInIndex = field["comment"] === "notinindex";

        // Ignore internal IDs
        if (k !== "UID" &&
            k !== "corpusID" &&
            k !== "docID" &&
            k !== "textID" &&
            k !== "layerInfos") {

          metaL = document.createElement('div');

          dt = metaL.addE('dt');
          dt.addT(k);
          dt.setAttribute("title", k);
          
          metaDescr = field["value"];
          metaDD = metaL.addE('dd');
          metaDD.setAttribute('data-type', field["type"]);
          if (isNotInIndex) {
            metaDD.classList.add("notinindex");
          };

          if(metaDescr instanceof Array){
        	  metaDD.classList.add("metakeyvalues");
            metaDescr.forEach(function(md) {
              if (field["type"] === 'type:attachement') {
                att = new attClass(md);
                if (att)
        	        metaDD.addE('div').appendChild(att.inline());
              }
              else {
        	      metaDD.addE('div').addT(md);
              }
        	  });
          }
          else{
            if (field["type"] === 'type:attachement') {
              att = new attClass(field["value"]);
              if (att)
                metaDD.appendChild(att.inline());
            }
            else {
              metaDD.addT(field["value"]);
            };
          }
          
          metaDL.appendChild(metaL);
        };
      });

      // Add corpusByMatch assistant
      this._corpusByMatch = new cbmClass(this._el);

      return this._el;
    }
  }

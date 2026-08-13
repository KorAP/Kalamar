import jsonldClass from './jsonld.js';
import rewriteClass from './rewrite.js';
import '../../util/util.js';

  export default class RewriteList extends jsonldClass {

    // Construction method
    constructor (json) {
      super();
      this.fromJson(json);
    }


    /**
     * Deserialize from KoralQuery
     */
    fromJson (json) {
      this._list = new Array();
      json.forEach(
        i => 
	        this._list.push(
	          rewriteClass.fromJson(i)
	        )
      );
      return this;
    }


    length () {
      return this._list.length;
    }


    /**
     * Get element.
     */
    element () {
      if (this._el !== undefined)
	      return this._el;

      const e = this._el = document.createElement('div');
      e.setAttribute('class', 'rewrite');

      const comments = [];
      let span, rewriteText;
      this._list.forEach(function (rewrite) {
	    
        // This is a blind element
	      span = document.createElement('span');

	      // Set class attribute
	      span.setAttribute('class', rewrite.operation());

	      // Append source information
	      rewriteText = rewrite.src();

	      // Append scope information
	      if (rewrite.scope() !== undefined) {
	        rewriteText += ': ' + rewrite.scope();
	      };

	      // Append source information
	      span.addT(rewriteText);

        comments.push(rewriteText + ' (' + rewrite.operation() + ')');
        
	      this._el.appendChild(span);
      }, this);

      e.setAttribute("title", comments.join("\n"))

      return e;
    }
  };

"use strict";

define(['vc/jsonld', 'vc/rewrite','util'], function (jsonldClass, rewriteClass) {
  return {

    // Construction method
    create : function (json) {
      return Object(jsonldClass).
	      create().
	      upgradeTo(this).
	      fromJson(json);
    },


    /**
     * Deserialize from KoralQuery
     */
    fromJson : function (json) {
      this._list = new Array();
      json.forEach(
        i => 
	        this._list.push(
	          rewriteClass.create(i)
	        )
      );
      return this;
    },


    length : function () {
      return this._list.length;
    },


    /**
     * Get element.
     */
    element : function () {
      if (this._element !== undefined)
	      return this._element;

      const e = this._element = document.createElement('div');
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
        
	      this._element.appendChild(span);
      }, this);

      e.setAttribute("title", comments.join("\n"))

      return e;
    }
  };
});

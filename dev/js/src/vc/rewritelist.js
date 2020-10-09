define(['vc/jsonld', 'vc/rewrite','util'], function (jsonldClass, rewriteClass) {
  return {
    // Construction method
    create : function (json) {
      var obj = Object(jsonldClass).
	        create().
	        upgradeTo(this).
	        fromJson(json);
      return obj;
    },


    /**
     * Deserialize from KoralQuery
     */
    fromJson : function (json) {
      this._list = new Array();
      for (var i = 0; i < json.length; i++) {
	      this._list.push(
	        rewriteClass.create(json[i])
	      );
      };
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

      this._element = document.createElement('div');
      this._element.setAttribute('class', 'rewrite');
      var comments = [];
      this._list.forEach(function(rewrite) {
	    
        // This is a blind element
	      var span = document.createElement('span');

	      // Set class attribute
	      span.setAttribute('class', rewrite.operation());

	      // Append source information
	      var rewriteText = rewrite.src();

	      // Append scope information
	      if (rewrite.scope() !== undefined) {
	        rewriteText += ': ' + rewrite.scope();
	      };

	      // Append source information
	      span.addT(rewriteText);

        comments.push(rewriteText + ' (' + rewrite.operation() + ')');
        
	      this._element.appendChild(span);
      }, this);
      this._element.setAttribute("title", comments.join("\n"))
      return this._element;
    }
  };
});

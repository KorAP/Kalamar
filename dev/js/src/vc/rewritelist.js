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

    /**
     * Get element.
     */
    element : function () {
      if (this._element !== undefined)
	      return this._element;

      this._element = document.createElement('div');
      this._element.setAttribute('class', 'rewrite');
      for (var x in this._list) {
	      var rewrite = this._list[x];
	      var span = document.createElement('span');

	      // Set class attribute
	      span.setAttribute('class', rewrite.operation());

	      // Append source information
	      span.addT(rewrite.src());

	      // Append scope information
	      if (rewrite.scope() !== undefined) {
	        span.addT(': ' + rewrite.scope());
	      };
	      this._element.appendChild(span);
      };
      return this._element;
    }
  };
});

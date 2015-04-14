/**
 * Unspecified criterion
 */
define(['vc/jsonld', 'vc/doc', 'util'], function (jsonldClass, docClass) {

  var loc = KorAP.Locale;
  loc.EMPTY = loc.EMPTY || '⋯';

  return {
    _ldType : "non",
    create : function (parent) {
      var obj = Object.create(jsonldClass).
	upgradeTo(this);

      if (parent !== undefined)
	obj._parent = parent;

      return obj;
    },

    // Set key - replace
    key : function (v) {

      // Not replaceable
      if (this._parent === undefined)
	return null;

      // Set JSON-LD type
      var newDoc = docClass.create(this._parent, {
	"@type" : "koral:doc",
	"value" : "",
	"key"   : v
      });

      // Unspecified document on root
      if (this._parent.ldType() === null) {
	this._parent.root(newDoc);
	this.destroy();
      }

      // Unspecified document in group
      else {
	this._parent.replaceOperand(this, newDoc);
      };
      this._parent.update();
      return newDoc;
    },

    update : function () {

      if (this._element === undefined)
	return this.element();

      // Remove element content
      _removeChildren(this._element);

      var ellipsis = document.createElement('span');
      ellipsis.appendChild(document.createTextNode(loc.EMPTY));
      this._element.appendChild(ellipsis);

      // Set ref - TODO: Cleanup!
      this._element.refTo = this;

      // Set operators
      if (this._parent !== undefined && this.parent().ldType() !== null) {
	var op = this.operators(
	  false,
	  false,
	  true
	);
	
	this._element.appendChild(
	  op.element()
	);
      };

      return this.element();
    },

    element : function () {
      if (this._element !== undefined)
	return this._element;
      this._element = document.createElement('div');
      this._element.setAttribute('class', 'doc unspecified');
      this.update();
      return this._element;
    },
  };
});

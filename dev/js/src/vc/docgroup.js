/**
 * Document group criterion
 */
define([
  'vc/jsonld',
  'vc/unspecified',
  'vc/doc',
  'util'
], function (jsonldClass,
	     unspecClass,
	     docClass) {

  var _validGroupOpRE = new RegExp("^(?:and|or)$");

  var loc = KorAP.Locale;

  var docGroupClass = {
    _ldType : "docGroup",

    create : function (parent, json) {
      var obj = Object.create(jsonldClass).upgradeTo(this);
      obj._operands = [];
      obj.fromJson(json);
      if (parent !== undefined)
	obj._parent = parent;
      return obj;
    },
    
    newAfter : function (obj) {
      for (var i = 0; i < this._operands.length; i++) {
	if (this._operands[i] === obj) {
	  var operand = unspecClass.create(this);
	  this._operands.splice(i + 1, 0, operand);
	  return this.update();
	};
      };
    },

    // The doc is already set in the group
    _duplicate : function (operand) {
      if (operand.ldType() !== 'doc')
	return null;

      for (var i = 0; i < this._operands.length; i++) {
	var op = this.getOperand(i);
	if (op.ldType() === 'doc'
	    && operand.key() === op.key()
	    && operand.matchop() === op.matchop()
	    && operand.value() === op.value()) {
	  return op;
	};
      };
      return null;
    },
    
    append : function (operand) {
      
      // Append unspecified object
      if (operand === undefined) {

	// Be aware of cyclic structures!
	operand = unspecClass.create(this);
	this._operands.push(operand);
	return operand;
      };
      
      switch (operand["@type"]) {
	
      case undefined:
	// No @type defined
	if (operand["ldType"] !== undefined) {
	  if (operand.ldType() !== 'doc' &&
	      operand.ldType() !== 'docGroup') {
	    KorAP.log(812, "Operand not supported in document group");
	    return;
	  };

	  // Be aware of cyclic structures!
	  operand.parent(this);

	  var dupl = this._duplicate(operand);
	  if (dupl === null) {
	    this._operands.push(operand);
	    return operand;
	  };
	  return dupl;
	};

	KorAP.log(701, "JSON-LD group has no @type attribute");
	return;

      case "koral:doc":
	// Be aware of cyclic structures!
	var doc = docClass.create(this, operand);
	if (doc === undefined)
	  return;
	var dupl = this._duplicate(doc);
	if (dupl === null) {
	  this._operands.push(doc);
	  return doc;
	};
	return dupl;

      case "koral:docGroup":
	// Be aware of cyclic structures!
	var docGroup = docGroupClass.create(this, operand);
	if (docGroup === undefined)
	  return;

	// Flatten group
	if (docGroup.operation() === this.operation()) {
	  for (var op in docGroup.operands()) {
	    op = docGroup.getOperand(op);
	    var dupl = this._duplicate(op);
	    if (dupl === null) {
	      this._operands.push(op);
	      op.parent(this);
	    };
	  };
	  docGroup._operands = [];
	  docGroup.destroy();
	  return this;
	};
	this._operands.push(docGroup);
	return docGroup;

      default:
	KorAP.log(812, "Operand not supported in document group");
	return;
      };
    },

    update : function () {
      // There is only one operand in group
      
      if (this._operands.length === 1) {
	
	var parent = this.parent();
	var op = this.getOperand(0);
	
	// This will prevent destruction of
	// the operand
	this._operands = [];

	// Parent is a group
	if (parent.ldType() !== null)
	  return parent.replaceOperand(this, op).update();

	// Parent is vc
	else {
	  this.destroy();
	  // Cyclic madness
	  parent.root(op);
	  op.parent(parent);
	  return parent.root();
	};
      };

      if (this._element === undefined)
	return this;

      var group = this._element;
      group.setAttribute('data-operation', this.operation());

      _removeChildren(group);

      // Append operands
      for (var i = 0; i < this._operands.length; i++) {
	group.appendChild(
	  this.getOperand(i).element()
	);
      };

      // Set operators
      var op = this.operators(
	this.operation() == 'and' ? false : true,
	this.operation() == 'or'  ? false : true,
	true
      );

      group.appendChild(op.element());

      return this;
    },

    element : function () {
      if (this._element !== undefined)
	return this._element;

      this._element = document.createElement('div');
      this._element.setAttribute('class', 'docGroup');

      // Update the object - including optimization
      this.update();

      return this._element;
    },

    operation : function (op) {
      if (arguments.length === 1) {
	if (_validGroupOpRE.test(op)) {
	  this._op = op;
	}
	else {
	  KorAP.log(810, "Unknown operation type");
	  return;
	};
      };
      return this._op || 'and';
    },

    operands : function () {
      return this._operands;
    },

    getOperand : function (index) {
      return this._operands[index];
    },

    // Replace operand
    replaceOperand : function (oldOp, newOp) {
      
      for (var i = 0; i < this._operands.length; i++) {
	if (this._operands[i] === oldOp) {
	  
	  // Just insert a doc or ...
	  if (newOp.ldType() === "doc" ||
	      newOp.ldType() === "non" ||
	      // ... insert a group of a different operation
	      // (i.e. "and" in "or"/"or" in "and")
	      newOp.operation() != this.operation()) {
	    this._operands[i] = newOp;
	    newOp.parent(this);
	  }

	  // Flatten group
	  else {
	    // Remove old group
	    this._operands.splice(i, 1);

	    // Inject new operands
	    for (var op in newOp.operands().reverse()) {
	      op = newOp.getOperand(op);
	      this._operands.splice(i, 0, op);
	      op.parent(this);
	    };
	    // Prevent destruction of operands
	    newOp._operands = [];
	    newOp.destroy();
	  };
	  oldOp.destroy();
	  return this;
	}
      };
      return false;
    },

    // Delete operand from group
    delOperand : function (obj) {
      for (var i = 0; i < this._operands.length; i++) {
	if (this._operands[i] === obj) {
	  
	  // Delete identified operand
	  this._operands.splice(i,1);

	  // Destroy object for cyclic references
	  obj.destroy();

	  return this;
	};
      };

      // Operand not found
      return undefined;
    },
    
    // Deserialize from json
    fromJson : function (json) {
      if (json === undefined)
	return this;

      if (json["@type"] === undefined) {
	KorAP.log(701, "JSON-LD group has no @type attribute");
	return;
      };

      if (json["operation"] === undefined ||
	  typeof json["operation"] !== 'string') {
	KorAP.log(811, "Document group expects operation");
	return;
      };

      var operation = json["operation"];

      this.operation(operation.replace(/^operation:/,''));

      if (json["operands"] === undefined ||
	  !(json["operands"] instanceof Array)) {
	KorAP.log(704, "Operation needs operand list")
	return;
      };

      // Add all documents
      for (var i in json["operands"]) {
	var operand = json["operands"][i];
	this.append(operand);
      };
      
      return this;
    },

    toJson : function () {
      var opArray = new Array();
      for (var i = 0; i < this._operands.length; i++) {
	if (this._operands[i].ldType() !== 'non')
	  opArray.push(this._operands[i].toJson());
      };
      return {
	"@type"     : "koral:" + this.ldType(),
	"operation" : "operation:" + this.operation(),
	"operands"  : opArray
      };
    },

    toQuery : function (brackets) {
      var list = this._operands
	.filter(function (op) {
	  return op.ldType() !== 'non';
	})
	.map(function (op) {
	  return (op.ldType() === 'docGroup') ?
	    op.toQuery(true) :
	    op.toQuery();
	});
      
      if (list.length === 1)
	return list.join('');
      else {
	var str = list.join(this.operation() === 'or' ? ' | ' : ' & ');
	return brackets ? '(' + str + ')' : str;
      };
    }
  };
  return docGroupClass;
});

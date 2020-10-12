/**
 * Document group criterion
 */
/*
 * TODO: Let the UPDATE event bubble up through parents!
 */
define([
  'vc/jsonld',
  'vc/unspecified',
  'vc/doc',
  'vc/docgroupref',
  'util'
], function (jsonldClass,
	           unspecClass,
	           docClass,
             docGroupRefClass) {

  const _validGroupOpRE = new RegExp("^(?:and|or)$");

  const docGroupClass = {
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
      this._operands.forEach(function (op, i) {
	      if (op === obj) {
	        var operand = unspecClass.create(this);
	        this._operands.splice(i + 1, 0, operand);
	        return this.update();
	      };
      }, this);
    },

    // The doc is already set in the group
    _duplicate : function (operand) {

      // TODO:
      //   Also check for duplicate docGroupRefs!
      
      if (operand.ldType() !== 'doc')
	      return null;

      const f = this._operands.find(
        op => 
	        op.ldType() === 'doc'
	        && operand.key() === op.key()
	        && operand.matchop() === op.matchop()
	        && operand.value() === op.value()
      );

      if (f)
        return f;

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
	            operand.ldType() !== 'docGroup' &&
              operand.ldType() !== 'docGroupRef') {
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
          docGroup.operands().forEach(function(op) {
	          var dupl = this._duplicate(op);
	          if (dupl === null) {
	            this._operands.push(op);
	            op.parent(this);
	          };
	        }, this);
	        docGroup._operands = [];
	        docGroup.destroy();
	        return this;
	      };
	      this._operands.push(docGroup);
	      return docGroup;

      case "koral:docGroupRef":
      
        var docGroupRef = docGroupRefClass.create(this, operand);
      
        if (docGroupRef === undefined) {
          return
        };

        // TODO:
        //   Currently this doesn't do anything meaningful,
        //   as duplicate only checks on docs for the moment
        /*
	      var dupl = this._duplicate(doc);
	      if (dupl === null) {
	        this._operands.push(doc);
	        return doc;
	      };
	      return dupl;
        */
	      this._operands.push(docGroupRef);
        return docGroupRef;

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
      this._operands.forEach(
        op => group.appendChild(op.element())
      );

      // Set operators
      var op = this.operators(
	      this.operation() == 'and' ? false : true,
	      this.operation() == 'or'  ? false : true,
	      true
      );

      group.appendChild(op.element());

      if (KorAP.vc) {
        var vcchevent = new CustomEvent('vcChange', {'detail':this});
        KorAP.vc.element().dispatchEvent(vcchevent);
      };
      
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
              newOp.ldType() === 'docGroupRef' ||
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
            newOp.operands().reverse().forEach(function(op) {
	            this._operands.splice(i, 0, op);
	            op.parent(this);
	          }, this);
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
      json["operands"].forEach(i => this.append(i));
      
      return this;
    },

    toJson : function () {
      var opArray = new Array();
      this._operands.forEach(function(op) {
	      if (op.ldType() !== 'non')
	        opArray.push(op.toJson());
      });
      return {
	      "@type"     : "koral:" + this.ldType(),
	      "operation" : "operation:" + this.operation(),
	      "operands"  : opArray
      };
    },

    toQuery : function (brackets) {
      var list = this._operands
	        .filter(function (op) {
            return !op.incomplete();
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

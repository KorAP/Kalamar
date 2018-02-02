/*
 * Todo: In demoSpec: Create "and" on the last element of the top "or"-Group
 */
define(['vc'], function () {

  var vcClass =          require('vc');
  var docClass =         require('vc/doc');
  var menuClass =        require('vc/menu');
  var prefixClass =      require('vc/prefix');
  var docGroupClass =    require('vc/docgroup');
  var unspecifiedClass = require('vc/unspecified');
  var operatorsClass =   require('vc/operators');
  var rewriteClass =     require('vc/rewrite');
  var stringValClass =   require('vc/stringval');

  // Helper method for building factories
  buildFactory = function (objClass, defaults) {
    return {
      create : function (overwrites) {
	      var newObj = {};
	      for (var prop in defaults) {
	        newObj[prop] = defaults[prop];
	      };
	      for (var prop in overwrites) {
	        newObj[prop] = overwrites[prop];
	      };
	      return objClass.create().fromJson(newObj);
      }
    }
  };

  function _andOn (obj) {
    KorAP._and.bind(obj.element().lastChild.firstChild).apply();
  };

  function _orOn (obj) {
    KorAP._or.bind(obj.element().lastChild.firstChild).apply();
  };

  function _delOn (obj) {
    KorAP._delete.bind(obj.element().lastChild.firstChild).apply();
  };

  var demoFactory = buildFactory(vcClass, {
    "@type":"koral:docGroup",
    "operation":"operation:or",
    "operands":[
      {
	"@type":"koral:docGroup",
	"operation":"operation:and",
	"operands":[
          {
            "@type":"koral:doc",
            "key":"Titel",
            "value":"Baum",
            "match":"match:eq"
          },
          {
            "@type":"koral:doc",
            "key":"Veröffentlichungsort",
            "value":"hihi",
            "match":"match:eq"
          },
          {
            "@type":"koral:docGroup",
            "operation":"operation:or",
            "operands":[
              {
		"@type":"koral:doc",
		"key":"Titel",
		"value":"Baum",
		"match":"match:eq"
              },
              {
		"@type":"koral:doc",
		"key":"Veröffentlichungsort",
		"value":"hihi",
		"match":"match:eq"
              }
            ]
          }
	]
      },
      {
	"@type":"koral:doc",
	"key":"Untertitel",
	"value":"huhu",
	"match":"match:eq"
      }
    ]
  });

  describe('KorAP.Doc', function () {
    // Create example factories
    var stringFactory = buildFactory(docClass, {
      "key"   : "author",
      "value" : "Max Birkendale",
      "@type" : "koral:doc"
    });

    // Create example factories
    var dateFactory = buildFactory(docClass, {
      "key"   : "pubDate",
      "type"  : "type:date",
      "match" : "match:eq",
      "value" : "2014-11-05",
      "@type" : "koral:doc"
    });

    // Create example factories
    var regexFactory = buildFactory(docClass, {
      "key"   : "title",
      "type"  : "type:regex",
      "value" : "[^b]ee.+?",
      "@type" : "koral:doc"
    });

    it('should be initializable', function () {
      var doc = docClass.create();
      expect(doc.matchop()).toEqual('eq');
      expect(doc.key()).toBeUndefined();
      expect(doc.value()).toBeUndefined();
      expect(doc.type()).toEqual("string");
    });

    it('should be definable', function () {

      // Empty doc
      var doc = docClass.create();

      // Set values
      doc.key("title");
      doc.value("Der alte Mann");
      expect(doc.matchop()).toEqual('eq');
      expect(doc.key()).toEqual("title");
      expect(doc.type()).toEqual("string");
      expect(doc.value()).toEqual("Der alte Mann");
    });


    it('should deserialize JSON-LD string', function () {
      var doc;

      // String default
      doc = stringFactory.create();
      expect(doc.matchop()).toEqual('eq');
      expect(doc.key()).toEqual("author");
      expect(doc.type()).toEqual("string");
      expect(doc.value()).toEqual("Max Birkendale");

      // No valid string
      doc = stringFactory.create({
	      value : undefined
      });
      expect(doc).toBeUndefined();

      // No valid string
      doc = stringFactory.create({
	      value : { "foo" : "bar" }
      });
      expect(doc).toBeUndefined();

      // Change match type
      doc = stringFactory.create({
	      "match" : "match:ne"
      });

      expect(doc.matchop()).toEqual('ne');
      expect(doc.key()).toEqual("author");
      expect(doc.type()).toEqual("string");
      expect(doc.value()).toEqual("Max Birkendale");

      // Invalid match type
      doc = stringFactory.create({
	      "match" : { "foo" : "bar" }
      });
      expect(doc).toBeUndefined();
    });

    it('should deserialize JSON-LD regex', function () {
      var doc = regexFactory.create();
      expect(doc.key()).toEqual("title");
      expect(doc.type()).toEqual("regex");
      expect(doc.value()).toEqual("[^b]ee.+?");
      expect(doc.matchop()).toEqual('eq');

      // change matcher
      doc = regexFactory.create({
	      match : "match:ne"
      });
      expect(doc.matchop()).toEqual('ne');
      expect(doc.rewrites()).toBeUndefined();

      // Invalid matcher
      doc = regexFactory.create({
	      match : "match:chook"
      });
      expect(doc.matchop()).toEqual('eq');
      expect(doc.rewrites()).toBeDefined();

      // Invalid regex
      doc = regexFactory.create({
	      value : "[^b"
      });
      expect(doc).toBeUndefined();
    });

    it('should deserialize JSON-LD date', function () {

      // Normal date
      doc = dateFactory.create({});

      expect(doc.matchop()).toEqual('eq');
      expect(doc.key()).toEqual("pubDate");
      expect(doc.type()).toEqual("date");
      expect(doc.value()).toEqual("2014-11-05");

      // Short date 1
      doc = dateFactory.create({
	      "value" : "2014-11"
      });

      expect(doc.matchop()).toEqual('eq');
      expect(doc.key()).toEqual("pubDate");
      expect(doc.type()).toEqual("date");
      expect(doc.value()).toEqual("2014-11");

      // Short date 2
      doc = dateFactory.create({
	      "value" : "2014"
      });

      expect(doc.matchop()).toEqual('eq');
      expect(doc.key()).toEqual("pubDate");
      expect(doc.type()).toEqual("date");
      expect(doc.value()).toEqual("2014");

      // Invalid date!
      doc = dateFactory.create({
	      "value" : "2014-11-050"
      });
      expect(doc).toBeUndefined();

      // Invalid matcher!
      doc = dateFactory.create({
	      "match" : "match:ne",
      });
      expect(doc).toBeDefined();
      expect(doc.rewrites()).toBeDefined();
      expect(doc.matchop()).toEqual('eq');
    });

    it('should be serializale to JSON', function () {

      // Empty doc
      var doc = docClass.create();
      expect(doc.toJson()).toEqual(jasmine.any(Object));

      // Serialize string
      doc = stringFactory.create();
      expect(doc.toJson()).toEqual(jasmine.objectContaining({
	"@type" : "koral:doc",
	"type" : "type:string",
	"key" : "author",
	"value" : "Max Birkendale",
	"match" : "match:eq"
      }));

      // Serialize regex
      doc = regexFactory.create();
      expect(doc.toJson()).toEqual(jasmine.objectContaining({
	"@type" : "koral:doc",
	"type" : "type:regex",
	"value" : "[^b]ee.+?",
	"match" : "match:eq",
	"key" : 'title'
      }));

      doc = regexFactory.create({
	match: "match:ne"
      });
      expect(doc.toJson()).toEqual(jasmine.objectContaining({
	"@type" : "koral:doc",
	"type" : "type:regex",
	"value" : "[^b]ee.+?",
	"match" : "match:ne",
	"key" : 'title'
      }));

      doc = dateFactory.create();
      expect(doc.toJson()).toEqual(jasmine.objectContaining({
	      "@type" : "koral:doc",
	      "type" : "type:date",
	      "value" : "2014-11-05",
	      "match" : "match:eq",
	      "key" : 'pubDate'
      }));

      doc = dateFactory.create({
	value : "2014"
      });
      expect(doc.toJson()).toEqual(jasmine.objectContaining({
	"@type" : "koral:doc",
	"type" : "type:date",
	"value" : "2014",
	"match" : "match:eq",
	"key" : 'pubDate'
      }));
    });


    it('should be serializale to String', function () {
      // Empty doc
      var doc = docClass.create();
      expect(doc.toQuery()).toEqual("");

      // Serialize string
      doc = stringFactory.create();
      expect(doc.toQuery()).toEqual('author = "Max Birkendale"');

      // Serialize string with quotes
      doc = stringFactory.create({ "value" : 'Max "Der Coole" Birkendate'});
      expect(doc.toQuery()).toEqual('author = "Max \\"Der Coole\\" Birkendate"');

      // Serialize regex
      doc = regexFactory.create();
      expect(doc.toQuery()).toEqual('title = /[^b]ee.+?/');

      doc = regexFactory.create({
	      match: "match:ne"
      });
      expect(doc.toQuery()).toEqual('title != /[^b]ee.+?/');

      doc = regexFactory.create({
	      value: "WPD/AAA/00001"
      });
      expect(doc.toQuery()).toEqual('title = /WPD\\/AAA\\/00001/');

      doc = dateFactory.create();
      expect(doc.toQuery()).toEqual('pubDate in 2014-11-05');

      doc = dateFactory.create({
	      value : "2014"
      });
      expect(doc.toQuery()).toEqual('pubDate in 2014');
    });
  });


  describe('KorAP.DocGroup', function () {
    // Create example factories
    var docFactory = buildFactory(
      docClass,
      {
	"@type" : "koral:doc",
	"match":"match:eq",
	"key" : "author",
	"value" : "Max Birkendale"
      }
    );

    var docGroupFactory = buildFactory(
      docGroupClass, {
	"@type" : "koral:docGroup",
	"operation" : "operation:and",
	"operands" : [
	  docFactory.create().toJson(),
	  docFactory.create({
	    "key" : "pubDate",
	    "type" : "type:date",
	    "value" : "2014-12-05"
	  }).toJson()
	]
      });

    it('should be initializable', function () {
      // Create empty group
      var docGroup = docGroupClass.create();
      expect(docGroup.operation()).toEqual('and');

      // Create empty group
      docGroup = docGroupClass.create();
      docGroup.operation('or');
      expect(docGroup.operation()).toEqual('or');
    });

    it('should be definable', function () {

      // Empty group
      var docGroup = docGroupClass.create();
      expect(docGroup.operation()).toEqual('and');

      // Set values
      docGroup.operation("or");
      expect(docGroup.operation()).toEqual('or');

      // Set invalid values
      docGroup.operation("hui");
      expect(docGroup.operation()).toEqual('or');
    });

    it('should be deserializable', function () {
      var docGroup = docGroupFactory.create();
      expect(docGroup.operation()).toEqual("and");
      expect(docGroup.operands().length).toEqual(2);

      var op1 = docGroup.getOperand(0);
      expect(op1.type()).toEqual("string");
      expect(op1.key()).toEqual("author");
      expect(op1.value()).toEqual("Max Birkendale");
      expect(op1.matchop()).toEqual("eq");

      var op2 = docGroup.getOperand(1);
      expect(op2.type()).toEqual("date");
      expect(op2.key()).toEqual("pubDate");
      expect(op2.value()).toEqual("2014-12-05");
      expect(op2.matchop()).toEqual("eq");

      // Append empty group
      var newGroup = docGroup.append(docGroupClass.create());
      newGroup.operation('or');
      newGroup.append(docFactory.create());
      newGroup.append(docFactory.create({
	"type" : "type:regex",
	"key" : "title",
	"value" : "^e.+?$",
	"match" : "match:ne"
      }));

      expect(docGroup.operation()).toEqual("and");
      expect(docGroup.operands().length).toEqual(3);

      var op1 = docGroup.getOperand(0);
      expect(op1.ldType()).toEqual("doc");
      expect(op1.type()).toEqual("string");
      expect(op1.key()).toEqual("author");
      expect(op1.value()).toEqual("Max Birkendale");
      expect(op1.matchop()).toEqual("eq");

      var op2 = docGroup.getOperand(1);
      expect(op2.ldType()).toEqual("doc");
      expect(op2.type()).toEqual("date");
      expect(op2.key()).toEqual("pubDate");
      expect(op2.value()).toEqual("2014-12-05");
      expect(op2.matchop()).toEqual("eq");

      var op3 = docGroup.getOperand(2);
      expect(op3.ldType()).toEqual("docGroup");
      expect(op3.operation()).toEqual("or");

      var op4 = op3.getOperand(0);
      expect(op4.ldType()).toEqual("doc");
      expect(op4.type()).toEqual("string");
      expect(op4.key()).toEqual("author");
      expect(op4.value()).toEqual("Max Birkendale");
      expect(op4.matchop()).toEqual("eq");

      var op5 = op3.getOperand(1);
      expect(op5.ldType()).toEqual("doc");
      expect(op5.type()).toEqual("regex");
      expect(op5.key()).toEqual("title");
      expect(op5.value()).toEqual("^e.+?$");
      expect(op5.matchop()).toEqual("ne");
    });

    it('should be serializable to JSON', function () {
      var docGroup = docGroupFactory.create();

      expect(docGroup.toJson()).toEqual(jasmine.objectContaining({
	"@type" : "koral:docGroup",
	"operation" : "operation:and",
	"operands" : [
	  {
	    "@type": 'koral:doc',
	    "key" : 'author',
	    "match": 'match:eq',
	    "value": 'Max Birkendale',
	    "type": 'type:string'
	  },
	  {
	    "@type": 'koral:doc',
	    "key": 'pubDate',
	    "match": 'match:eq',
	    "value": '2014-12-05',
	    "type": 'type:date'
	  }
	]
      }));
    });

    it('should be serializable to String', function () {
      var docGroup = docGroupFactory.create();
      expect(docGroup.toQuery()).toEqual(
	'author = "Max Birkendale" & pubDate in 2014-12-05'
      );

      docGroup = docGroupFactory.create({
	"@type" : "koral:docGroup",
	"operation" : "operation:or",
	"operands" : [
	  {
	    "@type": 'koral:doc',
	    "key" : 'author',
	    "match": 'match:eq',
	    "value": 'Max Birkendale',
	    "type": 'type:string'
	  },
	  {
	    "@type" : "koral:docGroup",
	    "operation" : "operation:and",
	    "operands" : [
	      {
		"@type": 'koral:doc',
		"key": 'pubDate',
		"match": 'match:geq',
		"value": '2014-05-12',
		"type": 'type:date'
	      },
	      {
		"@type": 'koral:doc',
		"key": 'pubDate',
		"match": 'match:leq',
		"value": '2014-12-05',
		"type": 'type:date'
	      },
	      {
		"@type": 'koral:doc',
		"key": 'foo',
		"match": 'match:ne',
		"value": '[a]?bar',
		"type": 'type:regex'
	      }
	    ]
	  }
	]
      });
      expect(docGroup.toQuery()).toEqual(
	'author = "Max Birkendale" | ' +
	  '(pubDate since 2014-05-12 & ' +
	  'pubDate until 2014-12-05 & foo != /[a]?bar/)'
      );
    });
  });

  describe('KorAP.UnspecifiedDoc', function () {
    it('should be initializable', function () {
      var doc = unspecifiedClass.create();
      var docElement = doc.element();
      expect(docElement.getAttribute('class')).toEqual('doc unspecified');
      expect(docElement.firstChild.firstChild.data).toEqual('⋯');
      expect(docElement.lastChild.lastChild.data).toEqual('⋯');
      expect(doc.toQuery()).toEqual('');

      // Only removable
      expect(docElement.lastChild.children.length).toEqual(0);
    });

    it('should be removable, when no root', function () {
      var docGroup = docGroupClass.create();
      docGroup.operation('or');
      expect(docGroup.operation()).toEqual('or');

      docGroup.append({
	"@type": 'koral:doc',
	"key": 'pubDate',
	"match": 'match:eq',
	"value": '2014-12-05',
	"type": 'type:date'      
      });

      // Add unspecified object
      docGroup.append();

      expect(docGroup.element().getAttribute('class')).toEqual('docGroup');
      expect(docGroup.element().children[0].getAttribute('class')).toEqual('doc');

      var unspec = docGroup.element().children[1];
      expect(unspec.getAttribute('class')).toEqual('doc unspecified');

      // Removable
      expect(unspec.lastChild.children.length).toEqual(1);
      expect(unspec.lastChild.children[0].getAttribute('class')).toEqual('delete');
    });

    it('should be replaceable by a doc', function () {
      var doc = unspecifiedClass.create();
      expect(doc.ldType()).toEqual("non");
      // No parent, therefor not updateable
      expect(doc.key("baum")).toBeNull();

      var docGroup = docGroupClass.create();
      docGroup.operation('or');
      expect(docGroup.operation()).toEqual('or');

      docGroup.append({
	"@type": 'koral:doc',
	"key": 'pubDate',
	"match": 'match:eq',
	"value": '2014-12-05',
	"type": 'type:date'      
      });

      expect(docGroup.toQuery()).toEqual("pubDate in 2014-12-05");
      docGroup.append();

      expect(docGroup.getOperand(0).ldType()).toEqual("doc");
      expect(docGroup.getOperand(1).ldType()).toEqual("non");

      var op = docGroup.getOperand(1).element().lastChild;
      expect(op.getAttribute('class')).toEqual('operators button-group');
      expect(op.children[0].getAttribute('class')).toEqual('delete');
      expect(op.children.length).toEqual(1);

      // Replace unspecified doc
      expect(docGroup.getOperand(1).key("name")).not.toBeNull();
      expect(docGroup.getOperand(1).ldType()).toEqual("doc");
      expect(docGroup.getOperand(1).key()).toEqual("name");
      expect(docGroup.getOperand(1).value()).toEqual("");

      op = docGroup.getOperand(1).element().lastChild;
      expect(op.getAttribute('class')).toEqual('operators button-group');
      expect(op.children[0].getAttribute('class')).toEqual('and');
      expect(op.children[1].getAttribute('class')).toEqual('or');
      expect(op.children[2].getAttribute('class')).toEqual('delete');
      expect(op.children.length).toEqual(3);

      docGroup.getOperand(1).value("Pachelbel");
      expect(docGroup.getOperand(1).value()).toEqual("Pachelbel");
      expect(docGroup.getOperand(1).type()).toEqual("string");
      expect(docGroup.getOperand(1).matchop()).toEqual("eq");

      // Specified!
      expect(docGroup.toQuery()).toEqual('pubDate in 2014-12-05 | name = "Pachelbel"');
    });

    it('should be replaceable on root', function () {
      var vc = vcClass.create();
      expect(vc.toQuery()).toEqual("");

      expect(vc.root().ldType()).toEqual("non");

      // No operators on root
      op = vc.root().element().lastChild;
      expect(op.lastChild.textContent).toEqual('⋯');

      // Replace
      expect(vc.root().key("baum")).not.toBeNull();
      expect(vc.root().ldType()).toEqual("doc");

      op = vc.root().element().lastChild;
      expect(op.getAttribute('class')).toEqual('operators button-group');
      expect(op.children[0].getAttribute('class')).toEqual('and');
      expect(op.children[1].getAttribute('class')).toEqual('or');
      expect(op.children[2].getAttribute('class')).toEqual('delete');
      expect(op.children.length).toEqual(3);
    });
  });

  describe('KorAP.Doc element', function () {
    it('should be initializable', function () {
      var docElement = docClass.create(undefined, {
	"@type" : "koral:doc",
	"key":"Titel",
	"value":"Baum",
	"match":"match:eq"
      });
      expect(docElement.key()).toEqual('Titel');
      expect(docElement.matchop()).toEqual('eq');
      expect(docElement.value()).toEqual('Baum');

      var docE = docElement.element();
      expect(docE.children[0].firstChild.data).toEqual('Titel');
      expect(docE.children[1].firstChild.data).toEqual('eq');
      expect(docE.children[1].getAttribute('data-type')).toEqual('string');
      expect(docE.children[2].firstChild.data).toEqual('Baum');
      expect(docE.children[2].getAttribute('data-type')).toEqual('string');
      
      expect(docElement.toJson()).toEqual(jasmine.objectContaining({
	"@type" : "koral:doc",
	"key":"Titel",
	"value":"Baum",
	"match":"match:eq"
      }));
    });
  });

  describe('KorAP.DocGroup element', function () {
    it('should be initializable', function () {

      var docGroup = docGroupClass.create(undefined, {
	"@type" : "koral:docGroup",
	"operation" : "operation:and",
	"operands" : [
	  {
	    "@type": 'koral:doc',
	    "key" : 'author',
	    "match": 'match:eq',
	    "value": 'Max Birkendale',
	    "type": 'type:string'
	  },
	  {
	    "@type": 'koral:doc',
	    "key": 'pubDate',
	    "match": 'match:eq',
	    "value": '2014-12-05',
	    "type": 'type:date'
	  }
	]
      });

      expect(docGroup.operation()).toEqual('and');
      var e = docGroup.element();
      expect(e.getAttribute('class')).toEqual('docGroup');
      expect(e.getAttribute('data-operation')).toEqual('and');

      var first = e.children[0];
      expect(first.getAttribute('class')).toEqual('doc');
      expect(first.children[0].getAttribute('class')).toEqual('key');
      expect(first.children[1].getAttribute('class')).toEqual('match');
      expect(first.children[2].getAttribute('class')).toEqual('value');
      expect(first.children[2].getAttribute('data-type')).toEqual('string');
      expect(first.children[0].firstChild.data).toEqual('author');
      expect(first.children[1].firstChild.data).toEqual('eq');
      expect(first.children[2].firstChild.data).toEqual('Max Birkendale');

      var second = e.children[1];
      expect(second.getAttribute('class')).toEqual('doc');
      expect(second.children[0].getAttribute('class')).toEqual('key');
      expect(second.children[1].getAttribute('class')).toEqual('match');
      expect(second.children[2].getAttribute('class')).toEqual('value');
      expect(second.children[2].getAttribute('data-type')).toEqual('date');
      expect(second.children[0].firstChild.data).toEqual('pubDate');
      expect(second.children[1].firstChild.data).toEqual('eq');
      expect(second.children[2].firstChild.data).toEqual('2014-12-05');
    });

    it('should be deserializable with nested groups', function () {
      var docGroup = docGroupClass.create(undefined, {
	"@type" : "koral:docGroup",
	"operation" : "operation:or",
	"operands" : [
	  {
	    "@type": 'koral:doc',
	    "key" : 'author',
	    "match": 'match:eq',
	    "value": 'Max Birkendale',
	    "type": 'type:string'
	  },
	  {
	    "@type" : "koral:docGroup",
	    "operation" : "operation:and",
	    "operands" : [
	      {
		"@type": 'koral:doc',
		"key": 'pubDate',
		"match": 'match:geq',
		"value": '2014-05-12',
		"type": 'type:date'
	      },
	      {
		"@type": 'koral:doc',
		"key": 'pubDate',
		"match": 'match:leq',
		"value": '2014-12-05',
		"type": 'type:date'
	      }
	    ]
	  }
	]
      });

      expect(docGroup.operation()).toEqual('or');
      var e = docGroup.element();
      expect(e.getAttribute('class')).toEqual('docGroup');
      expect(e.getAttribute('data-operation')).toEqual('or');

      expect(e.children[0].getAttribute('class')).toEqual('doc');
      var docop = e.children[0].lastChild;
      expect(docop.getAttribute('class')).toEqual('operators button-group');
      expect(docop.children[0].getAttribute('class')).toEqual('and');
      expect(docop.children[1].getAttribute('class')).toEqual('or');
      expect(docop.children[2].getAttribute('class')).toEqual('delete');

      expect(e.children[1].getAttribute('class')).toEqual('docGroup');
      expect(e.children[1].getAttribute('data-operation')).toEqual('and');

      // This and-operation can be "or"ed or "delete"d
      var secop = e.children[1].children[2];
      expect(secop.getAttribute('class')).toEqual('operators button-group');
      expect(secop.children[0].getAttribute('class')).toEqual('or');
      expect(secop.children[1].getAttribute('class')).toEqual('delete');

      // This or-operation can be "and"ed or "delete"d
      expect(e.children[2].getAttribute('class')).toEqual('operators button-group');
      expect(e.lastChild.getAttribute('class')).toEqual('operators button-group');
      expect(e.lastChild.children[0].getAttribute('class')).toEqual('and');
      expect(e.lastChild.children[1].getAttribute('class')).toEqual('delete');
    });
  });

  describe('KorAP.VirtualCorpus', function () {
    var simpleGroupFactory = buildFactory(docGroupClass, {
      "@type" : "koral:docGroup",
      "operation" : "operation:and",
      "operands" : [
	{
	  "@type": 'koral:doc',
	  "key" : 'author',
	  "match": 'match:eq',
	  "value": 'Max Birkendale',
	  "type": 'type:string'
	},
	{
	  "@type": 'koral:doc',
	  "key": 'pubDate',
	  "match": 'match:eq',
	  "value": '2014-12-05',
	  "type": 'type:date'
	}
      ]
    });

    var nestedGroupFactory = buildFactory(vcClass, {
      "@type" : "koral:docGroup",
      "operation" : "operation:or",
      "operands" : [
	{
	  "@type": 'koral:doc',
	  "key" : 'author',
	  "match": 'match:eq',
	  "value": 'Max Birkendale',
	  "type": 'type:string'
	},
	{
	  "@type" : "koral:docGroup",
	  "operation" : "operation:and",
	  "operands" : [
	    {
	      "@type": 'koral:doc',
	      "key": 'pubDate',
	      "match": 'match:geq',
	      "value": '2014-05-12',
	      "type": 'type:date'
	    },
	    {
	      "@type": 'koral:doc',
	      "key": 'pubDate',
	      "match": 'match:leq',
	      "value": '2014-12-05',
	      "type": 'type:date'
	    }
	  ]
	}
      ]
    });

    var flatGroupFactory = buildFactory(vcClass, {
      "@type" : "koral:docGroup",
      "operation" : "operation:and",
      "operands" : [
	{
	  "@type": 'koral:doc',
	  "key": 'pubDate',
	  "match": 'match:geq',
	  "value": '2014-05-12',
	  "type": 'type:date'
	},
	{
	  "@type": 'koral:doc',
	  "key": 'pubDate',
	  "match": 'match:leq',
	  "value": '2014-12-05',
	  "type": 'type:date'
	},
	{
	  "@type": 'koral:doc',
	  "key": 'foo',
	  "match": 'match:eq',
	  "value": 'bar',
	  "type": 'type:string'
	}
      ]
    });
    
    it('should be initializable', function () {
      var vc = vcClass.create();
      expect(vc.element().getAttribute('class')).toEqual('vc');
      expect(vc.root().element().getAttribute('class')).toEqual('doc unspecified');

      // Not removable
      expect(vc.root().element().lastChild.children.length).toEqual(0);
    });

    it('should be based on a doc', function () {
      var vc = vcClass.create().fromJson({
	"@type" : "koral:doc",
	"key":"Titel",
	"value":"Baum",
	"match":"match:eq"
      });

      expect(vc.element().getAttribute('class')).toEqual('vc');
      expect(vc.root().element().getAttribute('class')).toEqual('doc');
      expect(vc.root().key()).toEqual('Titel');
      expect(vc.root().value()).toEqual('Baum');
      expect(vc.root().matchop()).toEqual('eq');

      var docE = vc.root().element();
      expect(docE.children[0].firstChild.data).toEqual('Titel');
      expect(docE.children[1].firstChild.data).toEqual('eq');
      expect(docE.children[1].getAttribute('data-type')).toEqual('string');
      expect(docE.children[2].firstChild.data).toEqual('Baum');
      expect(docE.children[2].getAttribute('data-type')).toEqual('string');
    });

    it('should be based on a docGroup', function () {
      var vc = vcClass.create().fromJson(simpleGroupFactory.create().toJson());

      expect(vc.element().getAttribute('class')).toEqual('vc');
      expect(vc.root().element().getAttribute('class')).toEqual('docGroup');
      expect(vc.root().operation()).toEqual('and');

      var docGroup = vc.root();

      var first = docGroup.getOperand(0);
      expect(first.key()).toEqual('author');
      expect(first.value()).toEqual('Max Birkendale');
      expect(first.matchop()).toEqual('eq');

      var second = docGroup.getOperand(1);
      expect(second.key()).toEqual('pubDate');
      expect(second.value()).toEqual('2014-12-05');
      expect(second.matchop()).toEqual('eq');
    });


    it('should be based on a nested docGroup', function () {
      var vc = nestedGroupFactory.create();

      expect(vc.element().getAttribute('class')).toEqual('vc');
      expect(vc.element().firstChild.getAttribute('class')).toEqual('docGroup');
      expect(vc.element().firstChild.children[0].getAttribute('class')).toEqual('doc');
      var dg = vc.element().firstChild.children[1];
      expect(dg.getAttribute('class')).toEqual('docGroup');
      expect(dg.children[0].getAttribute('class')).toEqual('doc');
      expect(dg.children[1].getAttribute('class')).toEqual('doc');
      expect(dg.children[2].getAttribute('class')).toEqual('operators button-group');
      expect(vc.element().firstChild.children[2].getAttribute('class')).toEqual('operators button-group');
    });    

    it('should be modifiable by deletion in flat docGroups', function () {
      var vc = flatGroupFactory.create();
      var docGroup = vc.root();

      expect(docGroup.element().getAttribute('class')).toEqual('docGroup');

      var doc = docGroup.getOperand(1);
      expect(doc.key()).toEqual("pubDate");
      expect(doc.value()).toEqual("2014-12-05");

      // Remove operand 1
      expect(docGroup.delOperand(doc).update()).not.toBeUndefined();
      expect(doc._element).toEqual(undefined);

      doc = docGroup.getOperand(1);
      expect(doc.key()).toEqual("foo");

      // Remove operand 1
      expect(docGroup.delOperand(doc).update()).not.toBeUndefined();
      expect(doc._element).toEqual(undefined);

      // Only one operand left ...
      expect(docGroup.getOperand(1)).toBeUndefined();
      // ... but there shouldn't be a group anymore at all!
      expect(docGroup.getOperand(0)).toBeUndefined();
      
      var obj = vc.root();
      expect(obj.ldType()).toEqual("doc");
      expect(obj.key()).toEqual("pubDate");
      expect(obj.value()).toEqual("2014-05-12");

      expect(obj.element().getAttribute('class')).toEqual('doc');
    }); 


    it('should be modifiable by deletion in nested docGroups (root case)', function () {
      var vc = nestedGroupFactory.create();

      expect(vc.toQuery()).toEqual(
	'author = "Max Birkendale" | (pubDate since 2014-05-12 & pubDate until 2014-12-05)'
      );

      var docGroup = vc.root();
      expect(docGroup.ldType()).toEqual("docGroup");
      expect(docGroup.operation()).toEqual("or");

      var doc = docGroup.getOperand(0);
      expect(doc.key()).toEqual("author");
      expect(doc.value()).toEqual("Max Birkendale");

      docGroup = docGroup.getOperand(1);
      expect(docGroup.operation()).toEqual("and");

      doc = docGroup.getOperand(0);
      expect(doc.key()).toEqual("pubDate");
      expect(doc.matchop()).toEqual("geq");
      expect(doc.value()).toEqual("2014-05-12");
      expect(doc.type()).toEqual("date");

      doc = docGroup.getOperand(1);
      expect(doc.key()).toEqual("pubDate");
      expect(doc.matchop()).toEqual("leq");
      expect(doc.value()).toEqual("2014-12-05");
      expect(doc.type()).toEqual("date");

      // Remove first operand so everything becomes root
      expect(
	vc.root().delOperand(
	  vc.root().getOperand(0)
	).update().ldType()
      ).toEqual("docGroup");

      expect(vc.root().ldType()).toEqual("docGroup");
      expect(vc.root().operation()).toEqual("and");
      expect(vc.root().getOperand(0).ldType()).toEqual("doc");

      expect(vc.toQuery()).toEqual(
	'pubDate since 2014-05-12 & pubDate until 2014-12-05'
      );
    });

    it('should be modifiable by deletion in nested docGroups (resolve group case)', function () {
      var vc = nestedGroupFactory.create();

      // Get nested group
      var firstGroup = vc.root().getOperand(1);
      firstGroup.append(simpleGroupFactory.create({ "operation" : "operation:or" }));
      
      // Structur is now:
      // or(doc, and(doc, doc, or(doc, doc)))

      // Get nested or in and
      var orGroup = vc.root().getOperand(1).getOperand(2);
      expect(orGroup.ldType()).toEqual("docGroup");
      expect(orGroup.operation()).toEqual("or");

      // Remove 
      // Structur is now:
      // or(doc, and(doc, doc, doc)))
      expect(orGroup.delOperand(orGroup.getOperand(0)).update().operation()).toEqual("and");
      expect(vc.root().getOperand(1).operands().length).toEqual(3);
    });

    it('should be modifiable by deletion in nested docGroups (identical group case)', function () {
      var vc = nestedGroupFactory.create();

      // Get nested group
      var firstGroup = vc.root().getOperand(1);
      firstGroup.append(simpleGroupFactory.create({
	"operation" : "operation:or"
      }));
      var oldAuthor = firstGroup.getOperand(2).getOperand(0);
      oldAuthor.key("title");
      oldAuthor.value("Der Birnbaum");
      
      // Structur is now:
      // or(doc, and(doc, doc, or(doc, doc)))
      expect(vc.toQuery()).toEqual(
	'author = "Max Birkendale" | ' +
	  '(pubDate since 2014-05-12 & ' +
	  'pubDate until 2014-12-05 & ' +
	  '(title = "Der Birnbaum" | ' +
	  'pubDate in 2014-12-05))'
      );

      var andGroup = vc.root().getOperand(1);

      // Get leading docs in and
      var doc1 = andGroup.getOperand(0);
      expect(doc1.ldType()).toEqual("doc");
      expect(doc1.value()).toEqual("2014-05-12");
      var doc2 = andGroup.getOperand(1);
      expect(doc2.ldType()).toEqual("doc");
      expect(doc2.value()).toEqual("2014-12-05");

      // Remove 2
      expect(
	andGroup.delOperand(doc2).update().operation()
      ).toEqual("and");
      // Structur is now:
      // or(doc, and(doc, or(doc, doc)))

      expect(vc.toQuery()).toEqual(
	'author = "Max Birkendale"' +
	  ' | (pubDate since 2014-05-12 & ' +
	  '(title = "Der Birnbaum" | pubDate in 2014-12-05))'
      );


      // Remove 1
      expect(andGroup.delOperand(doc1).update().operation()).toEqual("or");
      // Structur is now:
      // or(doc, doc, doc)

      expect(vc.toQuery()).toEqual(
	'author = "Max Birkendale" | title = "Der Birnbaum" | pubDate in 2014-12-05'
      );
    });

    it('should be reducible to unspecification', function () {
      var vc = demoFactory.create();

      expect(vc.toQuery()).toEqual(vc.root().toQuery());
      expect(vc.toQuery()).toEqual(
	'(Titel = "Baum" & Veröffentlichungsort = "hihi" & ' +
	  '(Titel = "Baum" | Veröffentlichungsort = "hihi")) ' +
	  '| Untertitel = "huhu"');
      expect(vc.root().element().lastChild.children[0].firstChild.nodeValue).toEqual('and');
      expect(vc.root().element().lastChild.children[1].firstChild.nodeValue).toEqual('×');
      expect(vc.root().delOperand(vc.root().getOperand(0)).update()).not.toBeUndefined();
      expect(vc.toQuery()).toEqual('Untertitel = "huhu"');

      var lc = vc.root().element().lastChild;
      expect(lc.children[0].firstChild.nodeValue).toEqual('and');
      expect(lc.children[1].firstChild.nodeValue).toEqual('or');
      expect(lc.children[2].firstChild.nodeValue).toEqual('×');

      // Clean everything
      vc.clean();
      expect(vc.toQuery()).toEqual('');
    });

    it('should flatten on import', function () {
      var vc = vcClass.create().fromJson({
	"@type":"koral:docGroup",
	"operation":"operation:or",
	"operands":[
	  {
	    "@type":"koral:docGroup",
	    "operation":"operation:or",
	    "operands":[
              {
		"@type":"koral:doc",
		"key":"Titel",
		"value":"Baum",
		"match":"match:eq"
              },
              {
		"@type":"koral:doc",
		"key":"Veröffentlichungsort",
		"value":"hihi",
		"match":"match:eq"
              },
              {
		"@type":"koral:docGroup",
		"operation":"operation:or",
		"operands":[
		  {
		    "@type":"koral:doc",
		    "key":"Titel",
		    "value":"Baum",
		    "match":"match:eq"
		  },
		  {
		    "@type":"koral:doc",
		    "key":"Veröffentlichungsort",
		    "value":"hihi",
		    "match":"match:eq"
		  }
		]
              }
	    ]
	  },
	  {
	    "@type":"koral:doc",
	    "key":"Untertitel",
	    "value":"huhu",
	    "match":"match:eq"
	  }
	]
      });

      expect(vc.toQuery()).toEqual(
	'Titel = "Baum" | Veröffentlichungsort = "hihi" | Untertitel = "huhu"'
      );
    });
  });

  describe('KorAP.Operators', function () {
    it('should be initializable', function () {
      var op = operatorsClass.create(true, false, false);
      expect(op.and()).toBeTruthy();
      expect(op.or()).not.toBeTruthy();
      expect(op.del()).not.toBeTruthy();

      op.and(false);
      expect(op.and()).not.toBeTruthy();
      expect(op.or()).not.toBeTruthy();
      expect(op.del()).not.toBeTruthy();

      op.or(true);
      op.del(true);
      expect(op.and()).not.toBeTruthy();
      expect(op.or()).toBeTruthy();
      expect(op.del()).toBeTruthy();

      var e = op.element();
      expect(e.getAttribute('class')).toEqual('operators button-group');
      expect(e.children[0].getAttribute('class')).toEqual('or');
      expect(e.children[0].firstChild.data).toEqual('or');
      expect(e.children[1].getAttribute('class')).toEqual('delete');
      expect(e.children[1].firstChild.data).toEqual('×');

      op.and(true);
      op.del(false);
      op.update();

      e = op.element();
      expect(e.getAttribute('class')).toEqual('operators button-group');
      expect(e.children[0].getAttribute('class')).toEqual('and');
      expect(e.children[0].firstChild.data).toEqual('and');
      expect(e.children[1].getAttribute('class')).toEqual('or');
      expect(e.children[1].firstChild.data).toEqual('or');
    });
  });

  describe('KorAP._delete (event)', function () {
    var complexVCFactory = buildFactory(vcClass,{
      "@type": 'koral:docGroup',
      'operation' : 'operation:and',
      'operands' : [
	{
	  "@type": 'koral:doc',
	  "key": 'pubDate',
	  "match": 'match:eq',
	  "value": '2014-12-05',
	  "type": 'type:date'
	},
	{
	  "@type" : 'koral:docGroup',
	  'operation' : 'operation:or',
	  'operands' : [
	    {
	      '@type' : 'koral:doc',
	      'key' : 'title',
	      'value' : 'Hello World!'
	    },
	    {
	      '@type' : 'koral:doc',
	      'key' : 'foo',
	      'value' : 'bar'
	    }
	  ]
	}
      ]
    });

    it('should clean on root docs', function () {
      var vc = vcClass.create().fromJson({
	"@type": 'koral:doc',
	"key": 'pubDate',
	"match": 'match:eq',
	"value": '2014-12-05',
	"type": 'type:date'
      });
      expect(vc.root().toQuery()).toEqual('pubDate in 2014-12-05');
      expect(vc.root().element().lastChild.getAttribute('class')).toEqual('operators button-group');

      // Clean with delete from root
      expect(vc.root().element().lastChild.lastChild.getAttribute('class')).toEqual('delete');
      _delOn(vc.root());
      expect(vc.root().toQuery()).toEqual('');
      expect(vc.root().element().lastChild.lastChild.data).toEqual('⋯');
    });

    it('should remove on nested docs', function () {
      var vc = vcClass.create().fromJson(
	{
	  "@type": 'koral:docGroup',
	  'operation' : 'operation:and',
	  'operands' : [
	    {
	      "@type": 'koral:doc',
	      "key": 'pubDate',
	      "match": 'match:eq',
	      "value": '2014-12-05',
	      "type": 'type:date'
	    },
	    {
	      "@type" : 'koral:doc',
	      'key' : 'foo',
	      'value' : 'bar'
	    }
	  ]
	}
      );

      // Delete with direct element access
      expect(vc.toQuery()).toEqual('pubDate in 2014-12-05 & foo = "bar"');
      _delOn(vc.root().getOperand(0));

      expect(vc.toQuery()).toEqual('foo = "bar"');
      expect(vc.root().ldType()).toEqual('doc');
    });

    it('should clean on doc groups', function () {
      var vc = vcClass.create().fromJson(
	{
	  "@type": 'koral:docGroup',
	  'operation' : 'operation:and',
	  'operands' : [
	    {
	      "@type": 'koral:doc',
	      "key": 'pubDate',
	      "match": 'match:eq',
	      "value": '2014-12-05',
	      "type": 'type:date'
	    },
	    {
	      "@type" : 'koral:doc',
	      'key' : 'foo',
	      'value' : 'bar'
	    }
	  ]
	}
      );

      // Cleanwith direct element access
      expect(vc.toQuery()).toEqual('pubDate in 2014-12-05 & foo = "bar"');
      _delOn(vc.root());
      expect(vc.toQuery()).toEqual('');
      expect(vc.root().ldType()).toEqual('non');
    });

    it('should remove on nested doc groups (case of ungrouping 1)', function () {
      var vc = complexVCFactory.create();

      // Delete with direct element access
      expect(vc.toQuery()).toEqual(
	'pubDate in 2014-12-05 & (title = "Hello World!" | foo = "bar")'
      );

      // Remove hello world:
      _delOn(vc.root().getOperand(1).getOperand(0));
      expect(vc.toQuery()).toEqual('pubDate in 2014-12-05 & foo = "bar"');
      expect(vc.root().ldType()).toEqual('docGroup');
    });

    it('should remove on nested doc groups (case of ungrouping 2)', function () {
      var vc = complexVCFactory.create();

      // Delete with direct element access
      expect(vc.toQuery()).toEqual(
	'pubDate in 2014-12-05 & (title = "Hello World!" | foo = "bar")'
      );

      // Remove bar
      _delOn(vc.root().getOperand(1).getOperand(1));
      expect(vc.toQuery()).toEqual('pubDate in 2014-12-05 & title = "Hello World!"');
      expect(vc.root().ldType()).toEqual('docGroup');
      expect(vc.root().operation()).toEqual('and');
    });

    it('should remove on nested doc groups (case of root changing)', function () {
      var vc = complexVCFactory.create();

      // Delete with direct element access
      expect(vc.toQuery()).toEqual(
	'pubDate in 2014-12-05 & ' +
	  '(title = "Hello World!" | foo = "bar")'
      );

      // Remove bar
      _delOn(vc.root().getOperand(0));
      expect(vc.toQuery()).toEqual('title = "Hello World!" | foo = "bar"');
      expect(vc.root().ldType()).toEqual('docGroup');
      expect(vc.root().operation()).toEqual('or');
    });

    it('should remove on nested doc groups (list flattening)', function () {
      var vc = vcClass.create().fromJson(
	{
	  "@type": 'koral:docGroup',
	  'operation' : 'operation:or',
	  'operands' : [
	    {
	      "@type": 'koral:doc',
	      "key": 'pubDate',
	      "match": 'match:eq',
	      "value": '2014-12-05',
	      "type": 'type:date'
	    },
	    {
	      "@type" : 'koral:doc',
	      'key' : 'foo',
	      'value' : 'bar'
	    },
	    {
	      "@type": 'koral:docGroup',
	      'operation' : 'operation:and',
	      'operands' : [
		{
		  "@type": 'koral:doc',
		  "key": 'pubDate',
		  "match": 'match:eq',
		  "value": '2014-12-05',
		  "type": 'type:date'
		},
		{
		  "@type" : 'koral:docGroup',
		  'operation' : 'operation:or',
		  'operands' : [
		    {
		      '@type' : 'koral:doc',
		      'key' : 'title',
		      'value' : 'Hello World!'
		    },
		    {
		      '@type' : 'koral:doc',
		      'key' : 'yeah',
		      'value' : 'juhu'
		    }
		  ]
		}
	      ]
	    }
	  ]
	}
      );

      // Delete with direct element access
      expect(vc.toQuery()).toEqual(
	'pubDate in 2014-12-05 | foo = "bar" | ' +
	  '(pubDate in 2014-12-05 & ' +
	  '(title = "Hello World!" | yeah = "juhu"))'
      );

      expect(vc.root().ldType()).toEqual('docGroup');
      expect(vc.root().operation()).toEqual('or');

      // Operands and operators
      expect(vc.element().firstChild.children.length).toEqual(4);
      expect(vc.element().firstChild.lastChild.getAttribute('class')).toEqual('operators button-group');

      // Remove inner group and flatten
      _delOn(vc.root().getOperand(2).getOperand(0));

      expect(vc.toQuery()).toEqual(
	'pubDate in 2014-12-05 | foo = "bar" | title = "Hello World!" | yeah = "juhu"'
      );
      expect(vc.root().ldType()).toEqual('docGroup');
      expect(vc.root().operation()).toEqual('or');

      // Operands and operators
      expect(vc.element().firstChild.children.length).toEqual(5);
      expect(vc.element().firstChild.lastChild.getAttribute('class')).toEqual('operators button-group');
    });
  });

  describe('KorAP._add (event)', function () {
    var complexVCFactory = buildFactory(vcClass,{
      "@type": 'koral:docGroup',
      'operation' : 'operation:and',
      'operands' : [
	{
	  "@type": 'koral:doc',
	  "key": 'pubDate',
	  "match": 'match:eq',
	  "value": '2014-12-05',
	  "type": 'type:date'
	},
	{
	  "@type" : 'koral:docGroup',
	  'operation' : 'operation:or',
	  'operands' : [
	    {
	      '@type' : 'koral:doc',
	      'key' : 'title',
	      'value' : 'Hello World!'
	    },
	    {
	      '@type' : 'koral:doc',
	      'key' : 'foo',
	      'value' : 'bar'
	    }
	  ]
	}
      ]
    });

    it('should add new unspecified doc with "and"', function () {
      var vc = vcClass.create().fromJson(
	{
	  "@type": 'koral:docGroup',
	  'operation' : 'operation:and',
	  'operands' : [
	    {
	      "@type": 'koral:doc',
	      "key": 'pubDate',
	      "match": 'match:eq',
	      "value": '2014-12-05',
	      "type": 'type:date'
	    },
	    {
	      "@type" : 'koral:doc',
	      'key' : 'foo',
	      'value' : 'bar'
	    }
	  ]
	}
      );

      expect(vc.toQuery()).toEqual('pubDate in 2014-12-05 & foo = "bar"');

      var fc = vc.element().firstChild;
      expect(fc.getAttribute('data-operation')).toEqual('and');
      expect(fc.children.length).toEqual(3);
      expect(fc.lastChild.getAttribute('class')).toEqual('operators button-group');
      expect(fc.children[0].getAttribute('class')).toEqual('doc');
      expect(fc.children[1].getAttribute('class')).toEqual('doc');

      // add with 'and' in the middle
      _andOn(vc.root().getOperand(0));
      expect(vc.toQuery()).toEqual('pubDate in 2014-12-05 & foo = "bar"');

      fc = vc.element().firstChild;
      expect(fc.getAttribute('data-operation')).toEqual('and');
      expect(fc.children.length).toEqual(4);
      expect(fc.lastChild.getAttribute('class')).toEqual('operators button-group');

      expect(fc.children[0].getAttribute('class')).toEqual('doc');
      expect(fc.children[1].getAttribute('class')).toEqual('doc unspecified');
      expect(fc.children[2].getAttribute('class')).toEqual('doc');
    });

    it('should add new unspecified doc with "or"', function () {
      var vc = vcClass.create().fromJson(
	{
	  "@type": 'koral:docGroup',
	  'operation' : 'operation:and',
	  'operands' : [
	    {
	      "@type": 'koral:doc',
	      "key": 'pubDate',
	      "match": 'match:eq',
	      "value": '2014-12-05',
	      "type": 'type:date'
	    },
	    {
	      "@type" : 'koral:doc',
	      'key' : 'foo',
	      'value' : 'bar'
	    }
	  ]
	}
      );

      expect(vc.toQuery()).toEqual('pubDate in 2014-12-05 & foo = "bar"');

      var fc = vc.element().firstChild;
      expect(fc.children.length).toEqual(3);
      expect(fc.lastChild.getAttribute('class')).toEqual('operators button-group');
      expect(fc.children[0].getAttribute('class')).toEqual('doc');
      expect(fc.children[1].getAttribute('class')).toEqual('doc');

      // add with 'or' in the middle
      _orOn(vc.root().getOperand(0));
      expect(vc.toQuery()).toEqual('pubDate in 2014-12-05 & foo = "bar"');
      fc = vc.element().firstChild;

      expect(fc.getAttribute('data-operation')).toEqual('and');
      expect(fc.children.length).toEqual(3);
      expect(fc.children[0].getAttribute('class')).toEqual('docGroup');
      expect(fc.children[0].getAttribute('data-operation')).toEqual('or');
      expect(fc.children[1].getAttribute('class')).toEqual('doc');
      expect(fc.children[2].getAttribute('class')).toEqual('operators button-group');
      expect(fc.lastChild.getAttribute('class')).toEqual('operators button-group');

      fc = vc.element().firstChild.firstChild;
      expect(fc.children.length).toEqual(3);
      expect(fc.children[0].getAttribute('class')).toEqual('doc');
      expect(fc.children[1].getAttribute('class')).toEqual('doc unspecified');
      expect(fc.children[2].getAttribute('class')).toEqual('operators button-group');
      expect(fc.lastChild.getAttribute('class')).toEqual('operators button-group');
    });

    it('should add new unspecified doc with "and" before group', function () {
      var vc = demoFactory.create();

      // Wrap with direct element access
      expect(vc.toQuery()).toEqual(
	'(Titel = "Baum" & ' +
	  'Veröffentlichungsort = "hihi" & ' +
	  '(Titel = "Baum" | ' +
	  'Veröffentlichungsort = "hihi")) | ' +
	  'Untertitel = "huhu"'
      );

      expect(vc.root().getOperand(0).ldType()).toEqual('docGroup');
      expect(vc.root().getOperand(0).operation()).toEqual('and');
      expect(vc.root().getOperand(0).operands().length).toEqual(3);

      // Add unspecified on the second doc
      var secDoc = vc.root().getOperand(0).getOperand(1);
      expect(secDoc.value()).toEqual('hihi');

      // Add
      _andOn(secDoc);

      var fo = vc.root().getOperand(0);

      expect(fo.ldType()).toEqual('docGroup');
      expect(fo.operation()).toEqual('and');
      expect(fo.operands().length).toEqual(4);

      expect(fo.getOperand(0).ldType()).toEqual('doc');
      expect(fo.getOperand(1).ldType()).toEqual('doc');
      expect(fo.getOperand(2).ldType()).toEqual('non');
      expect(fo.getOperand(3).ldType()).toEqual('docGroup');
    });


    it('should remove a doc with an unspecified doc in a nested group', function () {
      var vc = demoFactory.create();

      // Wrap with direct element access
      expect(vc.toQuery()).toEqual(
	'(Titel = "Baum" & Veröffentlichungsort = "hihi" & (Titel = "Baum" | Veröffentlichungsort = "hihi")) | Untertitel = "huhu"'
      );

      var fo = vc.root().getOperand(0).getOperand(0);
      expect(fo.key()).toEqual('Titel');
      expect(fo.value()).toEqual('Baum');

      // Add unspecified on the root group
      _orOn(fo);

      fo = vc.root().getOperand(0).getOperand(0);

      expect(fo.operation()).toEqual('or');
      expect(fo.getOperand(0).ldType()).toEqual('doc');
      expect(fo.getOperand(1).ldType()).toEqual('non');

      // Delete document
      _delOn(fo.getOperand(0));

      // The operand is now non
      expect(vc.root().getOperand(0).getOperand(0).ldType()).toEqual('non');
      expect(vc.root().getOperand(0).getOperand(1).ldType()).toEqual('doc');
      expect(vc.root().getOperand(0).getOperand(2).ldType()).toEqual('docGroup');
    });


    it('should remove an unspecified doc with an doc in a nested group', function () {
      var vc = demoFactory.create();

      // Wrap with direct element access
      expect(vc.toQuery()).toEqual(
	'(Titel = "Baum" & ' +
	  'Veröffentlichungsort = "hihi" & ' +
	  '(Titel = "Baum" ' +
	  '| Veröffentlichungsort = "hihi")) | ' +
	  'Untertitel = "huhu"'
      );

      var fo = vc.root().getOperand(0).getOperand(0);
      expect(fo.key()).toEqual('Titel');
      expect(fo.value()).toEqual('Baum');

      // Add unspecified on the root group
      _orOn(fo);

      fo = vc.root().getOperand(0).getOperand(0);

      expect(fo.operation()).toEqual('or');
      expect(fo.getOperand(0).ldType()).toEqual('doc');
      expect(fo.getOperand(1).ldType()).toEqual('non');

      // Delete unspecified doc
      _delOn(fo.getOperand(1));

      // The operand is now non
      fo = vc.root().getOperand(0);
      expect(fo.getOperand(0).ldType()).toEqual('doc');
      expect(fo.getOperand(0).key()).toEqual('Titel');
      expect(fo.getOperand(0).value()).toEqual('Baum');
      expect(fo.getOperand(1).ldType()).toEqual('doc');
      expect(fo.getOperand(2).ldType()).toEqual('docGroup');
    });


    it('should add on parent group (case "and")', function () {
      var vc = complexVCFactory.create();

      // Wrap with direct element access
      expect(vc.toQuery()).toEqual(
	'pubDate in 2014-12-05 & (title = "Hello World!" | foo = "bar")'
      );

      expect(vc.root().operands().length).toEqual(2);

      // Add unspecified on the root group
      _andOn(vc.root().getOperand(1));
      expect(vc.toQuery()).toEqual(
	'pubDate in 2014-12-05 & (title = "Hello World!" | foo = "bar")'
      );

      expect(vc.root().ldType()).toEqual('docGroup');
      expect(vc.root().operands().length).toEqual(3);
      expect(vc.root().getOperand(0).ldType()).toEqual('doc');
      expect(vc.root().getOperand(1).ldType()).toEqual('docGroup');
      expect(vc.root().getOperand(1).operation()).toEqual('or');
      expect(vc.root().getOperand(2).ldType()).toEqual('non');

      // Add another unspecified on the root group
      _andOn(vc.root().getOperand(1));

      expect(vc.root().operands().length).toEqual(4);
      expect(vc.root().getOperand(0).ldType()).toEqual('doc');
      expect(vc.root().getOperand(1).ldType()).toEqual('docGroup');
      expect(vc.root().getOperand(2).ldType()).toEqual('non');
      expect(vc.root().getOperand(3).ldType()).toEqual('non');

      // Add another unspecified after the first doc
      _andOn(vc.root().getOperand(0));

      expect(vc.root().operands().length).toEqual(5);
      expect(vc.root().getOperand(0).ldType()).toEqual('doc');
      expect(vc.root().getOperand(1).ldType()).toEqual('non');
      expect(vc.root().getOperand(2).ldType()).toEqual('docGroup');
      expect(vc.root().getOperand(3).ldType()).toEqual('non');
      expect(vc.root().getOperand(4).ldType()).toEqual('non');
    });

    it('should wrap on root', function () {
      var vc = vcClass.create().fromJson(
	{
	  "@type": 'koral:docGroup',
	  'operation' : 'operation:and',
	  'operands' : [
	    {
	      "@type": 'koral:doc',
	      "key": 'pubDate',
	      "match": 'match:eq',
	      "value": '2014-12-05',
	      "type": 'type:date'
	    },
	    {
	      "@type" : 'koral:doc',
	      'key' : 'foo',
	      'value' : 'bar'
	    }
	  ]
	}
      );

      // Wrap on root
      expect(vc.toQuery()).toEqual('pubDate in 2014-12-05 & foo = "bar"');
      expect(vc.root().ldType()).toEqual('docGroup');
      expect(vc.root().operation()).toEqual('and');
      _orOn(vc.root());
      expect(vc.root().ldType()).toEqual('docGroup');
      expect(vc.root().operation()).toEqual('or');

      expect(vc.root().getOperand(0).ldType()).toEqual('docGroup');
      expect(vc.root().getOperand(0).operation()).toEqual('and');
    });

    it('should add on root (case "and")', function () {
      var vc = vcClass.create().fromJson(
	{
	  "@type": 'koral:doc',
	  "key": 'pubDate',
	  "match": 'match:eq',
	  "value": '2014-12-05',
	  "type": 'type:date'
	}
      );

      expect(vc.toQuery()).toEqual('pubDate in 2014-12-05');
      expect(vc.root().ldType()).toEqual('doc');
      expect(vc.root().key()).toEqual('pubDate');
      expect(vc.root().value()).toEqual('2014-12-05');

      // Wrap on root
      _andOn(vc.root());
      expect(vc.root().ldType()).toEqual('docGroup');
      expect(vc.root().operation()).toEqual('and');
    });

    it('should add on root (case "or")', function () {
      var vc = vcClass.create().fromJson(
	{
	  "@type": 'koral:doc',
	  "key": 'pubDate',
	  "match": 'match:eq',
	  "value": '2014-12-05',
	  "type": 'type:date'
	}
      );

      expect(vc.toQuery()).toEqual('pubDate in 2014-12-05');
      expect(vc.root().key()).toEqual('pubDate');
      expect(vc.root().value()).toEqual('2014-12-05');

      // Wrap on root
      _orOn(vc.root());
      expect(vc.root().ldType()).toEqual('docGroup');
      expect(vc.root().operation()).toEqual('or');
    });

    it('should support multiple sub groups per group', function () {
      var vc = vcClass.create().fromJson(
	{
	  "@type": 'koral:docGroup',
	  'operation' : 'operation:or',
	  'operands' : [
	    {
	      "@type": 'koral:docGroup',
	      'operation' : 'operation:and',
	      'operands' : [
		{
		  "@type": 'koral:doc',
		  "key": 'title',
		  "value": 't1',
		},
		{
		  "@type" : 'koral:doc',
		  'key' : 'title',
		  'value' : 't2'
		}
	      ]
	    },
	    {
	      "@type": 'koral:docGroup',
	      'operation' : 'operation:and',
	      'operands' : [
		{
		  "@type": 'koral:doc',
		  "key": 'title',
		  "value": 't3',
		},
		{
		  "@type" : 'koral:doc',
		  'key' : 'title',
		  'value' : 't4'
		}
	      ]
	    }
	  ]
	}
      );
      expect(vc.toQuery()).toEqual(
	'(title = "t1" & title = "t2") | ' +
	  '(title = "t3" & title = "t4")'
      );
      expect(vc.root().operation()).toEqual('or');
      expect(vc.root().getOperand(0).toQuery()).toEqual('title = "t1" & title = "t2"');
      expect(vc.root().getOperand(1).toQuery()).toEqual('title = "t3" & title = "t4"');

      _andOn(vc.root());

      expect(vc.root().operation()).toEqual('and');
      expect(vc.root().getOperand(0).ldType()).toEqual('docGroup');
      expect(vc.root().getOperand(1).ldType()).toEqual('non');
    });
  });

  // Check class method
  describe('KorAP.VC.checkRewrite', function () {
    
    it('should check for simple rewrites', function () {
      expect(vcClass.checkRewrite(
        {
          "@type" : "koral:doc",
          "rewrites" : [{
	          "@type" : "koral:rewrite",
	          "operation" : "operation:modification",
	          "src" : "querySerializer",
	          "scope" : "tree"
          }]
        }
      )).toBeTruthy();

      var nested = {
        "@type" : "koral:docGroup",
        "operands" : [
          {
            "@type" : "koral:doc"
          },
          {
            "@type" : "koral:docGroup",
            "operands" : [
              {
                "@type": "koral:doc"
              },
              {
                "@type": "koral:doc"
              }
            ]
          }
        ]
      };

      expect(vcClass.checkRewrite(nested)).toBe(false);

      nested["operands"][1]["operands"][1]["rewrites"] = [{
	      "@type" : "koral:rewrite",
	      "operation" : "operation:modification",
	      "src" : "querySerializer",
	      "scope" : "tree"
      }];

      expect(vcClass.checkRewrite(nested)).toBeTruthy();
    });
  });

  describe('KorAP.Rewrite', function () {
    it('should be initializable', function () {
      var rewrite = rewriteClass.create({
	"@type" : "koral:rewrite",
	"operation" : "operation:modification",
	"src" : "querySerializer",
	"scope" : "tree"
      });
      expect(rewrite.toString()).toEqual('Modification of "tree" by "querySerializer"');
    });

    it('should be deserialized by docs', function () {
      var doc = docClass.create(
	undefined,
	{
	  "@type":"koral:doc",
	  "key":"Titel",
	  "value":"Baum",
	  "match":"match:eq"
	});

      expect(doc.element().classList.contains('doc')).toBeTruthy();
      expect(doc.element().classList.contains('rewritten')).toBe(false);

      doc = docClass.create(
	undefined,
	{
	  "@type":"koral:doc",
	  "key":"Titel",
	  "value":"Baum",
	  "match":"match:eq",
	  "rewrites" : [
	    {
	      "@type" : "koral:rewrite",
	      "operation" : "operation:modification",
	      "src" : "querySerializer",
	      "scope" : "tree"
	    }
	  ]
	});
      
      expect(doc.element().classList.contains('doc')).toBeTruthy();
      expect(doc.element().classList.contains('rewritten')).toBeTruthy();
    });

    xit('should be deserialized by docGroups', function () {
      var docGroup = docGroupClass.create(
	undefined,
	{
	  "@type" : "koral:docGroup",
	  "operation" : "operation:or",
	  "operands" : [
	    {
	      "@type" : "doc",
	      "key" : "pubDate",
	      "type" : "type:date",
	      "value" : "2014-12-05"
	    },
	    {
	      "@type" : "doc",
	      "key" : "pubDate",
	      "type" : "type:date",
	      "value" : "2014-12-06"
	    }
	  ],
	  "rewrites" : [
	    {
	      "@type" : "koral:rewrite",
	      "operation" : "operation:modification",
	      "src" : "querySerializer",
	      "scope" : "tree"
	    }
	  ]
	}
      );

      expect(doc.element().classList.contains('docgroup')).toBeTruthy();
      expect(doc.element().classList.contains('rewritten')).toBe(false);
    });
  });
  /*
    describe('KorAP.DocKey', function () {
    it('should be initializable', function () {
    var docKey = KorAP.DocKey.create();
    expect(docKey.toString()).toEqual('...');
    });
    });

      expect(
	function() { menuItemClass.create([]) }
      ).toThrow(new Error("Missing parameters"));


  */

  describe('KorAP.stringValue', function () {
    it('should be initializable', function () {
      var sv = stringValClass.create();
      expect(sv.regex()).toBe(false);
      expect(sv.value()).toBe('');

      sv = stringValClass.create('Baum');
      expect(sv.regex()).toBe(false);
      expect(sv.value()).toBe('Baum');

      sv = stringValClass.create('Baum', false);
      expect(sv.regex()).toBe(false);
      expect(sv.value()).toBe('Baum');

      sv = stringValClass.create('Baum', true);
      expect(sv.regex()).toBe(true);
      expect(sv.value()).toBe('Baum');
    });

    it('should be modifiable', function () {
      var sv = stringValClass.create();
      expect(sv.regex()).toBe(false);
      expect(sv.value()).toBe('');

      expect(sv.value('Baum')).toBe('Baum');
      expect(sv.value()).toBe('Baum');

      expect(sv.regex(true)).toBe(true);
      expect(sv.regex()).toBe(true);
    });

    it('should have a toggleble regex value', function () {
      var sv = stringValClass.create();

      expect(sv.element().firstChild.value).toBe('');
      sv.element().firstChild.value = 'der'
      expect(sv.element().firstChild.value).toBe('der');

      expect(sv.regex()).toBe(false);

      sv.toggleRegex();
      expect(sv.element().firstChild.value).toBe('der');
      expect(sv.regex()).toBe(true);
      sv.element().firstChild.value = 'derbe'

      sv.toggleRegex();
      expect(sv.regex()).toBe(false);
      expect(sv.element().firstChild.value).toBe('derbe');
    });

    it('should have an element', function () {
      var sv = stringValClass.create('der');
      expect(sv.element().nodeName).toBe('DIV');
      expect(sv.element().firstChild.nodeName).toBe('INPUT');
      expect(sv.element().firstChild.value).toBe('der');
    });

    it('should have a classed element', function () {
      var sv = stringValClass.create();
      console.log(sv.element());
      expect(sv.element().classList.contains('regex')).toBe(false);
      expect(sv.regex()).toBe(false);
      sv.toggleRegex();
      expect(sv.element().classList.contains('regex')).toBe(true);
    });

    it('should be storable', function () {
      var sv = stringValClass.create();
      var count = 1;
      sv.store = function (value, regex) {
	      expect(regex).toBe(true);
	      expect(value).toBe('tree');
      };
      sv.regex(true);
      sv.value('tree');
      sv.element().lastChild.click();
    });
  });

  // Check prefix
  describe('KorAP.VC.Prefix', function () {

    it('should be initializable', function () {
      var p = prefixClass.create();
      expect(p.element().classList.contains('pref')).toBeTruthy();
      expect(p.isSet()).not.toBeTruthy();
    });


    it('should be clickable', function () {
      var vc = vcClass.create([
	      ['a', null],
	      ['b', null],
	      ['c', null]
	    ]).fromJson();
      expect(vc.element().firstChild.classList.contains('unspecified')).toBeTruthy();

      // This should open up the menu
      vc.element().firstChild.firstChild.click();
      expect(vc.element().firstChild.firstChild.tagName).toEqual('UL');

      KorAP._vcKeyMenu._prefix.clear();
      KorAP._vcKeyMenu._prefix.add('x');

      var prefElement = vc.element().querySelector('span.pref');
      expect(prefElement.innerText).toEqual('x');

      // This should add key 'x' to VC
      prefElement.click();

      expect(vc.element().firstChild.classList.contains('doc')).toBeTruthy();
      expect(vc.element().firstChild.firstChild.className).toEqual('key');
      expect(vc.element().firstChild.firstChild.innerText).toEqual('x');
    });
  });
});

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

describe('KorAP.Doc', function () {

  // Create example factories
  var stringFactory = buildFactory(KorAP.Doc, {
    "key"   : "author",
    "value" : "Max Birkendale",
    "@type" : "korap:doc"
  });

  // Create example factories
  var dateFactory = buildFactory(KorAP.Doc, {
    "key"   : "pubDate",
    "type"  : "type:date",
    "match" : "match:eq",
    "value" : "2014-11-05",
    "@type" : "korap:doc"
  });

  // Create example factories
  var regexFactory = buildFactory(KorAP.Doc, {
    "key"   : "title",
    "type"  : "type:regex",
    "value" : "[^b]ee.+?",
    "@type" : "korap:doc"
  });

  it('should be initializable', function () {
    var doc = KorAP.Doc.create();
    expect(doc.matchop()).toEqual('eq');
    expect(doc.key()).toBeUndefined();
    expect(doc.value()).toBeUndefined();
    expect(doc.type()).toEqual("string");
  });

  it('should be definable', function () {

    // Empty doc
    var doc = KorAP.Doc.create();

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

    // Invalid matcher
    doc = regexFactory.create({
      match : "match:chook"
    });
    expect(doc).toBeUndefined();

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
    expect(doc).toBeUndefined();
  });

  it('should be serializale', function () {

    // Empty doc
    var doc = KorAP.Doc.create();
    expect(doc.toJson()).toEqual(jasmine.any(Object));

    // Serialize string
    doc = stringFactory.create();
    expect(doc.toJson()).toEqual(jasmine.objectContaining({
      "@type" : "korap:doc",
      "type" : "type:string",
      "key" : "author",
      "value" : "Max Birkendale",
      "match" : "match:eq"
    }));

    // Serialize regex
    doc = regexFactory.create();
    expect(doc.toJson()).toEqual(jasmine.objectContaining({
      "@type" : "korap:doc",
      "type" : "type:regex",
      "value" : "[^b]ee.+?",
      "match" : "match:eq",
      "key" : 'title'
    }));

    doc = regexFactory.create({
      match: "match:ne"
    });
    expect(doc.toJson()).toEqual(jasmine.objectContaining({
      "@type" : "korap:doc",
      "type" : "type:regex",
      "value" : "[^b]ee.+?",
      "match" : "match:ne",
      "key" : 'title'
    }));

    doc = dateFactory.create();
    expect(doc.toJson()).toEqual(jasmine.objectContaining({
      "@type" : "korap:doc",
      "type" : "type:date",
      "value" : "2014-11-05",
      "match" : "match:eq",
      "key" : 'pubDate'
    }));

    doc = dateFactory.create({
      value : "2014"
    });
    expect(doc.toJson()).toEqual(jasmine.objectContaining({
      "@type" : "korap:doc",
      "type" : "type:date",
      "value" : "2014",
      "match" : "match:eq",
      "key" : 'pubDate'
    }));
  });
});


describe('KorAP.DocGroup', function () {
  // Create example factories
  var docFactory = buildFactory(
    KorAP.Doc,
    {
      "@type" : "korap:doc",
      "match":"match:eq",
      "key" : "author",
      "value" : "Max Birkendale"
    }
  );

  var docGroupFactory = buildFactory(
    KorAP.DocGroup, {
      "@type" : "korap:docGroup",
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
    var docGroup = KorAP.DocGroup.create();
    expect(docGroup.operation()).toEqual('and');

    // Create empty group
    docGroup = KorAP.DocGroup.create();
    docGroup.operation('or');
    expect(docGroup.operation()).toEqual('or');
  });

  it('should be definable', function () {

    // Empty group
    var docGroup = KorAP.DocGroup.create();
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

    // Create empty group
    var newGroup = docGroup.append(KorAP.DocGroup.create());
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

  it('should be serializable', function () {
    var docGroup = docGroupFactory.create();

    expect(docGroup.toJson()).toEqual(jasmine.objectContaining({
      "@type" : "korap:docGroup",
      "operation" : "operation:and",
      "operands" : [
	{
	  "@type": 'korap:doc',
	  "key" : 'author',
	  "match": 'match:eq',
	  "value": 'Max Birkendale',
	  "type": 'type:string'
	},
	{
	  "@type": 'korap:doc',
	  "key": 'pubDate',
	  "match": 'match:eq',
	  "value": '2014-12-05',
	  "type": 'type:date'
	}
      ]
    }));
  });
});

describe('KorAP.UnspecifiedDoc', function () {
  it('should be initializable', function () {
    var docElement = KorAP.UnspecifiedDoc.create().element();
    expect(docElement.getAttribute('class')).toEqual('unspecified');
    expect(docElement.firstChild.firstChild.data).toEqual('⋯');
    expect(docElement.lastChild.getAttribute('class')).toEqual('operators');

    // Not removable
    expect(docElement.lastChild.children.length).toEqual(0);
  });

  it('should be removable, when no root', function () {
    var docGroup = KorAP.DocGroup.create();
    docGroup.operation('or');
    expect(docGroup.operation()).toEqual('or');

    docGroup.append({
      "@type": 'korap:doc',
      "key": 'pubDate',
      "match": 'match:eq',
      "value": '2014-12-05',
      "type": 'type:date'      
    });

    expect(docGroup.element().getAttribute('class')).toEqual('docGroup');
    expect(docGroup.element().children[0].getAttribute('class')).toEqual('doc');

    // Add unspecified object
    docGroup.append();
    var unspec = docGroup.element().children[1];
    expect(unspec.getAttribute('class')).toEqual('unspecified');

    // Removable
    expect(unspec.lastChild.children.length).toEqual(1);
    expect(unspec.lastChild.children[0].getAttribute('class')).toEqual('delete');
  });
});

describe('KorAP.Doc element', function () {
  it('should be initializable', function () {
    var docElement = KorAP.Doc.create(undefined, {
      "@type" : "korap:doc",
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
      "@type" : "korap:doc",
      "key":"Titel",
      "value":"Baum",
      "match":"match:eq"
    }));
  });
});

describe('KorAP.DocGroup element', function () {
  it('should be initializable', function () {

    var docGroup = KorAP.DocGroup.create(undefined, {
      "@type" : "korap:docGroup",
      "operation" : "operation:and",
      "operands" : [
	{
	  "@type": 'korap:doc',
	  "key" : 'author',
	  "match": 'match:eq',
	  "value": 'Max Birkendale',
	  "type": 'type:string'
	},
	{
	  "@type": 'korap:doc',
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
    var docGroup = KorAP.DocGroup.create(undefined, {
      "@type" : "korap:docGroup",
      "operation" : "operation:or",
      "operands" : [
	{
	  "@type": 'korap:doc',
	  "key" : 'author',
	  "match": 'match:eq',
	  "value": 'Max Birkendale',
	  "type": 'type:string'
	},
	{
	  "@type" : "korap:docGroup",
	  "operation" : "operation:and",
	  "operands" : [
	    {
	      "@type": 'korap:doc',
	      "key": 'pubDate',
	      "match": 'match:geq',
	      "value": '2014-05-12',
	      "type": 'type:date'
	    },
	    {
	      "@type": 'korap:doc',
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
    expect(docop.getAttribute('class')).toEqual('operators');
    expect(docop.children[0].getAttribute('class')).toEqual('and');
    expect(docop.children[1].getAttribute('class')).toEqual('or');
    expect(docop.children[2].getAttribute('class')).toEqual('delete');

    expect(e.children[1].getAttribute('class')).toEqual('docGroup');
    expect(e.children[1].getAttribute('data-operation')).toEqual('and');

    // This and-operation can be "or"ed or "delete"d
    var secop = e.children[1].children[2];
    expect(secop.getAttribute('class')).toEqual('operators');
    expect(secop.children[0].getAttribute('class')).toEqual('or');
    expect(secop.children[1].getAttribute('class')).toEqual('delete');

    // This or-operation can be "and"ed or "delete"d
    expect(e.children[2].getAttribute('class')).toEqual('operators');
    expect(e.lastChild.getAttribute('class')).toEqual('operators');
    expect(e.lastChild.children[0].getAttribute('class')).toEqual('and');
    expect(e.lastChild.children[1].getAttribute('class')).toEqual('delete');

  });
});

describe('KorAP.VirtualCollection', function () {
  it('should be initializable', function () {
    var vc = KorAP.VirtualCollection.render();
    expect(vc.element().getAttribute('class')).toEqual('vc');
    expect(vc.root().element().getAttribute('class')).toEqual('unspecified');

    // Not removable
    expect(vc.root().element().lastChild.children.length).toEqual(0);
  });

  it('should be based on a doc', function () {
    var vc = KorAP.VirtualCollection.render({
      "@type" : "korap:doc",
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
    var vc = KorAP.VirtualCollection.render({
      "@type" : "korap:docGroup",
      "operation" : "operation:and",
      "operands" : [
	{
	  "@type": 'korap:doc',
	  "key" : 'author',
	  "match": 'match:eq',
	  "value": 'Max Birkendale',
	  "type": 'type:string'
	},
	{
	  "@type": 'korap:doc',
	  "key": 'pubDate',
	  "match": 'match:eq',
	  "value": '2014-12-05',
	  "type": 'type:date'
	}
      ]
    });

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
    var vc = KorAP.VirtualCollection.render({
      "@type" : "korap:docGroup",
      "operation" : "operation:or",
      "operands" : [
	{
	  "@type": 'korap:doc',
	  "key" : 'author',
	  "match": 'match:eq',
	  "value": 'Max Birkendale',
	  "type": 'type:string'
	},
	{
	  "@type" : "korap:docGroup",
	  "operation" : "operation:and",
	  "operands" : [
	    {
	      "@type": 'korap:doc',
	      "key": 'pubDate',
	      "match": 'match:geq',
	      "value": '2014-05-12',
	      "type": 'type:date'
	    },
	    {
	      "@type": 'korap:doc',
	      "key": 'pubDate',
	      "match": 'match:leq',
	      "value": '2014-12-05',
	      "type": 'type:date'
	    }
	  ]
	}
      ]
    });
    expect(vc.element().getAttribute('class')).toEqual('vc');
    expect(vc.element().firstChild.getAttribute('class')).toEqual('docGroup');
    expect(vc.element().firstChild.children[0].getAttribute('class')).toEqual('doc');
    var dg = vc.element().firstChild.children[1];
    expect(dg.getAttribute('class')).toEqual('docGroup');
    expect(dg.children[0].getAttribute('class')).toEqual('doc');
    expect(dg.children[1].getAttribute('class')).toEqual('doc');
    expect(dg.children[2].getAttribute('class')).toEqual('operators');
    expect(vc.element().firstChild.children[2].getAttribute('class')).toEqual('operators');
  });    
});

describe('KorAP.Operators', function () {
  it('should be initializable', function () {
    var op = KorAP.Operators.create(true, false, false);
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
    expect(e.getAttribute('class')).toEqual('operators');
    expect(e.children[0].getAttribute('class')).toEqual('or');
    expect(e.children[0].firstChild.data).toEqual('or');
    expect(e.children[1].getAttribute('class')).toEqual('delete');
    expect(e.children[1].firstChild.data).toEqual('×');

    op.and(true);
    op.del(false);
    op.update();

    e = op.element();
    expect(e.getAttribute('class')).toEqual('operators');
    expect(e.children[0].getAttribute('class')).toEqual('and');
    expect(e.children[0].firstChild.data).toEqual('and');
    expect(e.children[1].getAttribute('class')).toEqual('or');
    expect(e.children[1].firstChild.data).toEqual('or');
  });
});

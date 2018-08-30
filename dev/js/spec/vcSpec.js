/*
 * Todo: In demoSpec: Create "and" on the last element of the top "or"-Group
 */
define([
  'vc',
  'vc/doc',
  'vc/menu',
  'vc/prefix',
  'vc/docgroup',
  'vc/docgroupref',
  'vc/unspecified',
  'vc/operators',
  'vc/rewrite',
  'vc/stringval'
], function (vcClass,
             docClass,
             menuClass,
             prefixClass,
             docGroupClass,
             docGroupRefClass,
             unspecifiedClass,
             operatorsClass,
             rewriteClass,
             stringValClass) {

  KorAP._vcKeyMenu = undefined;


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
    KorAP._and.apply(obj);
  };

  function _orOn (obj) {
    KorAP._or.apply(obj);
  };

  function _delOn (obj) {
    KorAP._delete.apply(obj);
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
        "match":"match:contains"
      }
    ]
  });

  describe('KorAP.Doc', function () {
    // Create example factories
    var stringFactory = buildFactory(docClass, {
      "key"   : "author",
      "value" : "Max Birkendale",
      "type"  : "type:string",
      "@type" : "koral:doc"
    });

    // Create example factories
    var textFactory = buildFactory(docClass, {
      "key"   : "author",
      "value" : "Birkendale",
      "type"  : "type:string",
      "match" : "match:contains",
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
        "match" : "match:contains",
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

      // Reset list
      KorAP._vcKeyMenu = menuClass.create([['referTo','ref']]);
      
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

  describe('KorAP.DocGroupRef', function () {
    // Create example factories
    var docRefFactory = buildFactory(
      docGroupRefClass,
      {
        "@type" : "koral:docGroupRef",
        "ref" : "@max/myCorpus"
      }
    );

    it('should be initializable', function () {
      var vcRef = docGroupRefClass.create();
      expect(vcRef.ref()).toBeUndefined();
    });

    it('should be definable', function () {
      var vcRef = docGroupRefClass.create();
      vcRef.ref("@peter/mycorpus");
      expect(vcRef.ref()).toEqual("@peter/mycorpus");
      vcRef.ref("@peter/mycorpus2");
      expect(vcRef.ref()).toEqual("@peter/mycorpus2");
    });

    it('should deserialize JSON-LD string', function () {
      var vcRef = docRefFactory.create();
      expect(vcRef.ref()).toEqual("@max/myCorpus");
    });

    it('should serialize to JSON-LD', function () {
      var vcRef = docRefFactory.create();
      expect(vcRef.toJson()).toEqual(jasmine.objectContaining({
        "@type" : "koral:docGroupRef",
        "ref":"@max/myCorpus"
      }));

      vcRef.ref("@peter/myCorpus2");
      expect(vcRef.toJson()).toEqual(jasmine.objectContaining({
        "@type" : "koral:docGroupRef",
        "ref":"@peter/myCorpus2"
      }));
    });

    it('should serialize to a query', function () {
      var vcRef = docRefFactory.create();
      expect(vcRef.toQuery()).toEqual(
        "referTo \"@max/myCorpus\""
      );

      vcRef.ref("@peter/myCorpus2");
      expect(vcRef.toQuery()).toEqual(
        "referTo \"@peter/myCorpus2\""
      );
    });
  });

  
  describe('KorAP.UnspecifiedDoc', function () {
    it('should be initializable', function () {
      var doc = unspecifiedClass.create();
      var docElement = doc.element();
      expect(docElement.getAttribute('class')).toEqual('doc unspecified');
      expect(docElement.firstChild.firstChild.data).toEqual(KorAP.Locale.EMPTY);
      expect(docElement.lastChild.lastChild.data).toEqual(KorAP.Locale.EMPTY);
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

      var parent = document.createElement('div');
      parent.appendChild(docGroup.element());

      expect(docGroup.element().getAttribute('class')).toEqual('docGroup');
      expect(docGroup.element().children[0].getAttribute('class')).toEqual('doc');

      var unspec = docGroup.element().children[1];
      expect(unspec.getAttribute('class')).toEqual('doc unspecified');

      // Only unspec and delete
      expect(unspec.children.length).toEqual(2);

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
      expect(docGroup.getOperand(1).value()).toBeUndefined();

      expect(docGroup.getOperand(1).element().children.length).toEqual(4);

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
      expect(op.lastChild.textContent).toEqual(KorAP.Locale.EMPTY);

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

    it('should be clickable', function () {
      var vc = vcClass.create([
        ["pubDate", "date"]
      ]);
      expect(vc.toQuery()).toEqual("");
      expect(vc.builder().firstChild.textContent).toEqual(KorAP.Locale.EMPTY);
      expect(vc.builder().firstChild.classList.contains('unspecified')).toEqual(true);
      vc.builder().firstChild.firstChild.click();

      // Click on pubDate
      vc.element().firstChild.getElementsByTagName("LI")[1].click();
      expect(vc.builder().firstChild.firstChild.textContent).toEqual("pubDate");
      expect(vc.builder().firstChild.children[1].getAttribute("data-type")).toEqual("date");
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

    
    it('should be replacable by unspecified', function () {
      var vc = vcClass.create([
        ["pubDate", "date"]
      ]).fromJson({
        "@type" : "koral:doc",
        "key":"Titel",
        "value":"Baum",
        "match":"match:eq"
      });
      expect(vc.toQuery()).toEqual("Titel = \"Baum\"");

      var vcE = vc.builder();
      expect(vcE.firstChild.children.length).toEqual(4);

      // Click to delete
      vcE.firstChild.lastChild.lastChild.click();

      expect(vcE.firstChild.children.length).toEqual(1);

      expect(vcE.firstChild.textContent).toEqual(KorAP.Locale.EMPTY);
      expect(vcE.firstChild.classList.contains("unspecified")).toBeTruthy();
      vcE.firstChild.firstChild.click();
      
      // Click on pubDate
      vcE.firstChild.getElementsByTagName("LI")[1].click();

      expect(vcE.firstChild.firstChild.textContent).toEqual("pubDate");
      expect(vcE.firstChild.children[1].getAttribute("data-type")).toEqual("date");

      expect(vcE.firstChild.children.length).toEqual(4);
    });

    
    it('should be replaceable by a docGroupRef', function () {
      var vc = vcClass.create().fromJson({
        "@type" : "koral:doc",
        "key":"Titel",
        "value":"Baum",
        "match":"match:eq"
      });

      expect(vc.toQuery()).toEqual("Titel = \"Baum\"");

      var vcE = vc.builder();
      expect(vcE.firstChild.children.length).toEqual(4);

      // Click to delete
      vcE.firstChild.lastChild.lastChild.click();

      expect(vcE.firstChild.children.length).toEqual(1);

      expect(vcE.firstChild.textContent).toEqual(KorAP.Locale.EMPTY);
      expect(vcE.firstChild.classList.contains('unspecified')).toEqual(true);
      vcE.firstChild.firstChild.click();
      
      // Click on referTo
      vcE.firstChild.getElementsByTagName("LI")[0].click();

      expect(vcE.firstChild.firstChild.textContent).toEqual("referTo");
      expect(vcE.firstChild.children[1].getAttribute("data-type")).toEqual("string");
      expect(vcE.firstChild.children.length).toEqual(3);
      expect(vcE.firstChild.children[1].classList.contains("unspecified")).toBeTruthy();      
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

  describe('KorAP.DocGroupRef element', function () {
    it('should be initializable', function () {
      var docGroupRef = docGroupRefClass.create(undefined, {
        "@type" : "koral:docGroupRef",
        "ref" : "@franz/myVC1"
      });
      expect(docGroupRef.ref()).toEqual("@franz/myVC1");
      var dgrE = docGroupRef.element();

      expect(dgrE.children[0].firstChild.data).toEqual("referTo");
      expect(dgrE.children[0].tagName).toEqual("SPAN");
      expect(dgrE.children[0].classList.contains("key")).toBeTruthy();
      expect(dgrE.children[0].classList.contains("fixed")).toBeTruthy();
      expect(dgrE.children[1].firstChild.data).toEqual("@franz/myVC1");
      expect(dgrE.children[1].tagName).toEqual("SPAN");
      expect(dgrE.children[1].classList.contains("value")).toBeTruthy();
      expect(dgrE.children[1].getAttribute("data-type")).toEqual("string");
    });

    it('should be modifiable on reference', function () {
      var docGroupRef = docGroupRefClass.create(undefined, {
        "@type" : "koral:docGroupRef",
        "ref" : "@franz/myVC1"
      });
      var dgrE = docGroupRef.element();
      expect(docGroupRef.toQuery()).toEqual("referTo \"@franz/myVC1\"");
      dgrE.children[1].click();

      var input = dgrE.children[1].firstChild;
      expect(input.tagName).toEqual("INPUT");
      input.value = "Versuch";

      var event = new KeyboardEvent("keypress", {
	      "key" : "[Enter]",
	      "keyCode"  : 13
      });

      input.dispatchEvent(event);
      expect(docGroupRef.toQuery()).toEqual("referTo \"Versuch\"");     
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

    it('should be based on a docGroupRef', function () {
      var vc = vcClass.create().fromJson({
        "@type" : "koral:docGroupRef",
        "ref":"myCorpus"
      });

      // iv class="doc groupref"><span class="key fixed">@referTo</span><span data-type="string" class="value">myCorpus</span>
      var vcE = vc.builder();
      expect(vcE.getAttribute('class')).toEqual('builder');
      expect(vcE.firstChild.tagName).toEqual('DIV');
      expect(vcE.firstChild.classList.contains('groupref')).toBeTruthy();

      expect(vcE.firstChild.firstChild.tagName).toEqual('SPAN');
      expect(vcE.firstChild.firstChild.classList.contains('key')).toBeTruthy();
      expect(vcE.firstChild.firstChild.classList.contains('fixed')).toBeTruthy();

      expect(vcE.firstChild.firstChild.textContent).toEqual("referTo");

      expect(vcE.firstChild.children[1].tagName).toEqual('SPAN');
      expect(vcE.firstChild.children[1].classList.contains('value')).toBeTruthy();
      expect(vcE.firstChild.children[1].getAttribute('data-type')).toEqual('string');
      expect(vcE.firstChild.children[1].textContent).toEqual("myCorpus");
    });

    it('should be based on a nested docGroup', function () {
      var vc = nestedGroupFactory.create();

      expect(vc.builder().getAttribute('class')).toEqual('builder');
      expect(vc.builder().firstChild.getAttribute('class')).toEqual('docGroup');
      expect(vc.builder().firstChild.children[0].getAttribute('class')).toEqual('doc');
      var dg = vc.builder().firstChild.children[1];
      expect(dg.getAttribute('class')).toEqual('docGroup');
      expect(dg.children[0].getAttribute('class')).toEqual('doc');
      expect(dg.children[1].getAttribute('class')).toEqual('doc');
      expect(dg.children[2].getAttribute('class')).toEqual('operators button-group');
      expect(vc.builder().firstChild.children[2].getAttribute('class')).toEqual('operators button-group');
    });    

    it('should be based on a nested docGroupRef', function () {
      var vc = vcClass.create().fromJson({
        "@type" : "koral:docGroup",
        "operation" : "operation:and",
        "operands" : [{
          "@type" : "koral:docGroupRef",
          "ref":"myCorpus"
        },{
          "@type" : "koral:doc",
          "key":"Titel",
          "value":"Baum",
          "match":"match:eq"
        }]
      });

      expect(vc._root.ldType()).toEqual("docGroup");

      expect(vc.toQuery()).toEqual('referTo "myCorpus" & Titel = "Baum"');
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
          '| Untertitel ~ "huhu"');
      expect(vc.root().element().lastChild.children[0].innerText).toEqual('and');      
      expect(vc.root().element().lastChild.children[1].innerText).toEqual('×');
      expect(vc.root().delOperand(vc.root().getOperand(0)).update()).not.toBeUndefined();
      expect(vc.toQuery()).toEqual('Untertitel ~ "huhu"');

      var lc = vc.root().element().lastChild;
      expect(lc.children[0].innerText).toEqual('and');
      expect(lc.children[1].innerText).toEqual('or');
      expect(lc.children[2].innerText).toEqual('×');

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
            "match":"match:contains"
          }
        ]
      });

      expect(vc.toQuery()).toEqual(
        'Titel = "Baum" | Veröffentlichungsort = "hihi" | Untertitel ~ "huhu"'
      );
    });

    it('should be deserializable from collection 1', function () {
      var kq = {
        "matches":["..."],
        "collection":{
          "@type": "koral:docGroup",
          "operation": "operation:or",
          "operands": [{
            "@type": "koral:docGroup",
            "operation": "operation:and",
            "operands": [
              {
                "@type": "koral:doc",
                "key": "title",
                "match": "match:eq",
                "value": "Der Birnbaum",
                "type": "type:string"
              },
              {
                "@type": "koral:doc",
                "key": "pubPlace",
                "match": "match:eq",
                "value": "Mannheim",
                "type": "type:string"
              },
              {
                "@type": "koral:docGroup",
                "operation": "operation:or",
                "operands": [
                  {
                    "@type": "koral:doc",
                    "key": "subTitle",
                    "match": "match:eq",
                    "value": "Aufzucht und Pflege",
                    "type": "type:string"
                  },
                  {
                    "@type": "koral:doc",
                    "key": "subTitle",
                    "match": "match:eq",
                    "value": "Gedichte",
                    "type": "type:string"
                  }
                ]
              }
            ]
          },{
            "@type": "koral:doc",
            "key": "pubDate",
            "match": "match:geq",
            "value": "2015-03-05",
            "type": "type:date",
            "rewrites" : [{
	            "@type" : "koral:rewrite",
	            "operation" : "operation:modification",
	            "src" : "querySerializer",
	            "scope" : "tree"
            }]
          }]
        }
      };
      
      var vc = vcClass.create().fromJson(kq["collection"]);
      expect(vc.toQuery()).toEqual('(title = "Der Birnbaum" & pubPlace = "Mannheim" & (subTitle = "Aufzucht und Pflege" | subTitle = "Gedichte")) | pubDate since 2015-03-05');
    });

    it('should be deserializable from collection 2', function () {
      var kq = {
        "@context": "http://korap.ids-mannheim.de/ns/KoralQuery/v0.3/context.jsonld",
        "meta": {},
        "query": {
          "@type": "koral:token",
          "wrap": {
            "@type": "koral:term",
            "match": "match:eq",
            "layer": "orth",
            "key": "Baum",
            "foundry": "opennlp",
            "rewrites": [
              {
                "@type": "koral:rewrite",
                "src": "Kustvakt",
                "operation": "operation:injection",
                "scope": "foundry"
              }
            ]
          },
          "idn": "Baum_2227",
          "rewrites": [
            {
              "@type": "koral:rewrite",
              "src": "Kustvakt",
              "operation": "operation:injection",
              "scope": "idn"
            }
          ]
        },
        "collection": {
          "@type": "koral:docGroup",
          "operation": "operation:and",
          "operands": [
            {
              "@type": "koral:doc",
              "match": "match:eq",
              "type": "type:regex",
              "value": "CC-BY.*",
              "key": "availability"
            },
            {
              "@type": "koral:doc",
              "match": "match:eq",
              "type":"type:text",
              "value": "Goethe",
              "key": "author"
            }
          ],
          "rewrites": [
            {
              "@type": "koral:rewrite",
              "src": "Kustvakt",
              "operation": "operation:insertion",
              "scope": "availability(FREE)"
            }
          ]
        },
        "matches": []
      };

      var vc = vcClass.create().fromJson(kq["collection"]);
      expect(vc.toQuery()).toEqual('availability = /CC-BY.*/ & author = "Goethe"');
    });

    it('shouldn\'t be deserializable from collection with unknown type', function () {
      var kq = {
        "@type" : "koral:doc",
        "match": "match:eq",
        "type":"type:failure",
        "value": "Goethe",
        "key": "author"
      };

      expect(function () {
        vcClass.create().fromJson(kq)
      }).toThrow(new Error("Unknown value type: string"));
    });

    it('should return a name', function () {
      var vc = vcClass.create();
      expect(vc.getName()).toEqual(KorAP.Locale.VC_allCorpora);

      vc = vcClass.create().fromJson({"@type" : "koral:docGroupRef", "ref" : "DeReKo"});
      expect(vc.getName()).toEqual("DeReKo");

      vc = vcClass.create().fromJson({"@type" : "koral:doc", "key" : "author", "value" : "Peter"});
      expect(vc.getName()).toEqual(KorAP.Locale.VC_oneCollection);
    });

    it('should check for rewrites', function () {

      var vc = vcClass.create().fromJson({
        "@type" : "koral:doc",
        "key" : "author",
        "value" : "Goethe",
        "rewrites" : [{
          "@type" : "koral:rewrite",
          "operation" : "operation:modification",
          "src" : "querySerializer",
          "scope" : "value"
        }]
      });
      expect(vc.wasRewritten()).toBeTruthy();

      var nested = {
        "@type" : "koral:docGroup",
        "operation" : "operation:or",
        "operands" : [
          {
            "@type" : "koral:doc",
            "key" : "author",
            "value" : "Goethe"
          },
          {
            "@type" : "koral:docGroup",
            "operation" : "operation:and",
            "operands" : [
              {
                "@type": "koral:doc",
                "key" : "author",
                "value" : "Schiller"
              },
              {
                "@type": "koral:doc",
                "key" : "author",
                "value" : "Fontane"
              }
            ]
          }
        ]
      };
      vc = vcClass.create().fromJson(nested);
      expect(vc.wasRewritten()).toBe(false);

      nested["operands"][1]["operands"][1]["rewrites"] = [{
        "@type" : "koral:rewrite",
        "operation" : "operation:modification",
        "src" : "querySerializer",
        "scope" : "tree"
      }];
      vc = vcClass.create().fromJson(nested);
      expect(vc.wasRewritten()).toBeTruthy();
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

      var e = op.update();
      expect(e.getAttribute('class')).toEqual('operators button-group');
      expect(e.children[0].getAttribute('class')).toEqual('or');
      expect(e.children[0].innerText).toEqual('or');
      expect(e.children[1].getAttribute('class')).toEqual('delete');
      expect(e.children[1].innerText).toEqual('×');

      op.and(true);
      op.del(false);
      e = op.update();

      expect(e.getAttribute('class')).toEqual('operators button-group');
      expect(e.children[0].getAttribute('class')).toEqual('and');
      expect(e.children[0].innerText).toEqual('and');
      expect(e.children[1].getAttribute('class')).toEqual('or');
      expect(e.children[1].innerText).toEqual('or');
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
      expect(vc.root().element().lastChild.lastChild.data).toEqual(KorAP.Locale.EMPTY);
      expect(vc.root().element().classList.contains('unspecified')).toEqual(true);
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
      expect(vc.builder().firstChild.children.length).toEqual(4);
      expect(vc.builder().firstChild.lastChild.getAttribute('class')).toEqual('operators button-group');

      // Remove inner group and flatten
      _delOn(vc.root().getOperand(2).getOperand(0));

      expect(vc.toQuery()).toEqual(
        'pubDate in 2014-12-05 | foo = "bar" | title = "Hello World!" | yeah = "juhu"'
      );
      expect(vc.root().ldType()).toEqual('docGroup');
      expect(vc.root().operation()).toEqual('or');

      // Operands and operators
      expect(vc.builder().firstChild.children.length).toEqual(5);
      expect(vc.builder().firstChild.lastChild.getAttribute('class')).toEqual('operators button-group');
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
            },
            {
              "@type" : "koral:docGroupRef",
              "ref" : "myCorpus"
            }
          ]
        }
      );

      expect(vc.toQuery()).toEqual('pubDate in 2014-12-05 & foo = "bar" & referTo "myCorpus"');

      var fc = vc.builder().firstChild;
      expect(fc.getAttribute('data-operation')).toEqual('and');
      expect(fc.children.length).toEqual(4);
      expect(fc.lastChild.getAttribute('class')).toEqual('operators button-group');
      expect(fc.children[0].getAttribute('class')).toEqual('doc');
      expect(fc.children[1].getAttribute('class')).toEqual('doc');
      expect(fc.children[2].getAttribute('class')).toEqual('doc groupref');

      // add with 'and' in the middle
      _andOn(vc.root().getOperand(0));
      expect(vc.toQuery()).toEqual('pubDate in 2014-12-05 & foo = "bar" & referTo "myCorpus"');

      fc = vc.builder().firstChild;
      expect(fc.getAttribute('data-operation')).toEqual('and');
      expect(fc.children.length).toEqual(5);
      expect(fc.lastChild.getAttribute('class')).toEqual('operators button-group');

      expect(fc.children[0].getAttribute('class')).toEqual('doc');
      expect(fc.children[1].getAttribute('class')).toEqual('doc unspecified');
      expect(fc.children[2].getAttribute('class')).toEqual('doc');
      expect(fc.children[3].getAttribute('class')).toEqual('doc groupref');
      expect(fc.children[4].classList.contains('button-group')).toBeTruthy();
      expect(fc.children.length).toEqual(5);

      _andOn(vc.root().getOperand(3));
      expect(fc.children[0].getAttribute('class')).toEqual('doc');
      expect(fc.children[1].getAttribute('class')).toEqual('doc unspecified');
      expect(fc.children[2].getAttribute('class')).toEqual('doc');
      expect(fc.children[3].getAttribute('class')).toEqual('doc groupref');
      expect(fc.children[4].getAttribute('class')).toEqual('doc unspecified');
      expect(fc.children[5].classList.contains('button-group')).toBeTruthy();
      expect(fc.children.length).toEqual(6);

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
            },
            {
              "@type" : "koral:docGroupRef",
              "ref" : "myCorpus"
            }
          ]
        }
      );

      expect(vc.toQuery()).toEqual('pubDate in 2014-12-05 & foo = "bar" & referTo "myCorpus"');

      var fc = vc.builder().firstChild;
      expect(fc.children.length).toEqual(4);
      expect(fc.lastChild.getAttribute('class')).toEqual('operators button-group');
      expect(fc.children[0].getAttribute('class')).toEqual('doc');
      expect(fc.children[1].getAttribute('class')).toEqual('doc');
      expect(fc.children[2].getAttribute('class')).toEqual('doc groupref');

      // add with 'or' in the middle
      _orOn(vc.root().getOperand(0));
      expect(vc.toQuery()).toEqual('pubDate in 2014-12-05 & foo = "bar" & referTo "myCorpus"');
      fc = vc.builder().firstChild;

      expect(fc.getAttribute('data-operation')).toEqual('and');
      expect(fc.children.length).toEqual(4);
      expect(fc.children[0].getAttribute('class')).toEqual('docGroup');
      expect(fc.children[0].getAttribute('data-operation')).toEqual('or');
      expect(fc.children[1].getAttribute('class')).toEqual('doc');
      expect(fc.children[2].getAttribute('class')).toEqual('doc groupref');
      expect(fc.children[3].getAttribute('class')).toEqual('operators button-group');
      expect(fc.lastChild.getAttribute('class')).toEqual('operators button-group');

      fc = vc.builder().firstChild.firstChild;
      expect(fc.children.length).toEqual(3);
      expect(fc.children[0].getAttribute('class')).toEqual('doc');
      expect(fc.children[1].getAttribute('class')).toEqual('doc unspecified');
      expect(fc.children[2].getAttribute('class')).toEqual('operators button-group');
      expect(fc.lastChild.getAttribute('class')).toEqual('operators button-group');

      _orOn(vc.root().getOperand(2));
      fc = vc.builder().firstChild;
      expect(fc.children.length).toEqual(4);

      expect(fc.children[0].getAttribute('class')).toEqual('docGroup');
      expect(fc.children[1].getAttribute('class')).toEqual('doc');
      expect(fc.children[2].getAttribute('class')).toEqual('docGroup');
      expect(fc.children[3].getAttribute('class')).toEqual('operators button-group');

      fc = vc.builder().firstChild.children[2];
      expect(fc.children[0].getAttribute('class')).toEqual('doc groupref');
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
          'Untertitel ~ "huhu"'
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
        '(Titel = "Baum" & Veröffentlichungsort = "hihi" & (Titel = "Baum" | Veröffentlichungsort = "hihi")) | Untertitel ~ "huhu"'
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


    it('should remove an unspecified doc with a doc in a nested group', function () {
      var vc = demoFactory.create();

      // Wrap with direct element access
      expect(vc.toQuery()).toEqual(
        '(Titel = "Baum" & ' +
          'Veröffentlichungsort = "hihi" & ' +
          '(Titel = "Baum" ' +
          '| Veröffentlichungsort = "hihi")) | ' +
          'Untertitel ~ "huhu"'
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

    it('should be described in a title attribute', function () {

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
            },
            {
              "@type" : "koral:rewrite",
              "operation" : "operation:injection",
              "src" : "me"
            }
          ]
        });
      
      expect(doc.element().classList.contains('doc')).toBeTruthy();
      expect(doc.element().classList.contains('rewritten')).toBeTruthy();
      expect(doc.element().lastChild.getAttribute("title")).toEqual("querySerializer: tree (modification)\nme (injection)");
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

    it('should have a disableoption for regex', function () {
      var sv = stringValClass.create(undefined, undefined, true);
      var svE = sv.element();
      expect(svE.children.length).toEqual(2);

      sv = stringValClass.create(undefined, undefined, false);
      svE = sv.element();
      expect(svE.children.length).toEqual(1);
    });

  });

  describe('KorAP.VC.Menu', function () {

    var vc;
    
    it('should be initializable', function () {

      vc = vcClass.create([
        ['a', 'text'],
        ['b', 'string'],
        ['c', 'date']
      ]).fromJson();
      expect(vc.builder().firstChild.classList.contains('unspecified')).toBeTruthy();
      expect(vc.builder().firstChild.firstChild.tagName).toEqual('SPAN');

      // Click on unspecified
      vc.builder().firstChild.firstChild.click();
      expect(vc.builder().firstChild.firstChild.tagName).toEqual('UL');

      var list = vc.builder().firstChild.firstChild;
      expect(list.getElementsByTagName("LI")[0].innerText).toEqual('referTo');
      expect(list.getElementsByTagName("LI")[1].innerText).toEqual('a');
      expect(list.getElementsByTagName("LI")[2].innerText).toEqual('b');
      expect(list.getElementsByTagName("LI")[3].innerText).toEqual('c');

      vc = vcClass.create([
        ['d', 'text'],
        ['e', 'string'],
        ['f', 'date']
      ]).fromJson();
      expect(vc.builder().firstChild.classList.contains('unspecified')).toBeTruthy();
      expect(vc.builder().firstChild.firstChild.tagName).toEqual('SPAN');

      // Click on unspecified
      vc.builder().firstChild.firstChild.click();
      expect(vc.builder().firstChild.firstChild.tagName).toEqual('UL');

      list = vc.builder().firstChild.firstChild;
      expect(list.getElementsByTagName("LI")[0].innerText).toEqual('referTo');
      expect(list.getElementsByTagName("LI")[1].innerText).toEqual('d');
      expect(list.getElementsByTagName("LI")[2].innerText).toEqual('e');
      expect(list.getElementsByTagName("LI")[3].innerText).toEqual('f');
      // blur
      document.body.click();
    });

    // Reinitialize to make tests stable
    vc = vcClass.create([
      ['d', 'text'],
      ['e', 'string'],
      ['f', 'date']
    ]).fromJson();

    it('should be clickable on key', function () {
      // Click on unspecified
      vc.builder().firstChild.firstChild.click();
      // Click on "d"
      vc.builder().firstChild.firstChild.getElementsByTagName("LI")[1].click();
      expect(vc.builder().firstChild.firstChild.tagName).toEqual('SPAN');
      expect(vc.builder().firstChild.firstChild.innerText).toEqual('d');
      expect(vc.builder().firstChild.children[1].innerText).toEqual('eq');
      expect(vc.builder().firstChild.children[1].getAttribute('data-type')).toEqual('text');
      // blur
      document.body.click();
    });

    it('should be clickable on operation for text', function () {
      // Click on "d" (or unspecified)
      vc.builder().firstChild.firstChild.click();

      // Choose "d"
      vc.builder().firstChild.firstChild.getElementsByTagName("LI")[1].click();

      // Click on matchop
      vc.builder().firstChild.children[1].click();

      expect(vc.builder().firstChild.children[1].tagName).toEqual('UL');

      var ul = vc.builder().firstChild.children[1];
      expect(ul.getElementsByTagName('li')[0].innerText).toEqual("eq");
      expect(ul.getElementsByTagName('li')[1].innerText).toEqual("ne");
      expect(ul.getElementsByTagName('li')[2].innerText).toEqual("contains");
      expect(ul.getElementsByTagName('li')[3].innerText).toEqual("containsnot");
      expect(ul.getElementsByTagName('li')[4]).toBeUndefined();

      // Choose "contains"
      ul.getElementsByTagName('li')[2].click();
      expect(vc.builder().firstChild.children[1].tagName).toEqual("SPAN");
      expect(vc.builder().firstChild.children[1].innerText).toEqual("contains");
      // blur
      document.body.click();
    })

    it('should be clickable on operation for string', function () {
      // Click on "d" (or unspecified)
      vc.builder().firstChild.firstChild.click();

      // Choose "e"
      vc.builder().firstChild.firstChild.getElementsByTagName("LI")[2].click();

      // As a consequence the matchoperator may no longer
      // be valid and needs to be re-evaluated
      var fc = vc.builder().firstChild;
      expect(fc.firstChild.tagName).toEqual('SPAN');
      expect(fc.firstChild.innerText).toEqual('e');
      expect(fc.children[1].innerText).toEqual('eq');
      expect(fc.children[1].getAttribute('data-type')).toEqual('string');

      vc.builder().firstChild.children[1].click();

      expect(vc.builder().firstChild.children[1].tagName).toEqual('UL');

      var ul = vc.builder().firstChild.children[1];
      expect(ul.getElementsByTagName('li')[0].innerText).toEqual("eq");
      expect(ul.getElementsByTagName('li')[1].innerText).toEqual("ne");
      expect(ul.getElementsByTagName('li')[2]).toBeUndefined();

      // Choose "ne"
      ul.getElementsByTagName('li')[1].click();
      expect(vc.builder().firstChild.children[1].tagName).toEqual("SPAN");
      expect(vc.builder().firstChild.children[1].innerText).toEqual("ne");

      // Click on text
      expect(vc.builder().firstChild.children[2].innerText).toEqual(KorAP.Locale.EMPTY);
      expect(vc.builder().firstChild.children[2].classList.contains('unspecified')).toEqual(true);
      vc.builder().firstChild.children[2].click();

      // Blur text element
      expect(vc.builder().firstChild.children[2].firstChild.value).toEqual('');

      // blur
      document.body.click();
    });

    it('should be clickable on operation for date', function () {

      // Replay matchop check - so it's guaranteed that "ne" is chosen
      // Click on "e" (or unspecified)
      vc.builder().firstChild.firstChild.click();
      // Rechoose "e"
      vc.builder().firstChild.firstChild.getElementsByTagName("LI")[1].click();
      // Click on matchop
      vc.builder().firstChild.children[1].click();
      // Choose "ne"
      vc.builder().firstChild.children[1].getElementsByTagName('li')[1].click();
      expect(vc.builder().firstChild.children[1].innerText).toEqual("ne");

      // Click on "e"
      vc.builder().firstChild.firstChild.click();
      // Choose "f"
      vc.builder().firstChild.firstChild.getElementsByTagName("LI")[3].click();
      
      // The matchoperator should still be "ne" as this is valid for dates as well (now)
      var fc = vc.builder().firstChild;
      expect(fc.firstChild.tagName).toEqual('SPAN');
      expect(fc.firstChild.innerText).toEqual('f');
      expect(fc.children[1].innerText).toEqual('ne');
      // blur
      document.body.click();
    });


    // Check json deserialization
    it('should be initializable', function () {
      vc = vcClass.create([
        ['a', 'text'],
        ['b', 'string'],
        ['c', 'date']
      ]).fromJson({
        "@type" : "koral:doc",
        "key":"a",
        "value":"Baum"
      });
     
      expect(vc.builder().firstChild.children[1].getAttribute('data-type')).toEqual('text');
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
      expect(vc.builder().firstChild.classList.contains('unspecified')).toBeTruthy();

      // This should open up the menu
      vc.builder().firstChild.firstChild.click();
      expect(vc.builder().firstChild.firstChild.tagName).toEqual('UL');

      KorAP._vcKeyMenu._prefix.clear();
      KorAP._vcKeyMenu._prefix.add('x');

      var prefElement = vc.builder().querySelector('span.pref');
      expect(prefElement.innerText).toEqual('x');

      // This should add key 'x' to VC
      prefElement.click();

      expect(vc.builder().firstChild.classList.contains('doc')).toBeTruthy();
      expect(vc.builder().firstChild.firstChild.className).toEqual('key');
      expect(vc.builder().firstChild.firstChild.innerText).toEqual('x');
    });
  });
});

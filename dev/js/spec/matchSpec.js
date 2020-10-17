// Regarding async:
// http://stackoverflow.com/questions/16423156/getting-requirejs-to-work-with-jasmine
define(['match',
        'view/match/tokentable',
        'view/match/relations',
        'panel/match',
        'match/meta',
        'match/infolayer',
        'match/treeitem',
        'match/treearc',
        'match/treehierarchy',
        'buttongroup/menu',
        'match/attachement',
        'hint/foundries/cnx',
        'hint/foundries/mate'], function (
          matchClass,
          tableClass,
          relClass,
          panelClass,
          metaClass,
          infoClass,
          matchTreeItemClass,
          matchRelClass,
          matchHierClass,
          matchTreeMenuClass,
          attachementClass) {

  var available = [
    'base/s=spans',
    'corenlp/c=spans',
    'corenlp/ne=tokens',
    'corenlp/p=tokens',
    'corenlp/s=spans',
    'glemm/l=tokens',
    'mate/l=tokens',
    'mate/m=tokens',
    'mate/p=tokens',
    'opennlp/p=tokens',
    'opennlp/s=spans',
    'tt/l=tokens',
    'tt/p=tokens',
    'tt/s=spans'
  ];

  var match = {
    'corpusID' : 'WPD',
    'docID' : 'UUU',
    'textID' : '01912',
    'matchID' : 'p121-122',
    'textSigle' : 'WPD/UUU/01912',
    'available' : available
  };


  var fields = [
	  {
      "@type": "koral:field",
      "key": "author",
      "type": "type:text",
      "value": "Sprachpfleger, u.a."
    },
    {
      "@type": "koral:field",
      "key": "textClass",
      "type": "type:keywords", // May not be necessary
      "value": ["kultur", "film"]
    },
    {
      "@type":"koral:field",
      "key":"foundries",
      "type":"type:string",
      "value":[
        "corenlp",
        "corenlp\/constituency",
        "corenlp\/morpho",
        "corenlp\/sentences",
        "dereko",
        "dereko\/structure",
        "dereko\/structure\/base-sentences-paragraphs-pagebreaks",
        "opennlp",
        "opennlp\/morpho",
        "opennlp\/sentences"
      ]
    },
    {
      "@type": "koral:field",
      "key": "xlink",
      "type": "type:attachement",
      "value": "data:application/x.korap-link;title=Cool,https://de.wikipedia.org/wiki/Beispiel"
    },
    {
      "@type": "koral:field",
      "key": "z-reference",
      "type": "type:attachement",
      "value": "data:,This is a reference"
    }
  ];


  var snippet = "<span class=\"context-left\"><\/span>"+
      "<span class=\"match\">" +
      "<span class=\"cutted\"><\/span>" +
      "Außerdem " +
      "<span title=\"cnx/l:meist\">" +
      "  <span title=\"cnx/p:ADV\">" +
      "    <span title=\"cnx/syn:@PREMOD\">" +
      "      <span title=\"mate/l:meist\">" +
      "        <span title=\"mate/l:meist\">" +
      "          <span title=\"mate/p:ADV\">" +
      "            <span title=\"opennlp/p:ADV\">meist</span>" +
      "          </span>" +
      "        </span>" +
      "      </span>" +
      "    </span>" +
      "  </span>" +
      "</span>" +
      "<mark>" + 
      "<span title=\"cnx/l:deutlich\">" +
      "  <span title=\"cnx/p:A\">" +
      "    <span title=\"cnx/syn:@PREMOD\">" +
      "      <span title=\"mate/l:deutlich\">" +
      "        <span title=\"mate/m:degree:pos\">" +
      "          <span title=\"mate/p:ADJD\">" +
      "            <span title=\"opennlp/p:ADJD\">deutlich</span>" +
      "          </span>" +
      "        </span>" +
      "      </span>" +
      "    </span>" +
      "  </span>" +
      "</span>" +
      "</mark>" +
      "<span title=\"dgd/para:incident\">▮</span>" +
      "<span title=\"cnx/l:fähig\">" +
      "  <span title=\"cnx/l:leistung\">" +
      "    <span title=\"cnx/p:A\">" +
      "      <span title=\"cnx/p:ADJA\">" +
      "        <span title=\"cnx/syn:@NH\">" +
      "          <span title=\"mate/l:leistungsfähig\">" +
      "            <span title=\"mate/m:degree:comp\">" +
      "              <span title=\"mate/p:ADJD\">" +
      "                <span title=\"opennlp/p:ADJD\">leistungsfähiger</span>" +
      "              </span>" +
      "            </span>" +
      "          </span>" +
      "        </span>" +
      "      </span>" +
      "    </span>" +
      "  </span>" +
      "</span>" +
      " und robust sind auch die anderen Traktoren, die hier der Übersicht wegen keine Erwähnung finden können." +
      "<span class=\"cutted\"><\/span>" +
      "</span>";

  var treeSnippet =
      "<span class=\"context-left\"></span>" +
      "<span class=\"match\">" +
      "  <span title=\"xip/c:MC\">" +
      "    <span title=\"xip/c:TOP\">" +
      "      <span title=\"xip/c:PP\">" +
      "        <span title=\"xip/c:PREP\">Mit</span>" +
      "        <span title=\"xip/c:NP\">" +
      "          <span title=\"xip/c:DET\">dieser</span>" +
      "          <span title=\"xip/c:NPA\">" +
      "            <span title=\"xip/c:NOUN\">Methode</span>" +
      "          </span>" +
      "        </span>" +
      "      </span>" +
      "      <span title=\"xip/c:VERB\">ist</span>" +
      "      <mark>" +
      "        <span title=\"xip/c:NP\">" +
      "          <span title=\"xip/c:PRON\">es</span>" +
      "        </span>" +  
      "        <span title=\"xip/c:AP\">" +
      "          <span title=\"xip/c:ADV\">nun</span>" +
      "          <span title=\"xip/c:ADJ\">möglich</span>" +
      "        </span>" +
      "      </mark>" +
      "      <span title=\"xip/c:ADV\">z. B.</span>" +
      "      <span title=\"xip/c:NPA\">" +
      "        <span title=\"xip/c:NP\">" +
      "          <span title=\"xip/c:NOUN\">Voice</span>" +
      "        </span>" +
      "      </span>" + "(" +
      "      <span title=\"xip/c:INS\">" +
      "        <span title=\"xip/c:NPA\">" +
      "          <span title=\"xip/c:NP\">" +
      "            <span title=\"xip/c:NOUN\">Sprache</span>" +
      "          </span>" +
      "        </span>" +
      "      </span>" + ")" +
      "      <span title=\"xip/c:VERB\">bevorzugt</span>" +
      "      <span title=\"xip/c:PP\">" +
      "        <span title=\"xip/c:PREP\">in</span>" +
      "        <span title=\"xip/c:NP\">" +
      "          <span title=\"xip/c:PRON\">der</span>" +
      "        </span>" +
      "        <span title=\"xip/c:NPA\">" +
      "          <span title=\"xip/c:NP\">" +
      "            <span title=\"xip/c:NOUN\">Bridge</span>" +
      "          </span>" +
      "        </span>" +
      "      </span>" +
      "      <span title=\"xip/c:INFC\">" +
      "        <span title=\"xip/c:INS\">" +
      "          <span title=\"xip/c:VERB\">weiterzugeben</span>" +
      "        </span>" +
      "      </span>" +
      "    </span>" +
      "  </span>" +
      "</span>" +
      "<span class=\"context-right\"></span>";

  var treeSnippetHierarchy =
      "<span class=\"context-left\"><\/span><span class=\"match\"><span title=\"corenlp\/c:MPN\">Leonard Maltin<\/span> schrieb: „<span title=\"corenlp\/c:S\"><span title=\"corenlp\/c:NP\">Plot <span title=\"corenlp\/c:MPN\">contrivance isn‘<mark>t<\/mark> handled badly<\/span><\/span> <span title=\"corenlp\/c:PP\">in above-average programmer<\/span><\/span>“.&lt;<span title=\"corenlp\/c:S\"><span title=\"corenlp\/c:ROOT\"><span title=\"corenlp\/c:NP\">ref&gt;''<span title=\"corenlp\/c:NP\"><span title=\"corenlp\/c:CNP\">Movie &amp;amp; Video<\/span> Guide<\/span><\/span>'', <span title=\"corenlp\/c:VP\">1996 edition, <span title=\"corenlp\/c:NP\"><span title=\"corenlp\/c:CNP\">S. 210<\/span><\/span><\/span>.<\/span><\/span><\/span><span class=\"context-right\"><\/span>";

  function matchElementFactory () {
    var me = document.createElement('li');

    me.setAttribute(
      'data-available-info',
      'base/s=spans corenlp/c=spans corenlp/ne=tokens corenlp/p=tokens' +
        ' corenlp/s=spans glemm/l=tokens mate/l=tokens mate/m=tokens' +
        ' mate/p=tokens opennlp/p=tokens opennlp/s=spans tt/l=tokens' +
        ' tt/p=tokens tt/s=spans');

    me.setAttribute('data-corpus-id', 'WPD');
    me.setAttribute('data-doc-id', 'FFF');
    me.setAttribute('data-text-id', '01460');
    me.setAttribute('data-text-sigle', 'WPD/FFF/01460');
    me.setAttribute('data-match-id', 'p119-120');
    me.innerHTML = '<div><div class="snippet">check</div></div><p class="ref">me</p>';
    return me;
  };

  function matchElementReal () {
    var me = document.createElement('em');
    me.innerHTML =
      '<li data-match-id="p85183-85184"' +
      ' data-text-sigle="GOE/AGI/00000"' +
      ' data-available-info="base/s=spans corenlp/c=spans corenlp/p=tokens corenlp/s=spans dereko/s=spans malt/d=rels opennlp/p=tokens opennlp/s=spans tt/l=tokens tt/p=tokens tt/s=spans"' +
      ' data-info="{&quot;UID&quot;:0,&quot;author&quot;:&quot;Goethe, Johann Wolfgang von&quot;,&quot;corpusID&quot;:null,&quot;corpusSigle&quot;:&quot;GOE&quot;,&quot;docID&quot;:null,&quot;docSigle&quot;:&quot;GOE\/AGI&quot;,&quot;layerInfos&quot;:&quot;base\/s=spans corenlp\/c=spans corenlp\/p=tokens corenlp\/s=spans dereko\/s=spans malt\/d=rels opennlp\/p=tokens opennlp\/s=spans tt\/l=tokens tt\/p=tokens tt\/s=spans&quot;,&quot;matchID&quot;:&quot;match-GOE\/AGI\/00000-p85183-85184&quot;,&quot;pubDate&quot;:&quot;1982&quot;,&quot;pubPlace&quot;:&quot;München&quot;,&quot;subTitle&quot;:&quot;Auch ich in Arkadien!&quot;,&quot;textID&quot;:null,&quot;textSigle&quot;:&quot;GOE\/AGI\/00000&quot;,&quot;title&quot;:&quot;Italienische Reise&quot;}"' +
      ' id="GOE/AGI/00000#p85183-85184">' +
      '<div>' + 
      '<div class="flag"></div>' +
      '<div class="snippet startMore endMore"><span class="context-left"><span class="more"></span>keine großen Flächen, aber sanft gegeneinander laufende Berg- und Hügelrücken, durchgängig mit Weizen und Gerste bestellt, die eine ununterbrochene Masse von Fruchtbarkeit dem Auge darbieten. der diesen Pflanzen geeignete Boden wird so genutzt und so geschont, daß man nirgends einen </span><span class="match"><mark>Baum</mark></span><span class="context-right"> sieht, ja, alle die kleinen Ortschaften und Wohnungen liegen auf Rücken der Hügel, wo eine hinstreichende Reihe Kalkfelsen den Boden ohnehin unbrauchbar macht. dort wohnen die Weiber das ganze Jahr, mit Spinnen und Weben beschäftigt, die Männer hingegen bringen zur<span class="more"></span></span></div>' +
      '</div>' +
      '<p class="ref"><strong>Italienische Reise</strong> von Goethe, Johann Wolfgang von (<time datetime="1982">1982</time>)  <span class="sigle">[GOE/AGI/00000]</span> </p>' +
      '</li>';
    return me.firstChild;
  };

  var beforeAllFunc = function () {
    // Override getMatchInfo API call
    KorAP.API.getMatchInfo = function (x, param, cb) {
      if (param['spans'] === undefined || param['spans'] === false)
        cb({ "snippet": snippet });
      else
        cb({ "snippet": treeSnippet });
    };
  };

  var afterAllFunc = function () {
    KorAP.API.getMatchInfo = undefined;
    KorAP.TreeMenu = undefined;
    var body = document.body;
    var i = body.children.length - 1;
    while (i >= 0) {
      if (body.children[i].nodeType && body.children[i].nodeType === 1) {
        if (!body.children[i].classList.contains("jasmine_html-reporter")) {
          body.removeChild(body.children[i]);
        };
      };
      i--;
    };
  };
  
  describe('KorAP.InfoLayer', function () {
    beforeAll(beforeAllFunc);
    afterAll(afterAllFunc);  

    it('should be initializable', function () {
      expect(
        function() { infoClass.create() }
      ).toThrow(new Error("Missing parameters"));

      expect(
        function() { infoClass.create("base") }
      ).toThrow(new Error("Missing parameters"));

      var layer = infoClass.create("base", "s");
      expect(layer).toBeTruthy();
      expect(layer.foundry).toEqual("base");
      expect(layer.layer).toEqual("s");
      expect(layer.type).toEqual("tokens");

      layer = infoClass.create("cnx", "syn", "spans");
      expect(layer).toBeTruthy();
      expect(layer.foundry).toEqual("cnx");
      expect(layer.layer).toEqual("syn");
      expect(layer.type).toEqual("spans");
    });
  });


  describe('KorAP.Match', function () {
    beforeAll(beforeAllFunc);
    afterAll(afterAllFunc);  

    var match = {
      'corpusID'  : 'WPD',
      'docID'     : 'UUU',
      'textID'    : '01912',
      'matchID'   : 'p121-122',
      'textSigle' : 'WPD/UUU/01912',
      'available' : available
    };

    it('should be initializable by Object', function () {
      expect(function() {
        matchClass.create()
      }).toThrow(new Error('Missing parameters'));

      expect(matchClass.create(match)).toBeTruthy();

      var m = matchClass.create(match);
      expect(m.textSigle).toEqual("WPD/UUU/01912");
      expect(m.matchID).toEqual("p121-122");

      // /corpus/WPD/UUU.01912/p121-122/matchInfo?spans=false&foundry=*
      var m = matchClass.create(match);

      // Spans:
      var spans = m.getSpans();
      expect(spans[0].foundry).toEqual("base");
      expect(spans[0].layer).toEqual("s");

      expect(spans[1].foundry).toEqual("corenlp");
      expect(spans[1].layer).toEqual("c");

      expect(spans[2].foundry).toEqual("corenlp");
      expect(spans[2].layer).toEqual("s");

      expect(spans[spans.length-1].foundry).toEqual("tt");
      expect(spans[spans.length-1].layer).toEqual("s");

      // Tokens:
      var tokens = m.getTokens();
      expect(tokens[0].foundry).toEqual("corenlp");
      expect(tokens[0].layer).toEqual("ne");

      expect(tokens[1].foundry).toEqual("corenlp");
      expect(tokens[1].layer).toEqual("p");

      expect(tokens[tokens.length-1].foundry).toEqual("tt");
      expect(tokens[tokens.length-1].layer).toEqual("p");
    });


    it('should be initializable by Node 1', function () {
      var m = matchClass.create(matchElementFactory());
      expect(m.textSigle).toEqual("WPD/FFF/01460");
      expect(m.matchID).toEqual("p119-120");

      // Spans:
      var spans = m.getSpans();
      expect(spans[0].foundry).toEqual("base");
      expect(spans[0].layer).toEqual("s");

      expect(spans[1].foundry).toEqual("corenlp");
      expect(spans[1].layer).toEqual("c");

      expect(spans[2].foundry).toEqual("corenlp");
      expect(spans[2].layer).toEqual("s");

      expect(spans[spans.length-1].foundry).toEqual("tt");
      expect(spans[spans.length-1].layer).toEqual("s");

      // Tokens:
      var tokens = m.getTokens();
      expect(tokens[0].foundry).toEqual("corenlp");
      expect(tokens[0].layer).toEqual("ne");

      expect(tokens[1].foundry).toEqual("corenlp");
      expect(tokens[1].layer).toEqual("p");

      expect(tokens[tokens.length-1].foundry).toEqual("tt");
      expect(tokens[tokens.length-1].layer).toEqual("p");

    });

    it('should be initializable by Node 2', function () {
      var ele = matchElementReal();
      var m = matchClass.create(ele);
      expect(m.textSigle).toEqual("GOE/AGI/00000");
      expect(m.matchID).toEqual("p85183-85184");
    });

    it('should be initializable when active', function () {
      var e = matchElementFactory();
      e.setAttribute('class', 'active');

      expect(e.classList.contains('active')).toBe(true);
      expect(e["_match"]).toBe(undefined);

      var m = matchClass.create(e);

      expect(e["_match"]).not.toBe(undefined);
      
      // Open the match
      m.init();
      
      expect(e["_match"]).not.toBe(undefined);

      actions = e.querySelector("p.ref > div.action.button-group").children;
      
      expect(actions[0].getAttribute("class")).toEqual("metatable");
      expect(actions[1].getAttribute("class")).toEqual("info");
      expect(actions[2].getAttribute("class")).toEqual("tree");
      
      // Close the match
      expect(e.querySelector("div.action.button-group > span.minimize")).toBe(null);
    });
    
    it('should react to gui actions', function () {
      var e = matchElementFactory();

      expect(e.classList.contains('active')).toBe(false);
      expect(e["_match"]).toBe(undefined);

      var m = matchClass.create(e);

      expect(e.classList.contains('active')).toBe(false);
      expect(e["_match"]).not.toBe(undefined);
      
      // Open the match
      m.open();
      
      expect(e.classList.contains('active')).toBe(true);
      expect(e["_match"]).not.toBe(undefined);

      actions = e.querySelector("p.ref > div.action.button-group").children;
      
      expect(actions[0].getAttribute("class")).toEqual("metatable");
      expect(actions[1].getAttribute("class")).toEqual("info");
      expect(actions[2].getAttribute("class")).toEqual("tree");

      expect(e.querySelector("div.action.button-group > span.minimize")).not.toBe(null);
      
      // Close the match
      m.minimize();
      expect(e.classList.contains('active')).toBe(false);
      expect(e["_match"]).not.toBe(undefined);
    });

    it('should toggle', function () {
      var e = matchElementFactory();

      expect(e.classList.contains('active')).toBe(false);
      expect(e["_match"]).toBe(undefined);

      var m = matchClass.create(e);

      expect(e.classList.contains('active')).toBe(false);
      expect(e["_match"]).not.toBe(undefined);
      
      // Open the match
      m.open();
      
      expect(e.classList.contains('active')).toBe(true);
      expect(e["_match"]).not.toBe(undefined);

      m.toggle();

      expect(e.classList.contains('active')).toBe(false);
      expect(e["_match"]).not.toBe(undefined);

      m.toggle();

      expect(e.classList.contains('active')).toBe(true);
      expect(e["_match"]).not.toBe(undefined);
    });
    
    it('should open tree menu', function () {      
      var e = matchElementFactory();
      var m = matchClass.create(e);
      m.open();
      var relation = e.querySelector("p.ref > div.action.button-group > span:nth-of-type(3)");
      expect(relation.getAttribute("class")).toEqual("tree");
      expect(document.getElementsByClassName("button-group-list").length).toEqual(0);
      expect(document.activeElement.tagName).toEqual("BODY");
 
      // Show menu
      relation.click();
      expect(document.getElementsByClassName("button-group-list").length).toEqual(1);
      expect(document.activeElement.tagName).toEqual("UL");
      
      // Choose first tree
      document.getElementsByClassName("button-group-list")[0].getElementsByTagName("li")[1].click();
      expect(e.querySelector("div.matchinfo div.matchtree h6 span").innerText).toEqual("corenlp");

      // This should blur the focus
      expect(document.activeElement.tagName).toEqual("BODY");
      
    });

  });

  describe('KorAP.TableView', function () {
    beforeAll(beforeAllFunc);
    afterAll(afterAllFunc);  

    let longString = " und robust sind auch die anderen Traktoren, die hier der Übersicht wegen keine Erwähnung finden können.";
    
    var table;

    var matchObj = matchClass.create(match);
    var tableObj = tableClass.create(matchObj);

    var table1, table2;

    it('should fail to load a table async', function (done) {
      expect(tableObj).toBeTruthy();

      tableObj.getData([], function (tablen) {
        table1 = tablen;
        done();
      });
    });


    xit('should\'nt be parsable (async)', function () {
      expect(table1).not.toBeTruthy();
    });

    
    it('should be retrieved async', function (done) {
      expect(tableObj).toBeTruthy();
      tableObj.getData(undefined, function (x) {
        table = x;
        done();
      });
    });

    it('should parse into a table (async)', function () {
      expect(table).toBeTruthy();

      expect(table.length()).toBe(8);

      expect(table.getToken(0)).toBe("");
      expect(table.getToken(1)).toBe("Außerdem ");
      expect(table.getToken(2)).toBe("meist");
      expect(table.getToken(3)).toBe("deutlich");
      expect(table.getToken(5)).toBe("leistungsfähiger");
      expect(table.getToken(6)).toBe(longString);

      expect(table.getValue(2, "cnx", "p")[0]).toBe("ADV");
      expect(table.getValue(2, "cnx", "syn")[0]).toBe("@PREMOD");
      expect(table.getValue(2, "mate", "l")[0]).toBe("meist");
      expect(table.getValue(2, "mate", "l")[1]).toBeUndefined();

      expect(table.getValue(5, "cnx", "l")[0]).toBe("fähig");
      expect(table.getValue(5, "cnx", "l")[1]).toBe("leistung");
    });
   
    it('should be rendered async', function () {
      var e = table.element().firstChild;
      expect(e.nodeName).toBe('TABLE');
      expect(e.children[0].nodeName).toBe('THEAD');
      var tr = e.children[0].children[0];
      expect(tr.nodeName).toBe('TR');
      expect(tr.children[0].nodeName).toBe('TH');

      expect(tr.children[0].firstChild.nodeValue).toBe('Foundry');
      expect(tr.children[1].firstChild.nodeValue).toBe('Layer');

      expect(tr.children[2].classList.contains('cutted')).toBeTruthy();
      expect(tr.children[3].firstChild.nodeValue).toBe('Außerdem ');

      
      expect(tr.children[4].firstChild.nodeValue).toBe('meist');
      expect(tr.children[4].classList.contains('mark')).toBeFalsy();
      expect(tr.children[5].firstChild.nodeValue).toBe('deutlich');
      expect(tr.children[5].classList.contains('mark')).toBeTruthy();
      expect(tr.children[6].firstChild.nodeValue).toBe('▮');
      expect(tr.children[7].firstChild.nodeValue).toBe('leistungsfähiger');
      expect(tr.children[7].classList.contains('mark')).toBeFalsy();
      expect(tr.children[7].hasAttribute("title")).toBeFalsy();
      expect(tr.children[8].firstChild.nodeValue).toBe(longString);
      expect(tr.children[8].getAttribute("title")).toBe(longString);
      expect(tr.children[9].classList.contains('cutted')).toBeTruthy();

      // first row
      tr = e.children[1].children[0];
      expect(tr.nodeName).toBe('TR');
      expect(tr.getAttribute('tabindex')).toEqual('0');
      expect(tr.children[0].nodeName).toBe('TH');
      expect(tr.children[0].firstChild.nodeValue).toEqual('cnx');
      expect(tr.children[1].firstChild.nodeValue).toEqual('l');
      expect(tr.children[4].firstChild.nodeValue).toEqual('meist');
      expect(tr.children[5].firstChild.nodeValue).toEqual('deutlich');
      expect(tr.children[6].firstChild).toBeNull();
      expect(tr.children[7].firstChild.firstChild.nodeValue).toEqual('fähig');
      expect(tr.children[7].lastChild.firstChild.nodeValue).toEqual('leistung');

      // second row
      tr = e.children[1].children[1];
      expect(tr.nodeName).toBe('TR');
      expect(tr.getAttribute('tabindex')).toEqual('0');
      expect(tr.children[0].nodeName).toBe('TH');
      expect(tr.children[0].firstChild.nodeValue).toEqual('cnx');
      expect(tr.children[1].firstChild.nodeValue).toEqual('p');
      expect(tr.children[4].firstChild.nodeValue).toEqual('ADV');
      expect(tr.children[5].firstChild.nodeValue).toEqual('A');
      expect(tr.children[6].firstChild).toBeNull();
      expect(tr.children[7].firstChild.firstChild.nodeValue).toEqual('A');
      expect(tr.children[7].lastChild.firstChild.nodeValue).toEqual('ADJA');

      expect(tr.children[7].firstChild.getAttribute("title")).toEqual('Adjective');
      expect(tr.children[4].getAttribute("title")).toEqual('Adverb');
    });


    it('should parse into a table view (sync)', function () {
      var matchElement = matchElementFactory();
      expect(matchElement.tagName).toEqual('LI');

      // Match
      expect(matchElement.children[0].tagName).toEqual('DIV');

      // snippet
      expect(matchElement.children[0].children[0].tagName).toEqual('DIV');
      expect(matchElement.children[0].children[0].classList.contains('snippet')).toBeTruthy();
      expect(matchElement.children[0].children[0].firstChild.nodeValue).toEqual('check');

      // reference
      expect(matchElement.children[1].classList.contains('ref')).toBeTruthy();
      expect(matchElement.children[1].firstChild.nodeValue).toEqual('me');

      // not yet
      expect(matchElement.children[0].children[1]).toBe(undefined);

      /*
      var info = matchClass.create(matchElement).info();
      info.showTable();
      */
      var matchObj = matchClass.create(matchElement);
      matchObj.open();

      // Match
      expect(matchElement.children[0].tagName).toEqual('DIV');

      // snippet
      expect(matchElement.children[0].children[0].tagName).toEqual('DIV');

      expect(matchElement.children[0].children[0].classList.contains('snippet')).toBeTruthy();

      expect(matchElement.children[0].children[0].firstChild.nodeValue).toEqual('check');

      // reference

      expect(matchElement.children[2].classList.contains('ref')).toBeTruthy();
      expect(matchElement.children[2].childNodes[1].nodeValue).toEqual('me');

      // Add table
      matchObj.panel.addTable();

      // now
      var infotable = matchElement.children[1];
      expect(infotable.tagName).toEqual('DIV');

      expect(infotable.classList.contains('matchinfo')).toBeTruthy();
    
      expect(infotable.firstChild.firstChild.firstChild.classList.contains('matchtable')).toBeTruthy();

      // expect(infotable.children[1].classList.contains('addtree')).toBeTruthy();
    });

    it('should parse into a table view with non-verbal elements (sync)', function () {
      var matchElement = matchElementFactory();
      expect(matchElement.tagName).toEqual('LI');
    });
    
  });

  describe('KorAP.RelationsView', function () {
    beforeAll(beforeAllFunc);
    afterAll(afterAllFunc);  

    var tree;

    it('should be rendered async 1', function (done) {
      var matchObj = matchClass.create(match);
      var relObj = relClass.create(matchObj);
      expect(relObj).toBeTruthy();
      relObj.getData(undefined, undefined, "spans", function (y) {
        tree = y;
        done();
      });
    });

    it('should be rendered async 2', function () {
      expect(tree).toBeTruthy();
      expect(tree.nodes()).toEqual(49);
      
      var e = tree.element();
      expect(e.nodeName).toEqual('svg');
      expect(e.getElementsByTagName('g').length).toEqual(48);
    });


    it('should add a tree view async 2', function () {
      var matchElement = matchElementFactory();
      var matchObj = matchClass.create(matchElement);
      matchObj.open();
      matchObj.panel.addTree('mate', 'beebop', 'spans', function () {
        done();
      });

      // With added tree
      var tree = matchElement.children[1].firstChild.firstChild.firstChild;
      expect(tree.tagName).toEqual('DIV');
      expect(tree.classList.contains('matchtree')).toBeTruthy();
      expect(tree.children[0].tagName).toEqual('H6');
      expect(tree.children[0].children[0].tagName).toEqual('SPAN');
      expect(tree.children[0].children[0].firstChild.nodeValue).toEqual('mate');
      expect(tree.children[0].children[1].tagName).toEqual('SPAN');
      expect(tree.children[0].children[1].firstChild.nodeValue).toEqual('beebop');

      expect(tree.children[1].tagName).toEqual('DIV');
    });

    it('should make the tree downloadable', function () {
      var treeClass = matchHierClass.create(treeSnippetHierarchy);
      var treeElement = treeClass.element();
      expect(treeElement.tagName).toEqual("svg");

      var base64 = treeClass.toBase64();
      var str = atob(base64);
      expect(str).toMatch(new RegExp('<defs><style>path'));
      expect(str).not.toMatch(new RegExp('&nbsp;'));
      expect(str).toMatch(new RegExp('&amp;'));
    });
  });


  describe('KorAP.MatchTreeItem', function () {
    beforeAll(beforeAllFunc);
    afterAll(afterAllFunc);  

    it('should be initializable', function () {
      var mi = matchTreeItemClass.create(['cnx/c', 'cnx', 'c'])
      expect(mi.element().firstChild.nodeValue).toEqual('cnx/c');
      expect(mi.lcField()).toEqual(' cnx/c');
      expect(mi.foundry()).toEqual('cnx');
      expect(mi.layer()).toEqual('c');
    });
  });


  describe('KorAP.MatchRelation', function () {
    beforeAll(beforeAllFunc);
    afterAll(afterAllFunc);  

    var relExample = "<span class=\"context-left\"></span>" +
        "<span class=\"match\">" +
        "  <span xml:id=\"token-GOE/AGA/01784-p199\">" +
        "    <span xlink:title=\"malt/d:ADV\" " +
        "          xlink:type=\"simple\" " +
        "          xlink:href=\"#token-GOE/AGA/01784-p199\">dann</span>" +
        "  </span>" +
        " zog " +
        "  <span xlink:title=\"malt/d:SUBJ\" " +
        "        xlink:type=\"simple\" " +
        "        xlink:href=\"#token-GOE/AGA/01784-p199\">ich</span>" +
        "  <span xml:id=\"token-GOE/AGA/01784-p202\">" +
        "    <span xlink:title=\"malt/d:OBJA\" " +
        "          xlink:type=\"simple\" " +
        "          xlink:href=\"#token-GOE/AGA/01784-p199\">mich</span>" +
        "  </span>" +
        "</span>" +
        "<span class=\"context-right\"></span>";


    it('should be initializable', function () {
      var tree = matchRelClass.create();
      expect(tree.size()).toBe(0);
    });

    it('should be parse string data', function () {
      var tree = matchRelClass.create(relExample);
      expect(tree.size()).toBe(4);
    });

    it('should accept missing data', function () {
      var relExample2 = "<span class=\"context-left\"><\/span>"+
          "<span class=\"match\">"+
          "{{"+
          "<span xml:id=\"token-WUD17\/D95\/09441-p180\">"+
          "<span xlink:title=\"malt\/d:APP\" xlink:show=\"none\" xlink:href=\"#token-WUD17\/D95\/09441-p179\">Wikiläum<\/span>"+
          "<\/span>"+
          "|"+
          "<span xlink:title=\"malt\/d:APP\" xlink:show=\"none\" xlink:href=\"#token-WUD17\/D95\/09441-p180\">Silber<\/span>"+
          "|"+
          "<span xlink:title=\"malt\/d:DET\" xlink:show=\"none\" xlink:href=\"#token-WUD17\/D95\/09441-p183\">Dein<\/span>"+
          " "+
          "<span xml:id=\"token-WUD17\/D95\/09441-p183\">"+
          "<span xlink:title=\"malt\/d:ROOT\" xlink:show=\"none\" xlink:href=\"#token-WUD17\/D95\/09441-p179-196\">Freund<\/span>"+
          "<\/span>"+
          " "+
          "<span xlink:title=\"malt\/d:DET\" xlink:show=\"none\" xlink:href=\"#token-WUD17\/D95\/09441-p185\">der<\/span>"+
          " "+
          "<span xml:id=\"token-WUD17\/D95\/09441-p185-186\">"+
          "<span xml:id=\"token-WUD17\/D95\/09441-p185\">"+
          "<mark>"+
          "<span xlink:title=\"malt\/d:GMOD\" xlink:show=\"none\" xlink:href=\"#token-WUD17\/D95\/09441-p183\">Baum<\/span>"+
          "<\/mark>"+
          "<\/span>"+
          "|  "+
          "<span xlink:title=\"malt\/d:APP\" xlink:show=\"none\" xlink:href=\"#token-WUD17\/D95\/09441-p185-186\">09:38<\/span>"+
          "<\/span>"+
          ", "+
          "<span xlink:title=\"malt\/d:ATTR\" xlink:show=\"none\" xlink:href=\"#token-WUD17\/D95\/09441-p188\">22.<\/span>"+
          " "+
          "<span xml:id=\"token-WUD17\/D95\/09441-p188\">"+
          "<span xlink:title=\"malt\/d:APP\" xlink:show=\"none\" xlink:href=\"#token-WUD17\/D95\/09441-p183\">Aug.<\/span>"+
          "<\/span>"+
          " "+
          "<span xml:id=\"token-WUD17\/D95\/09441-p189\">"+
          "<span xlink:title=\"malt\/d:APP\" xlink:show=\"none\" xlink:href=\"#token-WUD17\/D95\/09441-p188\">2015<\/span>"+
          "<\/span>"+
          " ("+
          "<span xlink:title=\"malt\/d:PAR\" xlink:show=\"none\" xlink:href=\"#token-WUD17\/D95\/09441-p189\">CEST<\/span>"+
          ")"+
          "<\/span>"+
          "<span class=\"context-right\"><\/span>";
      var tree = matchRelClass.create(relExample2);
      expect(tree.size()).toBe(18);
      var treeElement = tree.element();
      expect(treeElement.tagName).toEqual("svg");
      tree.show();
      expect(treeElement.querySelector("text[text-anchor=\"middle\"]").textContent).toEqual("APP");
    });
  });

  
  describe('KorAP.MatchTreeMenu', function () {
    beforeAll(beforeAllFunc);
    afterAll(afterAllFunc);  

    it('should be initializable', function () {
      var menu = matchTreeMenuClass.create([
        ['cnx/c', 'cnx', 'c'],
        ['xip/c', 'xip', 'c']
      ], matchTreeItemClass);

      expect(menu.itemClass()).toEqual(matchTreeItemClass);
      expect(menu.element().nodeName).toEqual('UL');
      expect(menu.element().classList.contains('visible')).toBeFalsy();
      expect(menu.limit()).toEqual(6);
      menu.show();
      expect(menu.element().classList.contains('visible')).toBeTruthy();
      expect(menu.item(0).active()).toBe(false);
    });
  });
  
  //Test display and sorting of meta information 
  describe('KorAP.Meta', function(){
    beforeAll(beforeAllFunc);
    afterAll(afterAllFunc);  

	 	var met = metaClass.create(match, fields);
	  var mel = met.element(); 
	  	  
	  // Meta information should be parsed into a list
	  it('should parse in a meta view', function(){
		  expect(mel.tagName).toEqual('DL');
		  expect(mel.children[0].tagName).toEqual('DIV');
		  expect(mel.children[0].children[0].tagName).toEqual('DT');
		  expect(mel.children[0].children[0].attributes[0].name).toEqual('title');
      expect(mel.children[0].children[1].tagName).toEqual('DD');
      expect(mel.children[0].children[1].getAttribute('data-type')).toEqual('type:text')
		
		  expect(mel.children[0].children[0].firstChild.nodeValue).toEqual('author');
		  expect(mel.children[0].children[1].firstChild.nodeValue).toEqual('Sprachpfleger, u.a.');
		  expect(mel.children[0].children[0].attributes[0].value).toEqual('author');
	  });
	  
	  
	  /* The keywords in the meta information list should be formatted to be able  
	     to chose each keyword separately in the corpusByMatch assistant. */
	  it('keywords should be formatted', function(){
		
		  //type:string or type:keyword should b not relevant
      expect(mel.children[1].children[1].getAttribute('data-type')).toEqual('type:string')
		  expect(mel.children[1].children[1].classList.contains('metakeyvalues')).toBeTruthy;
		  expect(mel.children[1].children[1].children[0].tagName).toEqual('DIV');
		  expect(mel.children[1].children[1].children[0].firstChild.nodeValue).toEqual('corenlp');
		  expect(mel.children[1].children[1].children[1].tagName).toEqual('DIV');
		  expect(mel.children[1].children[1].children[1].firstChild.nodeValue).toEqual('corenlp\/constituency');
		  
		  expect(mel.children[2].children[1].classList.contains('metakeyvalues')).toBeTruthy;
		  expect(mel.children[2].children[1].children[0].tagName).toEqual('DIV');
		  expect(mel.children[2].children[1].children[0].firstChild.nodeValue).toEqual('kultur');
		  expect(mel.children[2].children[1].children[1].tagName).toEqual('DIV');
		  expect(mel.children[2].children[1].children[1].firstChild.nodeValue).toEqual('film');		 
	  }); 

    it('attachements should be formatted', function(){
		  //type:attachement with a link
      expect(mel.children[3].children[1].getAttribute('data-type')).toEqual('type:attachement')
		  expect(mel.children[3].children[1].classList.contains('metakeyvalues')).toBeFalsy;
		  expect(mel.children[3].children[0].firstChild.nodeValue).toEqual('xlink');
		  expect(mel.children[3].children[1].firstChild.textContent).toEqual('Cool');
		  expect(mel.children[3].children[1].firstChild.tagName).toEqual('A');
      expect(mel.children[3].children[1].firstChild.getAttribute('href')).toEqual('https://de.wikipedia.org/wiki/Beispiel');

		  //type:attachement with plain text
      expect(mel.children[4].children[1].getAttribute('data-type')).toEqual('type:attachement')
		  expect(mel.children[4].children[1].classList.contains('metakeyvalues')).toBeFalsy;
      expect(mel.children[4].children[0].firstChild.nodeValue).toEqual('z-reference');
      expect(mel.children[4].children[1].firstChild.nodeValue).toEqual('This is a reference');
    }); 
 
    
  
	  // Meta information should be sorted alphabetically
    it('should be alphabetically sorted', function(){
  	  var a = mel.children[0].children[0].firstChild.nodeValue;
  	  var b = mel.children[1].children[0].firstChild.nodeValue;
  	  var c = mel.children[2].children[0].firstChild.nodeValue;
  	  expect(a.localeCompare(b)).toBe(-1);
  	  expect(b.localeCompare(c)).toBe(-1);
    });


    it('should handle attachements', function () {
      let uri = attachementClass.create("data:text/plain;title=new,Hallo");
      expect(uri.contentType).toEqual("text/plain");

      expect(uri.payload).toEqual("Hallo");
      expect(uri.base64).toBeFalsy();
      expect(uri.isLink).toBeFalsy();
      expect(uri.param["title"]).toEqual("new");

      uri = attachementClass.create("data:application/x.korap-link,https://de.wikipedia.org/wiki/Beispiel");
      expect(uri.contentType).toEqual("application/x.korap-link");
      expect(uri.payload).toEqual("https://de.wikipedia.org/wiki/Beispiel");
      expect(uri.base64).toBeFalsy();
      expect(uri.isLink).toBeTruthy();
      expect(uri.inline().textContent).toEqual("https://de.wikipedia.org/wiki/Beispiel");
      expect(uri.inline().nodeType).toEqual(1);
      expect(uri.inline().tagName).toEqual("A");
      expect(uri.inline().getAttribute("rel")).toEqual("noopener noreferrer");


      uri = attachementClass.create("data:application/x.korap-link;title=Das ist ein Titel,https://de.wikipedia.org/wiki/Beispiel");
      expect(uri.contentType).toEqual("application/x.korap-link");
      expect(uri.payload).toEqual("https://de.wikipedia.org/wiki/Beispiel");
      expect(uri.base64).toBeFalsy();
      expect(uri.isLink).toBeTruthy();
      expect(uri.inline().textContent).toEqual("Das ist ein Titel");
      expect(uri.inline().nodeType).toEqual(1);
      expect(uri.inline().tagName).toEqual("A");
      expect(uri.inline().getAttribute("rel")).toEqual("noopener noreferrer");

      
      uri = attachementClass.create("data:text/plain;base64,SGVsbG8sIFdvcmxkIQ%3D%3D");
      expect(uri.contentType).toEqual("text/plain");
      expect(uri.payload).toEqual("Hello, World!");
      expect(uri.base64).toBeTruthy();
      expect(uri.isLink).toBeFalsy();
      expect(uri.inline().nodeType).toEqual(3);
      expect(uri.inline().textContent).toEqual("Hello, World!");

      uri = attachementClass.create("data:text/plain;title= new ; subTitle = old ;base64,SGVsbG8sIFdvcmxkIQ%3D%3D");
      expect(uri.contentType).toEqual("text/plain");
      expect(uri.payload).toEqual("Hello, World!");
      expect(uri.param["title"]).toEqual("new");
      expect(uri.param["subTitle"]).toEqual("old");
      expect(uri.base64).toBeTruthy();
      expect(uri.isLink).toBeFalsy();
      expect(uri.inline().nodeType).toEqual(3);
      expect(uri.inline().textContent).toEqual("Hello, World!");
    });
  });
  // table = view.toTable();
  // table.sortBy('');
  // table.element();
  // tree = view.toTree();
  // tree.element();
});

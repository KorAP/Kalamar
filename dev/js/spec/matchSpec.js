// Regarding async:
// http://stackoverflow.com/questions/16423156/getting-requirejs-to-work-with-jasmine

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
  'available' : available
};

var snippet = "<span title=\"cnx/l:meist\">" +
  "  <span title=\"cnx/p:ADV\">" +
  "    <span title=\"cnx/syn:@PREMOD\">" +
  "      <span title=\"mate/l:meist\">" +
  "        <span title=\"mate/p:ADV\">" +
  "          <span title=\"opennlp/p:ADV\">meist</span>" +
  "        </span>" +
  "      </span>" +
  "    </span>" +
  "  </span>" +
  "</span>" +
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
  "<span title=\"cnx/l:fähig\">" +
  "  <span title=\"cnx/l:leistung\">" +
  "    <span title=\"cnx/p:A\">" +
  "      <span title=\"cnx/syn:@NH\">" +
  "        <span title=\"mate/l:leistungsfähig\">" +
  "          <span title=\"mate/m:degree:comp\">" +
  "            <span title=\"mate/p:ADJD\">" +
  "              <span title=\"opennlp/p:ADJD\">leistungsfähiger</span>" +
  "            </span>" +
  "          </span>" +
  "        </span>" +
  "      </span>" +
  "    </span>" +
  "  </span>" +
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
  "      <span title=\"xip/c:NP\">" +
  "        <span title=\"xip/c:PRON\">es</span>" +
  "      </span>" +
  "      <span title=\"xip/c:AP\">" +
  "        <span title=\"xip/c:ADV\">nun</span>" +
  "        <span title=\"xip/c:ADJ\">möglich</span>" +
  "      </span>" +
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
  me.setAttribute('data-match-id', 'p119-120');
  me.innerHTML = '<div><div class="snippet">check</div></div><p class="ref">me</p>';
  return me;
};


define(['match'], function () {

  // Override getMatchInfo API call
  KorAP.API.getMatchInfo = function (x, param, cb) {
    if (param['spans'] === undefined || param['spans'] === false)
      cb({ "snippet": snippet });
    else
      cb({ "snippet": treeSnippet });
  };

  describe('KorAP.InfoLayer', function () {
    
    var infoClass = require('match/infolayer');

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
    var match = {
      'corpusID'  : 'WPD',
      'docID'     : 'UUU',
      'textID'    : '01912',
      'matchID'   : 'p121-122',
      'available' : available
    };

    var matchClass = require('match');

    it('should be initializable by Object', function () {
      expect(function() {
	matchClass.create()
      }).toThrow(new Error('Missing parameters'));

      expect(matchClass.create(match)).toBeTruthy();

      var m = matchClass.create(match);
      expect(m.corpusID).toEqual("WPD");
      expect(m.docID).toEqual("UUU");
      expect(m.textID).toEqual("01912");
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


    it('should be initializable by Node', function () {
      var m = matchClass.create(matchElementFactory());
      expect(m.corpusID).toEqual("WPD");
      expect(m.docID).toEqual("FFF");
      expect(m.textID).toEqual("01460");
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

      // Close the match
      m.close();
      expect(e.classList.contains('active')).toBe(false);
      expect(e["_match"]).not.toBe(undefined);

    });
  });


  describe('KorAP.MatchInfo', function () {

    var matchClass = require('match');

    var m = matchClass.create(match);
    var info = m.info();

    it('should contain a valid info', function () {
      expect(m._info).toEqual(info);
    });

    var table1, table2;

    // Async preparation
    it('should fail to load a table async', function (done) {
      expect(info).toBeTruthy();

      info.getTable([], function (tablen) {
	table1 = tablen;
	done();
      });
    });

    it('should\'nt be parsable (async)', function () {
      expect(table1).not.toBeTruthy();
    });

    it('should load a working table async', function(done) {
      expect(info).toBeTruthy();
      info.getTable(undefined, function (tablem) {
	table2 = tablem;
	done();
      });
    });
    
    it('should parse into a table (async)', function () {
      expect(table2).toBeTruthy();

      expect(table2.length()).toBe(3);

      expect(table2.getToken(0)).toBe("meist");
      expect(table2.getToken(1)).toBe("deutlich");
      expect(table2.getToken(2)).toBe("leistungsfähiger");

      expect(table2.getValue(0, "cnx", "p")[0]).toBe("ADV");
      expect(table2.getValue(0, "cnx", "syn")[0]).toBe("@PREMOD");

      expect(table2.getValue(2, "cnx", "l")[0]).toBe("fähig");
      expect(table2.getValue(2, "cnx", "l")[1]).toBe("leistung");
    });

    it('should parse into a table view', function () {
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

      var info = matchClass.create(matchElement).info();
      info.toggle();

      // Match
      expect(matchElement.children[0].tagName).toEqual('DIV');

      // snippet
      expect(matchElement.children[0].children[0].tagName).toEqual('DIV');
      expect(matchElement.children[0].children[0].classList.contains('snippet')).toBeTruthy();
      expect(matchElement.children[0].children[0].firstChild.nodeValue).toEqual('check');

      // reference
      expect(matchElement.children[1].classList.contains('ref')).toBeTruthy();
      expect(matchElement.children[1].firstChild.nodeValue).toEqual('me');

      // now
      var infotable = matchElement.children[0].children[1];
      expect(infotable.tagName).toEqual('DIV');
      expect(infotable.classList.contains('matchinfo')).toBeTruthy();

      expect(infotable.children[0].classList.contains('matchtable')).toBeTruthy();
      expect(infotable.children[1].classList.contains('addtree')).toBeTruthy();
    });

    var tree;
    it('should parse into a tree (async) 1', function (done) {
      var info = matchClass.create(match).info();
      expect(info).toBeTruthy();
      info.getTree(undefined, undefined, function (treem) {
	tree = treem;
	done();
      });
    });

    it('should parse into a tree (async) 2', function () {
      expect(tree).toBeTruthy();
      expect(tree.nodes()).toEqual(49);
    });


    var info, matchElement;
    it('should parse into a tree view', function () {
      matchElement = matchElementFactory();
      expect(matchElement.tagName).toEqual('LI');

      info = matchClass.create(matchElement).info();
      info.toggle();

      // Match
      expect(matchElement.children[0].tagName).toEqual('DIV');

      // snippet
      expect(matchElement.children[0].children[0].tagName).toEqual('DIV');
      expect(matchElement.children[0].children[0].classList.contains('snippet')).toBeTruthy();
      expect(matchElement.children[0].children[0].firstChild.nodeValue).toEqual('check');

      // reference
      expect(matchElement.children[1].classList.contains('ref')).toBeTruthy();
      expect(matchElement.children[1].firstChild.nodeValue).toEqual('me');

      // now
      var infotable = matchElement.children[0].children[1];
      expect(infotable.tagName).toEqual('DIV');
      expect(infotable.classList.contains('matchinfo')).toBeTruthy();
      expect(infotable.children[0].classList.contains('matchtable')).toBeTruthy();
      expect(infotable.children[1].classList.contains('addtree')).toBeTruthy();
    });

    it('should add a tree view async 1', function (done) {
      expect(info).toBeTruthy();
      info.addTree('mate', 'beebop', function () {
	done();
      });
    });

    it('should add a tree view async 2', function () {
      // With added tree
      var infotable = matchElement.children[0].children[1];
      expect(infotable.tagName).toEqual('DIV');
      expect(infotable.classList.contains('matchinfo')).toBeTruthy();
      expect(infotable.children[0].classList.contains('matchtable')).toBeTruthy();
      expect(infotable.children[1].classList.contains('addtree')).toBe(false);

      var tree = infotable.children[1];
      expect(tree.tagName).toEqual('DIV');
      expect(tree.classList.contains('matchtree')).toBeTruthy();
      expect(tree.children[0].tagName).toEqual('H6');
      expect(tree.children[0].children[0].tagName).toEqual('SPAN');
      expect(tree.children[0].children[0].firstChild.nodeValue).toEqual('mate');
      expect(tree.children[0].children[1].tagName).toEqual('SPAN');
      expect(tree.children[0].children[1].firstChild.nodeValue).toEqual('beebop');

      expect(tree.children[1].tagName).toEqual('DIV');
    });
  });


  describe('KorAP.MatchTable', function () {

    var matchClass = require('match');

    var table;
    it('should be retrieved async', function (done) {
      var info = matchClass.create(match).info();
      expect(info).toBeTruthy();
      info.getTable(undefined, function (x) {
	table = x;
	done();
      });
    });

    it('should be rendered async', function () {
      var e = table.element();
      
      expect(e.nodeName).toBe('TABLE');
      expect(e.children[0].nodeName).toBe('THEAD');
      var tr = e.children[0].children[0];
      expect(tr.nodeName).toBe('TR');
      expect(tr.children[0].nodeName).toBe('TH');

      expect(tr.children[0].firstChild.nodeValue).toBe('Foundry');
      expect(tr.children[1].firstChild.nodeValue).toBe('Layer');
      expect(tr.children[2].firstChild.nodeValue).toBe('meist');
      expect(tr.children[3].firstChild.nodeValue).toBe('deutlich');
      expect(tr.children[4].firstChild.nodeValue).toBe('leistungsfähiger');

      // first row
      tr = e.children[1].children[0];
      expect(tr.nodeName).toBe('TR');
      expect(tr.getAttribute('tabindex')).toEqual('0');
      expect(tr.children[0].nodeName).toBe('TH');
      expect(tr.children[0].firstChild.nodeValue).toEqual('cnx');
      expect(tr.children[1].firstChild.nodeValue).toEqual('l');
      expect(tr.children[2].firstChild.nodeValue).toEqual('meist');
      expect(tr.children[3].firstChild.nodeValue).toEqual('deutlich');
      expect(tr.children[4].firstChild.nodeValue).toEqual('fähig');
      expect(tr.children[4].lastChild.nodeValue).toEqual('leistung');

      // second row
      tr = e.children[1].children[1];
      expect(tr.nodeName).toBe('TR');
      expect(tr.getAttribute('tabindex')).toEqual('0');
      expect(tr.children[0].nodeName).toBe('TH');
      expect(tr.children[0].firstChild.nodeValue).toEqual('cnx');
      expect(tr.children[1].firstChild.nodeValue).toEqual('p');
      expect(tr.children[2].firstChild.nodeValue).toEqual('ADV');
      expect(tr.children[3].firstChild.nodeValue).toEqual('A');
      expect(tr.children[4].firstChild.nodeValue).toEqual('A');
    });
  });

  describe('KorAP.MatchTree', function () {
    var tree;
    var matchClass = require('match');

    it('should be rendered async 1', function (done) {
      var info = matchClass.create(match).info();
      expect(info).toBeTruthy();
      info.getTree(undefined, undefined, function (y) {
	tree = y;
	done();
      });
    });

    it('should be rendered async 2', function () {
      var e = tree.element();
      expect(e.nodeName).toEqual('svg');
      expect(e.getElementsByTagName('g').length).toEqual(48);
    });
  });


  describe('KorAP.MatchTreeItem', function () {
    var matchTreeItemClass = require('match/treeitem');
    it('should be initializable', function () {
      var mi = matchTreeItemClass.create(['cnx/c', 'cnx', 'c'])
      expect(mi.element().firstChild.nodeValue).toEqual('cnx/c');
      expect(mi.lcField()).toEqual(' cnx/c');
      expect(mi.foundry()).toEqual('cnx');
      expect(mi.layer()).toEqual('c');
    });
  });


  describe('KorAP.MatchTreeMenu', function () {
    var matchTreeMenu = require('match/treemenu');
    var matchTreeItem = require('match/treeitem');

    it('should be initializable', function () {
      var menu = matchTreeMenu.create(undefined, [
	['cnx/c', 'cnx', 'c'],
	['xip/c', 'xip', 'c']
      ]);

      expect(menu.itemClass()).toEqual(matchTreeItem);
      expect(menu.element().nodeName).toEqual('UL');
      expect(menu.element().style.opacity).toEqual("0");
      expect(menu.limit()).toEqual(6);
      menu.show();
      expect(menu.item(0).active()).toBe(false);
    });
  });

  // table = view.toTable();
  // table.sortBy('');
  // table.element();
  // tree = view.toTree();
  // tree.element();

});

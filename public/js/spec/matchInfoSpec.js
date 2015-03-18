describe('KorAP.InfoLayer', function () {
  it('should be initializable', function () {
    expect(
      function() { KorAP.InfoLayer.create() }
    ).toThrow(new Error("Missing parameters"));

    expect(
      function() { KorAP.InfoLayer.create("base") }
    ).toThrow(new Error("Missing parameters"));

    var layer = KorAP.InfoLayer.create("base", "s");
    expect(layer).toBeTruthy();
    expect(layer.foundry).toEqual("base");
    expect(layer.layer).toEqual("s");
    expect(layer.type).toEqual("tokens");

    layer = KorAP.InfoLayer.create("cnx", "syn", "spans");
    expect(layer).toBeTruthy();
    expect(layer.foundry).toEqual("cnx");
    expect(layer.layer).toEqual("syn");
    expect(layer.type).toEqual("spans");
  });
});

describe('KorAP.Match', function () {
  var match = {
    'corpusID' : 'WPD',
    'docID' : 'UUU',
    'textID' : '01912',
    'pos' : 'p121-122'
  };

  it('should be initializable', function () {
    var mInfo = KorAP.Match.create(match);
    expect(mInfo.corpusID).toEqual("WPD");
  });
});

describe('KorAP.MatchInfo', function () {
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
    'pos' : 'p121-122'
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


  it('should be initializable', function () {
    expect(function() {
      KorAP.MatchInfo.create()
    }).toThrow(new Error('Missing parameters'));

    expect(function() {
      KorAP.MatchInfo.create(available)
    }).toThrow(new Error('Missing parameters'));

    expect(KorAP.MatchInfo.create(match, available)).toBeTruthy();

    // /corpus/WPD/UUU.01912/p121-122/matchInfo?spans=false&foundry=*
    var info = KorAP.MatchInfo.create(match, available);

    // Spans:
    var spans = info.getSpans();
    expect(spans[0].foundry).toEqual("base");
    expect(spans[0].layer).toEqual("s");

    expect(spans[1].foundry).toEqual("corenlp");
    expect(spans[1].layer).toEqual("c");

    expect(spans[2].foundry).toEqual("corenlp");
    expect(spans[2].layer).toEqual("s");

    expect(spans[spans.length-1].foundry).toEqual("tt");
    expect(spans[spans.length-1].layer).toEqual("s");

    // Tokens:
    var tokens = info.getTokens();
    expect(tokens[0].foundry).toEqual("corenlp");
    expect(tokens[0].layer).toEqual("ne");

    expect(tokens[1].foundry).toEqual("corenlp");
    expect(tokens[1].layer).toEqual("p");

    expect(tokens[tokens.length-1].foundry).toEqual("tt");
    expect(tokens[tokens.length-1].layer).toEqual("p");
  });


  it('should parse into a table', function () {
    var info = KorAP.MatchInfo.create(match, available);

    expect(info.getTable('base/s')).not.toBeTruthy();

    // Override getMatchInfo API call
    KorAP.API.getMatchInfo = function() {
      return { "snippet": snippet };
    };

    var table = info.getTable();
    expect(table).toBeTruthy();

    expect(table.length()).toBe(3);

    expect(table.getToken(0)).toBe("meist");
    expect(table.getToken(1)).toBe("deutlich");
    expect(table.getToken(2)).toBe("leistungsfähiger");

    expect(table.getValue(0, "cnx", "p")[0]).toBe("ADV");
    expect(table.getValue(0, "cnx", "syn")[0]).toBe("@PREMOD");

    expect(table.getValue(2, "cnx", "l")[0]).toBe("fähig");
    expect(table.getValue(2, "cnx", "l")[1]).toBe("leistung");
  });

});

// table = view.toTable();
// table.sortBy('');
// table.element();
// tree = view.toTree();
// tree.element();

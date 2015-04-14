requirejs.config({
  baseUrl: '../js/src',
  paths : {
    'lib': '../lib'
  }
});

// Parse and show the table
// Override getMatchInfo API call
require(['init'], function () {

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

  KorAP.API.getMatchInfo = function(match, callObj, cb) {
    if (callObj["spans"] !== undefined && callObj["spans"] === true) {
      return cb({ "snippet": treeSnippet });
    }
    else {
      return cb({ "snippet": snippet });
    }
  };
});

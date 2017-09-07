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

requirejs.config({
  baseUrl: '../js/src',
  paths : {
    'lib': '../lib'
  }
});

require(['match/relations', 'match/tree'], function (relClass, treeClass) {
  var rel = relClass.create();

  /*
   * Start and end may be spans, i.e. arrays
   */

  rel
    .addToken("Der")
    .addToken("alte")
    .addToken("Mann")
    .addToken("ging")
    .addToken("über")
    .addToken("die")
    .addToken("breite")
    .addToken("nasse")
    .addToken("Straße")
  ;

  rel
    .addRel({ start: 0, end: 1, label: "a"})
    .addRel({ start: 0, end: 1, label: "b" })
    .addRel({ start: 1, end: 2, label: "c", direction: "bi"   })
    .addRel({ start: 0, end: 2, label: "d" })
    .addRel({ start: [2,4], end: 5, label: "e", direction: "uni"  })
    .addRel({ start: [5,6], end: 7, label: "g" })
    .addRel({ start: 4, end: [6,8], label: "f", direction: "bi" })
  ;

  document.getElementById("treeRel").appendChild(rel.element());

  // Todo: Probably rename to rel.draw()
  rel.show();

  var tree = treeClass.create(treeSnippet);
  document.getElementById("treeHier").appendChild(tree.element());
});


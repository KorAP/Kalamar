function matchInfoFactory () {
  var info = document.createElement('div');
  info.className = 'matchinfo';
  info.innerHTML = 
    "  <div class=\"matchtable\">" +
    "    <table>" +
    "      <thead>" +
    "        <tr>" +
    "          <th>Foundry</th>" +
    "          <th>Layer</th>" +
    "          <th>Der</th>" +
    "          <th>älteste</th>" +
    "          <th>lebende</th>" +
    "          <th>Baum</th>" +
    "          <th>hier</th>" +
    "        </tr>" +
    "      </thead>" +
    "      <tbody>" +
    "        <tr tabindex=\"0\">" +
    "          <th>corenlp</th>" +
    "          <th>p</th>" +
    "          <td>ART</td>" +
    "          <td>ADJA</td>" +
    "          <td>ADJA<br>ADJD</td>" +
    "          <td>NN</td>" +
    "          <td>ADV</td>" +
    "        </tr>" +
    "        <tr tabindex=\"0\">" +
    "          <th>opennlp</th>" +
    "          <th>p</th>" +
    "          <td>ART</td>" +
    "          <td>ADJA</td>" +
    "          <td></td>" +
    "          <td>NN</td>" +
    "          <td>ADV</td>" +
    "        </tr>" +
    "      </tbody>" +
    "    </table>" +
    "  </div>" +
    "</div>";

  return info;
};

function matchInfoComplexFactory () {
  var info = document.createElement('div');
  info.className = 'matchinfo';
  info.innerHTML = 
    "  <div class=\"matchtable\">" +
    "    <table>" +
    "      <thead>" +
    "        <tr>" +
    "          <th>Foundry</th>" +
    "          <th>Layer</th>" +
    "          <th>Der</th>" +
    "          <th>älteste</th>" +
    "          <th>lebende</th>" +
    "          <th>Baum</th>" +
    "        </tr>" +
    "      </thead>" +
    "      <tbody>" +
    "        <tr tabindex=\"0\">" +
    "          <th>corenlp</th>" +
    "          <th>p</th>" +
    "          <td>ART</td>" +
    "          <td>ADJA</td>" +
    "          <td>ADJA<br>ADJD</td>" +
    "          <td class=\"matchkeyvalues\">" +
    "            <div>case:nom</div>" +
    "            <div>gender:masc<br/>gender:fem</div>" +
    "            <div>number:sg</div>" +
    "          </td>" +
    "        </tr>" +
    "        <tr tabindex=\"0\">" +
    "          <th>opennlp</th>" +
    "          <th>p</th>" +
    "          <td class=\"matchkeyvalues\">" +
    "            <div>case:nom</div>" +
    "            <div>gender:masc</div>" +
    "            <div>number:sg</div>" +
    "          </td>" +
    "          <td>ADJA</td>" +
    "          <td></td>" +
    "          <td>NN</td>" +
    "        </tr>" +
    "      </tbody>" +
    "    </table>" +
    "  </div>";
  return info;
};


define(['match/querycreator'], function (qcClass) {

  describe('KorAP.QueryCreator', function () {

    it('should be initializable', function () {
      expect(
	      function() {
          qcClass.create()
        }
      ).toThrow(new Error("Missing parameters"));

      expect(
	      function() {
          qcClass.create("Test")
        }
      ).toThrow(new Error("Requires element"));

      expect(
	      function() {
          var minfo = document.createElement('div');
          qcClass.create(minfo);
        }
      ).toThrow(new Error("Element contains no match table"));

      expect(qcClass.create(matchInfoFactory()).toString()).toEqual("");
    });

    it('should listen to click events', function () {

      var matchInfo = matchInfoFactory();
      var qc = qcClass.create(matchInfo);

      // Nothing to show
      expect(qc.toString()).toEqual("");
      expect(qc.shown()).toBe(false);
      qc.show();
      expect(qc.shown()).toBe(false);
      expect(qc.element().className).toEqual("queryfragment");

      // Click on cell 0:0 "Foundry"
      var cell = matchInfo.querySelector("thead > tr > th:first-child");
      expect(cell.innerText).toEqual("Foundry");
      cell.click();
      expect(cell.classList.contains("chosen")).toBe(false);
      expect(qc.toString()).toEqual("");
      expect(qc.shown()).toBe(false);

      // Click on cell 0:2 "Der"
      cell = matchInfo.querySelector("thead > tr > th:nth-child(3)")
      expect(cell.innerText).toEqual("Der");
      cell.click();
      expect(cell.classList.contains("chosen")).toBeTruthy();
      expect(qc.toString()).toEqual("[orth=Der]");
      expect(qc.shown()).toBeTruthy();

      // Click on cell 0:2 "Der" again - to hide
      cell = matchInfo.querySelector("thead > tr > th:nth-child(3)")
      expect(cell.innerText).toEqual("Der");
      cell.click();
      expect(cell.classList.contains("chosen")).toBe(false);
      expect(qc.toString()).toEqual("");
      expect(qc.shown()).toBe(false);
    });

    it('should create tokens in arbitrary order', function () {
      var matchInfo = matchInfoFactory();
      var qc = qcClass.create(matchInfo);

      var cell = matchInfo.querySelector("tbody > tr:nth-child(2) > td:nth-child(4)");
      expect(cell.innerText).toEqual("ADJA");
      cell.click();
      expect(qc.toString()).toEqual("[opennlp/p=ADJA]");

      cell = matchInfo.querySelector("thead > tr > th:nth-child(4)");
      expect(cell.innerText).toEqual("älteste");
      cell.click();
      expect(qc.toString()).toEqual("[opennlp/p=ADJA & orth=älteste]");

      cell = matchInfo.querySelector("tbody > tr > td:nth-child(4)");
      expect(cell.innerText).toEqual("ADJA");
      cell.click();
      expect(qc.toString()).toEqual("[corenlp/p=ADJA & opennlp/p=ADJA & orth=älteste]");
    });

    it('should create token sequences in arbitrary order', function () {
      var matchInfo = matchInfoFactory();
      var qc = qcClass.create(matchInfo);

      var cell = matchInfo.querySelector("thead > tr > th:nth-child(5)");
      expect(cell.innerText).toEqual("lebende");
      cell.click();
      expect(qc.toString()).toEqual("[orth=lebende]");

      cell = matchInfo.querySelector("tbody > tr:nth-child(2) > td:nth-child(3)");
      expect(cell.innerText).toEqual("ART");
      cell.click();
      expect(qc.toString()).toEqual("[opennlp/p=ART][][orth=lebende]");

      cell = matchInfo.querySelector("tbody > tr > td:nth-child(4)");
      expect(cell.innerText).toEqual("ADJA");
      cell.click();
      expect(qc.toString()).toEqual("[opennlp/p=ART][corenlp/p=ADJA][orth=lebende]");
    });

    it('should remove chosen elements again', function () {
      var matchInfo = matchInfoFactory();
      var qc = qcClass.create(matchInfo);

      var cell = matchInfo.querySelector("tbody > tr:nth-child(2) > td:nth-child(4)");
      expect(cell.innerText).toEqual("ADJA");
      cell.click();
      expect(qc.toString()).toEqual("[opennlp/p=ADJA]");
      var cell1 = cell;

      cell = matchInfo.querySelector("thead > tr > th:nth-child(4)");
      expect(cell.innerText).toEqual("älteste");
      cell.click();
      expect(qc.toString()).toEqual("[opennlp/p=ADJA & orth=älteste]");
      var cell2 = cell;

      cell = matchInfo.querySelector("tbody > tr > td:nth-child(3)");
      expect(cell.innerText).toEqual("ART");
      cell.click();
      expect(qc.toString()).toEqual("[corenlp/p=ART][opennlp/p=ADJA & orth=älteste]");
      var cell3 = cell;

      cell = matchInfo.querySelector("thead > tr > th:nth-child(6)");
      expect(cell.innerText).toEqual("Baum");
      cell.click();
      expect(qc.toString()).toEqual("[corenlp/p=ART][opennlp/p=ADJA & orth=älteste][][orth=Baum]");
      var cell4 = cell;

      cell = matchInfo.querySelector("thead > tr > th:nth-child(5)");
      expect(cell.innerText).toEqual("lebende");
      cell.click();
      expect(qc.toString()).toEqual("[corenlp/p=ART][opennlp/p=ADJA & orth=älteste][orth=lebende][orth=Baum]");
      var cell5 = cell;


      // Remove annotations again
      expect(cell5.classList.contains("chosen")).toBeTruthy();
      cell5.click()
      expect(cell5.classList.contains("chosen")).toBe(false);
      expect(qc.toString()).toEqual("[corenlp/p=ART][opennlp/p=ADJA & orth=älteste][][orth=Baum]");

      expect(cell2.classList.contains("chosen")).toBeTruthy();
      cell2.click()
      expect(cell2.classList.contains("chosen")).toBe(false);
      expect(qc.toString()).toEqual("[corenlp/p=ART][opennlp/p=ADJA][][orth=Baum]");

      expect(cell1.classList.contains("chosen")).toBeTruthy();
      cell1.click()
      expect(cell1.classList.contains("chosen")).toBe(false);
      expect(qc.toString()).toEqual("[corenlp/p=ART][]{2}[orth=Baum]");

      // Re-add first cell at the same position
      expect(cell1.classList.contains("chosen")).toBe(false);
      cell1.click()
      expect(cell1.classList.contains("chosen")).toBeTruthy();
      expect(qc.toString()).toEqual("[corenlp/p=ART][opennlp/p=ADJA][][orth=Baum]");

      expect(cell3.classList.contains("chosen")).toBeTruthy();
      cell3.click()
      expect(cell3.classList.contains("chosen")).toBe(false);
      expect(qc.toString()).toEqual("[opennlp/p=ADJA][][orth=Baum]");

      expect(cell4.classList.contains("chosen")).toBeTruthy();
      cell4.click()
      expect(cell4.classList.contains("chosen")).toBe(false);
      expect(qc.toString()).toEqual("[opennlp/p=ADJA]");

      // Remove last token
      expect(qc.shown()).toBeTruthy();
      expect(qc.element().innerHTML).toEqual("<span>New Query:</span><span>[opennlp/p=ADJA]</span>");
      expect(cell1.classList.contains("chosen")).toBeTruthy();
      cell1.click()
      expect(cell1.classList.contains("chosen")).toBe(false);
      expect(qc.toString()).toEqual("");
      expect(qc.shown()).toBe(false);

      // Re-add token
      expect(cell4.classList.contains("chosen")).toBe(false);
      cell4.click()
      expect(cell4.classList.contains("chosen")).toBeTruthy();
      expect(qc.toString()).toEqual("[orth=Baum]");
      expect(qc.shown()).toBeTruthy();
      expect(qc.element().innerHTML).toEqual("<span>New Query:</span><span>[orth=Baum]</span>");
    });

    it('should ignore empty terms', function () {
      var matchInfo = matchInfoFactory();
      var qc = qcClass.create(matchInfo);

      // Nothing to show
      expect(qc.toString()).toEqual("");
      expect(qc.shown()).toBe(false);
      qc.show();
      expect(qc.shown()).toBe(false);
      expect(qc.element().className).toEqual("queryfragment");

      var cell = matchInfo.querySelector("tbody > tr:nth-child(2) > td:nth-child(4)");
      expect(cell.innerText).toEqual("ADJA");
      expect(cell.classList.contains("chosen")).toBe(false);
      cell.click();
      expect(cell.classList.contains("chosen")).toBeTruthy();
      expect(qc.toString()).toEqual("[opennlp/p=ADJA]");

      cell = matchInfo.querySelector("tbody > tr:nth-child(2) > td:nth-child(5)");
      expect(cell.innerText).toEqual("");
      expect(cell.classList.contains("chosen")).toBe(false);
      cell.click();
      expect(cell.classList.contains("chosen")).toBe(false);
      expect(qc.toString()).toEqual("[opennlp/p=ADJA]");

    });

    it('should create or-groups for alternative terms', function () {
      var matchInfo = matchInfoFactory();
      var qc = qcClass.create(matchInfo);

      // Nothing to show
      expect(qc.toString()).toEqual("");
      expect(qc.shown()).toBe(false);
      qc.show();
      expect(qc.shown()).toBe(false);
      expect(qc.element().className).toEqual("queryfragment");

      var cell = matchInfo.querySelector("thead > tr > th:nth-child(5)");
      expect(cell.innerText).toEqual("lebende");
      expect(cell.classList.contains("chosen")).toBe(false);
      cell.click();
      expect(cell.classList.contains("chosen")).toBeTruthy();
      expect(qc.toString()).toEqual("[orth=lebende]");

      cell = matchInfo.querySelector("tbody > tr:nth-child(1) > td:nth-child(5)");
      expect(cell.innerText).toEqual("ADJAADJD");
      expect(cell.classList.contains("chosen")).toBe(false);
      cell.click();
      expect(cell.classList.contains("chosen")).toBeTruthy();
      expect(qc.toString()).toEqual("[(corenlp/p=ADJA | corenlp/p=ADJD) & orth=lebende]");

      // Remove or group again
      expect(cell.classList.contains("chosen")).toBeTruthy();
      cell.click();
      expect(cell.classList.contains("chosen")).toBe(false);
      expect(qc.toString()).toEqual("[orth=lebende]");
    });


    it('should add whole rows', function () {
      var matchInfo = matchInfoFactory();
      var qc = qcClass.create(matchInfo);

      // Nothing to show
      expect(qc.toString()).toEqual("");
      expect(qc.shown()).toBe(false);
      qc.show();
      expect(qc.shown()).toBe(false);
      expect(qc.element().className).toEqual("queryfragment");

      var corenlpRow = matchInfo.querySelector("tbody > tr:nth-child(1)");

      var cell = corenlpRow.querySelector("td:nth-child(4)");
      expect(cell.innerText).toEqual("ADJA");
      expect(cell.classList.contains("chosen")).toBe(false);
      cell.click();
      expect(cell.classList.contains("chosen")).toBeTruthy();

      // Activate another cell in another row
      cell = matchInfo.querySelector("tbody > tr:nth-child(2) td:nth-child(3)");
      expect(cell.innerText).toEqual("ART");
      expect(cell.classList.contains("chosen")).toBe(false);
      cell.click();
      expect(cell.classList.contains("chosen")).toBeTruthy();

      expect(corenlpRow.querySelector("td:nth-child(3).chosen")).toBeNull();
      expect(corenlpRow.querySelector("td:nth-child(4).chosen")).toBeTruthy();
      expect(corenlpRow.querySelector("td:nth-child(5).chosen")).toBeNull();
      expect(corenlpRow.querySelector("td:nth-child(6).chosen")).toBeNull();

      expect(qc.toString()).toEqual("[opennlp/p=ART][corenlp/p=ADJA]");

      // Mark all corenlp lists
      cell = corenlpRow.querySelector("th:nth-child(1)");
      expect(cell.innerText).toEqual("corenlp");
      expect(cell.classList.contains("chosen")).toBe(false);
      cell.click();
      expect(cell.classList.contains("chosen")).toBe(false);

      expect(corenlpRow.querySelector("td:nth-child(3).chosen")).toBeTruthy();
      expect(corenlpRow.querySelector("td:nth-child(4).chosen")).toBeTruthy();
      expect(corenlpRow.querySelector("td:nth-child(5).chosen")).toBeTruthy();
      expect(corenlpRow.querySelector("td:nth-child(6).chosen")).toBeTruthy();

      // Replay the choice without any effect
      cell = corenlpRow.querySelector("th:nth-child(1)");
      expect(cell.innerText).toEqual("corenlp");
      expect(cell.classList.contains("chosen")).toBe(false);
      cell.click();
      expect(cell.classList.contains("chosen")).toBe(false);

      expect(corenlpRow.querySelector("td:nth-child(3).chosen")).toBeTruthy();
      expect(corenlpRow.querySelector("td:nth-child(4).chosen")).toBeTruthy();
      expect(corenlpRow.querySelector("td:nth-child(5).chosen")).toBeTruthy();
      expect(corenlpRow.querySelector("td:nth-child(6).chosen")).toBeTruthy();
      expect(corenlpRow.querySelector("td:nth-child(7).chosen")).toBeTruthy();
      
      expect(qc.toString()).toEqual("[corenlp/p=ART & opennlp/p=ART][corenlp/p=ADJA][(corenlp/p=ADJA | corenlp/p=ADJD)][corenlp/p=NN][corenlp/p=ADV]");

      // Remove one of the cells again
      cell = corenlpRow.querySelector("td:nth-child(5).chosen");
      expect(cell.innerText).toEqual("ADJAADJD");
      expect(cell.classList.contains("chosen")).toBeTruthy();
      cell.click();
      expect(cell.classList.contains("chosen")).toBe(false);
      expect(qc.toString()).toEqual("[corenlp/p=ART & opennlp/p=ART][corenlp/p=ADJA][][corenlp/p=NN][corenlp/p=ADV]");

    });

    it('should ignore empty terms in whole rows', function () {
      var matchInfo = matchInfoFactory();
      var qc = qcClass.create(matchInfo);
      expect(qc.toString()).toEqual("");

      var opennlpRow = matchInfo.querySelector("tbody > tr:nth-child(2)");

      expect(opennlpRow.querySelector("td:nth-child(3).chosen")).toBeNull();
      expect(opennlpRow.querySelector("td:nth-child(4).chosen")).toBeNull();
      expect(opennlpRow.querySelector("td:nth-child(5).chosen")).toBeNull();
      expect(opennlpRow.querySelector("td:nth-child(6).chosen")).toBeNull();

      expect(qc.toString()).toEqual("");

      // Mark all opennlp lists
      cell = opennlpRow.querySelector("th:nth-child(1)");
      expect(cell.innerText).toEqual("opennlp");
      expect(cell.classList.contains("chosen")).toBe(false);
      cell.click();
      expect(cell.classList.contains("chosen")).toBe(false);

      expect(opennlpRow.querySelector("td:nth-child(3).chosen")).toBeTruthy();
      expect(opennlpRow.querySelector("td:nth-child(4).chosen")).toBeTruthy();
      expect(opennlpRow.querySelector("td:nth-child(5).chosen")).toBeNull();
      expect(opennlpRow.querySelector("td:nth-child(6).chosen")).toBeTruthy();

      expect(qc.toString()).toEqual("[opennlp/p=ART][opennlp/p=ADJA][][opennlp/p=NN][opennlp/p=ADV]");
    });

    it('should support multiple distances', function () {
      var matchInfo = matchInfoFactory();
      var qc = qcClass.create(matchInfo);

      var cell = matchInfo.querySelector("thead > tr > th:nth-child(3)");
      expect(cell.innerText).toEqual("Der");
      cell.click();
      expect(qc.toString()).toEqual("[orth=Der]");

      cell = matchInfo.querySelector("thead > tr > th:nth-child(7)");
      expect(cell.innerText).toEqual("hier");
      cell.click();
      expect(qc.toString()).toEqual("[orth=Der][]{3}[orth=hier]");

      cell = matchInfo.querySelector("thead > tr > th:nth-child(5)");
      expect(cell.innerText).toEqual("lebende");
      cell.click();
      expect(qc.toString()).toEqual("[orth=Der][][orth=lebende][][orth=hier]");
    });

    it('should create and-groups for key-value terms', function () {
      var matchInfo = matchInfoComplexFactory();
      var qc = qcClass.create(matchInfo);

      // Nothing to show
      expect(qc.toString()).toEqual("");
      expect(qc.shown()).toBe(false);
      qc.show();
      expect(qc.shown()).toBe(false);
      expect(qc.element().className).toEqual("queryfragment");

      var cell = matchInfo.querySelector("thead > tr > th:nth-child(5)");
      expect(cell.innerText).toEqual("lebende");
      expect(cell.classList.contains("chosen")).toBe(false);
      cell.click();
      expect(cell.classList.contains("chosen")).toBeTruthy();
      expect(qc.toString()).toEqual("[orth=lebende]");

      // Check complex cell
      cell = matchInfo.querySelector("tbody > tr:nth-child(1) > td:nth-child(6)");
      expect(cell.innerText).toMatch(/case:nom/);
      expect(cell.classList.contains("chosen")).toBe(false);
      cell.click();
      expect(cell.classList.contains("chosen")).toBe(false);
      expect(qc.toString()).toEqual("[orth=lebende]");

      // Check complex cell div
      cell = matchInfo.querySelector("tbody > tr:nth-child(1) > td:nth-child(6) > div:nth-child(1)");
      expect(cell.innerText).toEqual('case:nom');
      expect(cell.classList.contains("chosen")).toBe(false);
      cell.click();
      expect(cell.classList.contains("chosen")).toBe(true);
      expect(qc.toString()).toEqual("[orth=lebende][corenlp/p=case:nom]");
      var cell = cell;

      cell = matchInfo.querySelector("tbody > tr:nth-child(1) > td:nth-child(6) > div:nth-child(3)");
      expect(cell.innerText).toEqual('number:sg');
      expect(cell.classList.contains("chosen")).toBe(false);
      cell.click();
      expect(cell.classList.contains("chosen")).toBe(true);
      expect(qc.toString()).toEqual("[orth=lebende][corenlp/p=case:nom & corenlp/p=number:sg]");
      var cell2 = cell;

      cell = matchInfo.querySelector("tbody > tr:nth-child(1) > td:nth-child(6) > div:nth-child(2)");
      expect(cell.innerText).toEqual('gender:mascgender:fem');
      expect(cell.classList.contains("chosen")).toBe(false);
      cell.click();
      expect(cell.classList.contains("chosen")).toBe(true);
      expect(qc.toString()).toEqual("[orth=lebende][(corenlp/p=gender:fem | corenlp/p=gender:masc) & corenlp/p=case:nom & corenlp/p=number:sg]");
      var cell3 = cell;

      // Remove cell again
      cell = cell2;
      expect(cell.innerText).toEqual('number:sg');
      expect(cell.classList.contains("chosen")).toBe(true);
      cell.click();
      expect(cell.classList.contains("chosen")).toBe(false);
      expect(qc.toString()).toEqual("[orth=lebende][(corenlp/p=gender:fem | corenlp/p=gender:masc) & corenlp/p=case:nom]");

      // Remove cell again
      cell = cell3;
      expect(cell.innerText).toEqual('gender:mascgender:fem');
      expect(cell.classList.contains("chosen")).toBe(true);
      cell.click();
      expect(cell.classList.contains("chosen")).toBe(false);
      expect(qc.toString()).toEqual("[orth=lebende][corenlp/p=case:nom]");
    });


    it('should create rows including key-value terms', function () {
      var matchInfo = matchInfoComplexFactory();
      var qc = qcClass.create(matchInfo);
      expect(qc.toString()).toEqual("");

      var corenlpRow = matchInfo.querySelector("tbody > tr:nth-child(1)");

      expect(corenlpRow.querySelector("td:nth-child(3).chosen")).toBeNull();
      expect(corenlpRow.querySelector("td:nth-child(4).chosen")).toBeNull();
      expect(corenlpRow.querySelector("td:nth-child(5).chosen")).toBeNull();
      expect(corenlpRow.querySelector("td:nth-child(6) *.chosen")).toBeNull();

      expect(qc.toString()).toEqual("");

      // Mark all opennlp lists
      cell = corenlpRow.querySelector("th:nth-child(1)");
      expect(cell.innerText).toEqual("corenlp");
      expect(cell.classList.contains("chosen")).toBe(false);
      cell.click();
      expect(cell.classList.contains("chosen")).toBe(false);

      expect(corenlpRow.querySelector("td:nth-child(3).chosen")).toBeTruthy();
      expect(corenlpRow.querySelector("td:nth-child(4).chosen")).toBeTruthy();
      expect(corenlpRow.querySelector("td:nth-child(5).chosen")).toBeTruthy();
      expect(corenlpRow.querySelector("td:nth-child(6) div:nth-child(1).chosen")).toBeTruthy();
      expect(corenlpRow.querySelector("td:nth-child(6) div:nth-child(2).chosen")).toBeTruthy();
      expect(corenlpRow.querySelector("td:nth-child(6) div:nth-child(3).chosen")).toBeTruthy();

      expect(qc.toString()).toEqual(
        "[corenlp/p=ART]"+
          "[corenlp/p=ADJA]"+
          "[(corenlp/p=ADJA | corenlp/p=ADJD)]"+
          "[(corenlp/p=gender:fem | corenlp/p=gender:masc) & corenlp/p=case:nom & corenlp/p=number:sg]"
      );
    });
  });
});

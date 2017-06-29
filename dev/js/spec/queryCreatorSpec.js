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
    "        </tr>" +
    "        <tr tabindex=\"0\">" +
    "          <th>opennlp</th>" +
    "          <th>p</th>" +
    "          <td>ART</td>" +
    "          <td>ADJA</td>" +
    "          <td></td>" +
    "          <td>NN</td>" +
    "        </tr>" +
    "      </tbody>" +
    "    </table>" +
    "  </div>" +
    "</div>";

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
      expect(qc.toString()).toEqual("[opennlp/p=ART][orth=lebende]");

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
      expect(qc.toString()).toEqual("[corenlp/p=ART][opennlp/p=ADJA & orth=älteste][orth=Baum]");
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
      expect(qc.toString()).toEqual("[corenlp/p=ART][opennlp/p=ADJA & orth=älteste][orth=Baum]");

      expect(cell2.classList.contains("chosen")).toBeTruthy();
      cell2.click()
      expect(cell2.classList.contains("chosen")).toBe(false);
      expect(qc.toString()).toEqual("[corenlp/p=ART][opennlp/p=ADJA][orth=Baum]");

      expect(cell1.classList.contains("chosen")).toBeTruthy();
      cell1.click()
      expect(cell1.classList.contains("chosen")).toBe(false);
      expect(qc.toString()).toEqual("[corenlp/p=ART][orth=Baum]");

      // Re-add first cell at the same position
      expect(cell1.classList.contains("chosen")).toBe(false);
      cell1.click()
      expect(cell1.classList.contains("chosen")).toBeTruthy();
      expect(qc.toString()).toEqual("[corenlp/p=ART][opennlp/p=ADJA][orth=Baum]");

      expect(cell3.classList.contains("chosen")).toBeTruthy();
      cell3.click()
      expect(cell3.classList.contains("chosen")).toBe(false);
      expect(qc.toString()).toEqual("[opennlp/p=ADJA][orth=Baum]");

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

    it('should ignore empty terms');
    it('should create groups for multiple terms');
    it('should add whole rows');

  });
});

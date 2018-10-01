/**
 * Specification for the corpusByMatch assistant.
 */

function metaTableFactory () {
  var meta = document.createElement('div');
  meta.className = 'view metaTable';
  meta.innerHTML =
    "    <dl class=\"flex\">" +
    "      <div>" +
    "        <dt title=\"author\">author</dt>" +
    "        <dd>Sprachpfleger, u.a.</dd>" +
    "      </div>" +
    "      <div>" +
    "        <dd class=\"metakeyvalues\">" +
    "          <div>corenlp</div>" +
    "          <div>corenlp/constituency</div>" +
    "          <div>corenlp/morpho</div>" +
    "          <div>corenlp/sentences</div>" +
    "          <div>dereko</div>" +
    "          <div>dereko/structure</div>" +
    "          <div>dereko/structure/base-sentences-paragraphs-pagebreaks</div>" +
    "          <div>opennlp</div>" +
    "          <div>opennlp/morpho</div>" +
    "          <div>opennlp/sentences</div>" +
    "        </dd>" +
    "      </div>" +
    "    </dl>";
  var parent = document.createElement("div");
  parent.appendChild(meta);
  return meta;
};

define(['match/corpusByMatch'], function (cbmClass) {  
  describe('KorAP.CorpusByMatch', function () {
    it('should be initializable', function () {
      expect(function () {
        cbmClass.create()
      }).toThrow(new Error("Missing parameters"));

      expect(
	      function() {
          cbmClass.create("Test")
        }
      ).toThrow(new Error("Requires element"));

      expect(cbmClass.create(metaTableFactory()).toString()).toEqual("");
    });
  });
});

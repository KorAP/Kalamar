define(
  ["hint/foundries","hint/foundries/stts","hint/foundries/negranodes","hint/foundries/negraedges"],
  function (ah, sttsArray, negraNodesArray, negraEdgesArray) {
    var namedEntities = [
      ["I-LOC",  "I-LOC ",  "Location"],
      ["I-MISC", "I-MISC ", "Miscellaneous"],
      ["I-ORG",  "I-ORG ",  "Organization"],
      ["I-PER",  "I-PER ",  "Person"]
    ];

    ah["-"].push(
      ["CoreNLP", "corenlp/", "Constituency, Named Entities, Part-of-Speech"]
    );

    ah["corenlp/"] = [
      ["Constituency", "c="],
      ["Named Entity", "ne=" ],
      ["Part-of-Speech", "p="]
    ];

    ah["corenlp/ne="] = namedEntities;
    ah["corenlp/p="] = sttsArray;
    ah["corenlp/c="] = negraNodesArray;

    negraNodesArray.forEach(
      i => ah["corenlp/c=" + i[0] + '-'] = negraEdgesArray
    );
  }
);

require(["hint/foundries/stts"], function (sttsArray) {
  var ah = KorAP.annotationHelper = KorAP.annotationHelper || { "-" : [] };

  ah["-"].push(
    ["TreeTagger", "tt/", "Lemma, Part-of-Speech"]
  );

  ah["tt/"] = [
    ["Lemma", "l="],
    ["Part-of-Speech", "p="]
  ];

  ah["tt/p="] = sttsArray;
});

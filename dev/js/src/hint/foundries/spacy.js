define(["hint/foundries", "hint/foundries/upos"], function (ah, uposArray) {
  ah["-"].push(
    ["spaCy", "spacy/", "Lemma, Part-of-Speech"]
  );

  ah["spacy/"] = [
    ["Lemma", "l="],
    ["Part-of-Speech", "p="]
  ];

  ah["spacy/p="] = uposArray;

});

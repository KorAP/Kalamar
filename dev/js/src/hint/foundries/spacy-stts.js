define(["hint/foundries", "hint/foundries/stts"], function (ah, sttsArray) {
  ah["-"].push(
    ["spaCy", "spacy/", "Lemma, Part-of-Speech"]
  );

  ah["spacy/"] = [
    ["Lemma", "l="],
    ["Part-of-Speech", "p="]
  ];

  ah["spacy/p="] = sttsArray;

});

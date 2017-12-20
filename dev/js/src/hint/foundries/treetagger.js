define(["hint/foundries","hint/foundries/stts"], function (ah, sttsArray) {
  ah["-"].push(
    ["TreeTagger", "tt/", "Lemma, Part-of-Speech"]
  );

  ah["tt/"] = [
    ["Lemma", "l="],
    ["Part-of-Speech", "p="]
  ];

  ah["tt/p="] = sttsArray;
});

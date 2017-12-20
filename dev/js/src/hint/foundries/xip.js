define(["hint/foundries"], function (ah) {
  ah["-"].push(
    ["Xerox Parser", "xip/", "Constituency, Lemma, Part-of-Speech"]
  );

  ah["xip/"] = [
    ["Constituency", "c="],
    // Inactive: ["Dependency", "d="],
    ["Lemma", "l="],
    ["Part-of-Speech", "p="]
  ];
});

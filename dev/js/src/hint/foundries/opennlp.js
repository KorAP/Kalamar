define(["hint/foundries","hint/foundries/stts"], function (ah, sttsArray) {
  ah["-"].push(
    ["OpenNLP", "opennlp/", "Part-of-Speech"]
  );

  ah["opennlp/"] = [
    ["Part-of-Speech", "p="]
  ];

  ah["opennlp/p="] = sttsArray;
});

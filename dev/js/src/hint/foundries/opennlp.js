require(["hint/foundries/stts"], function (sttsArray) {
  
  var ah = KorAP.annotationHelper = KorAP.annotationHelper || { "-" : [] };

  ah["-"].push(
    ["OpenNLP", "opennlp/", "Part-of-Speech"]
  );

  ah["opennlp/"] = [
    ["Part-of-Speech", "p="]
  ];

  ah["opennlp/p="] = sttsArray;
});

require(["hint/foundries/stts"], function () {
  var ah = KorAP.annotationHelper = KorAP.annotationHelper || { "-" : [] };

  ah["-"].push(
    ["MarMoT", "marmot/", "Morphology, Part-of-Speech"]
  );

  ah["marmot/"] = [
    ["Morphology", "m="],
    ["Part-of-Speech", "p="]
  ];

  ah["marmot/p="] = sttsArray;

  ah["marmot/m="] = [
    ["Case", "case:"],
    ["Degree", "degree:"],
    ["Gender", "gender:"],
    ["Mood", "mood:"],
    ["Number", "number:"],
    ["Person", "person:"],
    ["Tense","tense:"],
    ["No type", "<no-type> "]
  ];

  ah["marmot/m=case:"] = [
    ["acc", "acc ", "Accusative"],
    ["dat","dat ", "Dative"],
    ["gen", "gen ","Genitive"],
    ["nom","nom ", "Nominative"],
    ["*","* ", "Undefined"]
  ];

  ah["marmot/m=degree:"] = [
    ["comp","comp ", "Comparative"],
    ["pos","pos ", "Positive"],
    ["sup","sup ", "Superative"]
  ];
  
  ah["marmot/m=gender:"] = [
    ["fem", "fem ", "Feminium"],
    ["masc", "masc ", "Masculinum"],
    ["neut","neut ", "Neuter"],
    ["*","* ","Undefined"]
  ];

  ah["marmot/m=mood:"] = [
    ["imp","imp ", "Imperative"],
    ["ind","ind ", "Indicative"],
    ["subj","subj ", "Subjunctive"]
  ];

  ah["marmot/m=number"] = [
    ["pl","pl ","Plural"],
    ["sg","sg ","Singular"],
    ["*","* ","Undefined"]
  ];

  ah["marmot/m=person:"] = [
    ["1","1 ", "First Person"],
    ["2","2 ", "Second Person"],
    ["3","3 ", "Third Person"]
  ];

  ah["marmot/m=tense:"] = [
    ["past","past ", "Past"],
    ["pres","pres ", "Present"]
  ];
});

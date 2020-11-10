"use strict";

define(["hint/foundries","hint/foundries/stts"], function (ah, sttsArray) {
  let mateSttsArray = sttsArray.slice(0);
  mateSttsArray.push(
    ["<root-POS>","<root-POS>","Root Part of Speech"]
  );

  let ah = KorAP.annotationHelper = KorAP.annotationHelper || { "-" : [] };

  ah["-"].push(
    ["Mate", "mate/", "Lemma, Morphology, Part-of-Speech"]
  );

  ah["mate/"] = [
    // Inactive: "d" : ["d=", "Dependency"],
    ["Lemma", "l="],
    ["Morphology", "m="],
    ["Part-of-Speech", "p="]
  ];

  // Inactive: mate/d=
  ah["mate/p="] = mateSttsArray;

  ah["mate/m="] = [
    ["Case", "case:"],
    ["Degree", "degree:"],
    ["Gender", "gender:"],
    ["Mood", "mood:"],
    ["Number", "number:"],
    ["Person", "person:"],
    ["Tense","tense:"],
    ["No type", "<no-type> "]
  ];

  ah["mate/m=case:"] = [
    ["acc", "acc ", "Accusative"],
    ["dat","dat ", "Dative"],
    ["gen", "gen ","Genitive"],
    ["nom","nom ", "Nominative"],
    ["*","* ", "Undefined"]
  ];

  ah["mate/m=degree:"] = [
    ["comp","comp ", "Comparative"],
    ["pos","pos ", "Positive"],
    ["sup","sup ", "Superative"]
  ];

  ah["mate/m=gender:"] = [
    ["fem", "fem ", "Feminium"],
    ["masc", "masc ", "Masculinum"],
    ["neut","neut ", "Neuter"],
    ["*","* ","Undefined"]
  ];

  ah["mate/m=mood:"] = [
    ["imp","imp ", "Imperative"],
    ["ind","ind ", "Indicative"],
    ["subj","subj ", "Subjunctive"]
  ];

  ah["mate/m=number:"] = [
    ["pl","pl ","Plural"],
    ["sg","sg ","Singular"],
    ["*","* ","Undefined"]
  ];

  ah["mate/m=person:"] = [
    ["1","1 ", "First Person"],
    ["2","2 ", "Second Person"],
    ["3","3 ", "Third Person"]
  ];
  ah["mate/m=tense:"] = [
    ["past","past ", "Past"],
    ["pres","pres ", "Present"]
  ];
});

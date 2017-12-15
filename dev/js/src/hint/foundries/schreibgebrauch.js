require(["hint/foundries/stts"], function (sttsArray) {
  var ah = KorAP.annotationHelper = KorAP.annotationHelper || { "-" : [] };

  var sgbrSttsArray = sttsArray.slice(0);

  // Push specific information for Schreibgebrauch
  sgbrSttsArray.push(
    ["NNE", "NNE", "Normal Nomina with Named Entity"],
    ["ADVART","ADVART",   "Adverb with Article"],
    ["EMOASC","EMOASC",   "ASCII emoticon"],
    ["EMOIMG","EMOIMG",   "Graphic emoticon"],
    ["ERRTOK","ERRTOK",   "Tokenisation Error"],
    ["HST",     "HST",      "Hashtag"],
    ["KOUSPPER","KOUSPPER", "Subordinating Conjunction (with Sentence) with Personal Pronoun"],
    ["ONO",     "ONO",      "Onomatopoeia"],
    ["PPERPPER","PPERPPER", "Personal Pronoun with Personal Pronoun"],
    ["URL",     "URL",      "Uniform Resource Locator"],
    ["VAPPER",  "VAPPER",   "Finite Auxiliary Verb with Personal Pronoun"],
    ["VMPPER",  "VMPPER",   "Fintite Modal Verb with Personal Pronoun"],
    ["VVPPER",  "VVPPER",   "Finite Full Verb with Personal Pronoun"],
    ["AW", "AW", "Interaction Word"],
    ["ADR", "ADR", "Addressing Term"],
    ["AWIND", "AWIND", "Punctuation Indicating Addressing Term"],
    ["ERRAW","ERRAW", "Part of Erroneously Separated Compound"]
    /*
      As KorAP currently doesn't support these tags, they could also be ommited
      ["_KOMMA", "_KOMMA", "Comma"],
      ["_SONST", "_SONST", "Intrasentential Punctuation Mark"],
      ["_ENDE", "_ENDE", "Punctuation Mark at the end of the Sentence"]
    */
  );

  // Sort by tag
  sgbrSttsArray.sort(function (a,b) { return a[0].localeCompare(b[0]) });

  
  ah["-"].push(
    ["Schreibgebrauch", "sgbr/", "Lemma, Lemma Variants, Part-of-Speech"]
  );

  ah["sgbr/"] = [
    ["Lemma", "l="],
    ["Lemma Variants", "lv="],
    ["Part-of-Speech", "p="]
  ];

  ah["sgbr/p="] = sgbrSttsArray;
});

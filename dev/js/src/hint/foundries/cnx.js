define(["hint/foundries"], function (ah) {
  ah["-"].push(
    ["Connexor", "cnx/", "Constituency, Lemma, Morphology, Part-of-Speech, Syntax"]
  );

  ah["cnx/"] = [
    ["Constituency", "c="],
    ["Lemma", "l="],
    ["Morphology", "m="],
    ["Part-of-Speech", "p="],
    ["Syntax", "syn="]
  ];

  ah["cnx/c="] = [
    ["np", "np ", "Nominal Phrase"]
  ];

  // http://www.ids-mannheim.de/cosmas2/projekt/referenz/connexor/morph.html
  ah["cnx/m="] = [
    ["Abbr","Abbr ", "Nouns: Abbreviation"],
    ["CMP","CMP ", "Adjective: Comparative"],
    ["IMP", "IMP ", "Mood: Imperative"],
    ["IND", "IND ", "Mood: Indicative"],
    ["INF", "INF ", "Infinitive"],
    ["ORD","ORD ", "Numeral: Ordinal"],
    ["PAST", "PAST ", "Tense: past"],
    ["PCP", "PCP ", "Participle"],
    ["PERF", "PERF ", "Perfective Participle"],
    ["PL","PL ", "Nouns: Plural"],
    ["PRES", "PRES ", "Tense: present"],
    ["PROG", "PROG ", "Progressive Participle"],
    ["Prop","Prop ", "Nouns: Proper Noun"],
    ["SUB", "SUB ", "Mood: Subjunctive"],
    ["SUP","SUP ", "Adjective: Superlative"]
  ];

  // http://www.ids-mannheim.de/cosmas2/projekt/referenz/connexor/morph.html
  ah["cnx/p="] = [
    ["A", "A ", "Adjective"],
    ["ADV", "ADV ", "Adverb"],
    ["CC", "CC ", "Coordination Marker"],
    ["CS", "CS ", "Clause Marker"],
    ["DET", "DET ", "Determiner"],
    ["INTERJ", "INTERJ ", "Interjection"],
    ["N", "N ", "Noun"],
    ["NUM", "NUM ", "Numeral"],
    ["PREP", "PREP ", "Preposition"],
    ["PRON", "PRON ", "Pro-Nominal"],
    ["V", "V ", "Verb"]
  ];

  // http://www.ids-mannheim.de/cosmas2/projekt/referenz/connexor/syntax.html
  ah["cnx/syn="] = [
    ["@ADVL", "@ADVL ", "Adverbial Head"],
    ["@AUX", "@AUX ", "Auxiliary Verb"],
    ["@CC", "@CC ", "Coordination"]
    ["@MAIN", "@MAIN ", "Main Verb"],
    ["@NH", "@NH ", "Nominal Head"],
    ["@POSTMOD", "@POSTMOD ", "Postmodifier"],
    ["@PREMARK", "@PREMARK ", "Preposed Marker"],
    ["@PREMOD", "@PREMOD ", "Premodifier"]
  ];
});

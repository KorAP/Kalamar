var menuContent = [
  ['cnx/c', 'cnx', 'c'],
  ['mate/c', 'mate', 'c'],
  ['base/c', 'base', 'c'],
  ['xip/c', 'xip', 'c'],
  ['tt/c', 'tt', 'c']
];

var namedEntities = [
  ["I-LOC",  "I-LOC ",  "Location"],
  ["I-MISC", "I-MISC ", "Miscellaneous"],
  ["I-ORG",  "I-ORG ",  "Organization"],
  ["I-PER",  "I-PER ",  "Person"]
];

// http://www.ids-mannheim.de/cosmas2/projekt/referenz/stts/morph.html
// http://nachhalt.sfb632.uni-potsdam.de/owl-docu/stts.html
var sttsArray = [
  // "$.", "$(", "$,"
  ["ADJA","ADJA ", "Attributive Adjective"],
  ["ADJD","ADJD ", "Predicative Adjective"],
  ["ADV","ADV ", "Adverb"],
  ["APPO","APPO ", "Postposition"],
  ["APPR","APPR ", "Preposition"],
  ["APPRART","APPRART ", "Preposition with Determiner"],
  ["APZR","APZR ","Right Circumposition"],
  ["ART","ART ", "Determiner"],
  ["CARD","CARD ", "Cardinal Number"],
  ["FM","FM ", "Foreign Material"],
  ["ITJ","ITJ ", "Interjection"],
  ["KOKOM","KOKOM ", "Comparison Particle"],
  ["KON","KON ", "Coordinating Conjuncion"],
  ["KOUI","KOUI ", "Subordinating Conjunction with 'zu'"],
  ["KOUS","KOUS ", "Subordinating Conjunction with Sentence"],
  ["NE","NE ", "Named Entity"],
  ["NN","NN ", "Normal Nomina"],
  ["PAV", "PAV ", "Pronominal Adverb"],
  ["PDAT","PDAT ","Attributive Demonstrative Pronoun"],
  ["PDS","PDS ", "Substitutive Demonstrative Pronoun"],
  ["PIAT","PIAT ", "Attributive Indefinite Pronoun without Determiner"],
  ["PIDAT","PIDAT ", "Attributive Indefinite Pronoun with Determiner"],
  ["PIS","PIS ", "Substitutive Indefinite Pronoun"],
  ["PPER","PPER ", "Personal Pronoun"],
  ["PPOSAT","PPOSAT ", "Attributive Possessive Pronoun"],
  ["PPOSS","PPOSS ", "Substitutive Possessive Pronoun"],
  ["PRELAT","PRELAT ", "Attributive Relative Pronoun"],
  ["PRELS","PRELS ", "Substitutive Relative Pronoun"],
  ["PRF","PRF ", "Reflexive Pronoun"],
  ["PROAV","PROAV ", "Pronominal Adverb"],
  ["PTKA","PTKA ","Particle with Adjective"],
  ["PTKANT","PTKANT ", "Answering Particle"],
  ["PTKNEG","PTKNEG ", "Negation Particle"],
  ["PTKVZ","PTKVZ ", "Separated Verbal Particle"],
  ["PTKZU","PTKZU ", "'zu' Particle"],
  ["PWAT","PWAT ", "Attributive Interrogative Pronoun"],
  ["PWAV","PWAV ", "Adverbial Interrogative Pronoun"],
  ["PWS","PWS ", "Substitutive Interrogative Pronoun"],
  ["TRUNC","TRUNC ","Truncated"],
  ["VAFIN","VAFIN ", "Auxiliary Finite Verb"],
  ["VAINF","VAINF ", "Auxiliary Infinite Verb"],
  ["VAIMP","VAIMP ", "Auxiliary Finite Imperative Verb"],
  ["VAPP","VAPP ", "Auxiliary Perfect Participle"],
  ["VMFIN","VMFIN ", "Modal Finite Verb"],
  ["VMINF","VMINF ", "Modal Infinite Verb"],
  ["VMPP","VMPP ", "Modal Perfect Participle"],
  ["VVFIN","VVFIN ","Finite Verb"],
  ["VVIMP","VVIMP ", "Finite Imperative Verb"],
  ["VVINF","VVINF ", "Infinite Verb"],
  ["VVIZU","VVIZU ", "Infinite Verb with 'zu'"],
  ["VVPP","VVPP ", "Perfect Participle"],
  ["XY", "XY ", "Non-Word"]
];

var mateSttsArray = sttsArray.slice(0);
mateSttsArray.push(
  ["<root-POS>","<root-POS>","Root Part of Speech"]
);


define({
  "-" : [
    ["Connexor",   "cnx/",     "Constituency, Lemma, Morphology, Part-of-Speech, Syntax"],
    ["CoreNLP",    "corenlp/", "Named Entities"],
    ["Mate",       "mate/",     "Lemma, Morphology, Part-of-Speech"],
    ["OpenNLP",    "opennlp/", "Part-of-Speech"],
    ["TreeTagger", "tt/",      "Lemma, Part-of-Speech"],
    ["Xerox Parser", "xip/",   "Constituency, Lemma, Part-of-Speech"]
  ],
  "corenlp/" : [
    ["Named Entity", "ne=" , "Combined"],
    ["Named Entity", "ne_dewac_175m_600=" , "ne_dewac_175m_600"],
    ["Named Entity", "ne_hgc_175m_600=",    "ne_hgc_175m_600"]
  ],
  "corenlp/ne=" : namedEntities,
  "corenlp/ne_dewac_175m_600=" : namedEntities,
  "corenlp/ne_hgc_175m_600=" : namedEntities,
  "cnx/" : [
    ["Constituency", "c="],
    ["Lemma", "l="],
    ["Morphology", "m="],
    ["Part-of-Speech", "p="],
    ["Syntax", "syn="]
  ],
  "cnx/c=" : [
    ["np", "np ", "Nominal Phrase"]
  ],
  // http://www.ids-mannheim.de/cosmas2/projekt/referenz/connexor/morph.html
  "cnx/m=" : [
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
  ],
  // http://www.ids-mannheim.de/cosmas2/projekt/referenz/connexor/morph.html
  "cnx/p=" : [
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
  ],
  // http://www.ids-mannheim.de/cosmas2/projekt/referenz/connexor/syntax.html
  "cnx/syn=" : [
    ["@ADVL", "@ADVL ", "Adverbial Head"],
    ["@AUX", "@AUX ", "Auxiliary Verb"],
    ["@CC", "@CC ", "Coordination"]
    ["@MAIN", "@MAIN ", "Main Verb"],
    ["@NH", "@NH ", "Nominal Head"],
    ["@POSTMOD", "@POSTMOD ", "Postmodifier"],
    ["@PREMARK", "@PREMARK ", "Preposed Marker"],
    ["@PREMOD", "@POSTMOD ", "Premodifier"]
  ],
  "opennlp/" : [
    ["Part-of-Speech", "p="]
  ],
  "opennlp/p=" : sttsArray,
  "xip/" : [
    ["Constituency", "c="],
    // Inactive: ["Dependency", "d="],
    ["Lemma", "l="],
    ["Part-of-Speech", "p="],
  ],
  // "xip/c=" : [],
  // Inactive: "xip/d=" : [],
  // "xip/p=" : [],
  "tt/" : [
    ["Lemma", "l="],
    ["Part-of-Speech", "p="]
  ],
  "tt/p=" : sttsArray,
  "mate/" : [
    // Inactive: "d" : ["d=", "Dependency"],
    ["Lemma", "l="],
    ["Morphology", "m="],
    ["Part-of-Speech", "p="]
  ],
  // Inactive: mate/d=
  "mate/p=" : mateSttsArray,
  "mate/m=" : [
    ["Case", "case:"],
    ["Degree", "degree:"],
    ["Gender", "gender:"],
    ["Mood", "mood:"],
    ["Number", "number:"],
    ["Person", "person:"],
    ["Tense","tense:"],
    ["No type", "<no-type> "]
  ],
  "mate/m=case:" : [
    ["acc", "acc ", "Accusative"],
    ["dat","dat ", "Dative"],
    ["gen", "gen ","Genitive"],
    ["nom","nom ", "Nominative"],
    ["*","* ", "Undefined"]
  ],
  "mate/m=degree:" : [
    ["comp","comp ", "Comparative"],
    ["pos","pos ", "Positive"],
    ["sup","sup ", "Superative"]
  ],
  "mate/m=gender:" : [
    ["fem", "fem ", "Feminium"],
    ["masc", "masc ", "Masculinum"],
    ["neut","neut ", "Neuter"],
    ["*","* ","Undefined"]
  ],
  "mate/m=mood:" : [
    ["imp","imp ", "Imperative"],
    ["ind","ind ", "Indicative"],
    ["subj","subj ", "Subjunctive"]
  ],
  "mate/m=number:" : [
    ["pl","pl ","Plural"],
    ["sg","sg ","Singular"],
    ["*","* ","Undefined"]
  ],
  "mate/m=person:" : [
    ["1","1 ", "First Person"],
    ["2","2 ", "Second Person"],
    ["3","3 ", "Third Person"]
  ],
  "mate/m=tense:" : [
    ["past","past ", "Past"],
    ["pres","pres ", "Present"]
  ]
});

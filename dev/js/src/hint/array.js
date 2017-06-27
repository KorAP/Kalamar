/*
var menuContent = [
  ['cnx/c', 'cnx', 'c'],
  ['mate/c', 'mate', 'c'],
  ['base/c', 'base', 'c'],
  ['xip/c', 'xip', 'c'],
  ['tt/c', 'tt', 'c']
];
*/

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
  ["VAIMP","VAIMP ", "Auxiliary Finite Imperative Verb"],
  ["VAINF","VAINF ", "Auxiliary Infinite Verb"],
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


// http://www.coli.uni-saarland.de/projects/sfb378/negra-corpus/negra-corpus.html
// http://www.coli.uni-saarland.de/projects/sfb378/negra-corpus/knoten.html
var negraNodes = [
  ["AA", "AA", "superlative phrase with 'am'"],
  ["AP","AP", "adjektive phrase"],
  ["AVP","AVP", "adverbial phrase"],
  ["CAP","CAP", "coordinated adjektive phrase"],
  ["CAVP","CAVP", "coordinated adverbial phrase"],
  ["CAC","CAC", "coordinated adposition"],
  ["CCP","CCP", "coordinated complementiser"],
  ["CH","CH", "chunk"],
  ["CNP","CNP", "coordinated noun phrase"],
  ["CO","CO", "coordination"],
  ["CPP","CPP", "coordinated adpositional phrase"],
  ["CS","CS", "coordinated sentence"],
  ["CVP","CVP", "coordinated verb phrase (non-finite)"],
  ["CVZ","CVZ", "coordinated zu-marked infinitive"],
  ["DL","DL", "discourse level constituent"],
  ["ISU","ISU", "idiosyncratis unit"],
  ["MPN","MPN", "multi-word proper noun"],
  ["MTA","MTA", "multi-token adjective"],
  ["NM","NM", "multi-token number"],
  ["NP","NP", "noun phrase"],
  ["PP","PP", "adpositional phrase"],
  ["QL","QL", "quasi-languag"],
  ["ROOT","ROOT", "root node"],
  ["S","S", "sentence"],
  ["VP","VP", "verb phrase (non-finite)"],
  ["VZ","VZ", "zu-marked infinitive"]
];

// http://www.coli.uni-saarland.de/projects/sfb378/negra-corpus/kanten.html
var negraEdges = [
  ["AC","AC","adpositional case marker"],
  ["ADC","ADC","adjective component"],
  ["AMS","AMS","measure argument of adj"],
  ["APP","APP","apposition"],
  ["AVC","AVC","adverbial phrase component"],
  ["CC","CC","comparative complement"],
  ["CD","CD","coordinating conjunction"],
  ["CJ","CJ","conjunct"],
  ["CM","CM","comparative concjunction"],
  ["CP","CP","complementizer"],
  ["DA","DA","dative"],
  ["DH","DH","discourse-level head"],
  ["DM","DM","discourse marker"],
  ["GL","GL","prenominal genitive"],
  ["GR","GR","postnominal genitive"],
  ["HD","HD","head"],
  ["JU","JU","junctor"],
  ["MC","MC","comitative"],
  ["MI","MI","instrumental"],
  ["ML","ML","locative"],
  ["MNR","MNR","postnominal modifier"],
  ["MO","MO","modifier"],
  ["MR","MR","rhetorical modifier"],
  ["MW","MW","way (directional modifier)"],
  ["NG","NG","negation"],
  ["NK","NK","noun kernel modifier"],
  ["NMC","NMC","numerical component"], 
  ["OA","OA","accusative object"],
  ["OA2","OA2","second accusative object"], 
  ["OC","OC","clausal object"],
  ["OG","OG","genitive object"], 
  ["PD","PD","predicate"],
  ["PG","PG","pseudo-genitive"],
  ["PH","PH","placeholder"],
  ["PM","PM","morphological particle"],
  ["PNC","PNC","proper noun component"], 
  ["RC","RC","relative clause"],
  ["RE","RE","repeated element"],
  ["RS","RS","reported speech"],
  ["SB","SB","subject"],
  ["SBP","SBP","passivised subject (PP)"], 
  ["SP","SP","subject or predicate"],
  ["SVP","SVP","separable verb prefix"],
  ["UC","UC","(idiosyncratic) unit component"], 
  ["VO","VO","vocative"]
];

var mateSttsArray = sttsArray.slice(0);
mateSttsArray.push(
  ["<root-POS>","<root-POS>","Root Part of Speech"]
);

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

define(function () {
  var obj = {
    "-" : [
      ["Base Annotation", "base/s=", "Structure"],
//      ["Connexor", "cnx/", "Constituency, Lemma, Morphology, Part-of-Speech, Syntax"],
      ["CoreNLP", "corenlp/", "Constituency, Named Entities, Part-of-Speech"],
      ["DeReKo", "dereko/s=", "Structure"],
      ["DRuKoLa", "drukola/", "Lemma, Morphology, Part-of-Speech"],
//      ["Mate", "mate/", "Lemma, Morphology, Part-of-Speech"],
      ["Malt", "malt/", "Dependency"],
      ["OpenNLP", "opennlp/", "Part-of-Speech"],
//      ["Schreibgebrauch", "sgbr/", "Lemma, Lemma Variants, Part-of-Speech"],
      ["TreeTagger", "tt/", "Lemma, Part-of-Speech"],
//      ["Xerox Parser", "xip/", "Constituency, Lemma, Part-of-Speech"]
      ["MarMoT", "marmot/", "Morphology, Part-of-Speech"],
    ],
    "base/s=" : [
      ["s", "s", "Sentence"],
      ["p", "p", "Paragraph"],
      ["t", "t", "Text"]
    ],
    "corenlp/" : [
      ["Constituency", "c="],
      ["Named Entity", "ne=" , "Combined"],
      ["Named Entity", "ne_dewac_175m_600=" , "ne_dewac_175m_600"],
      ["Named Entity", "ne_hgc_175m_600=",    "ne_hgc_175m_600"],
      ["Part-of-Speech", "p="]
    ],
    "corenlp/ne=" : namedEntities,
    "corenlp/ne_dewac_175m_600=" : namedEntities,
    "corenlp/ne_hgc_175m_600=" : namedEntities,
    "corenlp/p=" : sttsArray,
    "corenlp/c=" : negraNodes,
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
    "drukola/" : [
      ["Lemma", "l="],
      ["Morphology", "m="],
      ["Part-of-Speech", "p="]      
    ],
    "opennlp/" : [
      ["Part-of-Speech", "p="]
    ],
    "opennlp/p=" : sttsArray,
    "sgbr/" : [
      ["Lemma", "l="],
      ["Lemma Variants", "lv="],
      ["Part-of-Speech", "p="]
    ],
    "sgbr/p=" : sgbrSttsArray,
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
    "marmot/" : [
      ["Morphology", "m="],
      ["Part-of-Speech", "p="]
    ],
    "marmot/p=" : sttsArray,
    "malt/" : [
      ["Dependency", "d="]
    ],
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
    "marmot/m=" : [
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
    "marmot/m=case:" : [
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
    "marmot/m=degree:" : [
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
    "marmot/m=gender:" : [
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
    "marmot/m=mood:" : [
      ["imp","imp ", "Imperative"],
      ["ind","ind ", "Indicative"],
      ["subj","subj ", "Subjunctive"]
    ], 
    "mate/m=number:" : [
      ["pl","pl ","Plural"],
      ["sg","sg ","Singular"],
      ["*","* ","Undefined"]
    ],
    "marmot/m=number" : [
      ["pl","pl ","Plural"],
      ["sg","sg ","Singular"],
      ["*","* ","Undefined"]
    ],
    "mate/m=person:" : [
      ["1","1 ", "First Person"],
      ["2","2 ", "Second Person"],
      ["3","3 ", "Third Person"]
    ],
    "marmot/m=person:" : [
      ["1","1 ", "First Person"],
      ["2","2 ", "Second Person"],
      ["3","3 ", "Third Person"]
    ],
    "mate/m=tense:" : [
      ["past","past ", "Past"],
      ["pres","pres ", "Present"]
    ],
    "marmot/m=tense:" : [
      ["past","past ", "Past"],
      ["pres","pres ", "Present"]
    ],
    "malt/d=" : [
      ["-PUNCT-", "-PUNCT- "],
      ["-UNKNOWN-","-UNKNOWN- "],
      ["ADV","ADV "],
      ["APP","APP "],
      ["ATTR","ATTR "],
      ["AUX","AUX "],
      ["AVZ","AVZ "],
      ["CJ","CJ "],
      ["DET","DET "],
      ["EXPL","EXPL "],
      ["GMOD","GMOD "],
      ["GRAD","GRAD "],
      ["KOM","KOM "],
      ["KON","KON "],
      ["KONJ","KONJ "],
      ["NEB","NEB "],
      ["OBJA","OBJA "],
      ["OBJC","OBJC "],
      ["OBJD","OBJD "],
      ["OBJG","OBJG "],
      ["OBJI","OBJI "],
      ["OBJP","OBJP "],
      ["PAR","PAR "],
      ["PART","PART "],
      ["PN","PN "],
      ["PP","PP "],
      ["PRED","PRED "],
      ["REL","REL "],
      ["ROOT","ROOT "],
      ["S","S "],
      ["SUBJ","SUBJ "],
      ["SUBJC","SUBJC "],
      ["ZEIT","ZEIT "],
      ["gmod-app","gmod-app "],
      ["koord","koord "]
    ]
  };

  for (var i in negraNodes) {
    obj["corenlp/c=" + negraNodes[i][0] + '-'] = negraEdges;
  };

  return obj;
});

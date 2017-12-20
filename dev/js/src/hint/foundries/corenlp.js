define(["hint/foundries","hint/foundries/stts"], function (ah, sttsArray) {
  var namedEntities = [
    ["I-LOC",  "I-LOC ",  "Location"],
    ["I-MISC", "I-MISC ", "Miscellaneous"],
    ["I-ORG",  "I-ORG ",  "Organization"],
    ["I-PER",  "I-PER ",  "Person"]
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

  ah["-"].push(
    ["CoreNLP", "corenlp/", "Constituency, Named Entities, Part-of-Speech"]
  );

  ah["corenlp/"] = [
    ["Constituency", "c="],
    ["Named Entity", "ne=" , "Combined"],
    ["Named Entity", "ne_dewac_175m_600=" , "ne_dewac_175m_600"],
    ["Named Entity", "ne_hgc_175m_600=",    "ne_hgc_175m_600"],
    ["Part-of-Speech", "p="]
  ];

  ah["corenlp/ne="] = namedEntities;
  ah["corenlp/ne_dewac_175m_600="] = namedEntities;
  ah["corenlp/ne_hgc_175m_600="] = namedEntities;
  ah["corenlp/p="] = sttsArray;
  ah["corenlp/c="] = negraNodes;

  for (var i in negraNodes) {
    ah["corenlp/c=" + negraNodes[i][0] + '-'] = negraEdges;
  };
});

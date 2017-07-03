var snippet = "<span title=\"cnx/l:meist\">" +
  "  <span title=\"cnx/p:ADV\">" +
  "    <span title=\"cnx/syn:@PREMOD\">" +
  "      <span title=\"mate/l:meist\">" +
  "        <span title=\"mate/p:ADV\">" +
  "          <span title=\"opennlp/p:ADV\">meist</span>" +
  "        </span>" +
  "      </span>" +
  "    </span>" +
  "  </span>" +
  "</span>" +
  "<span title=\"cnx/l:deutlich\">" +
  "  <span title=\"cnx/p:A\">" +
  "    <span title=\"cnx/syn:@PREMOD\">" +
  "      <span title=\"mate/l:deutlich\">" +
  "        <span title=\"mate/m:degree:pos\">" +
  "          <span title=\"mate/m:case:nom\">" +
  "            <span title=\"mate/p:ADJD\">" +
  "              <span title=\"opennlp/p:ADJD\">deutlich</span>" +
  "            </span>" +
  "          </span>" +
  "        </span>" +
  "      </span>" +
  "    </span>" +
  "  </span>" +
  "</span>" +
  "<span title=\"cnx/l:fähig\">" +
  "  <span title=\"cnx/l:leistung\">" +
  "    <span title=\"cnx/p:A\">" +
  "      <span title=\"cnx/syn:@NH\">" +
  "        <span title=\"mate/l:leistungsfähig\">" +
  "          <span title=\"mate/m:degree:comp\">" +
  "            <span title=\"mate/p:ADJD\">" +
  "              <span title=\"opennlp/p:ADJD\">leistungsfähiger</span>" +
  "            </span>" +
  "          </span>" +
  "        </span>" +
  "      </span>" +
  "    </span>" +
  "  </span>" +
  "</span>";

var treeSnippet =
  "<span class=\"context-left\"></span>" +
  "<span class=\"match\">" +
  "  <span title=\"xip/c:MC\">" +
  "    <span title=\"xip/c:TOP\">" +
  "      <span title=\"xip/c:PP\">" +
  "        <span title=\"xip/c:PREP\">Mit</span>" +
  "        <span title=\"xip/c:NP\">" +
  "          <span title=\"xip/c:DET\">dieser</span>" +
  "          <span title=\"xip/c:NPA\">" +
  "            <span title=\"xip/c:NOUN\">Methode</span>" +
  "          </span>" +
  "        </span>" +
  "      </span>" +
  "      <span title=\"xip/c:VERB\">ist</span>" +
  "      <span title=\"xip/c:NP\">" +
  "        <span title=\"xip/c:PRON\">es</span>" +
  "      </span>" +
  "      <span title=\"xip/c:AP\">" +
  "        <span title=\"xip/c:ADV\">nun</span>" +
  "        <span title=\"xip/c:ADJ\">möglich</span>" +
  "      </span>" +
  "      <span title=\"xip/c:ADV\">z. B.</span>" +
  "      <span title=\"xip/c:NPA\">" +
  "        <span title=\"xip/c:NP\">" +
  "          <span title=\"xip/c:NOUN\">Voice</span>" +
  "        </span>" +
  "      </span>" + "(" +
  "      <span title=\"xip/c:INS\">" +
  "        <span title=\"xip/c:NPA\">" +
  "          <span title=\"xip/c:NP\">" +
  "            <span title=\"xip/c:NOUN\">Sprache</span>" +
  "          </span>" +
  "        </span>" +
  "      </span>" + ")" +
  "      <span title=\"xip/c:VERB\">bevorzugt</span>" +
  "      <span title=\"xip/c:PP\">" +
  "        <span title=\"xip/c:PREP\">in</span>" +
  "        <span title=\"xip/c:NP\">" +
  "          <span title=\"xip/c:PRON\">der</span>" +
  "        </span>" +
  "        <span title=\"xip/c:NPA\">" +
  "          <span title=\"xip/c:NP\">" +
  "            <span title=\"xip/c:NOUN\">Bridge</span>" +
  "          </span>" +
  "        </span>" +
  "      </span>" +
  "      <span title=\"xip/c:INFC\">" +
  "        <span title=\"xip/c:INS\">" +
  "          <span title=\"xip/c:VERB\">weiterzugeben</span>" +
  "        </span>" +
  "      </span>" +
  "    </span>" +
  "  </span>" +
  "</span>" +
  "<span class=\"context-right\"></span>";

var treeSnippet2 =
  "<span class=\"context-left\"><\/span>"+
  "<span class=\"match\">"+
  "<span title=\"xip\/c:NPA\">"+
  "<span title=\"xip\/c:NP\">"+
  "<span title=\"xip\/c:NOUN\">HDTV<\/span>"+
  "<\/span>"+
  "<\/span> "+
  "<span title=\"xip\/c:NPA\">" +
  "<span title=\"xip\/c:NP\">"+
  "<span title=\"xip\/c:NOUN\">Samples<\/span>"+
  "<\/span>"+
  "<\/span> "+
  "<span title=\"xip\/c:ADV\">from<\/span> "+
  "<span title=\"xip\/c:NPA\">"+
  "<span title=\"xip\/c:NP\">"+
  "<span title=\"xip\/c:NOUN\">European<\/span>"+
  "<\/span>"+
  "<\/span> ("+
  "<span title=\"xip\/c:INS\">"+
  "<span title=\"xip\/c:NPA\">"+
  "<span title=\"xip\/c:NP\">"+
  "<span title=\"xip\/c:NOUN\">and<\/span>"+
  "<\/span>"+
  "<\/span> "+
  "<span title=\"xip\/c:ADV\">other<\/span>"+
  "<\/span>) "+
  "<span title=\"xip\/c:ADV\">broadcasters<\/span> "+
  "<span title=\"xip\/c:NPA\">"+
  "<span title=\"xip\/c:NP\">"+
  "<span title=\"xip\/c:NOUN\">and<\/span>"+
  "<\/span>"+
  "<\/span> "+
  "<span title=\"xip\/c:VERB\">test<\/span> "+
  "<span title=\"xip\/c:ADV\">transmissions<\/span> "+
  "<span title=\"xip\/c:PREP\">in<\/span> "+
  "<span title=\"xip\/c:NOUN\">Europe<\/span>"+
  "<\/span>"+
  "<span class=\"context-right\"><\/span>";

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

var vcExample = {
  "@type":"koral:docGroup",
  "operation":"operation:or",
  "operands":[
    {
      "@type":"koral:docGroup",
      "operation":"operation:and",
      "operands":[
        {
          "@type":"koral:doc",
          "key":"title",
          "value":"Der Birnbaum",
          "match":"match:eq"
        },
        {
          "@type":"koral:doc",
          "key":"pubPlace",
          "value":"Mannheim",
          "match":"match:eq"
        },
        {
          "@type":"koral:docGroup",
          "operation":"operation:or",
          "operands":[
            {
              "@type":"koral:doc",
              "key":"subTitle",
              "value":"Aufzucht und Pflege",
              "match":"match:eq"
            },
            {
              "@type":"koral:doc",
              "key":"subTitle",
              "value":"Gedichte",
              "match":"match:eq",
              "rewrites" : [
                {
                  "@type": "koral:rewrite",
                  "src" : "policy",
                  "operation" : "operation:injection",
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "@type":"koral:doc",
      "key":"pubDate",
      "type":"type:date",
      "value":"2015-03-05",
      "match":"match:geq"
    }
  ]
};

var hintArray = {
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
};

var queryExample = {"wrap":{"layer":"orth","match":"match:eq","foundry":"opennlp","key":"Baum","@type":"korap:term"},"@type":"korap:token"};

queryExample = {
  "@context" : "http://korap.ids-mannheim.de/ns/koral/0.3/context.jsonld",
  "collection" : {
    "@type" : "koral:doc",
    "key" : "pubDate",
    "value" : "2005-05-25",
    "type" : "type:date",
    "match" : "match:geq" 
  },
  "query" : {}
};

queryExample = {
   "@type" : "koral:docGroup",
   "operation" : "operation:and",
   "operands" : [{
      "@type":"koral:doc",
      "key":"title",
      "match":"match:eq",
      "value":"Der Birnbaum",
      "type":"type:string"
    },{
      "@type":"koral:doc",
      "key":"pubPlace",
      "match":"match:eq",
      "value":"Mannheim",
      "type":"type:string"
    }
   ]
 };

queryExample = {
  "@context" : "http://korap.ids-mannheim.de/ns/koral/0.3/context.jsonld",
  "collection" : {},
  "query" : {
    "@type":"koral:group",
    "operation" : "operation:sequence",
    "operands" : [
      {
      "@type" : "koral:token",
      "wrap" : {
        "@type" : "koral:termGroup",
        "relation" : "relation:and",
        "operands" : [ {
          "@type" : "koral:term",
          "foundry" : "tt",
          "key" : "ADJA",
          "layer" : "pos",
          "match" : "match:eq"
      	},
		       {
			 "@type" : "koral:term",
          "foundry" : "cnx",
          "key" : "@PREMOD",
          "layer" : "syn",
          "match" : "match:eq"
		       } ]
    }
      },
      {
      "@type" : "koral:token",
      "wrap" : {
        "@type" : "koral:term",
        "key" : "octopus",
        "layer" : "lemma",
        "match" : "match:eq"
      }
    } ]
  }
};


queryExample = {
  "@context" : "http://korap.ids-mannheim.de/ns/koral/0.3/context.jsonld",
  "collection" : {
    "@type" : "koral:doc",
    "key" : "pubDate",
    "value" : "2005-05-25",
    "type" : "type:date",
    "match" : "match:geq" 
  },
  "query" : {
    "@type" : "koral:token",
    "wrap" : {
      "@type" : "koral:term",
      "key" : "octopus",
      "layer" : "lemma",
      "match" : "match:eq"
    }
  }
};

queryExample = {
  "@type":"koral:doc",
  "key":"subTitle",
  "value":"Gedichte",
  "match":"match:eq",
  "rewrites" : [
    {
      "@type": "koral:rewrite",
      "src" : "policy",
      "operation" : "operation:injection",
    }
  ]
};


requirejs.config({
  baseUrl: '../js/src',
  paths : {
    'lib': '../lib'
  }
});

KorAP.currentQuery = queryExample;

require(['app/en', 'init'], function (lang, init) {
  KorAP.hintArray = hintArray;

  // Set current virtual collection
  KorAP.currentVC = vcExample;

  // Parse and show the table
  // Override getMatchInfo API call
  KorAP.API.getMatchInfo = function(match, callObj, cb) {

    console.log(match);
    
    if (callObj["spans"] !== undefined && callObj["spans"] === true) {
      cb({ "snippet": treeSnippet2 });
    }
    else {
      cb({ "snippet": snippet });
    }
  };

  /**
   * Do some things at the beginning.
   */

  // document.getElementById('vc-choose').click();
  // init.tutorial.show();

  /*
    KorAP.HintMenu.hide = function () {};
    init.hint.show();

    var menu = KorAP.MatchTreeMenu.create(
      undefined,
      menuContent
    );
    menu.hide = function () {};
    document.getElementById('menu').appendChild(menu.element());
    menu.limit(3);
    menu.show();
    menu.focus();
  */
});

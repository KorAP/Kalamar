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

var relSnippet =
    "<span class=\"context-left\"></span>" +
    "<span class=\"match\">" +
    "  <span xml:id=\"token-GOE/AGA/01784-p199\">" +
    "    <span xlink:title=\"malt/d:ADV\" xlink:type=\"simple\" xlink:href=\"#token-GOE/AGA/01784-p199\">dann</span>" +
    "  </span>" +
    " zog " +
    "  <span xlink:title=\"malt/d:SUBJ\" xlink:type=\"simple\" xlink:href=\"#token-GOE/AGA/01784-p199\">ich</span>" +
    "  <span xml:id=\"token-GOE/AGA/01784-p202\">" +
    "    <span xlink:title=\"malt/d:OBJA\" xlink:type=\"simple\" xlink:href=\"#token-GOE/AGA/01784-p199\">mich</span>" +
    "  </span>" +
    "  <span xlink:title=\"malt/d:PP\" xlink:type=\"simple\" xlink:href=\"#token-GOE/AGA/01784-p199\">gegen</span>" +
    "  <span xml:id=\"token-GOE/AGA/01784-p204\">" +
    "    <span xlink:title=\"malt/d:DET\" xlink:type=\"simple\" xlink:href=\"#token-GOE/AGA/01784-p204\">das</span>" +
    "  </span>" +
    "  <span xlink:title=\"malt/d:PN\" xlink:type=\"simple\" xlink:href=\"#token-GOE/AGA/01784-p202\">Regiment</span>" +
    "  <span xml:id=\"token-GOE/AGA/01784-p206\">" +
    "    <span xlink:title=\"malt/d:AVZ\" xlink:type=\"simple\" xlink:href=\"#token-GOE/AGA/01784-p199\">zurück</span>" +
    "  </span>" +
    "  <span xml:id=\"token-GOE/AGA/01784-p207\">" +
    "    <span xlink:title=\"malt/d:KON\" xlink:type=\"simple\" xlink:href=\"#token-GOE/AGA/01784-p199\">und</span>" +
    "  </span>" +
    "  <span xml:id=\"token-GOE/AGA/01784-p208\">" +
    "    <span xlink:title=\"malt/d:CJ\" xlink:type=\"simple\" xlink:href=\"#token-GOE/AGA/01784-p206\">war</span>" +
    "  </span>" +
    "  <span xlink:title=\"malt/d:AUX\" xlink:type=\"simple\" xlink:href=\"#token-GOE/AGA/01784-p207\">bemüht</span>" +
    "," +
    "  <span xlink:title=\"malt/d:DET\" xlink:type=\"simple\" xlink:href=\"#token-GOE/AGA/01784-p211\">einige</span>" +
    "  <span xml:id=\"token-GOE/AGA/01784-p211\">" +
    "    <span xlink:title=\"malt/d:ATTR\" xlink:type=\"simple\" xlink:href=\"#token-GOE/AGA/01784-p211\">genaue</span>" +
    "  </span>" +
    "  <span xml:id=\"token-GOE/AGA/01784-p212\">" +
    "    <span xlink:title=\"malt/d:OBJA\" xlink:type=\"simple\" xlink:href=\"#token-GOE/AGA/01784-p215\">Umrisse</span>" +
    "  </span>" +
    "  <span xlink:title=\"malt/d:OBJP\" xlink:type=\"simple\" xlink:href=\"#token-GOE/AGA/01784-p215\">aufs</span>" +
    "  <span xlink:title=\"malt/d:PN\" xlink:type=\"simple\" xlink:href=\"#token-GOE/AGA/01784-p212\">Papier</span>" +
    "  <span xml:id=\"token-GOE/AGA/01784-p215\">" +
    "    <span xlink:title=\"malt/d:PART\" xlink:type=\"simple\" xlink:href=\"#token-GOE/AGA/01784-p215\">zu</span>" +
    "  </span>" +
    "  <span xlink:title=\"malt/d:OBJI\" xlink:type=\"simple\" xlink:href=\"#token-GOE/AGA/01784-p208\">bringen</span>" +
    ", um mir " +
    "  <span xml:id=\"token-GOE/AGA/01784-p219\">" +
    "    <span xlink:title=\"malt/d:DET\" xlink:type=\"simple\" xlink:href=\"#token-GOE/AGA/01784-p219\">die</span>" +
    "  </span>" +
    "  <span xml:id=\"token-GOE/AGA/01784-p220\">Bezüge</span>" +
    "  <span xlink:title=\"malt/d:KON\" xlink:type=\"simple\" xlink:href=\"#token-GOE/AGA/01784-p219\">und</span>" +
    "  <span xml:id=\"token-GOE/AGA/01784-p222\">" +
    "    <span xlink:title=\"malt/d:DET\" xlink:type=\"simple\" xlink:href=\"#token-GOE/AGA/01784-p222\">die</span>" +
    "  </span>" +
    "  <span xlink:title=\"malt/d:CJ\" xlink:type=\"simple\" xlink:href=\"#token-GOE/AGA/01784-p220\">Distanzen</span>" +
    "  <mark>" +
    "    <span xlink:title=\"malt/d:DET\" xlink:type=\"simple\" xlink:href=\"#token-GOE/AGA/01784-p225\">der</span>" +
    "  </mark>" +
    "  <span xml:id=\"token-GOE/AGA/01784-p225\">" +
    "    <span xlink:title=\"malt/d:ATTR\" xlink:type=\"simple\" xlink:href=\"#token-GOE/AGA/01784-p225\">landschaftlichen</span>" +
    "  </span>" +
    "  <span xml:id=\"token-GOE/AGA/01784-p226\">" +
    "    <span xlink:title=\"malt/d:GMOD\" xlink:type=\"simple\" xlink:href=\"#token-GOE/AGA/01784-p222\">Gegenstände</span>" +
    "  </span>" +
    "  <span xlink:title=\"malt/d:KON\" xlink:type=\"simple\" xlink:href=\"#token-GOE/AGA/01784-p219\">desto</span>" +
    "  <span xlink:title=\"malt/d:ADV\" xlink:type=\"simple\" xlink:href=\"#token-GOE/AGA/01784-p229\">besser</span>" +
    "  <span xml:id=\"token-GOE/AGA/01784-p229\">" +
    "    <span xlink:title=\"malt/d:PART\" xlink:type=\"simple\" xlink:href=\"#token-GOE/AGA/01784-p229\">zu</span>" +
    "  </span>" +
    "  <span xlink:title=\"malt/d:CJ\" xlink:type=\"simple\" xlink:href=\"#token-GOE/AGA/01784-p226\">imprimieren</span>" +
    "</span>" +
    "<span class=\"context-right\"></span>";


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
              "@type":"koral:docGroupRef",
              "ref":"@admin/derekosub"
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


var textInfo = {
  "@context":"http:\/\/korap.ids-mannheim.de\/ns\/KoralQuery\/v0.3\/context.jsonld",
  "document":{
    "@type":"koral:document",
    "fields":[
      {
        "@type":"koral:field",
        "key":"editor",
        "type":"type:store",
        "value":"wikipedia.org"
      },
      {
        "@type":"koral:field",
        "key":"textSigle",
        "type":"type:string",
        "value":"WPD15\/264\/58336"
      },
      {
        "@type":"koral:field",
        "key":"author",
        "type":"type:text",
        "value":"Sprachpfleger, u.a."
      },
      {
        "@type":"koral:field",
        "key":"docSigle",
        "type":"type:string",
        "value":"WPD15\/264"
      },
      {
        "@type":"koral:field",
        "key":"textTypeArt",
        "type":"type:string",
        "value":"Enzyklopädie-Artikel"
      },
      {
        "@type":"koral:field",
        "key":"language",
        "type":"type:string",
        "value":"de"
      },
      {
        "@type":"koral:field",
        "key":"docTitle",
        "type":"type:text",
        "value":"Wikipedia, Artikel mit Anfangszahl 2, Teil 64"
      },
      {
        "@type":"koral:field",
        "key":"textType",
        "type":"type:string",
        "value":"Enzyklopädie"
      },
      {
        "@type":"koral:field",
        "key":"availability",
        "type":"type:string",
        "value":"CC-BY-SA"
      },
      {
        "@type":"koral:field",
        "key":"foundries",
        "type":"type:keywords",
        "value":[
          "corenlp",
          "corenlp\/constituency",
          "corenlp\/morpho",
          "corenlp\/sentences",
          "dereko",
          "dereko\/structure",
          "dereko\/structure\/base-sentences-paragraphs-pagebreaks",
          "opennlp",
          "opennlp\/morpho",
          "opennlp\/sentences"
        ]
      },
      {
        "@type":"koral:field",
        "key":"creationDate",
        "type":"type:date",
        "value":"2015-04-17"
      },
      {
        "@type":"koral:field",
        "key":"title",
        "type":"type:text",
        "value":"22:43 – Das Schicksal hat einen Plan"
      },
      {
        "@type":"koral:field",
        "key":"pubDate",
        "type":"type:date",
        "value":"2015-05-01"
      },
      {
        "@type":"koral:field",
        "key":"reference",
        "type":"type:store",
        "value":"22:43 – Das Schicksal hat einen Plan, In: Wikipedia - URL:http:\/\/de.wikipedia.org\/wiki\/22:43_–_Das_Schicksal_hat_einen_Plan: Wikipedia, 2015"
      },
      {
        "@type":"koral:field",
        "key":"textClass",
        "type":"type:keywords",
        "value":["kultur","film"]
      },
      {
        "@type":"koral:field",
        "key":"tokenSource",
        "type":"type:store",
        "value":"base#tokens"
      },
      {
        "@type":"koral:field",
        "key":"publisher",
        "type":"type:store",
        "value":"Wikipedia"
      },
      {
        "@type":"koral:field",
        "key":"layerInfos",
        "type":"type:store",
        "value":"corenlp\/c=spans corenlp\/p=tokens corenlp\/s=spans dereko\/s=spans opennlp\/p=tokens opennlp\/s=spans"
      },
      {
        "@type":"koral:field",
        "key":"pubPlace",
        "type":"type:string",
        "value":"URL:http:\/\/de.wikipedia.org"
      },
      {
        "@type":"koral:field",
        "key":"corpusTitle",
        "type":"type:text",
        "value":"Wikipedia"
      },
      {
        "@type":"koral:field",
        "key":"corpusEditor",
        "type":"type:store",
        "value":"wikipedia.org"
      },
      {
        "@type":"koral:field",
        "key":"corpusSigle",
        "type":"type:string",
        "value":"WPD15"
      }
    ]
  }
};

//corpus statistic
var statistic = {
  "documents":1,
  "tokens":222222,
  "sentences":33333,
  "paragraphs":444
};


requirejs.config({
  baseUrl: '../js/src',
  paths : {
    'lib': '../lib'
  }
});

KorAP.currentQuery = queryExample;

/*
KorAP.koralQuery["collection"] = {
  "@type" : "koral:docGroupRef",
  "ref" : "This is my name"
};
*/
require(['app/en', 'init', 'hint/foundries/cnx'], function (lang) {
  KorAP.hintArray = hintArray;

  // Set current virtual corpus
  // KorAP.currentVC = vcExample;

  // Parse and show the table
  // Override getMatchInfo API call
  KorAP.API.getMatchInfo = function(match, callObj, cb) {

    console.log(match);

    if (callObj["foundry"] === "malt" && callObj["layer"] === "d") {
      cb({ "snippet": relSnippet });
    }
    else if (callObj["spans"] !== undefined && callObj["spans"] === true) {
      cb({ "snippet": treeSnippet2 });
    }
    else {
      cb({ "snippet": snippet });
    }
  };

  KorAP.API.getTextInfo = function (doc, param, cb) {
    cb(textInfo);
  };

  //get the corpus statistic (demo function)
  KorAP.API.getCorpStat = function(collQu, cb){
    return cb(statistic);
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

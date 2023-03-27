define(["hint/foundries"], function (ah) {
  ah["-"].push(
    ["NKJP", "nkjp/", "Morphology, Part-of-Speech"]
  );

  ah["nkjp/"] = [
    ["Lemma", "l="],
    ["Morphology", "m="],
    ["Named Entities", "ne="],
    ["Original Value", "ov="],
    ["Part-of-Speech", "p="]
  ];

  ah["nkjp/p="] = [
    ["adj","adj ","adjective"],
    ["adja","adja ","adjectival compounds forming form"],
    ["adjc","adjc ","predicative adjective"],
    ["adjp","adjp ","post-prepositional adjective"],
    ["adv","adv ","adverb"],
    ["aglt","aglt ","agglutinative form of być 'be'"],
    ["bedzie","bedzie ","future forms of być 'be'"],
    ["brev","brev ","abbreviation"],
    ["comp","comp ","subordinating conjunction / complementizer"],
    ["cond","cond ","conditional mood"],
    ["conj","conj ","coordinating conjunction"],
    ["depr","depr ","depreciative form"],
    ["dig","dig ","digits"],
    ["emo","emo ","emoticons"],
    ["fin","fin ","finite present / future (non-past) form"],
    ["frag","frag ","bound word"],
    ["ger","ger ","gerund"],
    ["ign","ign ","unknown word (ignotum)"],
    ["imps","imps ","impersonal"],
    ["impt","impt ","imperative"],
    ["inf","inf ","infinitive"],
    ["interj","interj ","interjection"],
    ["interp","interp ","punctuation"],
    ["'naj'","naj ",""],
    ["'nie'","nie ",""],
    ["num","num ","main numeral"],
    ["numcol","numcol","collective numeral"],
    ["numcomp","numcomp ","numeral compounds forming form"],
    ["pact","pact ","active adjectival participle"],
    ["pacta","pacta ","participal compounds forming form"],
    ["pant","pant ","anterior adverbial participle"],
    ["part","part ","particle"],
    ["pcon","pcon ","contemporary adverbial participle"],
    ["ppas","ppas ","passive adjectival participle"],
    ["ppron12","ppron12 ","non-3rd person personal pronoun"],
    ["ppron3","ppron3 ","3rd-person pronoun"],
    ["praet","praet ","l-participle"],
    ["pred","pred ","predicative"],
    ["prep","prep ","preposition"],
    ["romandig","romandig ","Roman digits"],
    ["siebie","siebie ","pronoun siebie"],   
    ["sp","sp ","space / blank"],
    ["subst","subst ","noun / substantive"],
    ["substa","substa ","nominal compounds forming form"],
    ["sym","sym ","symbols"],  
    ["winien","winien ","winien-like verb"],
    ["xxx","xxx ","foreign material"],
    ["xxs","xxs ","foreign material (substantivish)"]
  ];

  ah["nkjp/m="] = [
    ["Accentability","accent:"],
    ["Agglutination","agglut:"],
    ["Aspect", "aspect:"],
    ["Case", "case:"],
    ["Degree", "degree:"],
    ["Fullstoppedness","fullstopp:"],
    ["Gender", "gender:"],
    ["Number", "number:"],
    ["Negation", "negation:"],
    ["Post-Prepositionality","postprep:"],
    ["Vocalicity","vocal:"]
  ];

  ah["nkjp/m=case:"] = [
    ["acc","acc ", "Accusative"],
    ["dat", "dat ","Dative"],
    ["gen","gen ", "Genitive"],
    ["inst","inst ", "Instrumental"],
    ["loc","loc ", "Locative"],
    ["nom", "nom ", "Nominative"],
    ["voc","voc ", "Vocative"]
  ];

  ah["nkjp/m=number:"] = [
    ["pl","pl ", "Plural"],
    ["sg", "sg ","Singular"]
  ];

  ah["nkjp/m=gender:"] = [
    ["f", "f ", "Feminine"],
    ["m1", "m1 ", "Human masculine (virile)"],
    ["m2", "m2 ", "Animate masculine"],
    ["m3", "m3 ", "Inanimate masculine"],
    ["n", "n ", "Neuter"]
  ];

  ah["nkjp/m=person:"] = [
    ["pri", "pri ", "First"],
    ["sec", "sec ", "Second"],
    ["ter", "ter ", "Third"]
  ];

  ah["nkjp/m=degree:"] = [
    ["com", "com ", "Comparative"],
    ["pos", "pos ", "Positive"],
    ["sup", "sup ", "Superlative"]
  ];

  ah["nkjp/m=aspect:"] = [
    ["imperf", "imperf ", "Imperfective"],
    ["perf", "perf ", "Perfective"]
  ];

  ah["nkjp/m=negation:"] = [
    ["aff", "aff ", "Affirmative"],
    ["neg", "neg ", "Negative"]
  ];

  ah["nkjp/m=accent:"] = [
    ["akc", "akc ", "Accented (strong)"],
    ["nakc", "nakc ", "Non-accented (weak)"]
  ];

  ah["nkjp/m=postprep:"] = [
    ["npraep", "npraep ", "Non-post-prepositional"],
    ["praep", "praep ", "Post-prepositional"]
  ];

  ah["nkjp/m=accomm:"] = [
    ["congr", "congr ", "Agreeing"],
    ["rec", "rec ", "Governing"]
  ];

  ah["nkjp/m=agglut:"] = [
    ["agl", "agl ", "Agglutinative"],
    ["nagl", "nagl ", "Non-agglutinative"]
  ];

  ah["nkjp/m=vocal:"] = [
    ["nwok", "nwok ", "Non-vocalic"],
    ["wok", "wok ", "Vocalic"]
  ];

  ah["nkjp/m=fullstopp:"] = [
    ["pun", "pun ", "With full stop"],
    ["npun", "npun ", "Without full stop"]
  ];
});

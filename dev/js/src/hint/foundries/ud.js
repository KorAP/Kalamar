define(["hint/foundries", "hint/foundries/upos", "hint/foundries/umorpho"], function (ah, uposArray, morpho) {
  ah["-"].push(
    ["UDPipe", "ud/", "Morphology, Part-of-Speech"]
  );

  ah["ud/"] = [
    ["Morphology", "m="],
    ["Part-of-Speech", "p="]
  ];

  ah["ud/p="] = uposArray;

  // Use shared morphological features
  ah["ud/m="] = morpho.categories;

  ah["ud/m=abbr:"] = morpho.abbr;
  ah["ud/m=adptype:"] = morpho.adptype;
  ah["ud/m=animacy:"] = morpho.animacy;
  ah["ud/m=aspect:"] = morpho.aspect;
  ah["ud/m=case:"] = morpho.case;
  ah["ud/m=conjtype:"] = morpho.conjtype;
  ah["ud/m=definite:"] = morpho.definite;
  ah["ud/m=degree:"] = morpho.degree;
  ah["ud/m=foreign:"] = morpho.foreign;
  ah["ud/m=gender:"] = morpho.gender;
  ah["ud/m=hyph:"] = morpho.hyph;
  ah["ud/m=mood:"] = morpho.mood;
  ah["ud/m=number:"] = morpho.number;
  ah["ud/m=numtype:"] = morpho.numtype;
  ah["ud/m=parttype:"] = morpho.parttype;
  ah["ud/m=person:"] = morpho.person;
  ah["ud/m=polarity:"] = morpho.polarity;
  ah["ud/m=poss:"] = morpho.poss;
  ah["ud/m=prontype:"] = morpho.prontype;
  ah["ud/m=puncttype:"] = morpho.puncttype;
  ah["ud/m=reflex:"] = morpho.reflex;
  ah["ud/m=tense:"] = morpho.tense;
  ah["ud/m=typo:"] = morpho.typo;
  ah["ud/m=variant:"] = morpho.variant;
  ah["ud/m=verbform:"] = morpho.verbform;
  ah["ud/m=verbtype:"] = morpho.verbtype;
});

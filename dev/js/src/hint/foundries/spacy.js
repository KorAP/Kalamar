define(["hint/foundries", "hint/foundries/stts", "hint/foundries/upos", "hint/foundries/umorpho"], function (ah, sttsArray, uposArray, morpho) {
  ah["-"].push(
    ["spaCy", "spacy/", "Lemma, Morphology, Part-of-Speech, UPOS"]
  );

  ah["spacy/"] = [
    ["Lemma", "l="],
    ["Morphology", "m="],
    ["Part-of-Speech", "p="],
    ["UPOS", "u="]
  ];

  ah["spacy/p="] = sttsArray;
  ah["spacy/u="] = uposArray;

  // Use shared morphological features
  ah["spacy/m="] = morpho.categories;

  ah["spacy/m=abbr:"] = morpho.abbr;
  ah["spacy/m=adptype:"] = morpho.adptype;
  ah["spacy/m=animacy:"] = morpho.animacy;
  ah["spacy/m=aspect:"] = morpho.aspect;
  ah["spacy/m=case:"] = morpho.case;
  ah["spacy/m=conjtype:"] = morpho.conjtype;
  ah["spacy/m=definite:"] = morpho.definite;
  ah["spacy/m=degree:"] = morpho.degree;
  ah["spacy/m=foreign:"] = morpho.foreign;
  ah["spacy/m=gender:"] = morpho.gender;
  ah["spacy/m=hyph:"] = morpho.hyph;
  ah["spacy/m=mood:"] = morpho.mood;
  ah["spacy/m=number:"] = morpho.number;
  ah["spacy/m=numtype:"] = morpho.numtype;
  ah["spacy/m=parttype:"] = morpho.parttype;
  ah["spacy/m=person:"] = morpho.person;
  ah["spacy/m=polarity:"] = morpho.polarity;
  ah["spacy/m=poss:"] = morpho.poss;
  ah["spacy/m=prontype:"] = morpho.prontype;
  ah["spacy/m=puncttype:"] = morpho.puncttype;
  ah["spacy/m=reflex:"] = morpho.reflex;
  ah["spacy/m=tense:"] = morpho.tense;
  ah["spacy/m=typo:"] = morpho.typo;
  ah["spacy/m=variant:"] = morpho.variant;
  ah["spacy/m=verbform:"] = morpho.verbform;
  ah["spacy/m=verbtype:"] = morpho.verbtype;
});

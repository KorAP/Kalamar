import ah from '../foundries.js';
import sttsArray from './stts.js';

  ah["-"].push(
    ["spaCy", "spacy/", "Lemma, Part-of-Speech"]
  );

  ah["spacy/"] = [
    ["Lemma", "l="],
    ["Part-of-Speech", "p="]
  ];

  ah["spacy/p="] = sttsArray;

import ah from '../foundries.js';
import sttsArray from './stts.js';

  ah["-"].push(
    ["TreeTagger", "tt/", "Lemma, Part-of-Speech"]
  );

  ah["tt/"] = [
    ["Lemma", "l="],
    ["Part-of-Speech", "p="]
  ];

  ah["tt/p="] = sttsArray;

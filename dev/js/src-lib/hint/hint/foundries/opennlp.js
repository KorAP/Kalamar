import ah from '../foundries.js';
import sttsArray from './stts.js';

  ah["-"].push(
    ["OpenNLP", "opennlp/", "Part-of-Speech"]
  );

  ah["opennlp/"] = [
    ["Part-of-Speech", "p="]
  ];

  ah["opennlp/p="] = sttsArray;

import ah from '../foundries.js';
import sttsArray from './stts.js';
import negraNodesArray from './negranodes.js';
import negraEdgesArray from './negraedges.js';

   // Standard short NE tags written by korapxmltool -N (older models
    // emitted I-LOC, I-PER etc.); outside ("O") tokens are not indexed.
    var namedEntities = [
      ["LOC",  "LOC ",  "Location"],
      ["MISC", "MISC ", "Miscellaneous"],
      ["ORG",  "ORG ",  "Organization"],
      ["PER",  "PER ",  "Person"]
    ];

    ah["-"].push(
      ["CoreNLP", "corenlp/", "Constituency, Named Entities, Part-of-Speech"]
    );

    ah["corenlp/"] = [
      ["Constituency", "c="],
      ["Named Entity", "ne=" ],
      ["Part-of-Speech", "p="]
    ];

    ah["corenlp/ne="] = namedEntities;
    ah["corenlp/p="] = sttsArray;
    ah["corenlp/c="] = negraNodesArray;

    negraNodesArray.forEach(
      i => ah["corenlp/c=" + i[0] + '-'] = negraEdgesArray
    );

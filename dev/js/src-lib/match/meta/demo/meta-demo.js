import '../../../../../scss/kalamar.scss';
import Meta from '../meta.js';

/**
 * Demo for the match meta view.
 * Clicking on a value opens the corpusByMatch assistant.
 */

const match = {
  'corpusID' : 'WPD',
  'docID' : 'UUU',
  'textID' : '01912',
  'matchID' : 'p121-122',
  'textSigle' : 'WPD/UUU/01912'
};

const fields = [
  {
    "@type": "koral:field",
    "key": "author",
    "type": "type:text",
    "value": "Sprachpfleger, u.a."
  },
  {
    "@type": "koral:field",
    "key": "textClass",
    "type": "type:keywords",
    "value": ["kultur", "film"]
  },
  {
    "@type": "koral:field",
    "key": "foundries",
    "type": "type:keywords",
    "value": [
      "corenlp",
      "corenlp/constituency",
      "corenlp/morpho",
      "corenlp/sentences",
      "dereko",
      "dereko/structure",
      "dereko/structure/base-sentences-paragraphs-pagebreaks",
      "opennlp",
      "opennlp/morpho",
      "opennlp/sentences"
    ]
  },
  {
    "@type": "koral:field",
    "key": "pubDate",
    "type": "type:date",
    "value": "2018-11-20"
  },
  {
    "@type": "koral:field",
    "key": "length",
    "type": "type:integer",
    "value": 200
  },
  {
    "@type": "koral:field",
    "key": "xlink",
    "type": "type:attachement",
    "value": "data:application/x.korap-link;title=Cool,https://de.wikipedia.org/wiki/Beispiel"
  },
  {
    "@type": "koral:field",
    "key": "z-reference",
    "type": "type:attachement",
    "value": "data:,This is a reference"
  },
  {
    "@type": "koral:field",
    "key": "zz-notinindex",
    "type": "type:text",
    "comment": "notinindex",
    "value": "Stored but not indexed"
  }
];

document.addEventListener('DOMContentLoaded', function () {
  const meta = new Meta(match, fields);
  document.getElementById('metatable').appendChild(meta.element());
});

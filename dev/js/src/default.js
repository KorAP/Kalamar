/**
 * Default foundries to include in the Kalamar JavaScript bundle.
 * The actual foundries shown at runtime are controlled by the
 * hint_foundries configuration or KALAMAR_HINT_FOUNDRIES env var.
 */
require([
  "hint/foundries/base",
  "hint/foundries/corenlp",
  "hint/foundries/dereko",
  "hint/foundries/malt",
  "hint/foundries/marmot",
  "hint/foundries/opennlp",
  "hint/foundries/spacy",
  "hint/foundries/treetagger",
  "hint/foundries/ud"
]);

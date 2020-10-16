KorAP.annotationHelper = KorAP.annotationHelper || { '-' : [] };

"use strict";

define(["util"], function () {

  const ah = KorAP.annotationHelper;

  ah.getDesc = function (foundryLayer, value) {

    if (!foundryLayer)
      return;

    let anno = this[foundryLayer];

    if (!anno)
      return;

    if (!value.includes(':')) {
      value += ' ';

      // Iterate over all annotations and add the descriptions
      // This is a classic hash-lookup-case, but we have
      // to deal with lists ...
      for (var i = 0; i < anno.length; i++) {
        if (anno[i] &&
            anno[i][1] == value) {
          if (anno[i][2])
            return anno[i][2];
          else
            return;
        };
      };

      return;
    }

    else {
      const v = value.split(":");
      let l1 = v[0] + ':';
      let l2 = v[1] + ' ';
      let text = '';

      // Add key description
      for (let i = 0; i < anno.length; i++) {
        if (anno[i] &&
            anno[i][1] == l1) {
          if (anno[i][2])
            text += anno[i][2];
          else
            text += anno[i][0];
          break;
        };
      };

      // Nothing found
      if (text.length === 0)
        return;

      // Check next level
      anno = this[foundryLayer + l1];

      if (!anno)
        return;

      // Add value description
      for (let i = 0; i < anno.length; i++) {
        if (anno[i] &&
            anno[i][1] == l2) {
          if (anno[i][2])
            text += ': ' + anno[i][2];

          return text;
        };
      };      
    };

    return '';
  };

  return ah;
});

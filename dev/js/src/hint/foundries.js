window.KorAP = window.KorAP || {};
KorAP.annotationHelper = KorAP.annotationHelper || { '-' : [] };

define(function () {

  var ah = KorAP.annotationHelper;

  ah["getDesc"] = function (foundryLayer, value) {

    if (!foundryLayer)
      return;

    var anno = this[foundryLayer];

    if (!anno)
      return;

    if (value.indexOf(':') < 0) {
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
      var text = '';
      var v = value.split(":");
      var l1 = v[0];
      var l2 = v[1];

      l1 += ':';

      // Add key description
      for (var i = 0; i < anno.length; i++) {
        if (anno[i] &&
            anno[i][1] == l1) {
          if (anno[i][2])
            text += anno[i][2];
          else
            text += anno[i][0];
          break;
        };
      };

      // Nothinmg found
      if (text.length === 0)
        return;

      // Check next level
      anno = this[foundryLayer + l1];

      l2 += ' ';

      // Add value description
      for (var i = 0; i < anno.length; i++) {
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

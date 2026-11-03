window.KorAP = window.KorAP || {};

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

  // Apply deployment configuration to menus while keeping descriptions
  // available to getDesc() for annotations in search results.
  ah.getMenuEntries = function (action) {
    const entries = this[action];
    if (!Array.isArray(entries))
      return;

    const config = document.body && document.body.getAttribute('data-hint-foundries');
    if (config == null)
      return entries;

    const selectors = new Set(config.split(',').map(value => value.trim().toLowerCase()));

    const isLayerEnabled = (foundry, layerAction) => {
      const layer = layerAction.split('=', 1)[0];
      const selector = foundry + '/' + layer;
      return !selectors.has('-' + selector) &&
        (selectors.has(foundry) || selectors.has(selector));
    };

    const filterLayers = (foundry, layers) =>
      layers.filter(([, layerAction]) => isLayerEnabled(foundry, layerAction.toLowerCase()));

    if (action === '-') {
      const foundries = entries.flatMap(entry => {
        if (!entry || !entry[1])
          return [];

        const [name, prefix] = entry;
        const [foundry, layerAction] = prefix.toLowerCase().split('/');
        // Some entries go straight to a layer, e.g. base/s=.
        if (layerAction)
          return isLayerEnabled(foundry, layerAction) ? [entry] : [];

        const layers = this[prefix];
        if (!layers)
          return selectors.has(foundry) ? [entry] : [];

        const enabledLayers = filterLayers(foundry, layers);
        if (!enabledLayers.length)
          return [];
        if (enabledLayers.length === layers.length)
          return [entry];
        return [[name, prefix, enabledLayers.map(([label]) => label).join(', ')]];
      });
      return foundries.length ? foundries : undefined;
    }

    const [foundry, layerAction] = action.toLowerCase().split('/');
    if (layerAction)
      return isLayerEnabled(foundry, layerAction) ? entries : undefined;

    const layers = filterLayers(foundry, entries);
    return layers.length ? layers : undefined;
  };

  return ah;
});

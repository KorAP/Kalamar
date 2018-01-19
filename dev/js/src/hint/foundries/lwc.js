define(["hint/foundries","hint/foundries/negraedges"], function (ah, negraEdgesArray) {
  ah["-"].push(
    ["LWC", "lwc/", "Dependency"]
  );

  ah["lwc/"] = [
    ["Dependency", "d="]
  ];

  ah["lwc/d="] = negraEdgesArray;
});

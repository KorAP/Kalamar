var ah = KorAP.annotationHelper = KorAP.annotationHelper || { "-" : [] };

ah["-"].push(
  ["Malt", "malt/", "Dependency"]
);

ah["malt/"] = [
  ["Dependency", "d="]
];

ah["malt/d="] = [
  ["-PUNCT-", "-PUNCT- "],
  ["-UNKNOWN-","-UNKNOWN- "],
  ["ADV","ADV "],
  ["APP","APP "],
  ["ATTR","ATTR "],
  ["AUX","AUX "],
  ["AVZ","AVZ "],
  ["CJ","CJ "],
  ["DET","DET "],
  ["EXPL","EXPL "],
  ["GMOD","GMOD "],
  ["GRAD","GRAD "],
  ["KOM","KOM "],
  ["KON","KON "],
  ["KONJ","KONJ "],
  ["NEB","NEB "],
  ["OBJA","OBJA "],
  ["OBJC","OBJC "],
  ["OBJD","OBJD "],
  ["OBJG","OBJG "],
  ["OBJI","OBJI "],
  ["OBJP","OBJP "],
  ["PAR","PAR "],
  ["PART","PART "],
  ["PN","PN "],
  ["PP","PP "],
  ["PRED","PRED "],
  ["REL","REL "],
  ["ROOT","ROOT "],
  ["S","S "],
  ["SUBJ","SUBJ "],
  ["SUBJC","SUBJC "],
  ["ZEIT","ZEIT "],
  ["gmod-app","gmod-app "],
  ["koord","koord "]
];

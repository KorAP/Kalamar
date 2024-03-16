define(["hint/foundries", "hint/foundries/upos"], function (ah, uposArray) {
  ah["-"].push(
    ["UDPipe", "ud/", "Morphology, Part-of-Speech"]
  );

  ah["ud/"] = [
    ["Morphology", "m="],
    ["Part-of-Speech", "p="]
  ];

  ah["ud/p="] = uposArray;

  ah["ud/m="] = [
    ["abbreviation","abbr:"],
    ["adposition type","adptype:"],
    ["animacy","animacy:"],
    ["aspect","aspect:"],
    ["case","case:"],
    ["conjunction type","conjtype:"],
    ["definiteness or state","definite:"],
    ["degree","degree:"],
    ["foreign word","foreign:"],
    ["gender","gender:"],
    ["hyphenated compound or part of it","hyph:"],
    ["mood","mood:"],
    ["number","number:"],
    ["numeral type","numtype:"],
    ["particle type","parttype:"],
    ["person","person:"],
    ["polarity","polarity:"],
    ["possessive","poss:"],
    ["pronominal type","prontype:"],
    ["punctuation type","puncttype:"],
    ["reflexive","reflex:"],
    ["tense","tense:"],
    ["misspelled word","typo:"],
    ["alternative form of word","variant:"],
    ["form of verb or deverbative","verbform:"],
    ["verb type","verbtype:"]
  ];

  ah["ud/m=abbr:"] = [
    ["yes","yes ","yes"]
  ];

  ah["ud/m=adptype:"] = [
    ["circ","circ ","circumposition"],
    ["post","post ","postposition"],
    ["prep","prep ","preposition"],
    ["voc","voc ","vocalized preposition"]
  ];

  ah["ud/m=animacy:"] = [
    ["anim","anim ","animate"],
    ["hum","hum ","human"],
    ["inan","inan ","inanimate"],
    ["nhum","nhum ","non-human"]
  ];

  ah["ud/m=aspect:"] = [
    ["hab","hab ","habitual"],
    ["imp","imp ","imperfect"],
    ["iter","iter ","iterative / frequentative"],
    ["perf","perf ","perfect"],
    ["prog","prog ","progressive"],
    ["prosp","prosp ","prospective"]
  ];

  ah["ud/m=case:"] = [
    ["abe","abe ","abessive / caritative / privative"],
    ["abl","abl ","ablative / adelative"],
    ["abs","abs ","absolutive"],
    ["acc","acc ","accusative / oblique"],
    ["add","add ","additive"],
    ["ade","ade ","adessive"],
    ["all","all ","allative / adlative"],
    ["ben","ben ","benefactive / destinative"],
    ["cau","cau ","causative / motivative / purposive"],
    ["cmp","cmp ","comparative"],
    ["cns","cns ","considerative"],
    ["com","com ","comitative / associative"],
    ["dat","dat ","dative"],
    ["del","del ","delative / superelative"],
    ["dis","dis ","distributive"],
    ["ela","ela ","elative / inelative"],
    ["equ","equ ","equative"],
    ["erg","erg ","ergative"],
    ["ess","ess ","essive / prolative"],
    ["gen","gen ","genitive"],
    ["ill","ill ","illative / inlative"],
    ["ine","ine ","inessive"],
    ["ins","ins ","instrumental / instructive"],
    ["lat","lat ","lative / directional allative"],
    ["loc","loc ","locative"],
    ["nom","nom ","nominative / direct"],
    ["par","par ","partitive"],
    ["per","per ","perlative"],
    ["sbe","sbe ","subelative"],
    ["sbl","sbl ","sublative"],
    ["spl","spl ","superlative"],
    ["sub","sub ","subessive"],
    ["sup","sup ","superessive"],
    ["tem","tem ","temporal"],
    ["ter","ter ","terminative / terminal allative"],
    ["tra","tra ","translative / factive"],
    ["voc","voc ","vocative"]
  ];

  ah["ud/m=conjtype:"] = [
    ["comp","comp ","comparing conjunction"],
    ["oper","oper ","mathematical operator"],
    ["pred","pred ","subordinating conjunction introducing a secondary predicate"]
  ];

  ah["ud/m=definite:"] = [
    ["com","com ","complex"],
    ["cons","cons ","construct state / reduced definiteness"],
    ["def","def ","definite"],
    ["ind","ind ","indefinite"],
    ["spec","spec ","specific indefinite"]
  ];

  ah["ud/m=degree:"] = [
    ["abs","abs ","absolute superlative"],
    ["aug","aug ","augmentative"],
    ["cmp","cmp ","comparative, second degree"],
    ["dim","dim ","diminutive"],
    ["equ","equ ","equative"],
    ["pos","pos ","positive, first degree"],
    ["sup","sup ","superlative, third degree"]
  ];

  ah["ud/m=foreign:"] = [
    ["yes","yes ","yes"]
  ];

  ah["ud/m=gender:"] = [
    ["com","com ","common"],
    ["fem","fem ","feminine",],
    ["masc","masc ","masculine"],
    ["neut","neut ","neuter"]
  ];

  ah["ud/m=hyph:"] = [
    ["yes","yes ","yes"]
  ];

  ah["ud/m=mood:"] = [
    ["adm","adm ","admirative"],
    ["cnd","cnd ","conditional"],
    ["des","des ","desiderative"],
    ["imp","imp ","imperative"],
    ["ind","ind ","indicative or realis"],
    ["int","int ","interrogative"],
    ["irr","irr ","irrealis"],
    ["jus","jus ","jussive / injunctive"],
    ["nec","nec ","necessitative"],
    ["opt","opt ","optative"],
    ["pot","pot ","potential"],
    ["prp","prp ","purposive"],
    ["qot","qot ","quotative"],
    ["sub","sub ","subjunctive / conjunctive"]
  ];

  ah["ud/m=number:"] = [
    ["coll","coll ","collective / mass / singulare tantum"],
    ["count","count ","count plural"],
    ["dual","dual ","dual"],
    ["grpa","grpa ","greater paucal"],
    ["grpl","grpl ","greater plural"],
    ["inv","inv ","inverse"],
    ["pauc","pauc ","paucal"],
    ["plur","plur ","plural"],
    ["ptan","ptan ","plurale tantum"],
    ["sing","sing ","singular"],
    ["tri","tri ","trial"]
  ];

  ah["ud/m=numtype:"] = [
    ["card","card ","cardinal number or corresponding interrogative / relative / indefinite / demonstrative word"],
    ["dist","dist ","distributive numeral"],
    ["frac","frac ","fraction"],
    ["mult","mult ","multiplicative numeral or corresponding interrogative / relative / indefinite / demonstrative word"],
    ["ord","ord ","ordinal number or corresponding interrogative / relative / indefinite / demonstrative word"],
    ["range","range ","range of values"],
    ["sets","sets ","number of sets of things; collective numeral"]
  ];

  ah["ud/m=parttype:"] = [
    ["emp","emp ","particle of emphasis"],
    ["inf","inf ","infinitive marker"],
    ["int","int ","question particle"],
    ["mod","mod ","modal particle"],
    ["neg","neg ","negation particle"],
    ["res","res ","response particle"],
    ["vbp","vbp ","separated verb prefix in german"]
  ];

  ah["ud/m=person:"] = [
    ["0","0 ","zero person"],
    ["1","1 ","first person"],
    ["2","2 ","second person"],
    ["3","3 ","third person"],
    ["4","4 ","fourth person"]
  ];

  ah["ud/m=polarity:"] = [
    ["neg","neg ","negative"],
    ["pos","pos ","positive, affirmative"]
  ];

  ah["ud/m=poss:"] = [
    ["yes","yes ","yes"]
  ];

  ah["ud/m=prontype:"] = [
    ["art","art ","article"],
    ["dem","dem ","demonstrative pronoun, determiner, numeral or adverb"],
    ["emp","emp ","emphatic determiner"],
    ["exc","exc ","exclamative determiner"],
    ["ind","ind ","indefinite pronoun, determiner, numeral or adverb"],
    ["int","int ","interrogative pronoun, determiner, numeral or adverb"],
    ["neg","neg ","negative pronoun, determiner or adverb"],
    ["prs","prs ","personal or possessive personal pronoun or determiner"],
    ["rcp","rcp ","reciprocal pronoun"],
    ["rel","rel ","relative pronoun, determiner, numeral or adverb"],
    ["tot","tot ","total (collective) pronoun, determiner or adverb"]
  ];

  ah["ud/m=puncttype:"] = [
    ["brck","brck ","bracket"],
    ["colo","colo ","colon"],
    ["comm","comm ","comma"],
    ["dash","dash ","dash, hyphen"],
    ["elip","elip ","ellipsis"],
    ["excl","excl ","exclamation mark"],
    ["peri","peri ","period at the end of sentence or clause"],
    ["qest","qest ","question mark"],
    ["quot","quot ","quotation marks"],
    ["semi","semi ","semicolon"],
    ["slsh","slsh ","slash or backslash"]
  ];

  ah["ud/m=reflex:"] = [
    ["yes","yes ","yes"]
  ];

  ah["ud/m=tense:"] = [
    ["fut","fut ","future tense"],
    ["imp","imp ","imperfect"],
    ["past","past ","past tense / preterite / aorist"],
    ["pqp","pqp ","pluperfect"],
    ["pres","pres ","present / non-past tense / aorist"]
  ];

  ah["ud/m=typo:"] = [
    ["yes","yes ","yes"]
  ];

  ah["ud/m=variant:"] = [
    ["short","short ","short form of adjectives"]
  ];

  ah["ud/m=verbform:"] = [
    ["conv","conv ","converb, transgressive, adverbial participle, verbal adverb"],
    ["fin","fin ","finite verb"],
    ["gdv","gdv ","gerundive"],
    ["ger","ger ","gerund"],
    ["inf","inf ","infinitive"],
    ["part","part ","participle, verbal adjective"],
    ["sup","sup ","supine"],
    ["vnoun","vnoun ","verbal noun, masdar"]
  ];

  ah["ud/m=verbtype:"] = [
    ["aux","aux ","auxiliary verb"],
    ["cop","cop ","copula verb"],
    ["light","light ","light (support) verb"],
    ["mod","mod ","modal verb"],
    ["quasi","quasi ","quasi-verb"]
  ];
});

define(["hint/foundries"], function (ah) {
  ah["-"].push(
    ["UDPipe", "ud/", "Morphology, Part-of-Speech"]
  );

  ah["ud/"] = [
    ["Morphology", "m="],
    ["Part-of-Speech", "p="]
  ];

  ah["ud/p="] = [
    ["ADJ","ADJ ","adjective"],
    ["ADP","ADP ","adposition"],
    ["ADV","ADV ","adverb"],
    ["AUX","AUX ","auxiliary"],
    ["CCONJ","CCONJ ","coordinating conjunction"],
    ["DET","DET ","determiner"],
    ["INTJ","INTJ ","interjection"],
    ["NOUN","NOUN ","noun"],
    ["NUM","NUM ","numeral"],
    ["PART","PART ","particle"],
    ["PRON","PRON ","pronoun"],
    ["PROPN","PROPN ","proper noun"],
    ["PUNCT","PUNCT ","punctuation"],
    ["SCONJ","SCONJ ","subordinating conjunction"],
    ["SYM","SYM ","symbol"],
    ["VERB","VERB ","verb"],
    ["X","X ","other"]
  ];

  ah["ud/m="] = [
    ["Abbreviation","Abbr:"],
    ["Adposition type","AdpType:"],
    ["Animacy","Animacy:"],
    ["Aspect","Aspect:"],
    ["Case","Case:"],
    ["Conjunction type","ConjType:"],
    ["Definiteness or state","Definite:"],
    ["Degree","Degree:"],
    ["Foreign word","Foreign:"],
    ["Gender","Gender:"],
    ["Hyphenated compound or part of it","Hyph:"],
    ["Mood","Mood:"],
    ["Number","Number:"],
    ["Numeral type","NumType:"],
    ["Particle type","PartType:"],
    ["Person","Person:"],
    ["Polarity","Polarity:"],
    ["Possessive","Poss:"],
    ["Pronominal type","PronType:"],
    ["Punctuation type","PunctType:"],
    ["Reflexive","Reflex:"],
    ["Tense","Tense:"],
    ["Misspelled word","Typo:"],
    ["Alternative form of word","Variant:"],
    ["Form of verb or deverbative","VerbForm:"],
    ["Verb type","VerbType:"]
  ];

  ah["ud/m=Abbr:"] = [
    ["Yes","Yes ","Yes"]
  ];

  ah["ud/m=AdpType:"] = [
    ["Circ","Circ ","Circumposition"],
    ["Post","Post ","Postposition"],
    ["Prep","Prep ","Preposition"],
    ["Voc","Voc ","Vocalized preposition"]
  ];

  ah["ud/m=Animacy:"] = [
    ["Anim","Anim ","Animate"],
    ["Hum","Hum ","Human"],
    ["Inan","Inan ","Inanimate"],
    ["Nhum","Nhum ","Non-human"]
  ];

  ah["ud/m=Aspect:"] = [
    ["Hab","Hab ","Habitual"],
    ["Imp","Imp ","Imperfect"],
    ["Iter","Iter ","Iterative / frequentative"],
    ["Perf","Perf ","Perfect"],
    ["Prog","Prog ","Progressive"],
    ["Prosp","Prosp ","Prospective"]
  ];

  ah["ud/m=Case:"] = [
    ["Abe","Abe ","Abessive / caritative / privative"],
    ["Abl","Abl ","Ablative / adelative"],
    ["Abs","Abs ","Absolutive"],
    ["Acc","Acc ","Accusative / oblique"],
    ["Add","Add ","Additive"],
    ["Ade","Ade ","Adessive"],
    ["All","All ","Allative / adlative"],
    ["Ben","Ben ","Benefactive / destinative"],
    ["Cau","Cau ","Causative / motivative / purposive"],
    ["Cmp","Cmp ","Comparative"],
    ["Cns","Cns ","Considerative"],
    ["Com","Com ","Comitative / associative"],
    ["Dat","Dat ","Dative"],
    ["Del","Del ","Delative / superelative"],
    ["Dis","Dis ","Distributive"],
    ["Ela","Ela ","Elative / inelative"],
    ["Equ","Equ ","Equative"],
    ["Erg","Erg ","Ergative"],
    ["Ess","Ess ","Essive / prolative"],
    ["Gen","Gen ","Genitive"],
    ["Ill","Ill ","Illative / inlative"],
    ["Ine","Ine ","Inessive"],
    ["Ins","Ins ","Instrumental / instructive"],
    ["Lat","Lat ","Lative / directional allative"],
    ["Loc","Loc ","Locative"],
    ["Nom","Nom ","Nominative / direct"],
    ["Par","Par ","Partitive"],
    ["Per","Per ","Perlative"],
    ["Sbe","Sbe ","Subelative"],
    ["Sbl","Sbl ","Sublative"],
    ["Spl","Spl ","Superlative"],
    ["Sub","Sub ","Subessive"],
    ["Sup","Sup ","Superessive"],
    ["Tem","Tem ","Temporal"],
    ["Ter","Ter ","Terminative / terminal allative"],
    ["Tra","Tra ","Translative / factive"],
    ["Voc","Voc ","Vocative"]
  ];

  ah["ud/m=ConjType:"] = [
    ["Comp","Comp ","Comparing conjunction"],
    ["Oper","Oper ","Mathematical operator"],
    ["Pred","Pred ","Subordinating conjunction introducing a secondary predicate"]
  ];

  ah["ud/m=Definite:"] = [
    ["Com","Com ","Complex"],
    ["Cons","Cons ","Construct state / reduced definiteness"],
    ["Def","Def ","Definite"],
    ["Ind","Ind ","Indefinite"],
    ["Spec","Spec ","Specific indefinite"]
  ];

  ah["ud/m=Degree:"] = [
    ["Abs","Abs ","Absolute superlative"],
    ["Aug","Aug ","Augmentative"],
    ["Cmp","Cmp ","Comparative, second degree"],
    ["Dim","Dim ","Diminutive"],
    ["Equ","Equ ","Equative"],
    ["Pos","Pos ","Positive, first degree"],
    ["Sup","Sup ","Superlative, third degree"]
  ];

  ah["ud/m=Foreign:"] = [
    ["Yes","Yes ","Yes"]
  ];

  ah["ud/m=Gender:"] = [
    ["Com","Com ","Common"],
    ["Fem","Fem ","Feminine",],
    ["Masc","Masc ","Masculine"],
    ["Neut","Neut ","Neuter"]
  ];

  ah["ud/m=Hyph:"] = [
    ["Yes","Yes ","Yes"]
  ];

  ah["ud/m=Mood:"] = [
    ["Adm","Adm ","Admirative"],
    ["Cnd","Cnd ","Conditional"],
    ["Des","Des ","Desiderative"],
    ["Imp","Imp ","Imperative"],
    ["Ind","Ind ","Indicative or realis"],
    ["Int","Int ","Interrogative"],
    ["Irr","Irr ","Irrealis"],
    ["Jus","Jus ","Jussive / injunctive"],
    ["Nec","Nec ","Necessitative"],
    ["Opt","Opt ","Optative"],
    ["Pot","Pot ","Potential"],
    ["Prp","Prp ","Purposive"],
    ["Qot","Qot ","Quotative"],
    ["Sub","Sub ","Subjunctive / conjunctive"]
  ];

  ah["ud/m=Number:"] = [
    ["Coll","Coll ","Collective / mass / singulare tantum"],
    ["Count","Count ","Count plural"],
    ["Dual","Dual ","Dual"],
    ["Grpa","Grpa ","Greater paucal"],
    ["Grpl","Grpl ","Greater plural"],
    ["Inv","Inv ","Inverse"],
    ["Pauc","Pauc ","Paucal"],
    ["Plur","Plur ","Plural"],
    ["Ptan","Ptan ","Plurale tantum"],
    ["Sing","Sing ","Singular"],
    ["Tri","Tri ","Trial"]
  ];

  ah["ud/m=NumType:"] = [
    ["Card","Card ","Cardinal number or corresponding interrogative / relative / indefinite / demonstrative word"],
    ["Dist","Dist ","Distributive numeral"],
    ["Frac","Frac ","Fraction"],
    ["Mult","Mult ","Multiplicative numeral or corresponding interrogative / relative / indefinite / demonstrative word"],
    ["Ord","Ord ","Ordinal number or corresponding interrogative / relative / indefinite / demonstrative word"],
    ["Range","Range ","Range of values"],
    ["Sets","Sets ","Number of sets of things; collective numeral"]
  ];

  ah["ud/m=PartType:"] = [
    ["Emp","Emp ","Particle of emphasis"],
    ["Inf","Inf ","Infinitive marker"],
    ["Int","Int ","Question particle"],
    ["Mod","Mod ","Modal particle"],
    ["Neg","Neg ","Negation particle"],
    ["Res","Res ","Response particle"],
    ["Vbp","Vbp ","Separated verb prefix in German"]
  ];

  ah["ud/m=Person:"] = [
    ["0","0 ","Zero person"],
    ["1","1 ","First person"],
    ["2","2 ","Second person"],
    ["3","3 ","Third person"],
    ["4","4 ","Fourth person"]
  ];

  ah["ud/m=Polarity:"] = [
    ["Neg","Neg ","Negative"],
    ["Pos","Pos ","Positive, affirmative"]
  ];

  ah["ud/m=Poss:"] = [
    ["Yes","Yes ","Yes"]
  ];

  ah["ud/m=PronType:"] = [
    ["Art","Art ","Article"],
    ["Dem","Dem ","Demonstrative pronoun, determiner, numeral or adverb"],
    ["Emp","Emp ","Emphatic determiner"],
    ["Exc","Exc ","Exclamative determiner"],
    ["Ind","Ind ","Indefinite pronoun, determiner, numeral or adverb"],
    ["Int","Int ","Interrogative pronoun, determiner, numeral or adverb"],
    ["Neg","Neg ","Negative pronoun, determiner or adverb"],
    ["Prs","Prs ","Personal or possessive personal pronoun or determiner"],
    ["Rcp","Rcp ","Reciprocal pronoun"],
    ["Rel","Rel ","Relative pronoun, determiner, numeral or adverb"],
    ["Tot","Tot ","Total (collective) pronoun, determiner or adverb"]
  ];

  ah["ud/m=PunctType:"] = [
    ["Brck","Brck ","Bracket"],
    ["Colo","Colo ","Colon"],
    ["Comm","Comm ","Comma"],
    ["Dash","Dash ","Dash, hyphen"],
    ["Elip","Elip ","Ellipsis"],
    ["Excl","Excl ","Exclamation mark"],
    ["Peri","Peri ","Period at the end of sentence or clause"],
    ["Qest","Qest ","Question mark"],
    ["Quot","Quot ","Quotation marks"],
    ["Semi","Semi ","Semicolon"],
    ["Slsh","Slsh ","Slash or backslash"]
  ];

  ah["ud/m=Reflex:"] = [
    ["Yes","Yes ","Yes"]
  ];

  ah["ud/m=Tense:"] = [
    ["Fut","Fut ","Future tense"],
    ["Imp","Imp ","Imperfect"],
    ["Past","Past ","Past tense / preterite / aorist"],
    ["Pqp","Pqp ","Pluperfect"],
    ["Pres","Pres ","Present / non-past tense / aorist"]
  ];

  ah["ud/m=Typo:"] = [
    ["Yes","Yes ","Yes"]
  ];

  ah["ud/m=Variant:"] = [
    ["Short","Short ","Short form of adjectives"]
  ];

  ah["ud/m=VerbForm:"] = [
    ["Conv","Conv ","Converb, transgressive, adverbial participle, verbal adverb"],
    ["Fin","Fin ","Finite verb"],
    ["Gdv","Gdv ","Gerundive"],
    ["Ger","Ger ","Gerund"],
    ["Inf","Inf ","Infinitive"],
    ["Part","Part ","Participle, verbal adjective"],
    ["Sup","Sup ","Supine"],
    ["Vnoun","Vnoun ","Verbal noun, masdar"]
  ];

  ah["ud/m=VerbType:"] = [
    ["Aux","Aux ","Auxiliary verb"],
    ["Cop","Cop ","Copula verb"],
    ["Light","Light ","Light (support) verb"],
    ["Mod","Mod ","Modal verb"],
    ["Quasi","Quasi ","Quasi-verb"]
  ];
});

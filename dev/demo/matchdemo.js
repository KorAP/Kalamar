requirejs.config({
  baseUrl: '../js/src',
  paths : {
    'lib': '../lib'
  }
});

// Parse and show the table
// Override getMatchInfo API call
require(['init'], function () {

  var snippet = "<span title=\"cnx/l:meist\">" +
  "  <span title=\"cnx/p:ADV\">" +
  "    <span title=\"cnx/syn:@PREMOD\">" +
  "      <span title=\"mate/l:meist\">" +
  "        <span title=\"mate/p:ADV\">" +
  "          <span title=\"opennlp/p:ADV\">meist</span>" +
  "        </span>" +
  "      </span>" +
  "    </span>" +
  "  </span>" +
  "</span>" +
  "<span title=\"cnx/l:deutlich\">" +
  "  <span title=\"cnx/p:A\">" +
  "    <span title=\"cnx/syn:@PREMOD\">" +
  "      <span title=\"mate/l:deutlich\">" +
  "        <span title=\"mate/m:degree:pos\">" +
  "          <span title=\"mate/p:ADJD\">" +
  "            <span title=\"opennlp/p:ADJD\">deutlich</span>" +
  "          </span>" +
  "        </span>" +
  "      </span>" +
  "    </span>" +
  "  </span>" +
  "</span>" +
  "<span title=\"cnx/l:fähig\">" +
  "  <span title=\"cnx/l:leistung\">" +
  "    <span title=\"cnx/p:A\">" +
  "      <span title=\"cnx/syn:@NH\">" +
  "        <span title=\"mate/l:leistungsfähig\">" +
  "          <span title=\"mate/m:degree:comp\">" +
  "            <span title=\"mate/p:ADJD\">" +
  "              <span title=\"opennlp/p:ADJD\">leistungsfähiger</span>" +
  "            </span>" +
  "          </span>" +
  "        </span>" +
  "      </span>" +
  "    </span>" +
  "  </span>" +
  "</span>";

  snippet = "<span class=\"context-left\"></span>" +
  "<span class=\"match\">"+
  " <span title=\"corenlp\/p:KOUI\">"+
  "  <span title=\"marmot\/p:KOUI\">"+
  "   <span title=\"opennlp\/p:KOUI\">"+
  "    <span title=\"tt\/l:um\">"+
  "     <span title=\"tt\/l:um\">"+
  "      <span title=\"tt\/p:APPR\">"+
  "      <span title=\"tt\/p:KOUI\">Um</span>" +
  "      </span>" +
  "     </span>" +
  "    </span>" +
  "   </span>" +
  "  </span>" +
  " </span>"+
  "  " +
  " <span title=\"corenlp\/p:ART\">"+
  "  <span title=\"marmot\/m:case:acc\">"+
  "   <span title=\"marmot\/m:gender:masc\">"+
  "    <span title=\"marmot\/m:number:pl\">"+
  "     <span title=\"marmot\/p:ART\">"+
  "      <span title=\"opennlp\/p:ART\">"+
  "       <span title=\"tt\/l:die\">" +
  "       <span title=\"tt\/p:ART\">die</span>" +
  "       </span>" +
  "      </span>" +
  "     </span>" +
  "    </span>" +
  "   </span>" +
  "  </span>" +
  " </span>" +
  "  " +
  " <span title=\"corenlp\/p:APPR\">"+
  "  <span title=\"marmot\/p:APPR\">"+
  "   <span title=\"opennlp\/p:APPR\">"+
  "    <span title=\"tt\/l:von\">"+
  "    <span title=\"tt\/p:APPR\">von</span>" +
  "    </span>" +
  "   </span>" +
  "  </span>" +
  " </span>" +
  "  " +
  " <span title=\"corenlp\/p:PPOSAT\">"+
  "  <span title=\"marmot\/m:case:dat\">"+
  "   <span title=\"marmot\/m:gender:masc\">"+
  "    <span title=\"marmot\/m:number:sg\">"+
  "     <span title=\"marmot\/p:PPOSAT\">"+
  "      <span title=\"opennlp\/p:PPOSAT\">"+
  "       <span title=\"tt\/l:sein\">"+
  "       <span title=\"tt\/p:PPOSAT\">seinem</span>" +
  "       </span>" +
  "      </span>" +
  "     </span>" +
  "    </span>" +
  "   </span>" +
  "  </span>" +
  " </span>" +
  "  " +
  " <span title=\"corenlp\/p:NN\">"+
  "  <span title=\"marmot\/m:case:dat\">"+
  "   <span title=\"marmot\/m:gender:masc\">"+
  "    <span title=\"marmot\/m:number:sg\">"+
  "     <span title=\"marmot\/p:NN\">"+
  "      <span title=\"opennlp\/p:NN\">"+
  "       <span title=\"tt\/l:Großvater\">"+
  "       <span title=\"tt\/p:NN\">Großvater</span>" +
  "       </span>" +
  "      </span>" +
  "     </span>" +
  "    </span>" +
  "   </span>" +
  "  </span>" +
  " </span>" +
  "  " +
  " <span title=\"corenlp\/p:ADJA\">" +
  "  <span title=\"marmot\/m:case:acc\">" +
  "   <span title=\"marmot\/m:degree:pos\">" +
  "    <span title=\"marmot\/m:gender:fem\">" +
  "     <span title=\"marmot\/m:number:sg\">" +
  "      <span title=\"marmot\/p:ADJA\">" +
  "       <span title=\"opennlp\/p:ADJA\">" +
  "        <span title=\"tt\/l:gepflanzt\">" +
  "        <span title=\"tt\/p:ADJA\">gepflanzte</span>" +
  "        </span>" +
  "       </span>" +
  "      </span>" +
  "     </span>" +
  "    </span>" +
  "   </span>" +
  "  </span>" +
  " </span>" +
  "  " +
  " <span title=\"corenlp\/p:NN\">" +
  "  <span title=\"marmot\/m:case:acc\">" +
  "   <span title=\"marmot\/m:gender:fem\">" +
  "    <span title=\"marmot\/m:number:sg\">" +
  "     <span title=\"marmot\/p:NN\">" +
  "      <span title=\"opennlp\/p:NN\">" +
  "       <span title=\"tt\/l:Esche\">" +
  "       <span title=\"tt\/p:NN\">Esche</span>" +
  "       </span>" +
  "      </span>" +
  "     </span>" +
  "    </span>" +
  "   </span>" +
  "  </span>" +
  " </span>" +
  "  " +
  " <span title=\"corenlp\/p:VAFIN\">" +
  "  <span title=\"marmot\/m:mood:ind\">" +
  "   <span title=\"marmot\/m:number:sg\">" +
  "    <span title=\"marmot\/m:person:3\">" +
  "     <span title=\"marmot\/m:tense:pres\">" +
  "      <span title=\"marmot\/p:VAFIN\">" +
  "       <span title=\"opennlp\/p:VAFIN\">" +
  "        <span title=\"tt\/l:haben\">" +
  "        <span title=\"tt\/p:VAFIN\">hat</span>" +
  "        </span>" +
  "       </span>" +
  "      </span>" +
  "     </span>" +
  "    </span>" +
  "   </span>" +
  "  </span>" +
  " </span>" +
  "  " +
  " <span title=\"corenlp\/p:NE\">" +
  "  <span title=\"marmot\/m:case:nom\">" +
  "   <span title=\"marmot\/m:gender:*\">" +
  "    <span title=\"marmot\/m:number:sg\">" +
  "     <span title=\"marmot\/p:NE\">" +
  "      <span title=\"opennlp\/p:NE\">" +
  "       <span title=\"tt\/l:Behrens\">" +
  "       <span title=\"tt\/p:NE\">Behrens</span>" +
  "       </span>" +
  "      </span>" +
  "     </span>" +
  "    </span>" +
  "   </span>" +
  "  </span>" +
  " </span>" +
  "  " +
  " <span title=\"corenlp\/p:APPR\">" +
  "  <span title=\"marmot\/p:APPR\">" +
  "   <span title=\"opennlp\/p:APPR\">" +
  "    <span title=\"tt\/l:bei\">" +
  "    <span title=\"tt\/p:APPR\">bei</span>" +
  "    </span>" +
  "   </span>" +
  "  </span>" +
  " </span>" +
  "  " +
  " <span title=\"corenlp\/p:ART\">" +
  "  <span title=\"marmot\/m:case:dat\">" +
  "   <span title=\"marmot\/m:gender:fem\">" +
  "    <span title=\"marmot\/m:number:sg\">" +
  "     <span title=\"marmot\/p:ART\">" +
  "      <span title=\"opennlp\/p:ART\">" +
  "       <span title=\"tt\/l:die\">" +
  "       <span title=\"tt\/p:ART\">der</span>" +
  "       </span>" +
  "      </span>" +
  "     </span>" +
  "    </span>" +
  "   </span>" +
  "  </span>" +
  " </span>" +
  "  " +
  " <span title=\"corenlp\/p:NN\">" +
  "  <span title=\"marmot\/m:case:dat\">" +
  "   <span title=\"marmot\/m:gender:fem\">" +
  "    <span title=\"marmot\/m:number:sg\">" +
  "     <span title=\"marmot\/p:NN\">" +
  "      <span title=\"opennlp\/p:NN\">" +
  "       <span title=\"tt\/l:Vergrößerung\">" +
  "       <span title=\"tt\/p:NN\">Vergrößerung</span>" +
  "       </span>" +
  "      </span>" +
  "     </span>" +
  "    </span>" +
  "   </span>" +
  "  </span>" +
  " </span>" +
  "  " +
  " <span title=\"corenlp\/p:ART\">" +
  "  <span title=\"marmot\/m:case:gen\">" +
  "   <span title=\"marmot\/m:gender:neut\">" +
  "    <span title=\"marmot\/m:number:sg\">" +
  "     <span title=\"marmot\/p:ART\">" +
  "      <span title=\"opennlp\/p:ART\">" +
  "       <span title=\"tt\/l:die\">" +
  "       <span title=\"tt\/p:ART\">des</span>" +
  "       </span>" +
  "      </span>" +
  "     </span>" +
  "    </span>" +
  "   </span>" +
  "  </span>" +
  " </span>" +
  "  " +
  " <span title=\"corenlp\/p:NN\">" +
  "  <span title=\"marmot\/m:case:gen\">" +
  "   <span title=\"marmot\/m:gender:neut\">" +
  "    <span title=\"marmot\/m:number:sg\">" +
  "     <span title=\"marmot\/p:NN\">" +
  "      <span title=\"opennlp\/p:NN\">" +
  "       <span title=\"tt\/l:Laden\">" +
  "       <span title=\"tt\/p:NN\">Ladens</span>" +
  "       </span>" +
  "      </span>" +
  "     </span>" +
  "    </span>" +
  "   </span>" +
  "  </span>" +
  " </span>" +
  "  " +
  " <span title=\"corenlp\/p:ADV\">" +
  "  <span title=\"marmot\/p:ADV\">" +
  "   <span title=\"opennlp\/p:ADV\">" +
  "    <span title=\"tt\/l:einfach\">" +
  "    <span title=\"tt\/p:ADJD\">einfach</span>" +
  "    </span>" +
  "   </span>" +
  "  </span>" +
  " </span>" +
  "  " +
  " <span title=\"corenlp\/p:VVPP\">" +
  "  <span title=\"marmot\/p:VVPP\">" +
  "   <span title=\"opennlp\/p:VVPP\">" +
  "    <span title=\"tt\/l:herumbauen\">" +
  "    <span title=\"tt\/p:VVPP\">herumgebaut</span>" +
  "    </span>" +
  "   </span>" +
  "  </span>" +
  " </span>" +
  " : " +
  " <span title=\"corenlp\/p:ADV\">" +
  "  <span title=\"marmot\/p:ADV\">" +
  "   <span title=\"opennlp\/p:ADV\">" +
  "    <span title=\"tt\/l:nun\">" +
  "    <span title=\"tt\/p:ADV\">Nun</span>" +
  "    </span>" +
  "   </span>" +
  "  </span>" +
  " </span>" +
  "  " +
  " <span title=\"corenlp\/p:VVFIN\">" +
  "  <span title=\"marmot\/m:mood:ind\">" +
  "   <span title=\"marmot\/m:number:sg\">" +
  "    <span title=\"marmot\/m:person:3\">" +
  "     <span title=\"marmot\/m:tense:pres\">" +
  "      <span title=\"marmot\/p:VVFIN\">" +
  "       <span title=\"opennlp\/p:VVFIN\">" +
  "        <span title=\"tt\/l:stehen\">" +
  "        <span title=\"tt\/p:VVFIN\">steht</span>" +
  "        </span>" +
  "       </span>" +
  "      </span>" +
  "     </span>" +
  "    </span>" +
  "   </span>" +
  "  </span>" +
  " </span>" +
  "  " +
  " <mark>" +
  "  <span title=\"corenlp\/p:ART\">" +
  "   <span title=\"marmot\/m:case:nom\">" +
  "    <span title=\"marmot\/m:gender:masc\">" +
  "     <span title=\"marmot\/m:number:sg\">" +
  "      <span title=\"marmot\/p:ART\">" +
  "       <span title=\"opennlp\/p:ART\">" +
  "        <span title=\"tt\/l:die\">" +
  "        <span title=\"tt\/p:ART\">der</span>" +
  "        </span>" +
  "       </span>" +
  "      </span>" +
  "     </span>" +
  "    </span>" +
  "   </span>" +
  "  </span>" +
  "   " +
  "  <span title=\"corenlp\/p:ADJA\">" +
  "   <span title=\"marmot\/m:case:nom\">" +
  "    <span title=\"marmot\/m:degree:pos\">" +
  "     <span title=\"marmot\/m:gender:masc\">" +
  "      <span title=\"marmot\/m:number:sg\">" +
  "       <span title=\"marmot\/p:ADJA\">" +
  "        <span title=\"opennlp\/p:ADJA\">" +
  "         <span title=\"tt\/l:alt\">" +
  "         <span title=\"tt\/p:ADJA\">alte</span>" +
  "         </span>" +
  "        </span>" +
  "       </span>" +
  "      </span>" +
  "     </span>" +
  "    </span>" +
  "   </span>" +
  "  </span>" +
  "   " +
  "  <span title=\"corenlp\/p:NN\">" +
  "   <span title=\"marmot\/m:case:nom\">" +
  "    <span title=\"marmot\/m:gender:masc\">" +
  "     <span title=\"marmot\/m:number:sg\">" +
  "      <span title=\"marmot\/p:NN\">" +
  "       <span title=\"opennlp\/p:NN\">" +
  "        <span title=\"tt\/l:Baum\">" +
  "        <span title=\"tt\/p:NN\">Baum</span>" +
  "        </span>" +
  "       </span>" +
  "      </span>" +
  "     </span>" +
  "    </span>" +
  "   </span>" +
  "  </span>" +
  "  " +
  " </mark> <span title=\"corenlp\/p:ADV\">" +
  "  <span title=\"marmot\/p:ADV\">" +
  "   <span title=\"opennlp\/p:ADV\">" +
  "    <span title=\"tt\/l:mitten\">" +
  "    <span title=\"tt\/p:ADV\">mitten</span>" +
  "    </span>" +
  "   </span>" +
  "  </span>" +
  " </span>" +
  "  " +
  " <span title=\"corenlp\/p:APPR\">" +
  "  <span title=\"marmot\/p:APPR\">" +
  "   <span title=\"opennlp\/p:APPR\">" +
  "    <span title=\"tt\/l:in\">" +
  "    <span title=\"tt\/p:APPR\">in</span>" +
  "    </span>" +
  "   </span>" +
  "  </span>" +
  " </span>" +
  "  " +
  " <span title=\"corenlp\/p:ART\">" +
  "  <span title=\"marmot\/m:case:dat\">" +
  "   <span title=\"marmot\/m:gender:fem\">" +
  "    <span title=\"marmot\/m:number:sg\">" +
  "     <span title=\"marmot\/p:ART\">" +
  "      <span title=\"opennlp\/p:ART\">" +
  "       <span title=\"tt\/l:die\">" +
  "       <span title=\"tt\/p:ART\">der</span>" +
  "       </span>" +
  "      </span>" +
  "     </span>" +
  "    </span>" +
  "   </span>" +
  "  </span>" +
  " </span>" +
  "  " +
  " <span title=\"marmot\/p:TRUNC\">" +
  "  <span title=\"opennlp\/p:TRUNC\">" +
  "   <span title=\"tt\/l:Obst-\">" +
  "   <span title=\"tt\/p:TRUNC\">Obst-</span>" +
  "   </span>" +
  "  </span>" +
  " </span>" +
  "  " +
  " <span title=\"corenlp\/p:KON\">" +
  "  <span title=\"marmot\/p:KON\">" +
  "   <span title=\"opennlp\/p:KON\">" +
  "    <span title=\"tt\/l:und\">" +
  "    <span title=\"tt\/p:KON\">und</span>" +
  "    </span>" +
  "   </span>" +
  "  </span>" +
  " </span>" +
  "  " +
  " <span title=\"corenlp\/p:NN\">" +
  "  <span title=\"marmot\/m:case:gen\">" +
  "   <span title=\"marmot\/m:gender:fem\">" +
  "    <span title=\"marmot\/m:number:sg\">" +
  "     <span title=\"marmot\/p:NN\">" +
  "      <span title=\"opennlp\/p:NN\">" +
  "       <span title=\"tt\/l:Gemüseabteilung\">" +
  "       <span title=\"tt\/p:NN\">Gemüseabteilung</span>" +
  "       </span>" +
  "      </span>" +
  "     </span>" +
  "    </span>" +
  "   </span>" +
  "  </span>" +
  " </span>" +
  " ." +
  "</span>" +
  "<span class=\"context-right\">" +
  "</span>";

  var treeSnippet =
  "<span class=\"context-left\"></span>" +
  "<span class=\"match\">" +
  "  <span title=\"xip/c:MC\">" +
  "    <span title=\"xip/c:TOP\">" +
  "      <span title=\"xip/c:PP\">" +
  "        <span title=\"xip/c:PREP\">Mit</span>" +
  "        <span title=\"xip/c:NP\">" +
  "          <span title=\"xip/c:DET\">dieser</span>" +
  "          <span title=\"xip/c:NPA\">" +
  "            <span title=\"xip/c:NOUN\">Methode</span>" +
  "          </span>" +
  "        </span>" +
  "      </span>" +
  "      <span title=\"xip/c:VERB\">ist</span>" +
  "      <mark>" +
  "        <span title=\"xip/c:NP\">" +
  "          <span title=\"xip/c:PRON\">es</span>" +
  "        </span>" +  
  "        <span title=\"xip/c:AP\">" +
  "          <span title=\"xip/c:ADV\">nun</span>" +
  "          <span title=\"xip/c:ADJ\">möglich</span>" +
  "        </span>" +
  "      </mark>" +
  "      <span title=\"xip/c:ADV\">z. B.</span>" +
  "      <span title=\"xip/c:NPA\">" +
  "        <span title=\"xip/c:NP\">" +
  "          <span title=\"xip/c:NOUN\">Voice</span>" +
  "        </span>" +
  "      </span>" + "(" +
  "      <span title=\"xip/c:INS\">" +
  "        <span title=\"xip/c:NPA\">" +
  "          <span title=\"xip/c:NP\">" +
  "            <span title=\"xip/c:NOUN\">Sprache</span>" +
  "          </span>" +
  "        </span>" +
  "      </span>" + ")" +
  "      <span title=\"xip/c:VERB\">bevorzugt</span>" +
  "      <span title=\"xip/c:PP\">" +
  "        <span title=\"xip/c:PREP\">in</span>" +
  "        <span title=\"xip/c:NP\">" +
  "          <span title=\"xip/c:PRON\">der</span>" +
  "        </span>" +
  "        <span title=\"xip/c:NPA\">" +
  "          <span title=\"xip/c:NP\">" +
  "            <span title=\"xip/c:NOUN\">Bridge</span>" +
  "          </span>" +
  "        </span>" +
  "      </span>" +
  "      <span title=\"xip/c:INFC\">" +
  "        <span title=\"xip/c:INS\">" +
  "          <span title=\"xip/c:VERB\">weiterzugeben</span>" +
  "        </span>" +
  "      </span>" +
  "    </span>" +
  "  </span>" +
  "</span>" +
  "<span class=\"context-right\"></span>";


  var relSnippet =
 	"<span class=\"context-left\"></span>"+
	"<span class=\"match\">"+
	"  <span xml:id=\"token-WDD17/982/72848-p15836-15839\">"+
	"    <span xlink:title=\"lwc/d:NK\" xlink:show=\"none\" xlink:href=\"#token-WDD17/982/72848-p15838\">Ein</span>"+
	" "+
	"    <span xlink:title=\"lwc/d:NK\" xlink:show=\"none\" xlink:href=\"#token-WDD17/982/72848-p15838\">letztes</span>"+
	" "+
	"    <span xml:id=\"token-WDD17/982/72848-p15838\">"+
  //     s1464_n2 "ein" -> ":"
	"      <span xlink:title=\"lwc/d:--\" xlink:show=\"none\" xlink:href=\"#token-WDD17/982/72848-p15836-15839\">mal</span>"+
	"    </span>"+
	": "+
	"    <span xml:id=\"token-WDD17/982/72848-p15839-15840\">"+
	"      <span xlink:title=\"lwc/d:--\" xlink:show=\"none\" xlink:href=\"#token-WDD17/982/72848-p15839-15840\">AL</span>"+
	"    </span>"+
	"  </span>"+
	"  <span xlink:show=\"other\" data-action=\"join\" xlink:href=\"#token-WDD17/982/72848-p15839-15840\">"+
	":"+
	"    <span xml:id=\"token-WDD17/982/72848-p15840-15846\">"+
	"      <span xml:id=\"token-WDD17/982/72848-p15840\">"+
	"        <span xlink:title=\"lwc/d:--\" xlink:show=\"none\" xlink:href=\"#token-WDD17/982/72848-p15840-15846\">halt</span>"+
	"      </span>"+
	"    </span>"+
	"  </span>"+
	"  <span xlink:show=\"other\" data-action=\"join\" xlink:href=\"#token-WDD17/982/72848-p15840-15846\">"+
	" "+
	"    <span xlink:title=\"lwc/d:NK\" xlink:show=\"none\" xlink:href=\"#token-WDD17/982/72848-p15842\">den</span>"+
	" "+
	"    <span xml:id=\"token-WDD17/982/72848-p15842\">"+
	"      <span xlink:title=\"lwc/d:OA\" xlink:show=\"none\" xlink:href=\"#token-WDD17/982/72848-p15843\">Ball</span>"+
	"    </span>"+
	" "+
	"    <span xml:id=\"token-WDD17/982/72848-p15843\">"+
	"      <span xlink:title=\"lwc/d:PD\" xlink:show=\"none\" xlink:href=\"#token-WDD17/982/72848-p15840\">flach</span>"+
	"    </span>"+
	", "+
	"    <mark>"+
	"      <span xlink:title=\"lwc/d:MO\" xlink:show=\"none\" xlink:href=\"#token-WDD17/982/72848-p15845\">ganz</span>"+
	" "+
	"      <span xml:id=\"token-WDD17/982/72848-p15845\">"+
	"        <span xlink:title=\"lwc/d:CJ\" xlink:show=\"none\" xlink:href=\"#token-WDD17/982/72848-p15843\">flach</span>"+
	"      </span>"+
	"    </mark>"+
	"  </span>"+
	"</span>"+
	"<span class=\"context-right\"></span>";

  var meta = {"messages":[["Response format is temporary"]],"@context":"http://korap.ids-mannheim.de/ns/KoralQuery/v0.3/context.jsonld","meta":{},"document":{"@type":"koral:document","fields":[{"@type":"koral:field","type":"type:store","key":"ref","value":"My reference"},{"@type":"koral:field","type":"type:text","key":"title","value":"Der Name der Rose"},{"@type":"koral:field","type":"type:string","key":"textSigle","value":"a/b/c"},{"@type":"koral:field","type":"type:string","key":"keyword","value":["baum","wald"]},{"@type":"koral:field","type":"type:number","key":"zahl1","value":56},{"@type":"koral:field","type":"type:string","key":"name","value":"Peter"}]}};

  meta = {"messages":[["Response format is temporary"]],"@context":"http://korap.ids-mannheim.de/ns/KoralQuery/v0.3/context.jsonld","meta":{},"document":{"@type":"koral:document","fields":[{"@type":"koral:field","type":"type:number","key":"pubDate","value":20170701},{"@type":"koral:field","type":"type:string","key":"textSigle","value":"WDD17/982/72848"},{"@type":"koral:field","type":"type:string","key":"foundries","value":"dereko dereko/structure dereko/structure/base-sentences-paragraphs-pagebreaks lwc lwc/dependency treetagger treetagger/morpho"},{"@type":"koral:field","type":"type:string","key":"corpusSigle","value":"WDD17"},{"@type":"koral:field","type":"type:string","key":"docSigle","value":"WDD17/982"},{"@type":"koral:field","type":"type:store","key":"reference","value":"Diskussion:99 Namen Allahs/Archiv/1, In: Wikipedia - URL:http://de.wikipedia.org/wiki/Diskussion:99_Namen_Allahs/Archiv/1: Wikipedia, 2017"},{"@type":"koral:field","type":"type:text","key":"author","value":"ArchivBot, u.a."},{"@type":"koral:field","type":"type:number","key":"creationDate","value":20140609},{"@type":"koral:field","type":"type:string","key":"textTypeArt","value":"Diskussion"},{"@type":"koral:field","type":"type:store","key":"editor","value":"wikipedia.org"},{"@type":"koral:field","type":"type:text","key":"title","value":"Diskussion:99 Namen Allahs/Archiv/1"},{"@type":"koral:field","type":"type:store","key":"tokenSource","value":"base#tokens"},{"@type":"koral:field","type":"type:store","key":"layerInfos","value":"dereko/s=spans lwc/d=rels tt/l=tokens tt/p=tokens"},{"@type":"koral:field","type":"type:string","key":"textClass","value":"staat-gesellschaft biographien-interviews"},{"@type":"koral:field","type":"type:string","key":"availability","value":"CC-BY-SA"}]}};

  meta = {
    "@context":"http:\/\/korap.ids-mannheim.de\/ns\/KoralQuery\/v0.3\/context.jsonld",
    "document":{
      "@type":"koral:document",
      "fields":[
        {
          "@type":"koral:field",
          "key":"editor",
          "type":"type:store",
          "value":"wikipedia.org"
        },
        {
          "@type":"koral:field",
          "key":"textSigle",
          "type":"type:string",
          "value":"WPD15\/264\/58336"
        },
        {
          "@type":"koral:field",
          "key":"author",
          "type":"type:text",
          "value":"Sprachpfleger, u.a."
        },
        {
          "@type":"koral:field",
          "key":"docSigle",
          "type":"type:string",
          "value":"WPD15\/264"
        },
        {
          "@type":"koral:field",
          "key":"textTypeArt",
          "type":"type:string",
          "value":"Enzyklopädie-Artikel"
        },
        {
          "@type":"koral:field",
          "key":"language",
          "type":"type:string",
          "value":"de"
        },
        {
          "@type":"koral:field",
          "key":"link",
          "type":"type:attachement",
          "value":"data:application/x.korap-link;title=Wikipedia,https://de.wikipedia.org/wiki/Beispiel"
        },
        {
          "@type":"koral:field",
          "key":"docTitle",
          "type":"type:text",
          "value":"Wikipedia, Artikel mit Anfangszahl 2, Teil 64"
        },
        {
          "@type":"koral:field",
          "key":"textType",
          "type":"type:string",
          "value":"Enzyklopädie"
        },
        {
          "@type":"koral:field",
          "key":"availability",
          "type":"type:string",
          "value":"CC-BY-SA"
        },
        {
          "@type":"koral:field",
          "key":"foundries",
          "type":"type:keywords",
          "value":[
            "corenlp",
            "corenlp\/constituency",
            "corenlp\/morpho",
            "corenlp\/sentences",
            "dereko",
            "dereko\/structure",
            "dereko\/structure\/base-sentences-paragraphs-pagebreaks",
            "opennlp",
            "opennlp\/morpho",
            "opennlp\/sentences"
          ]
        },
        {
          "@type":"koral:field",
          "key":"creationDate",
          "type":"type:date",
          "value":"2015-04-17"
        },
        {
          "@type":"koral:field",
          "key":"title",
          "type":"type:text",
          "value":"22:43 – Das Schicksal hat einen Plan"
        },
        {
          "@type":"koral:field",
          "key":"pubDate",
          "type":"type:date",
          "value":"2015-05-01"
        },
        {
          "@type":"koral:field",
          "key":"reference",
          "type":"type:store",
          "value":"22:43 – Das Schicksal hat einen Plan, In: Wikipedia - URL:http:\/\/de.wikipedia.org\/wiki\/22:43_–_Das_Schicksal_hat_einen_Plan: Wikipedia, 2015"
        },
        {
          "@type":"koral:field",
          "key":"textClass",
          "type":"type:keywords",
          "value":["kultur","film"]
        },
        {
          "@type":"koral:field",
          "key":"tokenSource",
          "type":"type:store",
          "value":"base#tokens"
        },
        {
          "@type":"koral:field",
          "key":"publisher",
          "type":"type:store",
          "value":"Wikipedia"
        },
        {
          "@type":"koral:field",
          "key":"layerInfos",
          "type":"type:store",
          "value":"corenlp\/c=spans corenlp\/p=tokens corenlp\/s=spans dereko\/s=spans opennlp\/p=tokens opennlp\/s=spans"
        },
        {
          "@type":"koral:field",
          "key":"pubPlace",
          "type":"type:string",
          "value":"URL:http:\/\/de.wikipedia.org"
        },
        {
          "@type":"koral:field",
          "key":"corpusTitle",
          "type":"type:text",
          "value":"Wikipedia"
        },
        {
          "@type":"koral:field",
          "key":"corpusEditor",
          "type":"type:store",
          "value":"wikipedia.org"
        },
        {
          "@type":"koral:field",
          "key":"corpusSigle",
          "type":"type:string",
          "value":"WPD15"
        }
      ]
    }
  };
  

  KorAP.API.getMatchInfo = function(match, callObj, cb) {
    console.dir(callObj);
    if (callObj["spans"] !== undefined && callObj["spans"] === true) {
      if (callObj["layer"] === "d") {
        return cb({ "snippet": relSnippet });
      }
      else {
        return cb({ "snippet": treeSnippet });
      }
    }
    else {
      return cb({ "snippet": snippet });
    }
  };

  KorAP.API.getTextInfo = function(doc, callObj, cb) {
    return cb(meta);
  };
});

/**
 * Test suite for guided tour
 * 
 * @author Helge Stallkamp
 */

define(['tour/tours', 'vc', 'session', 'match'], function(tourClass, vcClass, sessionClass, matchClass){
  const loc   = KorAP.Locale;
  var introKorAP =
  	"<form autocomplete='off' action='/' id='searchform'>" + 
    "<div id='searchbar' class=''>" +
      "<input autocapitalize='off' autocomplete='off' autocorrect='off' autofocus='autofocus' id='q-field' name='q' placeholder='Finde ...' spellcheck='false' type='search'>" +
      "<button type='submit' id='qsubmit' title='Los!'><span>Los!</span></button>" + 
    "</div>" + 
    "<!-- Search in the following virtual corpus -->"+
    "<div id='vc-view'></div>" +
    "in" +
    "<span id='vc-choose' class='select'><span>allen Korpora</span></span>" +
    "<input id='cq' name='cq' type='text' style='display: none;'>" +
      "mit" +
      "<span class='select'>" +
        "<select id='ql-field' name='ql' style='display: none;'>" +
            "<option value='poliqarp'>Poliqarp</option>" +
            "<option value='cosmas2'>Cosmas II</option>" +
            "<option value='annis'>Annis QL</option>" +
            "<option value='cql'>CQL v1.2</option>" +
            "<option value='fcsql'>FCSQL</option>" +
        "</select>" +
      "<span style='display: inline;'> Poliqarp</span>" +
        "<ul style='outline: currentcolor none 0px;' tabindex='0' class='menu roll'>" +
          "<span class='pref'></span>" +
          "<div class='lengthField'>" +
            "<span>Poliqarp--</span>" +
            "<span>Cosmas II--</span>" +
            "<span>Annis QL--</span>" +
            "<span>CQL v1.2--</span>" +
            "<span>FCSQL--</span>" +
            "</div><div class='ruler' style='display: none;'><span></span><div></div>" +
          "</div>" +
         "</ul>" +
       "</span>" +
       "<div class='button right'>" +
         "<input checked='' class='checkbox' id='q-cutoff-field' name='cutoff' type='checkbox' value='1'>" +
           "<label for='q-cutoff-field' title='Zeige nur die ersten Treffer in beliebiger Reihenfolge'><span id='glimpse'></span>Glimpse</label>" +
           "<a class='tutorial' id='view-tutorial' tabindex='-1' title='Einführung'><span>Einführung</span></a>"+
       "</div>" +
       "<div class='clear'></div>"+
       "</form>" + 
       "<div class='hint mirror' style='height: 0px; left: 238px; top: 36px; width: 1272px; padding-left: 2px; margin-left: 0px; border-left-width: 2px; border-left-style: solid; font-size: 14.6667px; font-family: Noto Sans;'>" +
         "<span></span>" +
           "<div id='hint' class=''>" +
           "<div style='display: none;' class='alert hint'></div>" +
           "<ul style='outline: currentcolor none 0px;' tabindex='0' class='menu roll hint'>" +
             "<span class='pref'></span>" +
             "<div class='lengthField'>" +
               "<span>Base Annotation--</span>" +
               "<span class='desc'>Structure--</span>" +
               "<span>DeReKo--</span><span class='desc'>Structure--</span>"+
             "</div>"
             "<div class='ruler' style='display: none;'><span></span><div></div></div>"
            "</ul>" +
           "</div>" +
          "</div>"; 
  
  
  var preDefinedStat={
      "documents":12,
      "tokens":2323,
      "sentences":343434,
      "paragraphs":45454545
      };

  
  KorAP.API.getCorpStat = function(collQu, cb){
    return cb(preDefinedStat);
  }; 
  

  var resultkorap =  
    "<div id='search'>" +
      "<ol class='align-left' tabindex='-8'>" +
        "<li data-corpus-id='WPD' " +
          "data-doc-id='WWW'" +
          "data-text-id='03313'" +
          "data-match-id='p102-103'" +
          "data-available-info='base/s=spans corenlp/c=spans corenlp/ne=tokens corenlp/p=tokens corenlp/s=spans glemm/l=tokens mate/l=tokens mate/m=tokens mate/p=tokens opennlp/p=tokens opennlp/s=spans tt/l=tokens tt/p=tokens tt/s=spans xip/c=spans malt/d=rels'"+
          "id='WPD-WWW.03313-p102-103'" +
          "tabindex='6'>" +
          "<div class='meta'>WPD/WWW/03313</div>" +
          "<div class='match-main'>" +
            "<div class='match-wrap'>" +
              "<div class='snippet startMore endMore'>" +
                "<div class='flag'></div>" +
                "<span class='context-left'>In diesem Beispiel ist zu sehen, dass die beiden Variablen a und b lediglich ihre Werte an" +
                " die Funktion </span><mark><mark class='class-2 level-1'>Dies </mark><mark class='class-1 level-0'><mark class='class-2 level-1'><mark class='class-3 level-2'>ist</mark>" +
                " ein</mark> Test</mark></mark><span class='context-right'> übergeben, aber im Gegensatz zu einem Referenzparamter dabei unverändert bleiben.</span></div>" + 
              "</div>"+
              "<!-- only inject via javascript! -->" +
             "</div>" + 
             "<p class='ref'><strong>Wertparameter</strong> by Hubi,Zwobot,4; published on 2005-03-28 as WWW.03313 (WPD)</p>" +
             "<!-- only inject via javascript! -->" +
           "</li>" + 
      "</div>"; 



  var snippet = "<span title=\"cnx/l:meist\">" +
      "  <span title=\"cnx/p:ADV\">" +
      "    <span title=\"cnx/syn:@PREMOD\">" +
      "      <span title=\"mate/l:meist\">" +
      "        <span title=\"mate/l:meist\">" +
      "          <span title=\"mate/p:ADV\">" +
      "            <span title=\"opennlp/p:ADV\">meist</span>" +
      "          </span>" +
      "        </span>" +
      "      </span>" +
      "    </span>" +
      "  </span>" +
      "</span>" +
      "<mark>" + 
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
      "</mark>" +
      "<span title=\"cnx/l:fähig\">" +
      "  <span title=\"cnx/l:leistung\">" +
      "    <span title=\"cnx/p:A\">" +
      "      <span title=\"cnx/p:ADJA\">" +
      "        <span title=\"cnx/syn:@NH\">" +
      "          <span title=\"mate/l:leistungsfähig\">" +
      "            <span title=\"mate/m:degree:comp\">" +
      "              <span title=\"mate/p:ADJD\">" +
      "                <span title=\"opennlp/p:ADJD\">leistungsfähiger</span>" +
      "              </span>" +
      "            </span>" +
      "          </span>" +
      "        </span>" +
      "      </span>" +
      "    </span>" +
      "  </span>" +
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
  
  KorAP.API.getTextInfo = function (doc, param, cb) {
    cb(textInfo);
  };

    // Override getMatchInfo API call
    KorAP.API.getMatchInfo = function (x, param, cb) {
      if (param['spans'] === undefined || param['spans'] === false)
        cb({ "snippet": snippet });
      else
        cb({ "snippet": treeSnippet });
    };

    var textInfo = {
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
  let template = document.createElement('template');
  let html = introKorAP.trim(); // Do not return a text node of whitespace as the result
  template.innerHTML = html;
  let intrkorap = template.content;
  
  let resulttemplate = document.createElement('template');
  let htmlZwei = resultkorap.trim(); 
  resulttemplate.innerHTML = resultkorap;
  var resultkor = resulttemplate.content;

  resultkor.querySelector('#search > ol > li:not(.active)').addEventListener('click', function (e) {
    if (this._match !== undefined)
      this._match.open();
    else {
      matchClass.create(this).open();
    }
  });
  
  let vc= vcClass.create().fromJson({
    '@type' : 'koral:doc',
    'key' : 'title', 
    'match': 'match:eq',
    'value' : 'TestTour!',
    'type'  : 'type:string'      
  });
  
  KorAP.vc = vc;

  describe('KorAP.GuidedTour', function(){

    afterAll(function () {
      KorAP.API.getMatchInfo = undefined;
      var body = document.body;
      var i = body.children.length - 1;
      while (i >= 0) {
        if (body.children[i].nodeType && body.children[i].nodeType === 1) {
          if (!body.children[i].classList.contains("jasmine_html-reporter")) {
            body.removeChild(body.children[i]);
          };
        };
        i--;
      };
    })
        
    it('IDs and classes, that are needed for the guided tour should be in existence', function(){
      //gTstartSearch
      expect(intrkorap.querySelector('#searchbar')).not.toBeNull();
      expect(intrkorap.querySelector('#q-field')).not.toBeNull();
      expect(intrkorap.querySelector('#hint')).not.toBeNull();
      expect(intrkorap.querySelector('#vc-choose')).not.toBeNull();     
      expect(intrkorap.querySelector('#vc-view')).not.toBeNull();
      expect(intrkorap.querySelector('#ql-field').parentNode).not.toBeNull();
      expect(intrkorap.querySelector('#glimpse')).not.toBeNull();
      expect(intrkorap.querySelector('#view-tutorial')).not.toBeNull();
      expect(intrkorap.querySelector('#qsubmit')).not.toBeNull();
      let show = document.createElement('div');
      show.appendChild(vc.element());
      let statbut = show.querySelector('.statistic');
      expect(statbut).not.toBeNull();
      statbut.click();
      expect(show.querySelector('.stattable')).not.toBeNull();
      //IDs and classes, that are needed for the second guided tour(gTshowResults()) should be in existence, too
      expect(resultkor.querySelector('#search')).not.toBeNull();
      expect(resultkor.querySelector('#search > ol > li')).not.toBeNull();
      resultkor.querySelector("#search > ol > li").click();      
      expect(resultkor.querySelector('.action > .metatable')).not.toBeNull();
      resultkor.querySelector(".metatable").click();
      expect(resultkor.querySelector('.view.metatable')).not.toBeNull();
      expect(resultkor.querySelector('.action > .info')).not.toBeNull();
      resultkor.querySelector(".info").click();
      expect(resultkor.querySelector('.view.tokentable')).not.toBeNull();
      expect(resultkor.querySelector('.tree')).not.toBeNull(); 
    });
      
   it('Guided Tour should be started and display steps and labels in the right order', function(){
     let vcpanel = intrkorap.getElementById("vc-view");
     vcpanel.appendChild(vc.element());
     let searchTour = tourClass.gTstartSearch(intrkorap);
     searchTour.start();
     let totalSteps = searchTour.stepCount;
     expect(document.querySelector(".introjs-tooltiptext").textContent).toEqual(loc.TOUR_sear1);
     expect(document.querySelector(".introjs-skipbutton").textContent).toEqual(loc.TOUR_lskip);
     expect(document.querySelector(".introjs-prevbutton").textContent).toEqual(loc.TOUR_lprev);
     expect(document.querySelector(".introjs-nextbutton").textContent).toEqual(loc.TOUR_lnext);
     searchTour.exit();
     
     for(let i = 2; i <= totalSteps; i++){
       searchTour.goToStepNumber(i);
       expect(document.querySelector(".introjs-tooltiptext").textContent).toEqual(searchTour.testIntros[i-1]);
       
       if(i == totalSteps){
         expect(document.querySelector(".introjs-donebutton").textContent).toEqual(loc.TOUR_seargo);
         expect(document.querySelector(".introjs-prevbutton").textContent).toEqual(loc.TOUR_lprev);
         expect(document.querySelector(".introjs-nextbutton").classList.contains("introjs-disabled")).toBe(true);
       } 
       searchTour.exit();
     } 
     
     let resultTour = tourClass.gTshowResults(resultkor);
     KorAP.session = sessionClass.create('KalamarJSDem'); 
     resultTour.start(resultkor);
     let totalStepsR = resultTour.stepCount;
     expect(document.querySelector(".introjs-tooltiptext").textContent).toEqual(loc.TOUR_kwic);
     expect(document.querySelector(".introjs-skipbutton").textContent).toEqual(loc.TOUR_lskip);
     expect(document.querySelector(".introjs-prevbutton").textContent).toEqual(loc.TOUR_lprev);
     expect(document.querySelector(".introjs-nextbutton").textContent).toEqual(loc.TOUR_lnext);
     resultTour.exit();
     
    for(let i = 2; i <= totalStepsR; i++){
       resultTour.goToStepNumber(i);
       expect(document.querySelector(".introjs-tooltiptext").textContent).toEqual(resultTour.testIntros[i-1]);
       if(i == totalStepsR){
         expect(document.querySelector(".introjs-donebutton").textContent).toEqual(loc.TOUR_ldone);  
       }   
       resultTour.exit();
     } 
   });
  });
});

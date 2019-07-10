/**
 * Test suite for guided tour.
 * 
 * @author Helge Stallkamp
 */

define(['tour/tours', 'vc', 'session'], function(tourClass, vcClass, sessionClass){
  const loc   = KorAP.Locale;
 
  //TODO Read this file from the file system, see https://korap.ids-mannheim.de/gerrit/#/c/KorAP/Kalamar/+/2241/
  var introKorAP =
  	"<form autocomplete='off' action='/' id='searchform'>" + 
    "<div id='searchbar' class=''>" +
      "<input autocapitalize='off' autocomplete='off' autocorrect='off' autofocus='autofocus' id='q-field' name='q' placeholder='Finde ...' spellcheck='false' type='search'>" +
      "<button type='submit' id='qsubmit' title='Los!'><span>Los!</span></button>" + 
    "</div>" + 
    "<!-- Search in the following virtual collection -->"+
    "<div id='vc-view'></div>" +
    "in" +
    "<span id='vc-choose' class='select'><span>allen Korpora</span></span>" +
    "<input id='collection' name='collection' type='text' style='display: none;'>" +
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

  let template = document.createElement('template');
  html = introKorAP.trim(); // Do not return a text node of whitespace as the result
  template.innerHTML = html;
  intrkorap = template.content;
  
  //TODO Add hint and vc-choose, they are not part of the generated file
  describe('KorAP.GuidedTour', function(){
    it('IDs and classes, that are needed for the guided tour should be in existence', function(){
      expect(intrkorap.querySelector('#searchbar')).not.toBeNull();
      expect(intrkorap.querySelector('#q-field')).not.toBeNull();
      expect(intrkorap.querySelector('#hint')).not.toBeNull();
      expect(intrkorap.querySelector('#vc-choose')).not.toBeNull();     
      expect(intrkorap.querySelector('#vc-view')).not.toBeNull();
      expect(intrkorap.querySelector('#ql-field').parentNode).not.toBeNull();
      expect(intrkorap.querySelector('#glimpse')).not.toBeNull();
      expect(intrkorap.querySelector('#view-tutorial')).not.toBeNull();
      expect(intrkorap.querySelector('#qsubmit')).not.toBeNull();
    });
    
   
  
   it('Guided Tour should be started and display steps and labels in the right order', function(){
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
     
     let resultTour = tourClass.gTshowResults(intrkorap);
     KorAP.session = sessionClass.create('KalamarJSDem'); 
     resultTour.start();
     expect(document.querySelector(".introjs-tooltiptext").textContent).toEqual(loc.TOUR_result);
     expect(document.querySelector(".introjs-donebutton").textContent).toEqual(loc.TOUR_ldone);   
     resultTour.exit();
    
   }); 
  });
}    
);

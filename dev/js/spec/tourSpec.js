/**
 * Test suite for guided tour.
 * 
 * @author Helge Stallkamp
 */

define(['tour/tours', 'vc'], function(tourClass, vcClass){
  const loc   = KorAP.Locale;
 
  //TODO Read this file from the file system, see https://korap.ids-mannheim.de/gerrit/#/c/KorAP/Kalamar/+/2241/
  var introKorAP  = "<form autocomplete='off' action='/' id='searchform'>" +
  "<div id='searchbar'>" +
    "<input autocapitalize='off' autocomplete='off ' autocorrect='off' autofocus='autofocus' id='q-field' name='q' placeholder='Find ...' spellcheck='false' type='search'>" +
    "<button type='submit' title='Go!'><span>Go!</span></button>" +
  "</div>"+
  "<!-- Search in the following virtual collection -->"+
  "<div id='vc-view'></div>" +
  "in" +
  "<input id='collection' name='collection' type='text'>" +
  "with" +
  "<span class='select'>" +
    "<select id='ql-field' name='ql'><option value='poliqarp'>Poliqarp</option><option value='cosmas2'>Cosmas II</option><option value='annis'>Annis QL</option><option value='cql'>CQL v1.2</option><option value='fcsql'>FCSQL</option></select>" +
  "</span>" +
  "<div class='button right'>" +
    "<input checked class='checkbox' id='q-cutoff-field' name='cutoff' type='checkbox' value='1'>"+
    "<label for='q-cutoff-field' title='Just show the first matches in arbitrary order'><span id='glimpse'></span>Glimpse</label>" +
    "<a class='tutorial' href='/doc' id='view-tutorial' tabindex='-1' title='Tutorial'><span>Tutorial</span></a>" +
  "</div>" +
  "<div class='clear'></div>" +
  "</form>";

  let template = document.createElement('template');
  html = introKorAP.trim(); // Do not return a text node of whitespace as the result
  template.innerHTML = html;
  intrkorap = template.content.firstChild;

  
  //TODO Add hint and vc-choose, they are not part of the generated file
  describe('KorAP.GuidedTour', function(){
    it('IDs and classes, that are needed for the guided tour should be in existence', function(){
      expect(intrkorap.querySelector('#searchbar')).not.toBeNull();
      expect(intrkorap.querySelector('#q-field')).not.toBeNull();
      //expect(intrkorap.querySelector('#hint')).not.toBeNull();
      //expect(intrkorap.querySelector('#vc-choose')).not.toBeNull();     
      expect(intrkorap.querySelector('#vc-view')).not.toBeNull();
      expect(intrkorap.querySelector('#ql-field').parentNode).not.toBeNull();
      expect(intrkorap.querySelector('#glimpse')).not.toBeNull();
      expect(intrkorap.querySelector('#view-tutorial')).not.toBeNull();
      expect(intrkorap.querySelector('#searchbar button[type=submit]')).not.toBeNull();
    });
    
   
   it('Guided Tour should be started and display steps and labels in the right order', function(){
     let testTour = tourClass.guidedTour(intrkorap);
     testTour.start();
     let totalSteps = testTour.stepCount;
 
     expect(document.querySelector(".introjs-tooltiptext").textContent).toEqual(loc.TOUR_sear1);
     expect(document.querySelector(".introjs-skipbutton").textContent).toEqual(loc.TOUR_lskip);
     expect(document.querySelector(".introjs-prevbutton").textContent).toEqual(loc.TOUR_lprev);
     expect(document.querySelector(".introjs-nextbutton").textContent).toEqual(loc.TOUR_lnext);
     testTour.exit();
     
     for(let i = 2; i <= totalSteps; i++){
       testTour.goToStepNumber(i);
       expect(document.querySelector(".introjs-tooltiptext").textContent).toEqual(testTour.testIntros[i-1]);
       if(i == totalSteps){
         expect(document.querySelector('.introjs-donebutton').textContent).toEqual(loc.TOUR_ldone);
       }
       testTour.exit();
     }   
   }); 
  });
}    
);

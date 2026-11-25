import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import metaClass from '../match/meta.js';
import attachementClass from '../match/attachement.js';

  var available = [
    'base/s=spans',
    'corenlp/c=spans',
    'corenlp/ne=tokens',
    'corenlp/p=tokens',
    'corenlp/s=spans',
    'glemm/l=tokens',
    'mate/l=tokens',
    'mate/m=tokens',
    'mate/p=tokens',
    'opennlp/p=tokens',
    'opennlp/s=spans',
    'tt/l=tokens',
    'tt/p=tokens',
    'tt/s=spans'
  ];

  var match = {
    'corpusID' : 'WPD',
    'docID' : 'UUU',
    'textID' : '01912',
    'matchID' : 'p121-122',
    'textSigle' : 'WPD/UUU/01912',
    'available' : available
  };


  var fields = [
	  {
      "@type": "koral:field",
      "key": "author",
      "type": "type:text",
      "value": "Sprachpfleger, u.a."
    },
    {
      "@type": "koral:field",
      "key": "textClass",
      "type": "type:keywords", // May not be necessary
      "value": ["kultur", "film"]
    },
    {
      "@type":"koral:field",
      "key":"foundries",
      "type":"type:string",
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
      "@type": "koral:field",
      "key": "xlink",
      "type": "type:attachement",
      "value": "data:application/x.korap-link;title=Cool,https://de.wikipedia.org/wiki/Beispiel"
    },
    {
      "@type": "koral:field",
      "key": "xlink2",
      "type": "type:attachement",
      "value" : "data:application/x.korap-link;example=%20Das%20war%20einfach;title=Hallo%21,https%3A%2F%2Fwww.test.de",
    },
    {
      "@type": "koral:field",
      "key": "xlink3",
      "type": "type:attachement",
      "value": "data:application/x.korap-link;title=Gingko-Webseite%20an%20der%20Universit%E4t%20Leipzig,http%3A%2F%2Fwww.uni-leipzig.de%2Fgingko%2F"
    },
    {
      "@type": "koral:field",
      "key": "z-reference",
      "type": "type:attachement",
      "value": "data:,This is a reference"
    },
    {
      "@type": "koral:field",
      "key": "zz-notinindex",
      "type": "type:text",
      "comment": "notinindex",
      "value": "Stored but not indexed"
    },
  ];


  var snippet = "<span class=\"context-left\"><\/span>"+
      "<span class=\"match\">" +
      "<span class=\"cutted\"><\/span>" +
      "Außerdem " +
      "<span title=\"cnx/l:meist\">" +
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
      "<span title=\"dgd/para:incident\">▮</span>" +
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
      "</span>" +
      " und robust sind auch die anderen Traktoren, die hier der Übersicht wegen keine Erwähnung finden können." +
      "<span class=\"cutted\"><\/span>" +
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

  var snippetDiffToken = "<span class=\"context-left\"><\/span>"+
      "<span class=\"match\">" +
      "<span class=\"cutted\"><\/span>" +
      "Außerdem " +
      "<span title=\"cnx/l:meist\">" +
      "  <span title=\"cnx/p:ADV\">" +
      "    <span title=\"cnx/syn:@PREMOD\">" +
      "      <span title=\"mate/l:meist\">" +
      "        <span title=\"mate/p:ADV\">" +
      "          <span title=\"opennlp/p:ADV\">Диес</span>" +
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
      "            <span title=\"opennlp/p:ADJD\">ист</span>" +
      "          </span>" +
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
      "            <span title=\"opennlp/p:ADJD\">Беиспиел</span>" +
      "          </span>" +
      "        </span>" +
      "      </span>" +
      "    </span>" +
      "  </span>" +
      "</span>" +
      "</mark>" +
      ")" +
      "<span class=\"cutted\"><\/span>" +
      "</span>";

          
  var treeSnippetHierarchy =
      "<span class=\"context-left\"><\/span><span class=\"match\"><span title=\"corenlp\/c:MPN\">Leonard Maltin<\/span> schrieb: „<span title=\"corenlp\/c:S\"><span title=\"corenlp\/c:NP\">Plot <span title=\"corenlp\/c:MPN\">contrivance isn‘<mark>t<\/mark> handled badly<\/span><\/span> <span title=\"corenlp\/c:PP\">in above-average programmer<\/span><\/span>“.&lt;<span title=\"corenlp\/c:S\"><span title=\"corenlp\/c:ROOT\"><span title=\"corenlp\/c:NP\">ref&gt;''<span title=\"corenlp\/c:NP\"><span title=\"corenlp\/c:CNP\">Movie &amp;amp; Video<\/span> Guide<\/span><\/span>'', <span title=\"corenlp\/c:VP\">1996 edition, <span title=\"corenlp\/c:NP\"><span title=\"corenlp\/c:CNP\">S. 210<\/span><\/span><\/span>.<\/span><\/span><\/span><span class=\"context-right\"><\/span>";

  function matchElementFactory () {
    var me = document.createElement('li');

    me.setAttribute(
      'data-available-info',
      'base/s=spans corenlp/c=spans corenlp/ne=tokens corenlp/p=tokens' +
        ' corenlp/s=spans glemm/l=tokens mate/l=tokens mate/m=tokens' +
        ' mate/p=tokens opennlp/p=tokens opennlp/s=spans tt/l=tokens' +
        ' tt/p=tokens tt/s=spans');

    me.setAttribute('data-corpus-id', 'WPD');
    me.setAttribute('data-doc-id', 'FFF');
    me.setAttribute('data-text-id', '01460');
    me.setAttribute('data-text-sigle', 'WPD/FFF/01460');
    me.setAttribute('data-match-id', 'p119-120');
    me.innerHTML = '<div><div class="snippet">check</div></div><p class="ref">me</p>';
    return me;
  };

  function matchElementReal () {
    var me = document.createElement('em');
    me.innerHTML =
      '<li data-match-id="p85183-85184"' +
      ' data-text-sigle="GOE/AGI/00000"' +
      ' data-available-info="base/s=spans corenlp/c=spans corenlp/p=tokens corenlp/s=spans dereko/s=spans malt/d=rels opennlp/p=tokens opennlp/s=spans tt/l=tokens tt/p=tokens tt/s=spans"' +
      ' data-info="{&quot;UID&quot;:0,&quot;author&quot;:&quot;Goethe, Johann Wolfgang von&quot;,&quot;corpusID&quot;:null,&quot;corpusSigle&quot;:&quot;GOE&quot;,&quot;docID&quot;:null,&quot;docSigle&quot;:&quot;GOE\/AGI&quot;,&quot;layerInfos&quot;:&quot;base\/s=spans corenlp\/c=spans corenlp\/p=tokens corenlp\/s=spans dereko\/s=spans malt\/d=rels opennlp\/p=tokens opennlp\/s=spans tt\/l=tokens tt\/p=tokens tt\/s=spans&quot;,&quot;matchID&quot;:&quot;match-GOE\/AGI\/00000-p85183-85184&quot;,&quot;pubDate&quot;:&quot;1982&quot;,&quot;pubPlace&quot;:&quot;München&quot;,&quot;subTitle&quot;:&quot;Auch ich in Arkadien!&quot;,&quot;textID&quot;:null,&quot;textSigle&quot;:&quot;GOE\/AGI\/00000&quot;,&quot;title&quot;:&quot;Italienische Reise&quot;}"' +
      ' id="GOE/AGI/00000#p85183-85184">' +
      '<div>' + 
      '<div class="flag"></div>' +
      '<div class="snippet startMore endMore"><span class="context-left"><span class="more"></span>keine großen Flächen, aber sanft gegeneinander laufende Berg- und Hügelrücken, durchgängig mit Weizen und Gerste bestellt, die eine ununterbrochene Masse von Fruchtbarkeit dem Auge darbieten. der diesen Pflanzen geeignete Boden wird so genutzt und so geschont, daß man nirgends einen </span><span class="match"><mark>Baum</mark></span><span class="context-right"> sieht, ja, alle die kleinen Ortschaften und Wohnungen liegen auf Rücken der Hügel, wo eine hinstreichende Reihe Kalkfelsen den Boden ohnehin unbrauchbar macht. dort wohnen die Weiber das ganze Jahr, mit Spinnen und Weben beschäftigt, die Männer hingegen bringen zur<span class="more"></span></span></div>' +
      '</div>' +
      '<p class="ref"><strong>Italienische Reise</strong> von Goethe, Johann Wolfgang von (<time datetime="1982">1982</time>)  <span class="sigle">[GOE/AGI/00000]</span> </p>' +
      '</li>';
    return me.firstChild;
  };

  var beforeAllFunc = function () {
    // Override getMatchInfo API call
    KorAP.API.getMatchInfo = function (x, param, cb) {
      if (param['spans'] === undefined || param['spans'] === false)
        cb({ "snippet": snippet });
      else
        cb({ "snippet": treeSnippet });
    };
  };

  var afterAllFunc = function () {
    KorAP.API.getMatchInfo = undefined;
    KorAP.TreeMenu = undefined;
    var body = document.body;
    var i = body.children.length - 1;
    while (i >= 0) {
      if (body.children[i].nodeType && body.children[i].nodeType === 1) {
        body.removeChild(body.children[i]);
      };
      i--;
    };
  };
  
  
  //Test display and sorting of meta information 
  describe('KorAP.Meta', function(){
    beforeAll(beforeAllFunc);
    afterAll(afterAllFunc);  

	 	var met = new metaClass(match, fields);
	  var mel = met.element(); 
	  	  
	  // Meta information should be parsed into a list
	  it('should parse in a meta view', function(){
		  expect(mel.tagName).toEqual('DL');
		  expect(mel.children[0].tagName).toEqual('DIV');
		  expect(mel.children[0].children[0].tagName).toEqual('DT');
		  expect(mel.children[0].children[0].attributes[0].name).toEqual('title');
      expect(mel.children[0].children[1].tagName).toEqual('DD');
      expect(mel.children[0].children[1].getAttribute('data-type')).toEqual('type:text')
		
		  expect(mel.children[0].children[0].firstChild.nodeValue).toEqual('author');
		  expect(mel.children[0].children[1].firstChild.nodeValue).toEqual('Sprachpfleger, u.a.');
		  expect(mel.children[0].children[0].attributes[0].value).toEqual('author');
	  });
	  
	  
	  /* The keywords in the meta information list should be formatted to be able  
	     to chose each keyword separately in the corpusByMatch assistant. */
	  it('keywords should be formatted', function(){
		
		  //type:string or type:keyword should b not relevant
      expect(mel.children[1].children[1].getAttribute('data-type')).toEqual('type:string')
		  expect(mel.children[1].children[1].classList.contains('metakeyvalues')).toBeTruthy;
		  expect(mel.children[1].children[1].children[0].tagName).toEqual('DIV');
		  expect(mel.children[1].children[1].children[0].firstChild.nodeValue).toEqual('corenlp');
		  expect(mel.children[1].children[1].children[1].tagName).toEqual('DIV');
		  expect(mel.children[1].children[1].children[1].firstChild.nodeValue).toEqual('corenlp\/constituency');
		  
		  expect(mel.children[2].children[1].classList.contains('metakeyvalues')).toBeTruthy;
		  expect(mel.children[2].children[1].children[0].tagName).toEqual('DIV');
		  expect(mel.children[2].children[1].children[0].firstChild.nodeValue).toEqual('kultur');
		  expect(mel.children[2].children[1].children[1].tagName).toEqual('DIV');
		  expect(mel.children[2].children[1].children[1].firstChild.nodeValue).toEqual('film');		 
	  }); 

    it('attachements should be formatted', function(){
      //type:attachement with a link (legacy)
      expect(mel.children[3].children[1].getAttribute('data-type')).toEqual('type:attachement')
      expect(mel.children[3].children[1].classList.contains('metakeyvalues')).toBeFalsy;
      expect(mel.children[3].children[0].firstChild.nodeValue).toEqual('xlink');
      expect(mel.children[3].children[1].firstChild.textContent).toEqual('Cool');
      expect(mel.children[3].children[1].firstChild.tagName).toEqual('A');
      expect(mel.children[3].children[1].firstChild.getAttribute('href')).toEqual('https://de.wikipedia.org/wiki/Beispiel');

      //type:attachement with a link (uri encoded)
      expect(mel.children[4].children[1].getAttribute('data-type')).toEqual('type:attachement')
      expect(mel.children[4].children[1].classList.contains('metakeyvalues')).toBeFalsy;
      expect(mel.children[4].children[0].firstChild.nodeValue).toEqual('xlink2');
      expect(mel.children[4].children[1].firstChild.textContent).toEqual('Hallo!');
      expect(mel.children[4].children[1].firstChild.tagName).toEqual('A');
      expect(mel.children[4].children[1].firstChild.getAttribute('href')).toEqual('https://www.test.de');

      //type:attachement with plain text
      expect(mel.children[5].children[1].getAttribute('data-type')).toEqual('type:attachement')
      expect(mel.children[5].children[1].classList.contains('metakeyvalues')).toBeFalsy;
      expect(mel.children[5].children[0].firstChild.nodeValue).toEqual('xlink3');
      expect(mel.children[5].children[1].firstChild.nodeValue).toEqual('[INVALID URI]');
      
      //type:attachement with plain text
      expect(mel.children[6].children[1].getAttribute('data-type')).toEqual('type:attachement')
      expect(mel.children[6].children[1].classList.contains('metakeyvalues')).toBeFalsy;
      expect(mel.children[6].children[0].firstChild.nodeValue).toEqual('z-reference');
      expect(mel.children[6].children[1].firstChild.nodeValue).toEqual('This is a reference');
    }); 

    it('should mark metadata not in index', function () {
      let notInIndexField = Array.from(mel.children).find(function (field) {
        return field.children[0].firstChild.nodeValue === 'zz-notinindex';
      });

      expect(notInIndexField).toBeTruthy();
      expect(notInIndexField.children[1].classList.contains('notinindex')).toBeTruthy();
      expect(notInIndexField.children[1].firstChild.nodeValue).toEqual('Stored but not indexed');
    });
 
    
  
	  // Meta information should be sorted alphabetically
    it('should be alphabetically sorted', function(){
  	  var a = mel.children[0].children[0].firstChild.nodeValue;
  	  var b = mel.children[1].children[0].firstChild.nodeValue;
  	  var c = mel.children[2].children[0].firstChild.nodeValue;
  	  expect(a.localeCompare(b)).toBe(-1);
  	  expect(b.localeCompare(c)).toBe(-1);
    });


    it('should handle attachements', function () {
      let uri = new attachementClass("data:text/plain;title=new,Hallo");
      expect(uri.contentType).toEqual("text/plain");

      expect(uri.payload).toEqual("Hallo");
      expect(uri.base64).toBeFalsy();
      expect(uri.isLink).toBeFalsy();
      expect(uri.param["title"]).toEqual("new");

      uri = new attachementClass("data:application/x.korap-link,https://de.wikipedia.org/wiki/Beispiel");
      expect(uri.contentType).toEqual("application/x.korap-link");
      expect(uri.payload).toEqual("https://de.wikipedia.org/wiki/Beispiel");
      expect(uri.base64).toBeFalsy();
      expect(uri.isLink).toBeTruthy();
      expect(uri.inline().textContent).toEqual("https://de.wikipedia.org/wiki/Beispiel");
      expect(uri.inline().nodeType).toEqual(1);
      expect(uri.inline().tagName).toEqual("A");
      expect(uri.inline().getAttribute("rel")).toEqual("noopener noreferrer");


      uri = new attachementClass("data:application/x.korap-link;title=Das ist ein Titel,https://de.wikipedia.org/wiki/Beispiel");
      expect(uri.contentType).toEqual("application/x.korap-link");
      expect(uri.payload).toEqual("https://de.wikipedia.org/wiki/Beispiel");
      expect(uri.base64).toBeFalsy();
      expect(uri.isLink).toBeTruthy();
      expect(uri.inline().textContent).toEqual("Das ist ein Titel");
      expect(uri.inline().nodeType).toEqual(1);
      expect(uri.inline().tagName).toEqual("A");
      expect(uri.inline().getAttribute("rel")).toEqual("noopener noreferrer");

      
      uri = new attachementClass("data:text/plain;base64,SGVsbG8sIFdvcmxkIQ%3D%3D");
      expect(uri.contentType).toEqual("text/plain");
      expect(uri.payload).toEqual("Hello, World!");
      expect(uri.base64).toBeTruthy();
      expect(uri.isLink).toBeFalsy();
      expect(uri.inline().nodeType).toEqual(3);
      expect(uri.inline().textContent).toEqual("Hello, World!");

      uri = new attachementClass("data:text/plain;title= new ; subTitle = old ;base64,SGVsbG8sIFdvcmxkIQ%3D%3D");
      expect(uri.contentType).toEqual("text/plain");
      expect(uri.payload).toEqual("Hello, World!");
      expect(uri.param["title"]).toEqual("new");
      expect(uri.param["subTitle"]).toEqual("old");
      expect(uri.base64).toBeTruthy();
      expect(uri.isLink).toBeFalsy();
      expect(uri.inline().nodeType).toEqual(3);
      expect(uri.inline().textContent).toEqual("Hello, World!");
    });
  });


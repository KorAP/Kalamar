"use strict";

define(function () {
  const loc = KorAP.Locale;
  loc.OR = 'oder';
  loc.AND = 'und';
  // EMPTY, DELETE

  // Virtual corpus:
  loc.VC_allCorpora = 'allen Korpora';
  loc.VC_oneCollection = 'einem virtuellen Korpus';

  // Regex:
  loc.REGEX_DESC = loc.REGEX_DESC || 'Regulären Ausdruck verwenden';

  // Date picker:
  loc.WDAY = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  loc.MONTH = [
    'Januar', 'Februar', 'März', 'April',
    'Mai', 'Juni', 'Juli', 'August',
    'September', 'Oktober', 'November',
    'Dezember'
  ];

  // Match view
  loc.ADDTREE   = 'Relationen';
  loc.SHOWANNO  = 'Token';
  loc.SHOWINFO  = 'Informationen';
  loc.CLOSE     = 'Schließen';
  loc.MINIMIZE  = 'Zuklappen';
  loc.DOWNLOAD  = 'Herunterladen';
  loc.TOGGLE_ALIGN = 'tausche Textausrichtung';
  loc.SHOW_KQ      = 'zeige KoralQuery';
  loc.SHOW_META    = 'Metadaten';
  loc.NEW_QUERY = 'Neue Anfrage';
  
  //Corpus statistic
  loc.SHOW_STAT = 'Korpusstatistik';
  loc.REFRESH = 'Neu laden';
 
  loc.NEW_CONSTRAINT = 'Neue Bedingung';

  //Guided Tour:Buttonlabels
  loc.TOUR_lprev = "Zurück";
  loc.TOUR_lnext = "Weiter";
  loc.TOUR_ldone = "Beenden";
  loc.TOUR_ldoneSearch = "Suchen";
  //Guided Tour: Steps
  loc.TOUR_welcti = " <span class='tgreeting'> Willkommen zur KorAP Tour! </span>";
  loc.TOUR_welc = "Hier zeigen wir Ihnen einige wichtige Funktionalitäten von KorAP. " +
                  "Wir führen Sie Schritt für Schritt anhand eines Beispiels durch die Anwendung.";
  loc.TOUR_sear1ti = "Suchanfrage";
  loc.TOUR_sear1 = "Hier können Sie die Suchanfrage eingeben, zum Beispiel die Suche nach '" + loc.TOUR_Qexample + "'." ;
  loc.TOUR_searAnnotti = "Annotationsassistent (1)";
  loc.TOUR_searAnnot ="<p>Für die Suche nach Annotationen steht der Annotationsassistent zur Verfügung.</p>" +
            "<p>Er wird ausgewählt, in dem Sie auf den kleinen orangen Balken unter dem Sucheingabefenster klicken " +
            "oder die Pfeiltaste nach unten &darr; betätigen.</p>";
  loc.TOUR_annotAssti = "Annotationsassistent (2)";
  loc.TOUR_annotAss = "Der Annotationsassistent erleichert die Formulierung von Suchanfragen mit Annotationen.";
  
  loc.TOUR_vccho1ti = "Auswahl der Korpora",
  loc.TOUR_vccho1 = "Hier gelangen Sie zum Korpusassistenten.";
  loc.TOUR_vccho2ti = "Korpusassistent (1)";
  loc.TOUR_vccho2 = "Im Korpusassistenten ist die Definition von Subkorpora durch die Verknüpfung beliebiger Metadatenfelder möglich.";
  loc.TOUR_vccho3ti = "Korpusassistent (2)";
  loc.TOUR_vccho3 = "Einige der bekannten Metadatenfelder werden in einem DropDown-Menü angezeigt.";
  loc.TOUR_vccho4ti = "Korpusassistent (3)";
  loc.TOUR_vccho4 = "Ein Beispiel: Bilden eines virtuellen Korpus, der alle Texte mit der Dokumentsigle " + loc.TOUR_DocSigle + " enthält.";
  loc.TOUR_vcStat1ti =  "Korpusstatistik (1)",
  loc.TOUR_vcStat1 = "Anzeige der Korpusstatistik.";
  loc.TOUR_vcStat2ti = "Korpusstatistik (2)",
  loc.TOUR_vcStat2 = "Hier sehen sie die Korpusstatistik.";
  loc.TOUR_qlfieldti =  "Suchanfragen",
  loc.TOUR_qlfield = "In KorAP können mehrere Suchanfragesprachen verwendet werden. Welche Sie verwenden wollen, wählen Sie hier aus.";
  loc.TOUR_glimpseti = "Glimpse",
  loc.TOUR_glimpse = "Durch das Aktivieren dieser Option legen Sie fest, dass nur die ersten Treffer in undefinierter Reihenfolge angezeigt werden.";
  loc.TOUR_helpti = "Hilfe",
  loc.TOUR_help = "Hier finden Sie die Hilfe zu KorAP.";
  loc.TOUR_seargoti = "Suche",
  loc.TOUR_seargo = "Durch das Klicken auf das Lupensymbol wird die Suchanfrage gestartet.";
    
  //Guided Tour: explain the result
  loc.TOUR_kwicti = "Ergebnisse";
  loc.TOUR_kwic = "Die Ergebnisse der Suche werden hier als KWIC (keyword in context) angezeigt. Vor dem KWIC steht die jeweilige Textsigle des Treffers.";
  loc.TOUR_snippetti = "KWIC";
  loc.TOUR_snippet = "Klicken Sie auf das KWIC um einen größeren Kontext anzuzeigen.";  
  loc.TOUR_snippetbti ="Snippet";
  loc.TOUR_snippetb = "Unter der Anzeige des Snippets finden sie vor dem  Quellennachweis eine Buttonleiste um weitere Ansichten des Ergebnisses zu erhalten.";
  loc.TOUR_metadatabti = "Metadaten (1)";
  loc.TOUR_metadatab = "Klicken Sie hier um die Metadaten anzuzeigen.";
  loc.TOUR_metadatati = "Metadaten (2)";
  loc.TOUR_metadata = "Anzeige der Metadaten";
  loc.TOUR_tokenbti ="Token-Annotationen";
  loc.TOUR_tokenb = "Um die Token-Annotationen anzuzeigen, wählen Sie diesen Button.";
  loc.TOUR_tokenti = "Annotationen"; 
  loc.TOUR_token = "KorAP unterstützt multiple Annotationen.";
  //HK TODO kein schöner Titel
  loc.TOUR_treebti ="Relationen (1)";
  loc.TOUR_treeb = "Unter \"" + loc.ADDTREE + "\" ist eine Auswahl weiterer Ansichten möglich.";
  loc.TOUR_treeti = "Relationen (2)";
  loc.TOUR_tree = "Diese können können als Baum- oder Bogenansichten angezeigt werden.";
  loc.TOUR_tourdone = "Viel Spaß mit KorAP!";

  // Pagination panel
  loc.RANDOM_PAGE = 'Zufallsseite';

});

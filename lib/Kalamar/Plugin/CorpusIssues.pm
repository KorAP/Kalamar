package Kalamar::Plugin::CorpusIssues;
use Mojo::Base 'Mojolicious::Plugin';
use utf8;

sub register {
  my ($plugin, $app) = @_;
  my $url = $ENV{KALAMAR_CORPUS_ISSUES} || $app->config('Kalamar')->{corpus_issues};
  return unless $url;
  $url =~ s!/+$!!;
  unless ($url =~ m!^https?://[^/]+/!) {
    $app->log->warn('corpus_issues ignored, as it is no http(s) URL: ' . $url);
    return;
  };

  $app->defaults(corpus_issues => $url);
  push @{$app->renderer->classes}, __PACKAGE__;
  $app->plugin('Localize' => {dict => {
    de => {
      Nav => {issues => 'Korpusfehler'},
      Template => {doc => {corpus => {issues => 'de/doc/corpus/issues'}}}
    },
    -en => {
      Nav => {issues => 'Corpus Issues'},
      Template => {doc => {corpus => {issues => 'doc/corpus/issues'}}}
    }
  }});

  # Navigation is configured after plugins are loaded. Resolve it at render
  # time, without modifying the instance's navigation or adding startup hooks.
  my $corpus = sub {
    my $c = shift;
    return (grep { ($_->{id} // '') eq 'corpus' } @{$c->config('doc_navi')})[0];
  };
  $app->content_block('navigation.doc.corpus' => sub {
    my $c = shift;
    my $section = $corpus->($c);
    return '' if $section && grep { ($_->{id} // '') eq 'issues' } @{$section->{items} // []};
    return $c->render_to_string(template => 'corpus_issues/link');
  });
  $app->content_block('navigation.doc' => sub {
    my $c = shift;
    return '' if $corpus->($c);
    return $c->render_to_string(template => 'corpus_issues/section');
  });
};

1;

__DATA__

@@ corpus_issues/link.html.ep
<li<%== stash('scope') && stash('scope') eq 'corpus' && stash('page') eq 'issues' ? ' class="active"' : '' %>><%= link_to loc('Nav_issues', 'Corpus Issues'), url_with('doc', scope => 'corpus', page => 'issues')->fragment('page-top') %></li>

@@ corpus_issues/section.html.ep
<li><%= link_to loc('Nav_corpus', 'Corpus'), url_with('doc', scope => 'corpus', page => 'issues')->fragment('page-top') %>
<%== navigation('doc', 'corpus', []) %></li>

@@ doc/corpus/issues.html.ep
% my $issues = stash 'corpus_issues';
% layout 'main', title => 'KorAP: ' . loc('Nav_issues', 'Corpus Issues');

%= page_title

<p>Errors in the corpus data, such as wrong or missing metadata, faulty tokenisation or annotation, or missing, duplicated or damaged texts, are collected in a <%= ext_link_to 'public issue tracker on GitHub', "$issues/issues" %>. Please check there first whether an error is already known.</p>

<section>
  <h3>How can I report an error?</h3>
  <p>To <%= ext_link_to 'report a new error', "$issues/issues/new" %>, you need a GitHub account. To help us locate and fix the error, please include</p>
  <ul>
    <li>the name of the corpus and the sigle of the affected text (as shown in the metadata of a match),</li>
    <li>your query, ideally as a link to the search result (the address shown in your browser),</li>
    <li>a short description of the error and, if possible, of the correct form.</li>
  </ul>
</section>

<section>
  <h3>Please respect copyright</h3>
  <p><strong>Error reports are publicly visible.</strong> As most corpus texts are protected by copyright, please quote no more than a few words around the error. Instead of copying longer passages, please refer to the affected location by its text sigle and a link to the search result.</p>
</section>

<section>
  <h3>Errors in the software</h3>
  <p>Problems with KorAP itself, for example with the search or the user interface, are not corpus errors. Please report them in the <%= ext_link_to 'issue tracker of the KorAP frontend', 'https://github.com/KorAP/Kalamar/issues' %>.</p>
</section>

@@ de/doc/corpus/issues.html.ep
% my $issues = stash 'corpus_issues';
% layout 'main', title => 'KorAP: ' . loc('Nav_issues', 'Korpusfehler');

%= page_title

<p>Fehler in den Korpusdaten, etwa falsche oder fehlende Metadaten, fehlerhafte Tokenisierung oder Annotation oder fehlende, doppelte oder beschädigte Texte, werden in einem <%= ext_link_to 'öffentlichen Ticketsystem auf GitHub', "$issues/issues" %> gesammelt. Bitte prüfen Sie dort zuerst, ob ein Fehler bereits bekannt ist.</p>

<section>
  <h3>Wie kann ich einen Fehler melden?</h3>
  <p>Um <%= ext_link_to 'einen neuen Fehler zu melden', "$issues/issues/new" %>, benötigen Sie ein GitHub-Konto. Damit wir den Fehler finden und beheben können, geben Sie bitte Folgendes an:</p>
  <ul>
    <li>den Namen des Korpus und die Sigle des betroffenen Texts (wie in den Metadaten eines Treffers angezeigt),</li>
    <li>Ihre Suchanfrage, am besten als Link auf das Suchergebnis (die Adresse in Ihrem Browser),</li>
    <li>eine kurze Beschreibung des Fehlers und, wenn möglich, der korrekten Form.</li>
  </ul>
</section>

<section>
  <h3>Bitte beachten Sie das Urheberrecht</h3>
  <p><strong>Fehlermeldungen sind öffentlich einsehbar.</strong> Da die meisten Korpustexte urheberrechtlich geschützt sind, zitieren Sie bitte höchstens wenige Wörter um die fehlerhafte Stelle. Statt längere Passagen zu kopieren, verweisen Sie bitte über die Textsigle und einen Link auf das Suchergebnis auf die betroffene Stelle.</p>
</section>

<section>
  <h3>Fehler in der Software</h3>
  <p>Probleme mit KorAP selbst, zum Beispiel mit der Suche oder der Benutzeroberfläche, sind keine Korpusfehler. Bitte melden Sie diese im <%= ext_link_to 'Ticketsystem des KorAP-Frontends', 'https://github.com/KorAP/Kalamar/issues' %>.</p>
</section>

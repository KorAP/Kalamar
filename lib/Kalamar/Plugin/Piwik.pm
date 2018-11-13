package Kalamar::Plugin::Piwik;
use Mojo::Base 'Mojolicious::Plugin';

sub register {
  my ($plugin, $mojo, $param) = @_;

  # Load Piwik if not yet loaded
  unless (exists $mojo->renderer->helpers->{piwik_tag}) {
    $mojo->plugin('Piwik');
  };

  # Add opt-out to FAQ
  $mojo->content_block(
    'faq' => {
      inline => '<section name="piwik-opt-out">' .
        '<h3><%= loc("Piwik_HowToOptOut", "How can I opt-out?") %></h3>' .
        '<%= piwik_tag "opt-out" %>' .
        '</section>'
      }
  );

  # Add piwik tag to scripts
  $mojo->content_block(scripts => {
    inline => '<%= piwik_tag %>'
  });

  # Add event handler for korap requests
  $mojo->content_block(scripts => {
    inline => <<'SCRIPT'
% if (stash('piwik.embed')) {
  %= javascript begin
window.addEventListener('korapRequest', function(e) {
  _paq.push(['setReferrerUrl', location.href]);
  _paq.push(['setCustomUrl', e.detail.url]);
  _paq.push(['trackPageView']);
});
  % end
% }
SCRIPT
  });
};


1;


__END__

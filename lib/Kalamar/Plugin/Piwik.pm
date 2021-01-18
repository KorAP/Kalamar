package Kalamar::Plugin::Piwik;
use Mojo::Base 'Mojolicious::Plugin';

sub register {
  my ($plugin, $mojo, $param) = @_;

  # Load parameter from Config file
  if (my $config_param = $mojo->config('Kalamar')) {
    if ($config_param->{Piwik}) {
      $param = {
        %$param,
        %{$config_param->{Piwik}}
      };
    };
  };

  # Add event handler for korap requests
  my $piwik_conf = $mojo->config('Piwik');
  if ($piwik_conf) {
    $piwik_conf->{append} //= '';
  }
  else {
    $piwik_conf = { append => '' };
    $mojo->config(Piwik => $piwik_conf);
  };

  $piwik_conf->{append} .= <<APPEND;
;window.addEventListener('korapRequest', function(e) {
    let _paq=window._paq=window._paq||[];
    _paq.push(['setDocumentTitle', e.detail.title]);
    _paq.push(['setReferrerUrl', location.href]);
    _paq.push(['setCustomUrl', e.detail.url]);
    _paq.push(['trackPageView']);
})
APPEND

  # Load Piwik if not yet loaded
  unless (exists $mojo->renderer->helpers->{piwik_tag}) {
    $mojo->plugin('Piwik');
  };

  # Add random string plugin
  $mojo->plugin('Util::RandomString' => {
    piwik_rand_id => {
      alphabet => '0123456789abcdef',
      length   => 16
    }
  });

  # Add opt-out to FAQ
  $mojo->content_block(
    'faq' => {
      inline => '<section name="piwik-opt-out">' .
        '<h3><%= loc("Piwik_HowToOptOut", "How can I opt-out from Matomo?") %></h3>' .
        '<%= piwik_tag "opt-out" %>' .
        '</section>'
      }
  );

  # Add tracking code as <script/> instead of inline
  if ($param->{csp_compliant}) {

    # Set track script for CORS compliant tracking
    $mojo->routes->any('/js/tracking.js')->piwik('track_script');

    # Add piwik tag to scripts
    $mojo->content_block(scripts => {
      inline => q!<%= piwik_tag 'as-script' %>!
    });
  }

  # Add tracking code inline
  else {

    # Add piwik tag to scripts
    $mojo->content_block(scripts => {
      inline => '<%= piwik_tag %>'
    });
  };

  # If all requests should be pinged,
  # establish this hook
  if ($param->{ping_requests}) {
    $mojo->hook(
      after_render => sub {
        my $c = shift;

        # Only track valid routes
        my $route = $c->current_route or return;

        # This won't forward personalized information
        my $hash = {
          action_url => $c->url_for->to_abs,
          action_name => $route,
          ua => '',
          urlref => '',
          send_image => 0,
          dnt => 0,
          uid => $c->random_string('piwik_rand_id')
        };

        # Overrid ping site id
        if ($param->{ping_site_id}) {
          $hash->{idsite} = $param->{ping_site_id}
        };

        # Send track
        $c->piwik->api_p(Track => $hash)->wait;
      }
    );
  };
};


1;


__END__

# Parameters can be loaded from
# {
#   Kalamar => {
#     Piwik => {
#       ping_requests => 1,
#       ping_site_id => 12
#     }
#   }
# }

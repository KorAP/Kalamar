package Korap::Plugin::KorapMatchInfo;
use Mojo::Base 'Mojolicious::Plugin';

sub register {
  my ($plugin, $mojo, $param) = @_;
  $param ||= {};

  # Load parameter from Config file
  if (my $config_param = $mojo->config('KorAP')) {
    $param = { %$param, %$config_param };
  };

  my $api = $param->{api};

  # Todo: Make this recognize the user!
  $mojo->helper(
    info_on => sub {
      my $c = shift;
      my $src = shift;

#/resource/matchInfo?id=match-WPD!WPD_TTT.07206-p151-152&f=treetagger&l=morpho&spans=true

      $src = 'VirtualCollection' if $src eq 'collection';
      $src = 'Corpus' if $src eq 'corpus';

      my $url = Mojo::URL->new($api)->path('resource/' . $src);

      my $chi = $c->chi;
      if (my $json = $chi->get($url->to_string)) {
	return $json;
      }
      elsif (my $response = $c->ua->get($url)->success) {
	my $json = $response->json;
	$c->chi->set($url->to_string => $json);
	return $json;
      };
      $c->notify(error => 'Unable to retrieve resource');
      return [];
    }
  );
};


1;

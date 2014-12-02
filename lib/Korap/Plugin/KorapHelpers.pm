package Korap::Plugin::KorapHelpers;
use Mojo::Base 'Mojolicious::Plugin';

sub register {
  my ($plugin, $mojo) = @_;

  $mojo->helper(
    korap_test_port => sub {
      my $c = shift;
      if (defined $c->stash('korap.test_port')) {
	return $c->stash('korap.test_port');
      };

      if ($c->req->url->to_abs->port == 6666 ||
	    $c->app->mode =~ m/^development|test$/) {
	$c->stash('korap.test_port' => 1);
	return 1;
      };

      $c->stash('korap.test_port' => 0);
      return 0;
    });
};

1;

package Kalamar::Plugin::KalamarHelpers;
use Mojo::Base 'Mojolicious::Plugin';

sub register {
  my ($plugin, $mojo) = @_;

  $mojo->helper(
    kalamar_test_port => sub {
      my $c = shift;
      if (defined $c->stash('kalamar.test_port')) {
	return $c->stash('kalamar.test_port');
      };

      if ($c->req->url->to_abs->port == 6666 ||
	    $c->app->mode =~ m/^development|test$/) {
	$c->stash('kalamar.test_port' => 1);
	return 1;
      };

      $c->stash('kalamar.test_port' => 0);
      return 0;
    });
};

1;

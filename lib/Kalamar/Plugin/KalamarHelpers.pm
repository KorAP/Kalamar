package Kalamar::Plugin::KalamarHelpers;
use Mojo::Base 'Mojolicious::Plugin';


# Helpers for Kalamar
sub register {
  my ($plugin, $mojo) = @_;

  # Check for test port
  $mojo->helper(
    kalamar_test_port => sub {
      my $c = shift;

      # Test port is defined in the stash
      if (defined $c->stash('kalamar.test_port')) {
	return $c->stash('kalamar.test_port');
      };

      # Check the port
      if ($c->req->url->to_abs->port == 6666 ||
	    $c->app->mode =~ m/^development|test$/) {
	$c->stash('kalamar.test_port' => 1);
	return 1;
      };

      # No test port
      $c->stash('kalamar.test_port' => 0);
      return 0;
    });
};

1;

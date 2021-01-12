package Kalamar::Plugin::QueryReference;
use Mojo::Base 'Mojolicious::Plugin';

# This is a plugin to support query references.
# It currently only mocks endpoints for development purposes.

sub register {
  my ($plugin, $mojo) = @_;

  $mojo->plugin(CHI => {
    queryref => {
      driver => 'Memory',
      global => 1
    }
  });

  # Establishes routes under '/query'
  my $r = $mojo->routes;

  $r->add_type('qname' => qr![-_\.a-zA-Z0-9]+!);

  # List queries
  $r->get('/query')->to(
    cb => sub {
      my $c = shift;
      my $chi = $c->chi('queryref');
      my $qs = $chi->get('~queries') // [];
      my @queries = ();
      foreach (@$qs) {
        push @queries, $chi->get($_);
      };
      return $c->render(json => \@queries);
    }
  );


  # Create query
  $r->put('/query/<qname:qname>' => )->to(
    cb => sub {
      my $c = shift;
      my $v = $c->validation;

      # Missing: type, definition

      $v->required('q');
      $v->required('desc');

      my $qname = $c->stash('qname');
      my $chi = $c->chi('queryref');

      if ($v->has_error() || $chi->is_valid($qname)) {
        return $c->render(
          json => {
            errors => [
              {
                message => 'Unable to store query reference'
              }
            ]
          }, status => 400
        );
      };

      # Set query reference
      $chi->set($qname => {
        name => $qname,
        koralQuery => $v->param('q'), # TODO: Actually this is KQ - not pq or similar
        description => $v->param('desc')
      });

      my $queries = $chi->get('~queries') // [];
      push @$queries, $qname;
      $chi->set('~queries' => $queries);

      return $c->render(
        status => 201,
        text => ''
      );
    }
  );


  # Delete query
  $r->delete('/query/<qname:qname>')->to(
    cb => sub {
      my $c = shift;

      my $qname = $c->stash('qname');
      my $chi = $c->chi('queryref');

      $chi->remove($qname);

      my $queries = $chi->get('~queries') // [];

      my @clean = ();
      foreach (@$queries) {
        push @clean, $_ unless $_ eq $qname
      };
      $chi->set('~queries' => \@clean);

      return $c->render(
        status => 201,
        text => ''
      );
    }
  );


  # Retrieve query
  $r->get('/query/<qname:qname>')->to(
    cb => sub {
      my $c = shift;
      my $qname = $c->stash('qname');

      my $chi = $c->chi('queryref');
      my $json = $chi->get($qname);

      if ($json) {
        return $c->render(
          json => $json
        );
      };

      return $c->render(
        json => {
          errors => [
            {
              message => 'Query reference not found'
            }
          ]
        }, status => 404
      );
    }
  );
};


1;

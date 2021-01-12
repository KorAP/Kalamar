package Kalamar::Plugin::QueryReference;
use Mojo::Base 'Mojolicious::Plugin';

# This is a plugin to support query references.
# It currently only mocks endpoints for development purposes.

sub register {
  my ($plugin, $mojo) = @_;

  # Namespace not yet established
  unless (exists $mojo->renderer->helpers->{chi} &&
            $mojo->chi('queryref')) {
    $mojo->plugin(CHI => {
      queryref => {
        driver => 'Memory',
        global => 1
      }
    });
  };

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
      $v->optional('ql');
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
        q => $v->param('q'),
        ql => $v->param('ql'),
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


  # Create query
  $r->put('/query2/<qname:qname>' => )->to(
    cb => sub {
      my $c = shift;
      my $v = $c->validation;

      # Missing: definition
      $v->required('q');
      $v->optional('ql');
      $v->required('desc');

      my $qname = $c->stash('qname');

      if ($v->has_error()) {
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

      # Get user handle
      my $user = $c->user_handle;
      if ($user eq 'not_logged_in') {
        return $c->render(
          json => {
            errors => [
              message => 'User not logged in'
            ]
          }, status => 400
        );
      };

      # API for query adding
      my $url = Mojo::URL->new($c->korap->api);
      $url->path->parts(['query', '~' . $user, $qname]);

      my $json = {
        type => 'PRIVATE',
        queryType => 'QUERY',
        queryLanguage => $v->param('ql') // 'poliqarp',
        query => $v->param('q'),
        description => $v->param('desc')
      };

      # Issue backend request
      $c->korap_request('put', $url => {} => $json)->then(
        sub {
          my $tx = shift;
          # Catch errors and warnings
          return ($c->catch_errors_and_warnings($tx) ||
                    Mojo::Promise->reject);
        }
      )->then(
        sub {
          my $json = shift;
          $c->notify_on_warnings($json);
          $c->stash(api_response => $json);
          return $json;
        }
      );

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
        status => 200,
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

package Kalamar::Plugin::QueryReference;
use Mojo::Base 'Mojolicious::Plugin';

# This is a plugin to support query references.
# It currently only mocks endpoints for development purposes.

sub register {
  my ($plugin, $mojo) = @_;

  # Namespace not yet established
  if ($ENV{QUERY_REF_MOCKUP}) {
    unless (exists $mojo->renderer->helpers->{chi} &&
              $mojo->chi('queryref')) {
      $mojo->plugin(CHI => {
        queryref => {
          driver => 'Memory',
          global => 1
        }
      });
    };
  };

  # Establishes routes under '/query'
  my $r = $mojo->routes;

  $r->add_type('qname' => qr![-_\.a-zA-Z0-9]+!);

  
  # List queries
  $r->get('/query')->to(
    cb => sub {
      my $c = shift;
      #$c->res->headers->header('Access-Control-Allow-Origin' => '127.0.0.1:3000'); #Does not seem to be necessary

      # Use mock up
      if ($ENV{QUERY_REF_MOCKUP}) {
        my $chi = $c->chi('queryref');
        my $qs = $chi->get('~queries') // [];
        my @queries = ();
        foreach (@$qs) {
          push @queries, $chi->get($_);
        };
        return $c->render(json => \@queries);
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

      $c->render_later;

      # API for query adding
      my $url = Mojo::URL->new($c->korap->api);
      $url->path->merge(
        Mojo::Path->new->parts(['query', '~' . $user])
        )->trailing_slash(0);

      # Issue backend request
      $c->korap_request('get', $url)->then(
        sub {
          my $tx = shift;

          # Catch errors and warnings
          if ($c->catch_errors_and_warnings($tx)) {
            my $json = $tx->res->json;
            if ($json) {
              $c->notify_on_warnings($json);
              $c->stash(api_response => $json);
            };
            return $c->render(
              status => $tx->res->code,
              json => $json
            );
          };
          Mojo::Promise->reject;
        }
      )->catch(
        sub {
          my $err_msg = shift;

          # Only raised in case of connection errors
          if ($err_msg) {
            $c->notify(error => { src => 'Backend' } => $err_msg)
          };

          return $c->render(
            status => 400,
            json => $c->notifications(json => {})
          );
        }
      );
    }
  );


  # Create query
  $r->put('/query/<qname:qname>')->to(
    cb => sub {
      my $c = shift;
      #$c->res->headers->header('Access-Control-Allow-Origin' => '127.0.0.1:3000'); #Does not seem to be necessary
      my $v = $c->validation;

      # Missing: definition
      $v->required('q');
      $v->optional('ql');
      $v->optional('desc');

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

      # Use mock up
      if ($ENV{QUERY_REF_MOCKUP}) {
        my $chi = $c->chi('queryref');
        if ($chi->is_valid($qname)) {
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

        my $json = {
          name => $qname,
          # TODO: Actually this is KQ - not pq or similar
          koralQuery => $v->param('q'),
          q => $v->param('q'),
          ql => ($v->param('ql') // 'poliqarp')
        };

        if ($v->param('desc')) {
          $json->{description} = $v->param('desc');
        };

        # Set query reference
        $chi->set($qname => $json);

        my $queries = $chi->get('~queries') // [];
        push @$queries, $qname;
        $chi->set('~queries' => $queries);

        return $c->render(
          status => 201,
          text => ''
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
      $url->path->merge(
        Mojo::Path->new->parts(['query', '~' . $user, $qname])
        )->trailing_slash(0);

      my $json = {
        type => 'PRIVATE',
        queryType => 'QUERY',
        queryLanguage => ($v->param('ql') // 'poliqarp'),
        query => $v->param('q')
      };

      if ($v->param('desc')) {
        $json->{description} = $v->param('desc');
      };

      $c->render_later;

      # Issue backend request
      $c->korap_request('put', $url => json => $json)->then(
        sub {
          my $tx = shift;

          if ($tx->res->is_error) {
            my $json = $tx->res->json;
            $c->notify_on_warnings($json);
            $c->stash(api_response => $json);
            return $c->render(
              status => $tx->res->code,
              json => $json
            );
          };

          return $c->render(
            status => 201,
            text => ''
          );
        }
      )->catch(
        sub {
          my $err_msg = shift;

          # Only raised in case of connection errors
          if ($err_msg) {
            $c->notify(error => { src => 'Backend' } => $err_msg)
          };

          return $c->render(
            status => 400,
            json => $c->notifications(json => {})
          );
        }
      );
    }
  );


  # Delete query
  $r->delete('/query/<qname:qname>')->to(
    cb => sub {
      my $c = shift;
      #$c->res->headers->header('Access-Control-Allow-Origin' => '127.0.0.1:3000'); #Does not seem to be necessary
      my $qname = $c->stash('qname');

      # Use mock up
      if ($ENV{QUERY_REF_MOCKUP}) {
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

      $c->render_later;

      # API for query adding
      my $url = Mojo::URL->new($c->korap->api);
      $url->path->merge(
        Mojo::Path->new->parts(['query', '~' . $user, $qname])
        )->trailing_slash(0);

      # Issue backend request
      $c->korap_request('delete', $url)->then(
        sub {
          my $tx = shift;

          if ($tx->res->is_error) {
            my $json = $tx->res->json;
            $c->notify_on_warnings($json);
            $c->stash(api_response => $json);
            return $c->render(
              status => $tx->res->code,
              json => $json
            );
          };

          return $c->render(
            status => 200,
            text => ''
          );
        }
      )->catch(
        sub {
          my $err_msg = shift;

          # Only raised in case of connection errors
          if ($err_msg) {
            $c->notify(error => { src => 'Backend' } => $err_msg)
          };

          return $c->render(
            status => 400,
            json => $c->notifications(json => {})
          );
        }
      );
    }
  );


  # Retrieve query
  $r->get('/query/<qname:qname>')->to(
    cb => sub {
      my $c = shift;
      #$c->res->headers->header('Access-Control-Allow-Origin' => '127.0.0.1:3000'); #Does not seem to be necessary
      my $qname = $c->stash('qname');

      # Use mock up
      if ($ENV{QUERY_REF_MOCKUP}) {
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
      $url->path->merge(
        Mojo::Path->new->parts(['query', '~' . $user, $qname])
        )->trailing_slash(0);

      # Issue backend request
      $c->korap_request('get', $url)->then(
        sub {
          my $tx = shift;

          if ($tx->res->code == 404) {
            return $c->render(
              status => 404,
              json => $tx->res->json
            );
          };

          # Catch errors and warnings
          if ($c->catch_errors_and_warnings($tx)) {
            my $json = $tx->res->json;
            if ($json) {
              $c->notify_on_warnings($json);
              $c->stash(api_response => $json);
            };
            return $c->render(
              status => $tx->res->code,
              json => $json
            );
          };
          Mojo::Promise->reject;
        }
      )->catch(
        sub {
          my $err_msg = shift;

          # Only raised in case of connection errors
          if ($err_msg) {
            $c->notify(error => { src => 'Backend' } => $err_msg)
          };

          return $c->render(
            status => 400,
            json => $c->notifications(json => {})
          );
        }
      );
    }
  );
};


1;

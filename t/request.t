use Mojolicious::Lite;
use Test::More tests => 17;
use Mojolicious::Controller;

use_ok('Kalamar::Request');

my $req = Kalamar::Request->new(
  url => 'http://www.example.com',
  method => 'POST',
  controller => Mojolicious::Controller->new
)->param('x', 'y');

is($req->method, 'POST');
is($req->url, 'http://www.example.com');
ok($req->controller);
is_deeply($req->param, ['x','y'], 'Compare');

my $err;
$req->start->catch(
  sub {
    $err = shift
  })->finally(
    sub {
      is($err,'No useragent defined','Error');
    })->wait;

my $c = $req->controller;
$c->app(app);
ok($req->controller(undef),'Set controller');

$req->start->catch(
  sub {
    $err = shift
  })->finally(
    sub {
      is($err,'No controller defined','Error');
    })->wait;

ok($req->url(undef),'Set URL');

$req->start->catch(
  sub {
    $err = shift
  })->finally(
    sub {
      is($err,'No URL defined','Error');
    })->wait;

put '/test' => sub {
  shift->render(text => 'Hallo')
};

# Set UA
ok($req->ua(Mojo::UserAgent->new));
$req->ua->server->app->log->level('fatal');
ok($req->controller($c));
ok($req->method('put'));
ok($req->url('/test'));
ok($req->param(undef));

$err = undef;
$req->start->then(
  sub {
    my $tx = shift;
    is($tx->res->body,'Hallo');
  })->catch(
    sub {
      $err = shift;
    })->finally(
      sub {
        ok(!$err);
      })->wait;

done_testing;
__END__

1;

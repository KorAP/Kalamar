package Kalamar::Plugin::DemoServer;
use Mojo::Base 'Mojolicious::Plugin';

sub register {
  my ($plugin, $mojo) = @_;

  $mojo->log->warn('THIS IS A DEMO SERVER!','NEVER USE IN PRODUCTION!');

  my $demo_dir = $mojo->home->child('dev', 'demo');

  $mojo->routes->get('/demo/:file', [format => ['html','js']])->to(
    cb => sub {
      my $c = shift;
      return $c->reply->file(
        $demo_dir->child($c->stash('file') . '.' . $c->stash('format'))
      );
    }
  );
};


1;

use Mojolicious::Lite;

my $base = app->home->child('..', '..');

push @{app->static->paths}, $base->child('dev');

app->start;

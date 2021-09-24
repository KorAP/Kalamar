use Mojolicious::Lite;

my $base = app->home->child('..', '..');
app->moniker('kalamar');

push @{app->static->paths}, $base->child('dev');

app->start;

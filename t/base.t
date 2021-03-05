use Mojo::Base -strict;
use Test::More;
use Test::Mojo;
use Mojo::JSON qw'decode_json';

my $t = Test::Mojo->new('Kalamar');

ok(my $file = $t->app->home->rel_file('kalamar.secret.json'));
ok(-e $file, 'File exists');

my $secrets = decode_json($file->slurp);
ok(@$secrets >= 1);
ok(length $secrets->[0] >= 5);

ok($file->lstat->mode & 0600);

done_testing;

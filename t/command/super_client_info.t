#!usr/bin/env perl
use Mojolicious::Lite;
use Mojolicious::Commands;
use Data::Dumper;
use Test::Output qw/:stdout :stderr :combined :functions/;
use Test::More;
use Test::Mojo;
use Mojo::Util qw/decode encode/;
use Mojo::JSON qw/decode_json/;
use Mojo::File 'path';
use File::Temp 'tempdir';

my $t = Test::Mojo->new('Kalamar');

my $dir = tempdir CLEANUP => 1;
chdir $dir;

my $dir_ext = tempdir CLEANUP => 1;

my $cmds = $t->app->commands;

like(
  join(' ', @{$cmds->namespaces}),
  qr!Mojolicious::Command!,
  'Namespace is set'
);

like(
  join(' ', @{$cmds->namespaces}),
  qr!Kalamar::Command!,
  'Namespace is set'
);

stdout_like(
  sub {
    local $ENV{HARNESS_ACTIVE} = 0;
    $cmds->run('super-client-info');
  },
  qr/\[write\].*super_client_info/,
  'Write'
);

stdout_unlike(
  sub {
    local $ENV{HARNESS_ACTIVE} = 0;
    $cmds->run('super-client-info');
  },
  qr/\[write\].*super_client_info/,
  'Already exists'
);

my $file = path($dir, 'super_client_info');

my $out = decode_json($file->slurp);

like($out->{client_id},qr!^.{20}$!);
like($out->{client_secret},qr!^.{20}$!);

unlink $file->to_string;

stdout_like(
  sub {
    local $ENV{HARNESS_ACTIVE} = 0;
    $cmds->run('super-client-info', 'my-client');
  },
  qr/\[write\].*super_client_info/,
  'Write with client id'
);

$out = decode_json($file->slurp);

like($out->{client_id}, qr!my-client$!);
like($out->{client_secret}, qr!^.{20}$!);

my $file_ext = path($dir_ext, 'super_client_fun');

stdout_like(
  sub {
    local $ENV{HARNESS_ACTIVE} = 0;
    $cmds->run('super-client-info', 'my-client-2', $file_ext);
  },
  qr/\[write\].*super_client_fun/,
  'Error'
);

$out = decode_json($file->slurp);

like($out->{client_id}, qr!my-client$!);
like($out->{client_secret}, qr!^.{20}$!);

my $secret_1 = $out->{client_secret};

$out = decode_json($file_ext->slurp);

like($out->{client_id}, qr!my-client-2$!);
like($out->{client_secret}, qr!^.{20}$!);

my $secret_2 = $out->{client_secret};

isnt($secret_1, $secret_2, 'Generated secrets differ');


done_testing;
__END__

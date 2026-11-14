use Mojo::Base -strict;
use Test::Mojo;
use Test::More;
use Mojo::File qw/path/;

#####################
# Start Fake server #
#####################
my $mount_point = '/realapi/';
$ENV{KALAMAR_API} = $mount_point;

my $fixtures_path = path(Mojo::File->new(__FILE__)->dirname, 'server');

sub kalamar {
  my $t = Test::Mojo->new('Kalamar' => { Kalamar => { @_ } });
  $t->app->plugin(
    Mount => { $mount_point => $fixtures_path->child('mock.pl') }
  )->pattern->defaults->{app}->log($t->app->log);
  return $t;
};

# Export is not offered by default
my $t = kalamar();

$t->get_ok('/?q=baum')
  ->status_is(200)
  ->element_exists('#search > ol')
  ->element_exists_not('#export-template');

$t->get_ok('/export/export/config')
  ->status_is(404);

# Export is offered with a single setting
my $export_path = '/realexport';
$t = kalamar(export => $export_path);

$t->app->plugin(
  Mount => { $export_path => $fixtures_path->child('plugin-ex.pl') }
)->pattern->defaults->{app}->log($t->app->log);

$t->app->ua->server->app($t->app);

$t->get_ok('/?q=baum&cq=corpusSigle+%3D+GOE')
  ->status_is(200)
  ->element_exists('#export-template[data-title="Export matches"]')
  ->element_exists('#export-template form[action="/export/export"][method=POST]')
  ->element_exists('#export-template input[type=hidden][name=q][value=baum]')
  ->element_exists('#export-template input[type=hidden][name=ql][value=poliqarp]')
  ->element_exists('#export-template input[type=hidden][name=cq][value="corpusSigle = GOE"]')
  ->element_exists('#export-template input[type=radio][name=format][value=rtf][checked]')
  ->element_exists('#export-template input[type=radio][name=format][value=csv]:not([checked])')
  ->element_exists('#export-template input[type=number][name=hitc]')
  ->element_exists('#export-template input[type=checkbox][name=randomizePageOrder][value=true]')
  ->element_exists('#export-template input[type=number][name=seed][value=42]')
  ->element_exists('#export-template input[type=submit][value=Export]');

# The service is reached through the proxy
$t->get_ok('/export/')
  ->status_is(200)
  ->content_is('Hello base world!');

$t->get_ok('/export/export/config')
  ->status_is(200)
  ->content_is('Hello world! export/config');

# There is nothing to export without matches
$t->get_ok('/?q=paum')
  ->status_is(200)
  ->element_exists_not('#export-template');

# Localization
$t->get_ok('/?q=baum' => { 'Accept-Language' => 'de-DE, en-US, en' })
  ->status_is(200)
  ->element_exists('#export-template[data-title="Treffer exportieren"]')
  ->element_exists('#export-template input[type=submit][value=Exportieren]');

# The form respects a proxy prefix
$t = kalamar(export => $export_path, proxy_prefix => '/instance/test');

$t->get_ok('/?q=baum')
  ->status_is(200)
  ->element_exists('#export-template form[action="/instance/test/export/export"]');

done_testing;

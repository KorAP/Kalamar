use Mojo::Base -strict;
use Test::More;
use Test::Mojo;

our %ENV;

my $app = Test::Mojo->new('Kalamar')->app;
# Get API version from app config (set in Kalamar.pm startup)
my $api_version = $app->app->config('Kalamar')->{api_version};
is($app->korap->api, "https://korap.ids-mannheim.de/api/v".$api_version. "/");


$ENV{KALAMAR_API} = 'https://example.com/';
$app = Test::Mojo->new('Kalamar')->app;
is($app->korap->api, "https://example.com/v".$api_version ."/");

$app = Test::Mojo->new('Kalamar' => {
  Kalamar => {
    api_path => 'https://example.org/'
  }
})->app;
is($app->korap->api, "https://example.org/v".$api_version."/");

$ENV{KALAMAR_API} = undef;
$app = Test::Mojo->new('Kalamar' => {
  Kalamar => {
    api_version => '1.1'
  }
})->app;
is($app->korap->api, 'https://korap.ids-mannheim.de/api/v1.1/');


done_testing;
__END__

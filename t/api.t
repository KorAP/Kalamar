use Mojo::Base -strict;
use Test::More;
use Test::Mojo;

our %ENV;

my $app = Test::Mojo->new('Kalamar')->app;
is($app->korap->api, 'https://korap.ids-mannheim.de/api/v1.0/');


$ENV{KALAMAR_API} = 'https://example.com/';
$app = Test::Mojo->new('Kalamar')->app;
is($app->korap->api, 'https://example.com/v1.0/');

$app = Test::Mojo->new('Kalamar' => {
  Kalamar => {
    api_path => 'https://example.org/'
  }
})->app;
is($app->korap->api, 'https://example.org/v1.0/');

$ENV{KALAMAR_API} = undef;
$app = Test::Mojo->new('Kalamar' => {
  Kalamar => {
    api_version => '1.1'
  }
})->app;
is($app->korap->api, 'https://korap.ids-mannheim.de/api/v1.1/');


done_testing;
__END__

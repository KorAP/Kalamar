package Kalamar::Plugin::StartWithBackend::start_with_backend;
use Mojo::Base 'Mojolicious::Command';
use Mojolicious::Command::daemon;

has description => 'Start Kalamar and the Kustvakt service';
has usage       => sub {
  my $kustvakt = $ENV{KUSTVAKT_PATH};
  return "\n" . qx{java -jar $kustvakt --help} if $kustvakt;
  return "\nThe jar file for Kustvakt can be set using\n" .
    "the environment variable KUSTVAKT_PATH\n";
};

sub run {
  my $kustvakt = $ENV{KUSTVAKT_PATH};
  unless ($kustvakt) {
    warn 'KUSTVAKT_PATH not set';
    return 0;
  };

  system("java -jar $kustvakt &");

  Mojolicious::Command::daemon::build_server(@_)->run;
  return 1;
};

1;

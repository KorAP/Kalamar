package Kalamar::Command::super_client_info;
use Mojo::Base 'Mojolicious::Command';

has description => 'Generate random super_client_info file';
has usage       => sub { shift->extract_usage };

sub run {
  my $self = shift;
  my $client_id = shift;

  # Path for super client file
  my $path = shift || $self->rel_file('super_client_info');

  my $app = $self->app;

  $app->plugin(
    'Mojolicious::Plugin::Util::RandomString',
    entropy => 256,
    printable => {
      alphabet => '2345679bdfhmnprtFGHJLMNPRT',
      length   => 20
    }
  );

  my $secret = $app->random_string('printable');

  unless ($client_id) {
    $client_id = $app->random_string('printable');
  };

  my $c = $self->app->build_controller;

  $self->write_file(
    $path,
    $c->render_to_string(
      json => {
        client_id => $client_id,
        client_secret => $secret
      }
    )
  );
};

1;

=encoding utf8

=head1 NAME

Kalamar::Command::super_client_info - Generate random super_client_info file

=head1 SYNOPSIS

  Usage: APPLICATION super_client_info

    kalamar super_client_info
    kalamar super_client_info 'my-client'
    kalamar super_client_info 'my-client' './output/super_client_info'

  Options:
    -h, --help   Show this summary of available options

=head1 DESCRIPTION

L<Kalamar::Command::super_client_info> generates C<super_client_info>
files with a client ID (either random or passed) and a randomized client secret.

This file can be used by Kalamar and Kustvakt (full) to have a common secret.

=head1 ATTRIBUTES

L<Kalamar::Command::Author::generate::super_client_info> inherits all attributes from L<Mojolicious::Command> and implements
the following new ones.

=head2 description

  my $description    = $super_client_info->description;
  $super_client_info = $super_client_info->description('Foo');

Short description of this command, used for the command list.

=head2 usage

  my $usage          = $super_client_info->usage;
  $super_client_info = $super_client_info->usage('Foo');

Usage information for this command, used for the help screen.

=head1 METHODS

L<Kalamar::Command::super_client_info> inherits all methods from L<Mojolicious::Command> and implements
the following new ones.

=head2 run

  $super_client_info->run(@ARGV);

Run this command.

=head1 SEE ALSO

L<Mojolicious>, L<Mojolicious::Guides>, L<https://mojolicious.org>.

=cut

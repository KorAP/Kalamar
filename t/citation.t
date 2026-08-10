use Mojo::Base -strict;
use Test::More;
use Test::Mojo;
use Mojo::File qw/curfile/;

my $t = Test::Mojo->new('Kalamar');
push @{$t->app->renderer->paths}, curfile->dirname;

my $c = $t->app->build_controller;

# By default all three shipped parts are used; Kalamar ships no corpus, so
# the corpus part is a placeholder.
my $default = $c->include('partial/citation');
like($default, qr/Under Construction/, 'corpus part is a placeholder by default');
like($default, qr/KorAP architecture/, 'korap part is shipped');
like($default, qr/MaltParser/, 'annotation part is shipped');

# Each part can be replaced by an instance template.
my $custom = $c->include('partial/citation',
  corpus_citation => 'custom/partial/citation/corpus');
like($custom, qr/The Example Corpus/, 'corpus part replaced by the instance template');
unlike($custom, qr/Under Construction/, 'placeholder no longer rendered');
like($custom, qr/KorAP architecture/, 'korap part still inherited');
like($custom, qr/MaltParser/, 'annotation part still inherited');

done_testing;

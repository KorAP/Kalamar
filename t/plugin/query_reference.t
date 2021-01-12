use Mojo::Base -strict;
use Test::More;
use Test::Mojo;

# Test the documentation
my $t = Test::Mojo->new('Kalamar');

# Load query reference plugin
$t->app->plugin('Kalamar::Plugin::QueryReference');

$t->put_ok('/query/baum')
  ->status_is(400)
  ->json_like('/errors/0/message', qr!unable!i)
  ;

$t->put_ok('/query/baum?q=[orth=Baum]&desc=Eine Baum-Query')
  ->status_is(201)
  ->content_is('')
  ;

$t->put_ok('/query/frage?q=[orth=Frage]&desc=Eine Frage-Query&ql=poliqarp')
  ->status_is(201)
  ->content_is('')
  ;

$t->put_ok('/query/baum?q=[orth=Baum]&desc=Eine Baum-Query')
  ->status_is(400)
  ->json_like('/errors/0/message', qr!unable!i)
  ;

$t->get_ok('/query')
  ->status_is(200)
  ->json_is('/0/name', 'baum')
  ->json_is('/1/name', 'frage')
  ;

$t->get_ok('/query/frage')
  ->status_is(200)
  ->json_is('/name', 'frage')
  ->json_is('/description', 'Eine Frage-Query')
  ->json_is('/koralQuery', '[orth=Frage]')
  ->json_is('/q', '[orth=Frage]')
  ->json_is('/ql', 'poliqarp')
  ;

$t->delete_ok('/query/frage')
  ->status_is(200)
  ->content_is('')
  ;

$t->delete_ok('/query/frage2')
  ->status_is(200)
  ->content_is('')
  ;

$t->get_ok('/query')
  ->status_is(200)
  ->json_is('/0/name', 'baum')
  ->json_hasnt('/1')
  ;

$t->get_ok('/query/frage')
  ->status_is(404)
  ->json_is('/errors/0/message', 'Query reference not found')
  ;

$t->get_ok('/query/baum')
  ->status_is(200)
  ->json_is('/name', 'baum')
  ->json_is('/description', 'Eine Baum-Query')
  ->json_is('/koralQuery', '[orth=Baum]')
  ->json_is('/q', '[orth=Baum]')
  ->json_is('/ql', undef)
  ;

done_testing();

use Mojo::Base -strict;
use Test::More;
use Test::Mojo;

# Test 1: Default foundries (no configuration)
subtest 'Default foundries' => sub {
  my $t = Test::Mojo->new('Kalamar');
  
  my $defaults = $t->app->defaults('hint_foundries');
  is_deeply(
    $defaults,
    [qw(base corenlp dereko malt marmot opennlp spacy tt)],
    'Default foundries are set correctly'
  );
  
  # Check that data-hint-foundries is rendered in HTML
  $t->get_ok('/')
    ->status_is(200)
    ->attr_like('body', 'data-hint-foundries', qr/base/)
    ->attr_like('body', 'data-hint-foundries', qr/corenlp/)
    ->attr_like('body', 'data-hint-foundries', qr/spacy/);
};


# Test 2: Custom foundries via config (inclusions only)
subtest 'Custom foundries via config' => sub {
  my $t = Test::Mojo->new('Kalamar' => {
    Kalamar => {
      hint_foundries => ['base', 'marmot', 'tt']
    }
  });
  
  my $defaults = $t->app->defaults('hint_foundries');
  is_deeply(
    $defaults,
    ['base', 'marmot', 'tt'],
    'Custom foundries are set correctly'
  );
  
  $t->get_ok('/')
    ->status_is(200)
    ->attr_like('body', 'data-hint-foundries', qr/base/)
    ->attr_like('body', 'data-hint-foundries', qr/marmot/)
    ->attr_like('body', 'data-hint-foundries', qr/tt/)
    ->attr_unlike('body', 'data-hint-foundries', qr/corenlp/)
    ->attr_unlike('body', 'data-hint-foundries', qr/spacy/);
};


# Test 3: Exclusions via config (e.g., -spacy, -corenlp)
subtest 'Exclusions via config' => sub {
  my $t = Test::Mojo->new('Kalamar' => {
    Kalamar => {
      hint_foundries => ['-spacy', '-corenlp']
    }
  });
  
  my $defaults = $t->app->defaults('hint_foundries');
  
  # Should contain all defaults except spacy and corenlp
  ok((grep { $_ eq 'base' } @$defaults), 'Contains base');
  ok((grep { $_ eq 'dereko' } @$defaults), 'Contains dereko');
  ok((grep { $_ eq 'malt' } @$defaults), 'Contains malt');
  ok((grep { $_ eq 'marmot' } @$defaults), 'Contains marmot');
  ok((grep { $_ eq 'opennlp' } @$defaults), 'Contains opennlp');
  ok((grep { $_ eq 'tt' } @$defaults), 'Contains tt');
  ok(!(grep { $_ eq 'spacy' } @$defaults), 'Does not contain spacy');
  ok(!(grep { $_ eq 'corenlp' } @$defaults), 'Does not contain corenlp');
  
  $t->get_ok('/')
    ->status_is(200)
    ->attr_like('body', 'data-hint-foundries', qr/base/)
    ->attr_unlike('body', 'data-hint-foundries', qr/spacy/)
    ->attr_unlike('body', 'data-hint-foundries', qr/corenlp/);
};


# Test 4: Environment variable KALAMAR_HINT_FOUNDRIES
subtest 'Environment variable' => sub {
  local $ENV{KALAMAR_HINT_FOUNDRIES} = 'base,tt,marmot';
  
  my $t = Test::Mojo->new('Kalamar');
  
  my $defaults = $t->app->defaults('hint_foundries');
  is_deeply(
    $defaults,
    ['base', 'tt', 'marmot'],
    'Foundries from environment variable'
  );
  
  $t->get_ok('/')
    ->status_is(200)
    ->attr_like('body', 'data-hint-foundries', qr/base,tt,marmot/);
};


# Test 5: Environment variable with exclusions
subtest 'Environment variable with exclusions' => sub {
  local $ENV{KALAMAR_HINT_FOUNDRIES} = '-spacy,-opennlp';
  
  my $t = Test::Mojo->new('Kalamar');
  
  my $defaults = $t->app->defaults('hint_foundries');
  
  ok((grep { $_ eq 'base' } @$defaults), 'Contains base');
  ok((grep { $_ eq 'corenlp' } @$defaults), 'Contains corenlp');
  ok(!(grep { $_ eq 'spacy' } @$defaults), 'Does not contain spacy');
  ok(!(grep { $_ eq 'opennlp' } @$defaults), 'Does not contain opennlp');
};


# Test 6: Environment variable overrides config
subtest 'Environment variable overrides config' => sub {
  local $ENV{KALAMAR_HINT_FOUNDRIES} = 'base,tt';
  
  my $t = Test::Mojo->new('Kalamar' => {
    Kalamar => {
      hint_foundries => ['corenlp', 'marmot', 'spacy']
    }
  });
  
  my $defaults = $t->app->defaults('hint_foundries');
  is_deeply(
    $defaults,
    ['base', 'tt'],
    'Environment variable takes precedence over config'
  );
};


# Test 7: Empty config foundries array uses defaults
subtest 'Empty config uses defaults' => sub {
  my $t = Test::Mojo->new('Kalamar' => {
    Kalamar => {
      hint_foundries => []
    }
  });
  
  my $defaults = $t->app->defaults('hint_foundries');
  is_deeply(
    $defaults,
    [qw(base corenlp dereko malt marmot opennlp spacy tt)],
    'Empty array results in defaults'
  );
};


# Test 8: Case insensitivity of exclusions
subtest 'Case insensitive exclusions' => sub {
  my $t = Test::Mojo->new('Kalamar' => {
    Kalamar => {
      hint_foundries => ['-SPACY', '-CoreNLP']
    }
  });
  
  my $defaults = $t->app->defaults('hint_foundries');
  
  ok(!(grep { lc($_) eq 'spacy' } @$defaults), 'Does not contain spacy (case insensitive)');
  ok(!(grep { lc($_) eq 'corenlp' } @$defaults), 'Does not contain corenlp (case insensitive)');
  ok((grep { $_ eq 'base' } @$defaults), 'Still contains base');
};


done_testing;
__END__

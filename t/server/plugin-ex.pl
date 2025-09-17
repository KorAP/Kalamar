#!/usr/bin/env perl
use Mojolicious::Lite;
use strict;
use warnings;

# Base page
get '/' => sub {
  shift->render(text => 'Hello base world!');
};

get '/*all' => sub {
  my $c = shift;
  $c->render(text => 'Hello world! ' . $c->stash('all'));
};

app->start;

use Mojo::Base -strict;
use Test::More;
use Test::Mojo;
use Mojolicious::Lite;

my $link_cb_called = 0;

plugin 'TagHelpers::ContentBlock';

plugin 'Kalamar::Plugin::Markdown' => {
  heading_offset => 2,
  link_callback  => sub {
    my ($c, $url, $text) = @_;
    $link_cb_called++;
    if ($url =~ m{^/doc/}) {
      return qq{<a href="$url" class="embedded-link">$text</a>};
    }
    if ($url =~ m{^https?://}) {
      return qq{<a href="$url" target="_top">$text</a>};
    }
    return undef;
  },
};

get '/md-inline' => sub {
  shift->render(
    handler => 'md',
    inline  => "# Heading\n\nSome **bold** text.\n"
  );
};

get '/md-page' => sub {
  shift->render(
    template => 'test_page',
    handler  => 'md',
    format   => 'html',
    name     => 'World'
  );
};

get '/md-helper' => sub {
  shift->render(
    template => 'test_helper',
    handler  => 'ep',
    format   => 'html'
  );
};

get '/md-links' => sub {
  shift->render(
    handler => 'md',
    inline  => "[FAQ](/doc/faq)\n\n[GitHub](https://github.com)\n\n[relative](page)\n"
  );
};

get '/md-html' => sub {
  shift->render(
    handler => 'md',
    inline  => qq{<pre class="query tutorial"><code>Baum</code></pre>\n\nSome text.\n}
  );
};

get '/md-ep' => sub {
  shift->render(
    template => 'test_ep',
    handler  => 'md',
    format   => 'html',
    title    => 'Test Title'
  );
};

get '/md-table' => sub {
  shift->render(
    handler => 'md',
    inline  => "| A | B |\n|---|---|\n| 1 | 2 |\n"
  );
};

get '/md-comment' => sub {
  shift->render(
    handler => 'md',
    inline  => "<!-- maintenance note -->\n\nVisible text.\n\n"
             . "Inline <!-- hidden --> text.\n\n"
             . "    <!-- in a code block -->\n"
  );
};

get '/md-content-block' => sub {
  my $c = shift;
  $c->content_block('test_block' => { inline => '<span class="from-block">block content</span>' });
  $c->render(
    template => 'test_content_block',
    handler  => 'md',
    format   => 'html'
  );
};

get '/md-details' => sub {
  shift->render(
    handler => 'md',
    inline  => "<details>\n<summary>More</summary>\n\n### Section\n\n- item\n\n</details>\n"
  );
};

my $t = Test::Mojo->new;

ok($t->app->renderer->handlers->{md}, 'md handler registered');

ok($t->app->renderer->helpers->{markdown}, 'markdown helper registered');

$t->get_ok('/md-inline')
  ->status_is(200)
  ->content_like(qr/<h3>Heading<\/h3>/)
  ->content_like(qr/<strong>bold<\/strong>/)
  ;

$t->get_ok('/md-inline')
  ->content_like(qr/<h3>/)
  ->content_unlike(qr/<h1>/)
  ;

$t->get_ok('/md-page')
  ->status_is(200)
  ->content_like(qr/Hello, World/)
  ->content_like(qr/<h3>/)
  ;

$t->get_ok('/md-helper')
  ->status_is(200)
  ->content_like(qr/<h3>Helper Section<\/h3>/)
  ->content_like(qr/<strong>works<\/strong>/)
  ;

$link_cb_called = 0;
$t->get_ok('/md-links')
  ->status_is(200)
  ->content_like(qr/class="embedded-link"/)
  ->content_like(qr/target="_top"/)
  ->content_like(qr/<a href="page">relative/)
  ;
ok($link_cb_called >= 3, 'link callback was called');

$t->get_ok('/md-html')
  ->status_is(200)
  ->content_like(qr/<pre class="query tutorial">/)
  ->content_like(qr/<code>Baum<\/code>/)
  ;

$t->get_ok('/md-ep')
  ->status_is(200)
  ->content_like(qr/Test Title/)
  ;

$t->get_ok('/md-table')
  ->status_is(200)
  ->content_like(qr/<table>/)
  ->content_like(qr/<td>1<\/td>/)
  ;

$t->get_ok('/md-content-block')
  ->status_is(200)
  ->content_like(qr/class="from-block"/)
  ->content_like(qr/block content/)
  ;

# HTML5 block elements (details/summary/...) survive conversion: the stray
# <p> wrapper Text::MultiMarkdown adds is removed and the inner Markdown is
# still converted.
$t->get_ok('/md-details')
  ->status_is(200)
  ->content_like(qr/<details>/)
  ->content_like(qr/<summary>More<\/summary>/)
  ->content_like(qr/<\/details>/)
  ->content_unlike(qr/<p>\s*<details>/)
  ->content_unlike(qr/<p>\s*<summary>/)
  ->content_unlike(qr/<p>\s*<\/details>/)
  ->content_like(qr/<li>item<\/li>/)
  ;

# Unwrapping can be disabled
my $wrapped = Mojolicious->new;
$wrapped->plugin('Kalamar::Plugin::Markdown' => { unwrap_html5_blocks => 0 });
like(
  $wrapped->build_controller->markdown("<details>\n<summary>x</summary>\n</details>\n"),
  qr/<p>\s*<details>/,
  'block unwrapping skipped with unwrap_html5_blocks => 0'
);

$t->get_ok('/md-comment')
  ->status_is(200)
  ->content_unlike(qr/maintenance note/)
  ->content_unlike(qr/hidden/)
  ->content_like(qr/Visible text\./)
  ->content_like(qr/Inline\s*text\./)
  ->content_like(qr/&lt;!-- in a code block --&gt;/)
  ;

# Comments are kept when the option is disabled
my $keep = Mojolicious->new;
$keep->plugin('Kalamar::Plugin::Markdown' => { strip_comments => 0 });
like(
  $keep->build_controller->markdown("<!-- kept -->\n\nText.\n"),
  qr/<!-- kept -->/,
  'comment kept with strip_comments => 0'
);

done_testing;

__DATA__

@@ test_page.html.md
# Welcome

Hello, <%= $name %>!

@@ test_helper.html.ep
<div>
%= markdown begin
# Helper Section
This **works** well.
% end
</div>

@@ test_ep.html.md
# Page: <%= $title %>

This page is about **<%= $title %>**.

@@ test_content_block.html.md
# Content Block Test

%= content_block 'test_block'

Some **markdown** after the block.

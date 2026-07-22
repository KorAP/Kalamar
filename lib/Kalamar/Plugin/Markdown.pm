package Kalamar::Plugin::Markdown;
use Mojo::Base 'Mojolicious::Plugin';
use Mojo::ByteStream 'b';
use Text::MultiMarkdown;

sub register {
  my ($plugin, $app, $conf) = @_;

  # Load parameter from config file
  if (my $config_param = $app->config('Kalamar')) {
    if ($config_param->{Markdown}) {
      $conf = {
        %$conf,
        %{$config_param->{Markdown}}
      };
    };
  };

  my $heading_offset = $conf->{heading_offset} // 2;
  my $link_cb        = $conf->{link_callback};
  my $strip_comments = $conf->{strip_comments} // 1;
  my $unwrap_blocks  = $conf->{unwrap_html5_blocks} // 1;
  my $m              = Text::MultiMarkdown->new(
    heading_ids => 0,
    %{$conf // {}}
  );

  # Get embedded Perl handler
  my $ep_handler = $app->renderer->handlers->{ep};

  # Add "md" extension handler to the renderer
  $app->renderer->add_handler(md => sub {
    my ($renderer, $c, $output, $options) = @_;

    # Process the template with the embedded Perl handler
    $ep_handler->($renderer, $c, $output, $options);

    # Convert the output to HTML using the markdown converter
    if (defined $$output && !ref $$output) {
      $$output = _to_html($m, $$output, $c, $heading_offset, $link_cb, $strip_comments, $unwrap_blocks);
    }
  });

  # Add "markdown" helper to the application
  $app->helper(markdown => sub {
    my ($c, $content) = @_;
    $content = $content->() if ref $content eq 'CODE';
    return b(_to_html($m, "$content", $c, $heading_offset, $link_cb, $strip_comments, $unwrap_blocks));
  });
}

# HTML5 block-level elements that Text::MultiMarkdown does not know about
# (its block-tag list predates HTML5). A stray tag of one of these on its own
# line is treated as inline content and paragraph-wrapped, producing invalid
# markup such as "<p><details></p>". See _to_html.
my $HTML5_BLOCKS = qr/details|summary|section|article|aside|figure|figcaption|nav|header|footer|main/i;

# Convert the text to HTML using the markdown converter
sub _to_html {
  my ($m, $text, $c, $heading_offset, $link_cb, $strip_comments, $unwrap_blocks) = @_;

  # Use Text::MultiMarkdown to convert the text to HTML
  my $html = $m->markdown($text);

  # Drop HTML comments, so maintenance notes in the source document do not
  # end up in the page source. Done after the conversion, where comments
  # quoted in code blocks and code spans are escaped and therefore kept.
  if ($strip_comments) {
    $html =~ s/<!--.*?-->\s*//gs;
  }

  # Undo the paragraph-wrapping Text::MultiMarkdown applies to HTML5 block
  # elements it does not recognize, so authors can use <details>/<summary>
  # collapsibles, <section>, <figure> etc. in Markdown documents. Markdown
  # inside such blocks is still converted (only the stray wrapper is removed):
  # "<p><details></p>" becomes "<details>", and a paragraph whose whole
  # content is one such element (e.g. "<p><summary>…</summary></p>") is
  # likewise unwrapped.
  if ($unwrap_blocks) {
    $html =~ s{<p>\s*(</?(?:$HTML5_BLOCKS)\b[^>]*>)\s*</p>}{$1}g;
    $html =~ s{<p>\s*(<(?:$HTML5_BLOCKS)\b[^>]*>.*?</(?:$HTML5_BLOCKS)>)\s*</p>}{$1}gs;
  }

  if ($heading_offset) {
    for my $src (reverse 1 .. 6) {
      my $dst = $src + $heading_offset;
      $dst = 6 if $dst > 6;
      next if $src == $dst;
      $html =~ s{<(/?)h$src([\s>])}{<${1}h${dst}${2}}g;
    }
  }

  if ($link_cb) {
    $html =~ s{<a href="([^"]*)">(.*?)</a>}{
      my ($url, $text) = ($1, $2);
      $link_cb->($c, $url, $text) // $&
    }gse;
  }

  return $html;
}

1;

__END__

=pod

=encoding utf8

=head1 NAME

Kalamar::Plugin::Markdown - Markdown template support for Kalamar

=head1 DESCRIPTION

Adds a C<md> renderer handler and a C<markdown> helper using
L<Text::MultiMarkdown>. Templates (C<*.html.md>) are first
processed by the EP handler, then converted to HTML.

When both C<.html.ep> and C<.html.md> exist, C<.html.ep> takes
precedence (C<ep> is the default handler).

B<Limitations:> Fenced code blocks (triple backticks) are not
supported by L<Text::MultiMarkdown>; use 4-space indentation.
EP C<begin>/C<end> blocks may produce line breaks that get
wrapped in C<< <p> >> tags; prefer single-line helper calls.

=head1 OPTIONS

=head2 heading_offset

Number of levels added to Markdown headings (default: C<2>).
Capped at C<h6>. Set to C<0> to disable.

=head2 strip_comments

Remove HTML comments from the generated markup (default: C<1>).
Set to C<0> to keep them. Comments are removed after the Markdown
conversion, so comments quoted inside code blocks or code spans
are not affected -- but comments inside raw HTML blocks are.

=head2 unwrap_html5_blocks

Undo the paragraph-wrapping L<Text::MultiMarkdown> applies to HTML5
block-level elements it does not recognize (default: C<1>). Its
block-tag list predates HTML5, so a stray C<< <details> >>,
C<< <summary> >>, C<< <section> >>, C<< <article> >>, C<< <aside> >>,
C<< <figure> >>, C<< <figcaption> >>, C<< <nav> >>, C<< <header> >>,
C<< <footer> >> or C<< <main> >> tag on its own line is otherwise
emitted as invalid markup such as C<< <p><details></p> >>. Markdown
inside such elements is still converted. Set to C<0> to disable.

=head2 link_callback

  sub { my ($c, $url, $text) = @_; ... }

Post-processes plain Markdown-generated C<< <a> >> tags.
Return replacement HTML or C<undef> to keep the original.
Links from EP helpers (which have extra attributes) are
not matched.

=head2 multimarkdown

Extra options passed to L<Text::MultiMarkdown/new>.

=head1 HELPERS

=head2 markdown

  %= markdown begin
  ## Section
  Some **bold** text.
  % end

Converts Markdown to HTML inside C<.html.ep> templates.

=head1 SEE ALSO

L<Text::MultiMarkdown>, L<Kalamar::Plugin::KalamarPages>.

=cut

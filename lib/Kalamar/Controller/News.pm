package Kalamar::Controller::News;
use Mojo::Base 'Mojolicious::Controller';

sub news {
    my $self = shift;

    # Fetch the user's language preference
    my $lang = $self->app->localize->preference // 'en';  # Default to 'en' if no preference is found

    # Pass $lang to the template
    $self->stash(lang => $lang);

    # Render the news template
    $self->render(template => 'news', layout => 'main');
}

1;

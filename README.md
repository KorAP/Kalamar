![Kalamar](https://raw.githubusercontent.com/KorAP/Kalamar/master/dev/demo/img/kalamar.png)

Kalamar is a [Mojolicious](http://mojolicio.us/)-based user interface
frontend for the [KorAP Corpus Analysis Platform](http://korap.ids-mannheim.de/).

![Kalamar Screenshots](https://raw.githubusercontent.com/KorAP/Kalamar/master/dev/demo/img/screenshots.png)

## Setup

The easiest way to install and run Kalamar is using [Docker](https://www.docker.com/).

```shell
$ docker pull korap/kalamar
```

Then start Kalamar listening on port `64543`.

```shell
$ docker run --network host --name kalamar korap/kalamar
```

Kalamar will be available at `http://localhost:64543`.

See the [description on docker hub](https://hub.docker.com/r/korap/kalamar)
regarding further information.

## Setup for Development

To fetch the latest version of Kalamar ...

```shell
$ git clone https://github.com/KorAP/Kalamar
```

### Generate Static Asset Files

To generate the static asset files (scripts, styles, images ...),
you need NodeJS >= 6.0.0.
For processing Sass, you will need Ruby with
the `sass` gem in addition.
This will probably need administration
rights, depending on your installation path.
These tools may also be available with a package manager.

You can check, if all tools are available using

```shell
$ npm -v
$ sass -v
```

Afterwards you can install grunt and run grunt to create the assets.

```shell
$ cd Kalamar
$ npm install -g grunt-cli
$ npm install
$ grunt
```

Whenever the assets change, just rerun `grunt`.

### Start Server

Kalamar uses the [Mojolicious](http://mojolicio.us/) framework,
that expects a Perl version of at least 5.10.1.
The recommended environment is based on [Perlbrew](http://perlbrew.pl/)
with [App::cpanminus](http://search.cpan.org/~miyagawa/App-cpanminus/).

Some perl modules are not on CPAN yet, so you need to install them from GitHub.
The easiest way to do this is using
[App::cpanminus](http://search.cpan.org/~miyagawa/App-cpanminus/).
This will probably need administration rights.

```shell
$ cpanm git://github.com/Akron/Mojolicious-Plugin-Localize.git
$ cpanm git://github.com/Akron/Mojolicious-Plugin-TagHelpers-ContentBlock.git
```

Then install the dependencies using
[App::cpanminus](http://search.cpan.org/~miyagawa/App-cpanminus/)
(there is no need to install Kalamar)
and run the test suite.

```shell
$ cd Kalamar
$ cpanm --installdeps .
$ perl Makefile.PL
$ make test
```

Kalamar can be deployed like all
[Mojolicious apps](http://mojolicio.us/perldoc/Mojolicious/Guides/Cookbook#DEPLOYMENT).
The easiest way is to start the built-in server:

```shell
$ perl script/kalamar daemon
```

Kalamar will then be available at `localhost:3000` in your browser.

By default, Kalamar tries to connect to `https://korap.ids-mannheim.de/api/`,
followed by the most current version of the API.
You may change that endpoint to the KorAP API provider in the configuration
(see [Kustvakt](https://github.com/KorAP/Kustvakt) for further information)
or by using the environment variable `KALAMAR_API`.


## Configuration

The basic configuration file is `kalamar.conf`. To define derivations,
create a configuration file with the pattern `kalamar.myconf.conf` and
follow the descriptions in `kalamar.conf`.

To start Kalamar with a derivative configuration, set the `MOJO_MODE`
environment variable.

```shell
$ MOJO_MODE=myconf perl script/kalamar daemon
```

For client-side configurations, a file `kalamar.conf.js` can be
introduced, that will be consulted during the build process, loading
optional components using a `require(...)` directive (see example below).

### Secret file

Kalamar uses [rotating secrets](https://mojolicious.org/perldoc/Mojolicious#secrets)
to sign cookies. Put a file called `kalamar.secret` in the root of the application
with one secret per line.

### Localization

To create a localized version of Kalamar, start the `localize` command
with the target locale as its argument, e.g. `pl` for polish.

```shell
$ perl script/kalamar localize pl
```

The newly defined dictionary file can then be modified and added to the resources
definition of the `Localize` plugin in the configuration:

```perl
Localize => {
  resources => ['kalamar.pl.dict']
}
```

To localize example queries according to a special corpus environment,
define a name of the example corpus in the configuration.

```perl
Kalamar => {
  examplecorpus => 'mycorpus'
}
```

Then create a translation file based on `kalamar.queries.dict`
as a blueprint and add it to the `Localize` resource list.

Templates can be localized and customized by overriding
the `Template` dictionary entries.

Currently the JavaScript translations are separated and stored in `dev/js/src/loc`.
To generate assets relying on different locales, add the locale to `Gruntfile.js`.

To localize the annotation helper according to a special corpus environment,
different annotation foundries can be loaded in `kalamar.conf.js`.
For example to support `marmot` and `malt`,
the configuration may look like this:

```js
require([
  "hint/foundries/marmot",
  "hint/foundries/malt"
]);
```

See `dev/js/src/hint/foundries` for
more optional foundries.


### Customization

The landing page can be customized by overriding the
entry for `Template_intro` in the dictionary.

Some sections of the user interface can be customized
by adding new
[content blocks](https://github.com/Akron/Mojolicious-Plugin-TagHelpers-ContentBlock).
Currently the documented sections are in
`footer`, in the bottom line of the user interface,
`sidebar`, in the left part of the user interface if present,
`headerButtonGroup`, in the right top part of the user interface,
and `loginInfo`, below the login form if present.


### Plugins

Some plugins are bundled as part of Kalamar. Plugins can be loaded
via configuration file in an array

```perl
{
  Kalamar => {
    plugins => ['Auth']
  }
}
```

Currently bundled plugins are
- `Auth`: For integrating user management
  supported by [Kustvakt full](https://github.com/KorAP/Kustvakt/tree/master/full).
- `Piwik`: For integrating Matomo/Piwik


## COPYRIGHT AND LICENSE

### Original Software

Copyright (C) 2015-2019, [IDS Mannheim](http://www.ids-mannheim.de/)<br>
Author: [Nils Diewald](http://nils-diewald.de/), Helge Stallkamp
Contributor: Eliza Margaretha (Documentation), Susanne Feix (Translation)

Kalamar is developed as part of the [KorAP](http://korap.ids-mannheim.de/)
Corpus Analysis Platform at the
[Leibniz Institute for the German Language (IDS)](http://ids-mannheim.de/),
member of the
[Leibniz Association](https://www.leibniz-gemeinschaft.de/en/home/)
and supported by the [KobRA](http://www.kobra.tu-dortmund.de) project,
funded by the
[Federal Ministry of Education and Research (BMBF)](http://www.bmbf.de/en/).

Kalamar is free software published under the
[BSD-2 License](https://raw.githubusercontent.com/KorAP/Kalamar/master/LICENSE).

**To cite this work, please refer to:**<br>
Diewald, Nils, Barbu Mititelu, Verginica and Kupietz, Marc (2019):
[The KorAP user interface. Accessing CoRoLa via KorAP](https://www.lingv.ro/images/RRL%203%202019%2006-%20Diewald.pdf).
In: Cosma, Ruxandra/Kupietz, Marc (eds.),
On design, creation and use of of the Reference Corpus of Contemporary
Romanian and its analysis tools. CoRoLa, KorAP, DRuKoLA and EuReCo,
Revue Roumaine de Linguistique, 64(3). Editura Academiei Române,
Bucharest, Romania.

### Bundled Software

[ALERTIFY.js](https://fabien-d.github.io/alertify.js/)
is released under the terms of the MIT License.
[Almond](https://github.com/jrburke/almond)
is released under the terms of the BSD License.
[dagre](https://highlightjs.org/)
is released under the terms of the MIT License.
[Highlight.js](https://highlightjs.org/)
is released under the terms of the BSD License.
[Jasmine](https://jasmine.github.io/)
is released under the terms of the MIT License.
[RequireJS](http://requirejs.org/)
is released under the terms of the BSD License.
[Font Awesome](http://fontawesome.io)
by Dave Gandy
is released under the terms of the
[SIL OFL 1.1](http://scripts.sil.org/OFL).
[Benchmark.js](https://benchmarkjs.com/)
is released under the terms of the MIT License.
[lodash](https://lodash.com/)
is released under the terms of the MIT License.
[Platform.js](https://mths.be/platform/)
is released under the terms of the MIT License.
[INTRO.JS](https://github.com/usablica/intro.js)
is released under the terms of the GNU AFFERO GENERAL
PUBLIC LICENSE (GNU AGPLv3).

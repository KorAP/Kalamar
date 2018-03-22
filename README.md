![Kalamar](https://raw.githubusercontent.com/KorAP/Kalamar/master/dev/demo/img/kalamar.png)

Kalamar is a [Mojolicious](http://mojolicio.us/)-based user interface
frontend for the [KorAP Corpus Analysis Platform](http://korap.ids-mannheim.de/).

![Kalamar Screenshots](https://raw.githubusercontent.com/KorAP/Kalamar/master/dev/demo/img/screenshots.png)

**! This software is in its early stages and not stable yet! Use it on your own risk!**

## INSTALLATION

### Setup

To fetch the latest version of Kalamar ...

```
$ git clone https://github.com/KorAP/Kalamar
```

### Generate Static Asset Files

To generate the static asset files (scripts, styles, images ...),
you need NodeJS > 0.8 and npm (maybe bundled with your version of NodeJS).
For processing Sass, you will need Ruby with
the ```sass``` gem in addition.
This will probably need administration
rights, depending on your installation path.
These tools may also be available with a package manager.

You can check, if all tools are available using

```
$ npm -v
$ sass -v
```

Afterwards you can install grunt and run grunt to create the assets.

```
$ cd Kalamar
$ npm install -g grunt-cli
$ npm install
$ grunt
```

Whenever the assets change, just rerun ```grunt```.

### Start Server

Kalamar uses the [Mojolicious](http://mojolicio.us/) framework,
that expects a Perl version of at least 5.10.1.
The recommended environment is based on [Perlbrew](http://perlbrew.pl/)
with [App::cpanminus](http://search.cpan.org/~miyagawa/App-cpanminus/).

Some perl modules are not on CPAN yet, so you need to install them from GitHub.
The easiest way to do this is using
[App::cpanminus](http://search.cpan.org/~miyagawa/App-cpanminus/).
This will probably need administration rights.

```
$ cpanm git://github.com/Akron/Mojolicious-Plugin-Search.git
$ cpanm git://github.com/Akron/Mojolicious-Plugin-Localize.git
```

Then install the dependencies using
[App::cpanminus](http://search.cpan.org/~miyagawa/App-cpanminus/)
(there is no need to install Kalamar)
and run the test suite.

```
$ cd Kalamar
$ cpanm --installdeps .
$ perl Makefile.PL
$ make test
```

Kalamar can be deployed like all
[Mojolicious apps](http://mojolicio.us/perldoc/Mojolicious/Guides/Cookbook#DEPLOYMENT).
The easiest way is to start the built-in server:

```
$ perl script/kalamar daemon
```

Kalamar will then be available at ```localhost:3000``` in your browser.

By default, Kalamar tries to connect to ```localhost:9999```.
You may change that endpoint to the KorAP API provider in in the configuration
(see [Kustvakt](https://github.com/KorAP/Kustvakt) for further information).


### Configuration

The basic configuration file is ```kalamar.conf```. To define derivations,
create a configuration file with the pattern ```kalamar.[MYNAME].conf``` and
follow the descriptions in ```kalamar.conf```.
For client-side configurations, a file ```kalamar.conf.js``` can be
introduced, that will be consulted during the build process, loading
optional components using a ```require(...)``` directive.

### Localization and Customization

To create a localized version of Kalamar, start the ```localize``` command
with the target locale as its argument, e.g. ```pl``` for polish.

```
$ perl script/kalamar localize pl
```

The newly defined dictionary file can then be modified and added to the resources
definition of the ```Localize``` plugin in the configuration:

```
Localize => {
  resources => ['kalamar.pl.dict']
}
```

To localize example queries according to a special corpus environment,
define a name of the example corpus in the configuration.

```
Kalamar => {
  examplecorpus => 'mycorpus'
}

```

Then create a translation file based on ```kalamar.queries.dict```
as a blueprint and add it to the ```Localize``` resource list.

Templates can be localized and customized by overriding
the ```Template``` dictionary entries.
This is especially useful for the landing page in
```Template_intro```.

Currently the JavaScript translations are separated and stored in ```dev/js/src/loc```.
To generate assets relying on different locales, add the locale to ```Gruntfile.js```.

To localize the annotation helper according to a special corpus environment,
different annotation foundries can be loaded in ```kalamar.conf.js```.
For example to support ```marmot``` and ```malt```,
the configuration may look like this:

```
require([
  "hint/foundries/marmot",
  "hint/foundries/malt"
]);
```

See ```dev/js/src/hint/foundries``` for
more optional foundries.

## COPYRIGHT AND LICENSE

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


### Original Software

Copyright (C) 2015-2018, [IDS Mannheim](http://www.ids-mannheim.de/)<br>
Author: [Nils Diewald](http://nils-diewald.de/)
Contributor: Susanne Feix (Translations)

Kalamar is developed as part of the [KorAP](http://korap.ids-mannheim.de/)
Corpus Analysis Platform at the
[Institute for the German Language (IDS)](http://ids-mannheim.de/),
member of the
[Leibniz-Gemeinschaft](http://www.leibniz-gemeinschaft.de/en/about-us/leibniz-competition/projekte-2011/2011-funding-line-2/)
and supported by the [KobRA](http://www.kobra.tu-dortmund.de) project,
funded by the
[Federal Ministry of Education and Research (BMBF)](http://www.bmbf.de/en/).

Kalamar is free software published under the
[BSD-2 License](https://raw.githubusercontent.com/KorAP/Kalamar/master/LICENSE).

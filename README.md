![Kalamar](https://raw.githubusercontent.com/KorAP/Kalamar/master/dev/demo/img/kalamar.png)

Kalamar is a [Mojolicious](http://mojolicio.us/)-based user interface
frontend for the [KorAP Corpus Analysis Platform](http://korap.ids-mannheim.de/).

[![DOI](https://zenodo.org/badge/36036704.svg)](https://zenodo.org/badge/latestdoi/36036704)

![Kalamar Screenshots](https://raw.githubusercontent.com/KorAP/Kalamar/master/dev/demo/img/screenshots.png)

## Setup

The easiest way to install and run Kalamar is using [Docker](https://www.docker.com/).

```shell
docker pull korap/kalamar
```

Then start Kalamar listening on port `64543`.

```shell
docker run --network host --name kalamar korap/kalamar
```

Kalamar will be available at `http://localhost:64543`.

See the [description on docker hub](https://hub.docker.com/r/korap/kalamar)
regarding further information.

## Setup for Development

To install the latest version of Kalamar, first fetch the resource ...

```shell
git clone https://github.com/KorAP/Kalamar
```

... and follow the steps below.

If you have any problems with installing Kalamar,
see the *Troubleshooting* section.

### Generate Static Asset Files

To generate the static asset files (scripts, styles, images ...),
you need NodeJS >= 6.0.0.
This will probably need administration
rights, depending on your installation path.
These tools may also be available with a package manager.

You can check your version using

```shell
npm -v
```

Afterwards you can install the dependencies and run `grunt` to create the assets.

```shell
cd Kalamar
npm install -g grunt-cli
npm install
grunt
```

Whenever the assets change, just rerun `npm install` and `grunt`.

### Start Server

Kalamar uses the [Mojolicious](http://mojolicio.us/) framework,
that expects a Perl version of at least 5.16.
On Windows [Strawberry Perl](http://strawberryperl.com/) is recommended.
An environment based on [Perlbrew](http://perlbrew.pl/) is recommended,
if available. The installation guide requires
[App::cpanminus](http://search.cpan.org/~miyagawa/App-cpanminus/) as well.

Some perl modules are not on CPAN yet, so you need to install them from GitHub.
The easiest way to do this is using
[App::cpanminus](http://search.cpan.org/~miyagawa/App-cpanminus/).
This will probably need administration rights.

```shell
cpanm https://github.com/Akron/Mojolicious-Plugin-Localize.git
```

Then install the dependencies using
[App::cpanminus](http://search.cpan.org/~miyagawa/App-cpanminus/)
(there is no need to install Kalamar)
and run the test suite.

```shell
cd Kalamar
cpanm --installdeps .
perl Makefile.PL
make test
```

Kalamar can be deployed like all
[Mojolicious apps](http://mojolicio.us/perldoc/Mojolicious/Guides/Cookbook#DEPLOYMENT).
The easiest way is to start the built-in server:

```shell
perl script/kalamar daemon
```

Kalamar will then be available at `localhost:3000` in your browser.

By default, Kalamar tries to connect to `https://korap.ids-mannheim.de/api/`,
followed by the most current version of the API.
You may change that endpoint to the KorAP API provider in the configuration
(see [Kustvakt](https://github.com/KorAP/Kustvakt) for further information)
or by using the environment variable `KALAMAR_API`.

If the endpoint is remote and requires SSL support, like the default endpoint,
you have to install SSL support in addition:

```
cpanm IO::Socket::SSL
```

## Updates

To update Kalamar, just run

```shell
git pull origin master
cpanm --installdeps .
npm install
grunt
```

And both the server and client dependencies should be up to date.

## Configuration

The basic configuration file is `kalamar.conf`. To define derivations,
create a configuration file with the pattern `kalamar.myconf.conf` and
follow the descriptions in `kalamar.conf`.

To start Kalamar with a derivative configuration, set the `MOJO_MODE`
environment variable.

```shell
MOJO_MODE=myconf perl script/kalamar daemon
```

Or in the windows command line with:

```cmd
> cmd /C "set MOJO_MODE=qr && perl .\script\kalamar daemon"
```

Or in the windows powershell with:

```powershell
> $env:MOJO_MODE='myconf'; perl .\script\kalamar daemon; Remove-Item Env:\MOJO_MODE
```

For client-side configurations, a file `kalamar.conf.js` can be
introduced, that will be consulted during the build process, loading
optional components using a `require(...)` directive (see example below).

### Secret file

Kalamar uses auto rotating secrets. Allow access to a file called
`kalamar.secret.json` in the home directory of kalamar. It will
automatically be created, if it doesn't exist.
(`kalamar.secret` is deprecated.)

### Localization

To create a localized version of Kalamar, start the `localize` command
with the target locale as its argument, e.g. `pl` for polish.

```shell
perl script/kalamar localize pl
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
- `Piwik`: For integrating [Matomo/Piwik](https://matomo.org/).
- `Tei2KorAPXML`: For integrated calls to [tei2korapxml](https://github.com/KorAP/KorAP-XML-TEI), if installed.
- `KorAPXML2Krill`: For integrated calls to [korapxml2krill](https://github.com/KorAP/KorAP-XML-Krill), if installed.
- `KrillIndexer`: For integrated calls to [Krilll](https://github.com/KorAP/Krill),
  if installed and exposed by `KRILL_INDEXER_PATH`.
- `KorAPXML2CoNLLU`: For integrated calls to [conllu2korapxml and korapxml2conllu](https://github.com/KorAP/KorAP-XML-CoNNL-U), if installed.

## Maintaining

### Caching

Kalamar supports [CHI](https://metacpan.org/dist/Mojolicious-Plugin-CHI) for caching,
allowing various cache drivers to configure.

To see options for cache maintenance
(e.g. to clear search results after index update),
run the command

```shell
perl script/kalamar chi
```

## Troubleshooting

### `make` not available under Windows

Instead of running

```shell
perl Makefile.PL
make test
```

it is also possible to run the test suite using `prove`.

```shell
prove -lr t
```

### Problem installing Crypt::Random::Source on Windows

[Crypt::Random::Source](https://metacpan.org/pod/Crypt::Random::Source)
recently removed support for C<rand> as a random source,
which may lead to missing sources in tests under certain operating systems.
You should be able to force install
[Crypt::Random::Source](https://metacpan.org/pod/Crypt::Random::Source),
though this environment is not recommended for production:

```shell
cpanm -f Crypt::Random::Source
```

### Problem installing Mojolicious::Plugin::MailException on Windows

Some versions of
[Mojolicious::Plugin::MailException](https://metacpan.org/pod/Mojolicious::Plugin::MailException)
have a
[minor bug](https://github.com/dr-co/libmojolicious-plugin-mail_exception/pull/13)
in the test suite, so a force install may be necessary.

```perl
cpanm -f Mojolicious::Plugin::MailException
```

### Problem running scripts on Windows with Powershell

In case you are having issues with running scripts under Windows,
you can set the execution policy with
[`Set-ExecutionPolicy`](https://docs.microsoft.com/de-de/powershell/module/microsoft.powershell.core/about/about_execution_policies?view=powershell-7.1).
If using the RemoteSigned execution policy, you can use `Unblock-File`
to allow specific scripts to run.

### Problem installing Module::Pluggable

In case [Module::Pluggable](https://metacpan.org/pod/Module-Pluggable) fails
as a dependency of the [DateTime](https://metacpan.org/pod/DateTime) module,
just force the installation and ignore warnings.

```perl
cpanm --force Module::Pluggable
```


## COPYRIGHT AND LICENSE

### Original Software

Copyright (C) 2015-2025, [IDS Mannheim](https://www.ids-mannheim.de/)<br>
Author: [Nils Diewald](https://www.nils-diewald.de/), Helge Stallkamp<br>
Contributor: Uyen-Nhu Tran, Eliza Margaretha (Documentation), Susanne Feix
and Rebecca Wilm (Translation), Leo Repp

Kalamar is developed as part of the [KorAP](https://korap.ids-mannheim.de/)
Corpus Analysis Platform at the
[Leibniz Institute for the German Language (IDS)](https://www.ids-mannheim.de/),
member of the
[Leibniz Association](https://www.leibniz-gemeinschaft.de/en/home/)
and supported by the [KobRA](http://www.kobra.tu-dortmund.de) project,
funded by the
[Federal Ministry of Education and Research (BMBF)](http://www.bmbf.de/en/).

Kalamar is free software published under the
[BSD-2 License](https://opensource.org/licenses/BSD-2-Clause).

**To cite this work, please refer to:**<br>
Diewald, Nils, Barbu Mititelu, Verginica and Kupietz, Marc (2019):
[The KorAP user interface. Accessing CoRoLa via KorAP](https://www.lingv.ro/images/RRL%203%202019%2006-%20Diewald.pdf).
In: Cosma, Ruxandra/Kupietz, Marc (eds.),
On design, creation and use of of the Reference Corpus of Contemporary
Romanian and its analysis tools. CoRoLa, KorAP, DRuKoLA and EuReCo,
Revue Roumaine de Linguistique, 64(3). Editura Academiei Române,
Bucharest, Romania.

### Bundled Assets

The KorAP logo was designed by Norbert Cußler-Volz
is released under the terms of the Creative Commons
License BY-NC-ND 4.0.
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

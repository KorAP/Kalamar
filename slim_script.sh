#!/bin/bash

# Get the version from the parameter or
# the latest git tag or "latest"
VERSION="${1:-$(git describe --tags --abbrev=0 2>/dev/null || echo "latest")}"

# Remove the leading 'v' if it exists
VERSION=${VERSION#v}

# Build the docker-slim command
slim build --http-probe=true \
           --exec="perl Makefile.PL && MOJO_MODE=test make test && unzip -v" \
           --include-workdir=true \
           --include-path="/usr/local/share/perl5/site_perl/KorAP/" \
           --include-path="/usr/local/share/perl5/site_perl/Mojolicious/" \
           --include-path="/usr/local/share/perl5/site_perl/Mojo/" \
           --include-path="/usr/share/perl5/vendor_perl/DateTime/" \
           --include-path="/usr/share/perl5/vendor_perl/auto/share/dist/DateTime-Locale" \
           --include-path="/usr/share/perl5/core_perl/Unicode/Collate/Locale" \
           --tag "korap/kalamar:$VERSION" \
           --tag "korap/kalamar:latest" \
           "korap/kalamar:${VERSION}-large"

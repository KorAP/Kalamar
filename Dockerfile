# Build assets in builder image
FROM node:21 AS assetbuilder

WORKDIR '/app'

# This follows the "multi-stage build" pattern

RUN npm install grunt && \
    npm install -g grunt-cli

# Copy repository respecting .dockerignore
COPY . /kalamar

RUN cd /kalamar && \
    npm install && \
    grunt && \
    rm -rf node_modules \
           dev/css  \
           dev/font \
           dev/img  \
           dev/js/bench  \
           dev/js/runner \
           dev/js/spec \
           dev/scss && \
    rm package-lock.json \
       dev/robots.txt

# Use alpine linux AS base image
FROM alpine:latest AS kalamar

RUN apk update && \
    apk add --no-cache git \
            perl \
            perl-io-socket-ssl \
            perl-dev \
            g++ \
            make \
            wget \
            perl-doc \
            libxml2-dev \
            perl-xml-libxml \
            perl-module-pluggable \
            perl-datetime \
            perl-readonly \
            unzip \
            curl && \
    set -o pipefail

RUN curl -fsSL https://raw.githubusercontent.com/kupietz/cpm/main/cpm > /bin/cpm && chmod a+x /bin/cpm

RUN cpm install --test -g Cpanel::JSON::XS File::ShareDir::Install EV IO::Socket::Socks && \
    cpm install --test -g "https://github.com/Akron/Mojolicious-Plugin-Localize/archive/refs/tags/v0.22.tar.gz" && \
    cpm install --test -g "https://github.com/KorAP/KorAP-XML-TEI/archive/refs/tags/v2.6.0.tar.gz" && \
    cpm install --test -g "https://github.com/KorAP/KorAP-XML-Krill/archive/refs/tags/v0.55.tar.gz" && \
    cpm install --test -g "https://github.com/KorAP/KorAP-XML-CoNLL-U/archive/refs/tags/v0.6.3.tar.gz"

# Copy assets from former container
COPY --from=assetbuilder /kalamar /kalamar

WORKDIR /kalamar

# Install Kalamar including all dependencies
RUN cpm install --test -g

# Remove all build dependencies
RUN rm /bin/cpm && \
    apk del git \
            perl-dev \
            perl-doc \
            g++ \
            wget \
            libxml2-dev \
            curl && \
            rm -rf /root/.cpanm \
                   /usr/local/share/man

RUN addgroup -S korap && \
    adduser -S kalamar -G korap && \
    chown -R kalamar:korap /kalamar

USER kalamar

RUN mkdir /kalamar/data

ENV MOJO_PORT   64543
ENV MOJO_LISTEN http://*:${MOJO_PORT}
ENV MOJO_MODE   production

RUN echo "{Kalamar=>{plugins=>['KorAPXML2Krill','Tei2KorAPXML','KorAPXML2CoNLLU']}}" > kalamar.production.conf

EXPOSE ${MOJO_PORT}

ENTRYPOINT [ "perl", "script/kalamar" ]

CMD [ "daemon" ]

LABEL description="Docker Image for Kalamar, the KorAP user frontend, including Conversion"
LABEL maintainer="korap@ids-mannheim.de"
LABEL repository="https://github.com/KorAP/Kalamar"

# docker build -f Dockerfile -t korap/kalamar:x.xx-large --target kalamar .

# Slimming (https://github.com/slimtoolkit/slim):
# slim build --http-probe=true \
#            --exec="perl Makefile.PL && make test && unzip -v" \
#            --include-workdir=true \
#            --include-path="/usr/local/share/perl5/site_perl/KorAP/" \
#            --tag korap/kalamar:x.xx \
#            --tag korap/kalamar:latest \
#            korap/kalamar:x.xx-large
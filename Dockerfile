# Build assets in builder image
FROM node:12 as assetbuilder

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
           dev/demo \
           dev/font \
           dev/img  \
           dev/js/bench  \
           dev/js/runner \
           dev/js/spec \
           dev/scss && \
    rm package-lock.json \
       dev/robots.txt

# Use alpine linux as base image
FROM alpine:latest

# Copy assets from former container
COPY --from=assetbuilder /kalamar /kalamar

WORKDIR /kalamar

RUN apk update && \
    apk add --no-cache git \
            perl \
            perl-io-socket-ssl \
            perl-dev \
            perl-doc \
            g++ \
            make \
            wget \
            libxml2-dev \
            libxml2 \
            unzip \
            curl && \
    set -o pipefail && \
    curl -L https://cpanmin.us | perl - App::cpanminus && \
    cpanm File::ShareDir::Install \
          Cpanel::JSON::XS \
          EV \
          IO::Socket::Socks

RUN cpanm https://github.com/Akron/Mojolicious-Plugin-Localize/archive/refs/tags/v0.21.tar.gz \
   https://github.com/KorAP/KorAP-XML-TEI/archive/refs/tags/v2.3.2b.tar.gz \
   https://github.com/KorAP/KorAP-XML-Krill/archive/refs/tags/v0.45.tar.gz

# Install Kalamar including all dependencies
RUN cpanm --installdeps . -M https://cpan.metacpan.org

# Remove all build dependencies
RUN apk del git \
            perl-dev \
            perl-doc \
            g++ \
            make \
            wget \
            libxml2-dev \
            curl && \
            rm -rf /root/.cpanm \
                   /usr/local/share/man && \
            rm -rf t

RUN addgroup -S korap && \
    adduser -S kalamar -G korap && \
    chown -R kalamar.korap /kalamar

USER kalamar

RUN mkdir /kalamar/data

ENV MOJO_PORT   64543
ENV MOJO_LISTEN http://*:${MOJO_PORT}
ENV MOJO_MODE   production

RUN echo "{Kalamar=>{plugins=>['KorAPXML2Krill','Tei2KorAPXML']}}" > kalamar.production.conf

EXPOSE ${MOJO_PORT}

ENTRYPOINT [ "perl", "script/kalamar" ]

CMD [ "daemon" ]

LABEL maintainer="korap@ids-mannheim.de"
LABEL description="Docker Image for Kalamar, the KorAP user frontend"
LABEL repository="https://github.com/KorAP/Kalamar"

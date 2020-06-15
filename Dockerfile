# Build assets in builder image
FROM node:12 as assetbuilder

# This follows the "multi-stage build" pattern

RUN npm install -g sass && \
    npm install grunt && \
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
           dev/scss

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
            g++ \
            make \
            wget \
            curl && \
    set -o pipefail && \
    curl -L https://cpanmin.us | perl - App::cpanminus && \
    cpanm git://github.com/Akron/Mojolicious-Plugin-Localize.git \
          git://github.com/Akron/Mojolicious-Plugin-TagHelpers-ContentBlock.git && \
    cpanm Cpanel::JSON::XS \
          EV \
          IO::Socket::Socks && \
    cpanm --installdeps . -M https://cpan.metacpan.org

# Remove all build dependencies
RUN apk del git \
            perl-dev \
            g++ \
            make \
            wget \
            curl && \
            rm -rf /root/.cpanm \
                   /usr/local/share/man

RUN addgroup -S korap && \
    adduser -S kalamar -G korap && \
    chown -R kalamar.korap /kalamar

USER kalamar

EXPOSE 64543

ENTRYPOINT [ "perl", "script/kalamar" ]

CMD [ "daemon", "-m", "production", "-l", "http://*:64543" ]

LABEL author="korap@ids-mannheim.de"
LABEL description="Docker Image for Kalamar, the KorAP user frontend"
LABEL repository="https://github.com/KorAP/Kalamar"

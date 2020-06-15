# Build assets in builder image
FROM node:12 as assetbuilder

RUN npm install -g sass && \
    npm install grunt && \
    npm install -g grunt-cli

# Copy repository respecting .dockerignore
COPY . /app/Kalamar

RUN cd /app/Kalamar && \
    npm install && \
    grunt && \
    rm -rf /app/Kalamar/dev \
           /app/Kalamar/node_modules

# Use alpine linux as base image
FROM alpine:latest

MAINTAINER korap@ids-mannheim.de

# Copy assets from former container
COPY --from=assetbuilder /app/Kalamar /app/Kalamar

WORKDIR /app/Kalamar

RUN apk update && \
    apk add --no-cache git \
            perl \
            perl-io-socket-ssl \
            perl-dev \
            g++ \
            make \
            wget \
            curl && \
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

ENV MOJO_MODE production

EXPOSE 64543

ENTRYPOINT [ "perl", "script/kalamar" ]

CMD ["daemon", "-l", "http://*:64543", "-m", "production" ]

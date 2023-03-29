# Build assets in builder image
FROM node:19 as assetbuilder

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
FROM alpine:latest as kalamar-base

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
    cpanm https://github.com/Akron/Mojolicious-Plugin-Localize/archive/refs/tags/v0.21.tar.gz \
          Cpanel::JSON::XS \
          EV \
          IO::Socket::Socks

# Install Kalamar including all dependencies
RUN cpanm --installdeps . -M https://cpan.metacpan.org

LABEL maintainer="korap@ids-mannheim.de"
LABEL repository="https://github.com/KorAP/Kalamar"

FROM kalamar-base AS kalamar

# Remove all build dependencies
RUN apk del git \
            perl-dev \
            g++ \
            make \
            wget \
            curl && \
            rm -rf /root/.cpanm \
                   /usr/local/share/man && \
            rm -rf t

RUN addgroup -S korap && \
    adduser -S kalamar -G korap && \
    chown -R kalamar.korap /kalamar

USER kalamar

ENV MOJO_PORT   64543
ENV MOJO_LISTEN http://*:${MOJO_PORT}
ENV MOJO_MODE   production

EXPOSE ${MOJO_PORT}

ENTRYPOINT [ "perl", "script/kalamar" ]

CMD [ "daemon" ]

LABEL description="Docker Image for Kalamar, the KorAP user frontend"


FROM kalamar-base AS kalamar-convert

RUN apk update && \
    apk add --no-cache \
            perl-doc \
            libxml2-dev \
            libxml2 \
            unzip && \
    set -o pipefail && \
    cpanm File::ShareDir::Install
          
RUN cpanm \
   https://github.com/KorAP/KorAP-XML-TEI/archive/refs/tags/v2.4.1.tar.gz \
   https://github.com/KorAP/KorAP-XML-Krill/archive/refs/tags/v0.49.tar.gz \
   https://github.com/KorAP/KorAP-XML-CoNLL-U/archive/refs/tags/v0.6.1.tar.gz

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

RUN echo "{Kalamar=>{plugins=>['KorAPXML2Krill','Tei2KorAPXML','KorAPXML2CoNLLU']}}" > kalamar.production.conf

EXPOSE ${MOJO_PORT}

ENTRYPOINT [ "perl", "script/kalamar" ]

CMD [ "daemon" ]

LABEL description="Docker Image for Kalamar, the KorAP user frontend, including Conversion"

# docker build -f Dockerfile -t korap/kalamar:x.xx-conv --target kalamar-convert .
# docker build -f Dockerfile -t korap/kalamar:x.xx --target kalamar .

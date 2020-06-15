# Build assets in builder image
FROM node:12 as assetbuilder

RUN npm install -g sass
RUN npm install grunt
RUN npm install -g grunt-cli

# Copy repository respecting .dockerignore
COPY . /app/Kalamar

RUN cd /app/Kalamar \
    ; npm install \
    ; grunt \
    ;

RUN rm -rf /app/Kalamar/dev \
           /app/Kalamar/node_modules

# Use alpine linux as base image
FROM alpine:3.12

# Copy assets from former container
COPY --from=assetbuilder /app/Kalamar /app/Kalamar

WORKDIR /app/Kalamar

# perl is Version 5.30.2-r0
RUN apk add --no-cache git \
  perl \
  perl-io-socket-ssl \
  perl-dev \
  g++ \
  make \
  wget \
  curl

RUN curl -L https://cpanmin.us | perl - App::cpanminus \
    ; \
    cpanm git://github.com/Akron/Mojolicious-Plugin-Localize.git \
          git://github.com/Akron/Mojolicious-Plugin-TagHelpers-ContentBlock.git \
    ; \
    cpanm --installdeps . -M https://cpan.metacpan.org

# Remove all build dependencies
RUN apk del git \
  perl-dev \
  g++ \
  make \
  wget \
  curl && \
  rm -rf /root/.cpanm /usr/local/share/man /app/Kalamar/t

EXPOSE 3000

CMD [ "morbo", "script/kalamar" ]

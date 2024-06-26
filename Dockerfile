FROM node:14.20.1-buster AS base
MAINTAINER Meedan <sysops@meedan.com>

# Set a UTF-8 capabable locale
ENV LC_ALL C.UTF-8
ENV LANG C.UTF-8
ENV LANGUAGE C.UTF-8

# TODO develop our own `watchman` image, so we can version it
COPY --from=icalialabs/watchman:buster /usr/local/bin/watchman /usr/local/bin/watchman
RUN mkdir -p /usr/local/var/run/watchman && touch /usr/local/var/run/watchman/.not-empty

# install dependencies
RUN true \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
        ruby2.5 \
        ruby2.5-dev \
        build-essential \
        graphicsmagick \
        tini \
        nginx \
    && gem install bundler:1.17.1 \
    && rm -rf /var/lib/apt/lists/*

# configure nginx to allow tests running on localhost:3333 and localhost:3000
COPY ./nginx.conf /etc/nginx/nginx.conf
RUN rm /etc/nginx/sites-enabled/default

# tx client
RUN curl -o- https://raw.githubusercontent.com/transifex/cli/master/install.sh | bash

# /app will be "." mounted as a volume mount from the host
WORKDIR /app

# ruby gems, for integration tests
# Gemfile.lock files must be updated on a host machine (outside of Docker)
COPY test/Gemfile test/Gemfile.lock /app/test/
RUN true \
    && cd /app/test \
    && BUNDLE_SILENCE_ROOT_WARNING=1 bundle install --jobs 20 --retry 5

# startup
EXPOSE 3333
CMD ["tini", "--", "bash", "-c", "export BUNDLE_PREFIX=$(date '+%Y%m%d%H%M%S') && npm install && npm run serve:dev"]

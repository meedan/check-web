FROM node:12.16.1-buster AS base
MAINTAINER Meedan <sysops@meedan.com>

# install dependencies
RUN true \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
        ruby2.5 \
        ruby2.5-dev \
        build-essential \
        imagemagick \
        tini \
    && gem install bundler:1.17.1 \
    && rm -rf /var/lib/apt/lists/*

# /app will be "." mounted as a volume mount from the host
WORKDIR /app

# ruby gems, for guard and integration tests
# Gemfile.lock files must be updated on a host machine (outside of Docker)
COPY Gemfile Gemfile.lock /app/
COPY test/Gemfile test/Gemfile.lock /app/test/
RUN true \
    && BUNDLE_SILENCE_ROOT_WARNING=1 bundle install --jobs 20 --retry 5 \
    && cd /app/test \
    && BUNDLE_SILENCE_ROOT_WARNING=1 bundle install --jobs 20 --retry 5

# /app/node_modules will be maintained by Docker. Treat it like a cache.
# Restarting the container won't modify /app/node_modules/*; and the files
# won't be visible from the host.
VOLUME /app/node_modules

# startup
EXPOSE 3333
CMD ["tini", "--", "bash", "-c", "npm install && npm run serve:dev"]

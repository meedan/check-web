# meedan/check-web

FROM node:14.21.3-bullseye AS base
MAINTAINER Meedan <sysops@meedan.com>

#
# SYSTEM CONFIG
#
ARG DEPLOY_BRANCH
ENV DEPLOYBRANCH=$DEPLOY_BRANCH

ARG TIMESTAMP
ENV BUNDLE_PREFIX=$TIMESTAMP

# consolidate ENV for one cache layer
ENV DEPLOYUSER=checkdeploy \
    DEPLOYDIR=/app \
    PLATFORM=web \
    PRODUCT=check \
    APP=check-web \
    NODE_ENV=production \
    TERM=xterm \
    MIN_INSTANCES=4 \
    MAX_POOL_SIZE=12 \
    LC_ALL=C.UTF-8 \
    LANG=C.UTF-8 \
    LANGUAGE=C.UTF-8 \
    AWS_DEFAULT_REGION=eu-west-1

# user config
RUN useradd ${DEPLOYUSER} -s /bin/bash -d ${DEPLOYDIR}/latest

# TODO develop our own `watchman` image, so we can version it
COPY --from=icalialabs/watchman:buster /usr/local/bin/watchman /usr/local/bin/watchman
RUN mkdir -p /usr/local/var/run/watchman && touch /usr/local/var/run/watchman/.not-empty

# install dependencies
RUN true \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
        awscli \
        jq \
        ruby2.7 \
        ruby2.7-dev \
        build-essential \
        graphicsmagick \
        tini \
        nginx \
    && gem install bundler:1.17.1 \
    && rm -rf /var/lib/apt/lists/*

# tx client
RUN curl -o- https://raw.githubusercontent.com/transifex/cli/master/install.sh | bash

# deployment scripts
COPY production/bin /opt/bin
RUN chmod 755 /opt/bin/*
# deployment directory

WORKDIR ${DEPLOYDIR}/latest

COPY package.json ${DEPLOYDIR}/latest
COPY package-lock.json ${DEPLOYDIR}/latest
RUN npm install
COPY . ${DEPLOYDIR}/latest

# get the relay.json file from github.com/meedan/check-api that corresponds to the DEPLOY_BRANCH passed to build.
RUN curl --silent https://raw.githubusercontent.com/meedan/check-api/${DEPLOYBRANCH}/public/relay.json -o ${DEPLOYDIR}/latest/relay.json
RUN sed "s|/api/public/relay.json|${DEPLOYDIR}/latest/relay.json|" < config-build.js.example > ${DEPLOYDIR}/latest/config-build.js

# Create default configs for build to succeed
COPY config.js.example ${DEPLOYDIR}/latest/config.js
COPY config-server.js.example ${DEPLOYDIR}/latest/config-server.js

### TEMP: skip sentry config as the script is failing to execute. To resolve later,
## Get the configuration for Sentry and apply environment variables, pre-build-step
#RUN bash /opt/bin/create_sentry_config.sh

# build all assets, js, css, transifex, upload sourcemaps to Sentry
RUN npm run build

WORKDIR ${DEPLOYDIR}/latest

EXPOSE 8000
CMD ["/opt/bin/start.sh"]

# meedan/check-web

FROM node:14.20.1-buster AS base
MAINTAINER sysops@meedan.com

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
RUN apt-get update -qq 
RUN apt-get install -y dirmngr gnupg \
    && apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 561F9B9CAC40B2F7 \
    && apt-get install -y apt-transport-https ca-certificates 
RUN apt-get install -y graphicsmagick awscli jq
RUN apt-get install -y libgnutls-openssl27 libgnutls30
RUN update-ca-certificates
RUN echo 'deb https://oss-binaries.phusionpassenger.com/apt/passenger buster main' > /etc/apt/sources.list.d/passenger.list 
RUN apt-get update -qq
RUN apt-get install -y passenger 

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

# Get the configuration for Sentry and apply environment variables, pre-build-step
RUN bash /opt/bin/create_sentry_config.sh

# build all assets, js, css, transifex, upload sourcemaps to Sentry
RUN npm run build

WORKDIR ${DEPLOYDIR}/latest

EXPOSE 8000
CMD ["/opt/bin/start.sh"]

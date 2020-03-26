# meedan/check-web

FROM node:12.16.1-buster AS base
MAINTAINER sysops@meedan.com

#
# SYSTEM CONFIG
#

# consolidate ENV for one cache layer
ENV DEPLOYUSER=checkdeploy \
    DEPLOYDIR=/app \
    PLATFORM=web \
    PRODUCT=check \
    APP=check-web \
    NODE_ENV=production \
    TERM=xterm \
    MIN_INSTANCES=4 \
    MAX_POOL_SIZE=12

# user config
RUN useradd ${DEPLOYUSER} -s /bin/bash -d ${DEPLOYDIR}/latest 
RUN apt-get install -y dirmngr gnupg \
    && apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 561F9B9CAC40B2F7 \
    && apt-get install -y apt-transport-https ca-certificates \
    && echo 'deb https://oss-binaries.phusionpassenger.com/apt/passenger buster main' > /etc/apt/sources.list.d/passenger.list \
    && apt-get update -qq && apt-get install -y graphicsmagick passenger

# deployment scripts
COPY production/bin /opt/bin
RUN chmod 755 /opt/bin/*
# deployment directory

WORKDIR ${DEPLOYDIR}/latest

COPY package.json ${DEPLOYDIR}/latest
COPY package-lock.json ${DEPLOYDIR}/latest
RUN npm install
COPY . ${DEPLOYDIR}/latest

# get the relay.json file from github.com/meedan/check-api that corresponds to the current local git branch (defaults to 'develop')
RUN curl --silent https://raw.githubusercontent.com/meedan/check-api/develop/public/relay.json -o ${DEPLOYDIR}/latest/relay.json \
    && sed "s|https://raw.githubusercontent.com/meedan/check-api/develop/public/relay.json|${DEPLOYDIR}/latest/relay.json|" < config-build.js.example > ${DEPLOYDIR}/latest/config-build.js


# build all assets, js, css, transifex
RUN npm run build

WORKDIR ${DEPLOYDIR}/latest

EXPOSE 8000
CMD ["/opt/bin/start.sh"]

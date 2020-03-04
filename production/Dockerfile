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

RUN apt-get update -qq && apt-get install -y graphicsmagick

# deployment scripts
COPY production/bin /opt/bin
RUN chmod 755 /opt/bin/*
# deployment directory

WORKDIR ${DEPLOYDIR}/latest
# RUN chown ${DEPLOYUSER}:www-data ${DEPLOYDIR}/latest
# copy in package.json and run npm install to populate node_modules
COPY . ${DEPLOYDIR}/latest
RUN npm install --only=prod

# get the relay.json file from github.com/meedan/check-api that corresponds to the current local git branch (defaults to 'develop')
RUN /opt/bin/get_relay_json.sh

# build all assets, js, css, transifex
RUN npm run build && npm run build:server

WORKDIR ${DEPLOYDIR}
RUN ln -s ./latest ./${APP}-$(date -I) && ln -s ./${APP}-$(date -I) ./current
RUN rm -rf ./latest/configurator
RUN rm /etc/nginx/sites-enabled/default
COPY production/config/nginx.conf /etc/nginx/sites-enabled/${APP}

#
# RUNTIME ELEMENTS
# expose, cmd
#
EXPOSE 80
WORKDIR ${DEPLOYDIR}/current
CMD ["/opt/bin/start.sh"]

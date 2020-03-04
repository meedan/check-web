# meedan/check-web

FROM meedan/ruby
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

ARG check_api_branch=develop

# user config
RUN useradd ${DEPLOYUSER} -s /bin/bash -m \
    && chown -R ${DEPLOYUSER}:${DEPLOYUSER} /home/${DEPLOYUSER}

# deployment scripts
COPY docker/production/bin /opt/bin
RUN chmod 755 /opt/bin/*

# deployment directory
RUN mkdir -p ${DEPLOYDIR}
WORKDIR ${DEPLOYDIR}/latest

# copy in package.json and run npm install to populate node_modules
COPY package.json ${DEPLOYDIR}/latest/package.json
USER root
RUN chown -R ${DEPLOYUSER}:www-data ${DEPLOYDIR}
USER ${DEPLOYUSER}
RUN npm cache clean && npm install && npm install --only=dev


# copy in the code and move it into the same directory as the built node_modules
COPY . ${DEPLOYDIR}/new
USER root
RUN chown -R ${DEPLOYUSER}:www-data ${DEPLOYDIR}/new
USER ${DEPLOYUSER}
RUN rm -rf ${DEPLOYDIR}/new/node_modules \
    && rsync -avp ${DEPLOYDIR}/new/* ${DEPLOYDIR}/latest/
COPY ./.babelrc ${DEPLOYDIR}/latest/.babelrc
COPY ./.eslintrc ${DEPLOYDIR}/latest/.eslintrc

# get the relay.json file from github.com/meedan/check-api that corresponds to the current local git branch (defaults to 'develop')
RUN /opt/bin/get_relay_json.sh

# build all assets, js, css, transifex
RUN npm run build && npm run build:server

# config
# RUN /opt/bin/find_and_link_config_files.sh ${DEPLOYDIR}/latest
RUN rm -f ${DEPLOYDIR}/latest/build/web/js/config.js \
    && ln -s ${DEPLOYDIR}/shared/config/config.js ${DEPLOYDIR}/latest/build/web/js/config.js \
    && rm -f ${DEPLOYDIR}/latest/build/web/js/config-server.js \
    && ln -s ${DEPLOYDIR}/shared/config/config-server.js ${DEPLOYDIR}/latest/config-server.js

WORKDIR ${DEPLOYDIR}
RUN ln -s ./latest ./${APP}-$(date -I) && ln -s ./${APP}-$(date -I) ./current

USER root
RUN rm /etc/nginx/sites-enabled/default
COPY docker/production/config/nginx.conf /etc/nginx/sites-enabled/${APP}

#
# RUNTIME ELEMENTS
# expose, cmd
#
EXPOSE 80
WORKDIR ${DEPLOYDIR}/current/build/web
CMD ["/opt/bin/start.sh"]

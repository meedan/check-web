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
    NODE_ENV=production


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

# prepare build configuration
RUN curl https://raw.githubusercontent.com/meedan/check-api/$(git rev-parse --abbrev-ref HEAD)/public/relay.json -o ${DEPLOYDIR}/latest/relay.json &&
    sed "s|https://raw.githubusercontent.com/meedan/check-api/develop/public/relay.json|${DEPLOYDIR}/latest/relay.json|" < config-build.js.example > ${DEPLOYDIR}/latest/config-build.js

# build all assets, js, css, transifex
RUN npm run build

# config
# RUN /opt/bin/find_and_link_config_files.sh ${DEPLOYDIR}/latest
RUN rm -f ${DEPLOYDIR}/latest/build/web/js/config.js \
    && ln -s ${DEPLOYDIR}/shared/config/src/app/config/config.js ${DEPLOYDIR}/latest/build/web/js/config.js

WORKDIR ${DEPLOYDIR}
RUN mv ./latest ./${APP}-$(date -I) && ln -s ./${APP}-$(date -I) ./current

USER root
RUN rm /etc/nginx/passenger.conf /etc/nginx/conf.d/passenger.conf /etc/nginx/sites-enabled/default
COPY docker/production/config/nginx.conf /etc/nginx/sites-enabled/${APP}

#
# RUNTIME ELEMENTS
# expose, cmd
#
EXPOSE 80
WORKDIR ${DEPLOYDIR}/current/build/web
CMD ["/opt/bin/start.sh"]

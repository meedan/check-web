# meedan/check-web

FROM meedan/nodejs
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

# copy in the code
RUN mkdir -p ${DEPLOYDIR}

WORKDIR ${DEPLOYDIR}/latest

# copy in package.json and run npm install to populate node_modules
COPY package.json ${DEPLOYDIR}/latest/package.json
USER root
RUN chown -R ${DEPLOYUSER}:www-data ${DEPLOYDIR}
USER ${DEPLOYUSER}
RUN npm cache clean && npm install --production

# copy in the code and move it into the same directory as the built node_modules
COPY . ${DEPLOYDIR}/new
USER root
RUN chown -R ${DEPLOYUSER}:www-data ${DEPLOYDIR}/new
USER ${DEPLOYUSER}
RUN rm -rf ${DEPLOYDIR}/new/node_modules \
    && rsync -avp ${DEPLOYDIR}/new/* ${DEPLOYDIR}/latest/ 

# style
RUN ./node_modules/.bin/node-sass src/app/styles/stylesheet.scss --output-style=compressed | ./node_modules/.bin/postcss --use autoprefixer -o build/web/css/stylesheet.css \
    && cp -r src/app/styles/images build/web/
    
RUN ./node_modules/.bin/gulp build:${PLATFORM}    

# config
# RUN /opt/bin/find_and_link_config_files.sh ${DEPLOYDIR}/latest
RUN rm ${DEPLOYDIR}/latest/build/web/js/config.js \
    && ln -s ${DEPLOYDIR}/shared/config/src/app/config/config.js ${DEPLOYDIR}/latest/build/web/js/config.js

WORKDIR ${DEPLOYDIR}
RUN mv ./latest ./${APP}-$(date -I) && ln -s ./${APP}-$(date -I) ./current

#
# RUNTIME ELEMENTS
# expose, cmd
#
USER root
EXPOSE 8000
WORKDIR ${DEPLOYDIR}/current/build/web
CMD ["/opt/bin/start.sh"]

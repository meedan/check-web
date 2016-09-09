# meedan/checkdeskclient web

FROM meedan/nodejs
MAINTAINER sysops@meedan.com

#
# SYSTEM CONFIG
#
ENV DEPLOYUSER cddeploy
ENV DEPLOYDIR /app
ENV PLATFORM web
ENV APP checkdesk-client
ENV BABEL_ENV production
ENV NODE_ENV production

# user config
RUN useradd ${DEPLOYUSER} -s /bin/bash -m
RUN chown -R ${DEPLOYUSER}:${DEPLOYUSER} /home/${DEPLOYUSER}

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
RUN rm -rf mv ${DEPLOYDIR}/new/node_modules \
    && rsync -avp ${DEPLOYDIR}/new/* ${DEPLOYDIR}/latest/ 

# logos
RUN src/assets/images/logo/generate.sh

# style
RUN ./node_modules/.bin/node-sass src/app/styles/stylesheet.scss --output-style=compressed | ./node_modules/.bin/postcss --use autoprefixer -o build/web/css/stylesheet.css \
    && cp -r src/app/styles/images build/web/
    
RUN ./node_modules/.bin/gulp build:${PLATFORM}    

# config
# RUN /opt/bin/find_and_link_config_files.sh ${DEPLOYDIR}/latest
RUN ln -s ${DEPLOYDIR}/shared/config/src/app/config/config.js ${DEPLOYDIR}/latest/build/web/js/config.js

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

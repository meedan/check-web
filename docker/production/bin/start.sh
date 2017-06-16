#!/bin/bash
# start.sh
# the Dockerfile CMD

if [ "${NODE_ENV}" != "production" ]; then 
    echo "NODE_ENV is ${NODE_ENV}, copying ${DEPLOYDIR}/current/docker/production/config/nginx_dev.conf /etc/nginx/sites-available/${APP} "
    cp ${DEPLOYDIR}/current/docker/production/config/nginx_dev.conf /etc/nginx/sites-enabled/${APP}
fi

echo "starting nginx"
echo "--STARTUP FINISHED--"
nginx

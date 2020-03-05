#!/bin/bash
# start.sh
# the Dockerfile CMD

if [[ -z ${GITHUB_TOKEN+x} || -z ${DEPLOY_ENV+x} || -z ${APP+x} ]]; then
	echo "GITHUB_TOKEN, DEPLOY_ENV, and APP must be in the environment. Exiting."
	exit 1
fi

if [ ! -d "configurator" ]; then git clone https://${GITHUB_TOKEN}:x-oauth-basic@github.com/meedan/configurator ${DEPLOYDIR}/latest/configurator; fi
d=configurator/check/${DEPLOY_ENV}/${APP}/; for f in $(find $d -type f); do cp "$f" "${f/$d/}"; done

#Put config into place
cp ${DEPLOYDIR}/latest/config.js ${DEPLOYDIR}/latest/build/web/js/config.js

passenger start

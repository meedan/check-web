#!/bin/bash
# start.sh
# the Dockerfile CMD

if [[ -z ${DEPLOY_ENV+x} || -z ${APP+x} ]]; then
	echo "DEPLOY_ENV, and APP must be in the environment. Exiting."
	exit 1
fi

# Always put config into place when starting service. This is because the
# build stage includes the sample configs which real deployments must replace.
/opt/bin/create_configs.sh
if (( $? != 0 )); then
	echo "Error creating configuration files. Exiting."
	exit 1
fi

cp ${DEPLOYDIR}/latest/config.js ${DEPLOYDIR}/latest/build/web/js/config.js

passenger start

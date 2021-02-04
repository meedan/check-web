#!/bin/bash
# start.sh
# the Dockerfile CMD

if [[ -z ${DEPLOY_ENV+x} || -z ${APP+x} ]]; then
	echo "DEPLOY_ENV, and APP must be in the environment. Exiting."
	exit 1
fi

# Put config into place if not yet created
if [ ! -f ${DEPLOYDIR}/latest/config.js ]; then
	/opt/bin/create_configs.sh ${DEPLOYDIR}
	if (( $? != 0 )); then
		echo "Error creating configuration files. Exiting."
		exit 1
	fi
fi	

cp ${DEPLOYDIR}/latest/config.js ${DEPLOYDIR}/latest/build/web/js/config.js

passenger start

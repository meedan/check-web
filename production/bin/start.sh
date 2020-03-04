#!/bin/bash
# start.sh
# the Dockerfile CMD

function config_replace() {
  # sed -i "s/ddRAILS_ENVdd/${RAILS_ENV}/g" /etc/nginx/sites-available/${APP}
  VAR=$1
  VAL=$2
  FILE=$3
  #    echo evaluating $VAR $VAL $FILE;
  if grep --quiet "dd${VAR}dd" $FILE; then
    echo "setting $VAR to $VAL in $FILE";
	CMD="s/dd${VAR}dd/${VAL}/g";
	sed -i -e ${CMD} ${FILE};
  fi
}


if [[ -z ${GITHUB_TOKEN+x} || -z ${DEPLOY_ENV+x} || -z ${APP+x} ]]; then
	echo "GITHUB_TOKEN, DEPLOY_ENV, and APP must be in the environment. Exiting."
	exit 1
fi

if [ ! -d "configurator" ]; then git clone https://${GITHUB_TOKEN}:x-oauth-basic@github.com/meedan/configurator ${DEPLOYDIR}/latest/configurator; fi
d=configurator/check/${DEPLOY_ENV}/${APP}/; for f in $(find $d -type f); do cp "$f" "${f/$d/}"; done

#Put config into place
cp ${DEPLOYDIR}/latest/config.js ${DEPLOYDIR}/latest/build/web/js/config.js
 
# sed in environmental variables
for ENV in $( env | cut -d= -f1); do
  config_replace "$ENV" "${!ENV}" /etc/nginx/sites-enabled/${APP};
done

echo "starting nginx";
echo "--STARTUP FINISHED--";
nginx;

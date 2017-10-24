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

# sed in environmental variables
for ENV in $( env | cut -d= -f1); do
  config_replace "$ENV" "${!ENV}" /etc/nginx/sites-enabled/${APP};
done

if [ "${NODE_ENV}" != "production" ]; then
  echo "NODE_ENV is ${NODE_ENV} - disabling caching for static assets";
  sed -i -e 's/s-maxage=900, max-age=300/no-cache/g' /etc/nginx/sites-enabled/${APP};
  sed -i -e '/NOTPRODUCTION/,+3 s/^/#/' /etc/nginx/sites-enabled/${APP}
fi

echo "starting nginx";
echo "--STARTUP FINISHED--";
nginx;

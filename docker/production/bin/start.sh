#!/bin/bash
# start.sh
# the Dockerfile CMD

if [ "${NODE_ENV}" != "production" ]; then 
    echo "NODE_ENV is ${NODE_ENV}, turning off cache headers in nginx conf"
    sed -i 's/add_header/# add_header/' /etc/nginx/sites-enabled/${APP}
fi

function config_replace() {
    # sed -i "s/ddRAILS_ENVdd/${RAILS_ENV}/g" /etc/nginx/sites-available/${APP}
    VAR=$1
    VAL=$2
    FILE=$3
    #    echo evaluating $VAR $VAL $FILE;
    if grep --quiet "dd${VAR}dd" $FILE; then
	echo "setting $VAR to $VAL in $FILE"
	CMD="s/dd${VAR}dd/${VAL}/g"
	sed -i -e ${CMD} ${FILE}
    fi
}

# sed in environmental variables
for ENV in $( env | cut -d= -f1); do
    config_replace "$ENV" "${!ENV}" /etc/nginx/sites-enabled/${APP}
done

echo "starting nginx"
echo "--STARTUP FINISHED--"
nginx

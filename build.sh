#!/bin/bash

# if [[ $TRAVIS_BRANCH != 'develop' && $TRAVIS_BRANCH != 'master' ]]
# then
#   docker-compose build web
#   docker-compose -f docker-compose.yml -f docker-test.yml up -d web
#   until curl --silent -I -f --fail http://localhost:3333; do printf .; sleep 1; done
# else
  if [[ $TRAVIS_JOB_NAME == 'integration-and-unit-tests' ]]
  then
    docker-compose build web api api-background pender pender-background
    docker-compose -f docker-compose.yml -f docker-test.yml up -d web api api-background pender pender-background chromedriver
  else
    i=0
    NGROK_URL=""
    while [ -z "$NGROK_URL" -a $i -lt 5 ]; do
      i=$(($i + 1))
      ./ngrok http 9000 >/dev/null &
      until curl --silent -I -f --fail http://localhost:4040; do printf .; sleep 1; done
      curl -I -v http://localhost:4040
      curl localhost:4040/api/tunnels > ngrok.json
      cat ngrok.json
      NGROK_URL=$(grep -Po '"public_url": *\K"[^"]*"' ngrok.json | tail -n1 | sed 's/.\(.*\)/\1/' | sed 's/\(.*\)./\1/')
      if [ -z $NGROK_URL ]
      then
        kill -9 $(pgrep ngrok)
      fi
      sleep 5
    done
    if [ -z $NGROK_URL ]
    then
      echo "Not able to connect a Ngrok Tunnel. Please try again"
      exit 1
    fi
    sed -i '/storage_public_endpoint/ i \  \storage_asset_host:\ '"'$NGROK_URL/check-api-test'"'' check-api/config/config.yml
    sed -i '/storage_public_endpoint/ i \  \storage_endpoint:\ '"'$NGROK_URL'"'' check-api/config/config.yml
    docker-compose build
    docker-compose -f docker-compose.yml -f docker-test.yml up -d
    until curl --silent -I -f --fail http://localhost:3100; do printf .; sleep 1; done
  fi
  until curl --silent -I -f --fail http://localhost:3200; do printf .; sleep 1; done
  until curl --silent -I -f --fail http://localhost:3000; do printf .; sleep 1; done
# fi

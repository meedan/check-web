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
    echo 'Installing localtunnel...'
    sudo npm install -g localtunnel
    rand=$(echo $RANDOM | md5sum | head -c 8)
    subdomain="minio$rand"
    lt --port 9000 --subdomain $subdomain &
    tunnel="https:\/\/$subdomain.loca.lt"
    sleep 10
    sed -i "s/https\?:\/\/\(localhost\|minio\):9000/$tunnel/g" check-api/config/config.yml
    docker-compose build
    docker-compose -f docker-compose.yml -f docker-test.yml up -d
    until curl --silent -I -f --fail http://localhost:3100; do printf .; sleep 1; done
  fi
  until curl --silent -I -f --fail http://localhost:3200; do printf .; sleep 1; done
  until curl --silent -I -f --fail http://localhost:3000; do printf .; sleep 1; done
# fi

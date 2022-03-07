#!/bin/bash
if [[ $TRAVIS_JOB_NAME == 'integration-and-unit-tests' ]]
then
  docker-compose build web api api-background pender pender-background 
  docker-compose -f docker-compose.yml -f docker-test.yml up -d web api api-background pender pender-background chromedriver
else
  docker-compose build
  docker-compose -f docker-compose.yml -f docker-test.yml up -d
  until curl --silent -I -f --fail http://localhost:5000; do printf .; sleep 1; done
fi

until curl --silent -I -f --fail http://localhost:3200; do printf .; sleep 1; done
until curl --silent -I -f --fail http://localhost:3000; do printf .; sleep 1; done
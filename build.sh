#!/bin/bash
if [[ $TRAVIS_JOB_NAME == 'integration-and-unit-tests' ]]
then
docker-compose build web api api-background pender pender-background 
docker-compose -f docker-compose.yml -f docker-test.yml up -d web api api-background pender pender-background chromedriver
else
docker-compose build
docker-compose -f docker-compose.yml -f docker-test.yml up
fi
#!/bin/bash

if [[ $GITHUB_JOB_NAME == 'integration-and-unit-tests' ]]
then
  npm run test:unit || exit 1
  ./../scripts/uncovered-files
  bundle install
  ./parallel-integration-test.sh
elif [[ $GITHUB_JOB_NAME == 'unit-tests' ]]
then
  npm run test:unit || exit 1
  ./../scripts/uncovered-files
elif [[ $GITHUB_JOB_NAME == 'media-similarity-tests' ]]
then
  ./parallel-media-similarity-test.sh
elif [[ $GITHUB_JOB_NAME == 'text-similarity-tests' ]]
then
  ./parallel-text-similarity-test.sh
fi

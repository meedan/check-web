#!/bin/bash

if [[ $GITHUB_JOB_NAME == 'integration-and-smoke-tests' ]]
then
  npm run test:unit || exit 1
  ./../scripts/uncovered-files
  bundle install
  ./parallel-integration-test.sh
elif [[ $GITHUB_JOB_NAME == 'unit-tests' ]]
then
  npm run test:unit || exit 1
  ./../scripts/uncovered-files
else
  ./parallel-similarity-test.sh
fi
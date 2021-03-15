#!/bin/bash

cd test
npm run test:unit
cd -
./scripts/uncovered-files
cd test
bundle install
./parallel-test.sh
cd -
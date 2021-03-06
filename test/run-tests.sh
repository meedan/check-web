#!/bin/bash

cd test
bundle install
npm run test:unit
./scripts/uncovered-files
./parallel-test.sh
cd -
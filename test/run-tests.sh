#!/bin/bash

cd test
npm run test:unit
./../scripts/uncovered-files
bundle install
./parallel-test.sh
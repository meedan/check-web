#!/bin/bash

npm run test:unit || exit 1
./../scripts/uncovered-files
bundle install
./parallel-test.sh
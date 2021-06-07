#!/bin/bash

# npm run test:unit || exit 1
# ./../scripts/uncovered-files
# bundle install
# ./parallel-test.sh
rspec --example 'should check, edit and remove source info' spec/integration_spec.rb
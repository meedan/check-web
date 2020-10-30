#!/bin/bash
CHROMEDRIVER_URL=http://localhost:9515 bundle exec rspec --example "flaky-test" spec/integration_spec.rb
#!/bin/bash
CHROMEDRIVER_URL=http://localhost:9515 bundle exec rspec --example "should logout" spec/integration_spec.rb
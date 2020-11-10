#!/bin/bash
CHROMEDRIVER_URL=http://localhost:9515 bundle exec rspec --example "should promote related item to main item" spec/integration_spec.rb
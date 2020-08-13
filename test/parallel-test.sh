#!/bin/bash

CHROMEDRIVER_URL=http://localhost:9517 bundle exec rspec --example "should localize interface based on browser language" spec/integration_spec.rb
# echo 'Starting tests...'

# FAIL=0

# SKIP_CONFIG_JS_OVERWRITE=1 bundle exec rspec --tag bin6 spec/integration_spec.rb &
# SKIP_CONFIG_JS_OVERWRITE=1 bundle exec rspec --tag bin1 spec/integration_spec.rb &
# SKIP_CONFIG_JS_OVERWRITE=1 bundle exec rspec --tag bin2 spec/integration_spec.rb &
# SKIP_CONFIG_JS_OVERWRITE=1 bundle exec rspec --tag bin5 spec/integration_spec.rb &
# SKIP_CONFIG_JS_OVERWRITE=1 bundle exec rspec --tag bin3 spec/integration_spec.rb &
# SKIP_CONFIG_JS_OVERWRITE=1 bundle exec rspec --tag bin4 spec/integration_spec.rb &

# for job in `jobs -p`
# do
#   echo $job
#   wait $job || let "FAIL+=1"
# done

# echo $FAIL

# if [ "$FAIL" == "0" ];
# then
#   exit 0
# else
#   exit 1
# fi

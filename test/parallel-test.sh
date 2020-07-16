#!/bin/bash

# echo 'Starting tests...'

# FAIL=0

# CHROMEDRIVER_URL=http://localhost:9517 bundle exec rspec --tag bin6 spec/integration_spec.rb &
# CHROMEDRIVER_URL=http://localhost:9516 bundle exec rspec --tag bin1 spec/integration_spec.rb &
# CHROMEDRIVER_URL=http://localhost:9518 bundle exec rspec --tag bin2 spec/integration_spec.rb &
# CHROMEDRIVER_URL=http://localhost:9519 bundle exec rspec --tag bin5 spec/integration_spec.rb &
# CHROMEDRIVER_URL=http://localhost:9520 bundle exec rspec --tag bin3 spec/integration_spec.rb &
# CHROMEDRIVER_URL=http://localhost:9521 bundle exec rspec --tag bin4 spec/integration_spec.rb &

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

#!/bin/bash
CHROMEDRIVER_URL=http://localhost:9517 bundle exec rspec --example "should lock and unlock status" spec/integration_spec.rb
#!/bin/bash

echo 'Starting tests...'

FAIL=0

bundle exec rspec --tag bin1 spec/integration_spec.rb &
bundle exec rspec --tag bin4 spec/integration_spec.rb &
bundle exec rspec --tag bin2 spec/integration_spec.rb &
bundle exec rspec --tag bin3 spec/integration_spec.rb &

for job in `jobs -p`
do
  echo $job
  wait $job || let "FAIL+=1"
done

echo $FAIL

if [ "$FAIL" == "0" ];
then
  exit 0
else
  exit 1
fi
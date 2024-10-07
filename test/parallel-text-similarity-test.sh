#!/bin/bash

echo 'Starting tests...'

FAIL=0

bundle exec rspec --tag bin7 spec/integration_spec.rb &

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
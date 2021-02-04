#!/bin/bash

# This script generates json configuration files for check-web using values
# from the SSM parameter store.

# The following environment variables must be set: DEPLOYDIR and
if [[ -z ${DEPLOY_ENV+x} || -z ${DEPLOYDIR+x} || -z ${AWS_DEFAULT_REGION+x} ]]; then
        echo "DEPLOY_ENV, DEPLOYDIR, and AWS_DEFAULT_REGION must be in the environment. Exiting."
        exit 1
fi

# We also require access to SSM via the awscli.
aws sts get-caller-identity >/dev/null 2>&1
if (( $? != 0 )); then
  echo "Error calling AWS get-caller-identity. Valid credentials required. Exiting."
  exit 1
fi

# We create a full template, and then exclude specific elements depending
# on which environment we are configuring.
export TEMPLATEFILE=$(mktemp)
export DESTFILE="${DEPLOYDIR}/latest/config.js"
cat << TEMPLATEEOF > $TEMPLATEFILE
window.config = {
  appName: 'check',
  selfHost: '##self_host##',
  restBaseUrl: '##rest_base_url##',
  relayPath: '##relay_path##',
  relayHeaders: {
    'X-Check-Token': '##check_header_token##'
  },
  penderUrl: '##pender_url##',
  pusherKey: '##pusher_key##',
  pusherCluster: '##pusher_cluster##',
  pusherDebug: ##pusher_debug##,
  googleAnalyticsCode: '##google_analytics_code##',
  googleStaticMapsKey: '##google_static_maps_key##',
  mapboxApiKey: '##mapbox_api_key##',
  opencageApiKey: '##opencage_api_key##',
  googleMapsApiKey: '##google_maps_api_key##',
  extensionUrls: ['chrome-extension://afafaiilokmpfmkfjjgfenfneoafojie', 'moz-extension://baeeb55c-c744-4ffc-bddd-64199b73f77b'],
  intercomAppId: '##intercom_app_id##',
};
TEMPLATEEOF

# Because of differences in configuration between environments, we use
# different template files for each environment.
if [[ "$DEPLOY_ENV" == "live" ]]; then
    export WORKTMP=$(mktemp)
    # Iterate over keys in SSM and replace corresponding values in template.
    PARAMNAMES=$(aws ssm get-parameters-by-path --region $AWS_DEFAULT_REGION --path /live/check-web/ --recursive --with-decryption --output text --query "Parameters[].[Name]" | sed -E 's#/live/check-web/##')
    echo "Setting parameters: $PARAMNAMES"
    for PNAME in $PARAMNAMES; do
        export PVAL=$(aws ssm get-parameters --region $AWS_DEFAULT_REGION --name "/live/check-web/${PNAME}" | jq .Parameters[].Value|sed 's/["]//g')
        cat $TEMPLATEFILE | sed "s,##${PNAME}##,${PVAL}," > $WORKTMP && mv $WORKTMP $TEMPLATEFILE
    done
    mv $TEMPLATEFILE $DESTFILE

# QA environment:
elif [[ "$DEPLOY_ENV" == "qa" ]]; then
    export WORKTMP=$(mktemp)
    # QA environment does not set some elements. Exclude them below...
    cat $TEMPLATEFILE | grep -v extensionUrls | grep -v intercomAppId > $WORKTMP && mv $WORKTMP $TEMPLATEFILE
    # Iterate over keys in SSM and replace corresponding values in template.
    PARAMNAMES=$(aws ssm get-parameters-by-path --region $AWS_DEFAULT_REGION --path /qa/check-web/ --recursive --with-decryption --output text --query "Parameters[].[Name]" | sed -E 's#/qa/check-web/##')
    echo "Setting parameters: $PARAMNAMES"
    for PNAME in $PARAMNAMES; do
        export PVAL=$(aws ssm get-parameters --region $AWS_DEFAULT_REGION --name "/qa/check-web/${PNAME}" | jq .Parameters[].Value|sed 's/["]//g')
        cat $TEMPLATEFILE | sed "s,##${PNAME}##,${PVAL}," > $WORKTMP && mv $WORKTMP $TEMPLATEFILE
    done
    mv $TEMPLATEFILE $DESTFILE

# Test environments:
else
    export WORKTMP=$(mktemp)
    # For test environments, we omit a number of elements.
    cat $TEMPLATEFILE | grep -v googleAnalyticsCode | grep -v googleStaticMapsKey | grep -v mapboxApiKey | grep -v extensionUrls | grep -v intercomAppId > $WORKTMP && mv $WORKTMP $TEMPLATEFILE
    # Iterate over keys in SSM and replace corresponding values in template.
    PARAMNAMES=$(aws ssm get-parameters-by-path --region $AWS_DEFAULT_REGION --path /qa/check-web/ --recursive --with-decryption --output text --query "Parameters[].[Name]" | sed -E 's#/qa/check-web/##')
    echo "Setting parameters: $PARAMNAMES"
    for PNAME in $PARAMNAMES; do
        export PVAL=$(aws ssm get-parameters --region $AWS_DEFAULT_REGION --name "/qa/check-web/${PNAME}" | jq .Parameters[].Value|sed 's/["]//g')
        cat $TEMPLATEFILE | sed "s,##${PNAME}##,${PVAL}," > $WORKTMP && mv $WORKTMP $TEMPLATEFILE
    done
    mv $TEMPLATEFILE $DESTFILE
fi

echo "Configuration for env $DEPLOY_ENV complete."
exit 0

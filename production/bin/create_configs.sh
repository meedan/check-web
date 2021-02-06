#!/bin/bash

# This script generates json configuration files for check-web using values
# from the SSM parameter store.

# For the build stage, use QA configs. These will be replaced for Live environment.
if [[ -z ${DEPLOY_ENV+x} ]]; then
  export DEPLOY_ENV=qa
fi

# The following environment variables must be set:
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

SSM_PREFIX="/${DEPLOY_ENV}/check-web"
WORKTMP=$(mktemp)

# Create user config.js from SSM parameter value:
DESTFILE="${DEPLOYDIR}/latest/config.js"
aws ssm get-parameters --region $AWS_DEFAULT_REGION --name "${SSM_PREFIX}/config" | jq .Parameters[].Value|sed 's/["]//g' | python -m base64 -d > $WORKTMP
if (( $? != 0 )); then
  echo "Error retrieving SSM parameter ${SSM_PREFIX}/config. Exiting."
  exit 1
fi
mv $WORKTMP $DESTFILE

# Create config-server.js from SSM parameter value:
DESTFILE="${DEPLOYDIR}/latest/config-server.js"
aws ssm get-parameters --region $AWS_DEFAULT_REGION --name "${SSM_PREFIX}/config-server" | jq .Parameters[].Value|sed 's/["]//g' | python -m base64 -d > $WORKTMP
if (( $? != 0 )); then
  echo "Error retrieving SSM parameter ${SSM_PREFIX}/config-server. Exiting."
  exit 1
fi
mv $WORKTMP $DESTFILE


echo "Configuration for env $DEPLOY_ENV complete."
exit 0

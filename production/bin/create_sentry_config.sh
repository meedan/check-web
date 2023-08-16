#!/bin/bash

# This script generates a .env.sentry-build-plugin for check-web's sentry install using values
# from the SSM parameter store. It is required for `npm run build` to upload source maps
# to Sentry and must be run before the `npm run build` step
# All deploy environments use the parameters stored at `/live/check-web/config-sentry` because
# the permissions are the same in each environment and we dont have access to DEPLOY_ENV before
# the image launches

# The following environment variables must be set:
if [[ -z ${DEPLOYDIR+x} || -z ${AWS_DEFAULT_REGION+x} ]]; then
  echo "DEPLOYDIR and AWS_DEFAULT_REGION must be in the environment. Exiting."
  exit 1
fi

SSM_PREFIX="/live/check-web"
WORKTMP=$(mktemp)

# Create .env.sentry-build-plugin from SSM parameter value, for webpack to upload sourcemaps:
# (clientside auth stuff for sentry is stored in config above)
DESTFILE="${DEPLOYDIR}/latest/.env.sentry-build-plugin"
aws ssm get-parameters --region $AWS_DEFAULT_REGION --name "${SSM_PREFIX}/config-sentry" | jq .Parameters[].Value|sed 's/["]//g' | python -m base64 -d > $WORKTMP
if (( $? != 0 )); then
  echo "Error retrieving SSM parameter ${SSM_PREFIX}/config-sentry. Exiting."
  exit 1
fi
mv $WORKTMP $DESTFILE

# Apply the config to environment variables
export $(cat $DESTFILE | xargs)

echo "Configuration for sentry complete."
exit 0

#!/bin/bash

# This script generates a .env.sentry-build-plugin for check-web's sentry install using values
# from the SSM parameter store. It is required for `npm run build` to upload source maps
# to Sentry and must be run before the `npm run build` step

# The following environment variables must be set:
if [[ -z ${DEPLOY_ENV+x} || -z ${DEPLOYDIR+x} || -z ${AWS_DEFAULT_REGION+x} ]]; then
  echo "DEPLOY_ENV, DEPLOYDIR, and AWS_DEFAULT_REGION must be in the environment. Exiting."
  exit 1
fi

SSM_PREFIX="/${DEPLOY_ENV}/check-web"
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

echo "Configuration for sentry in env $DEPLOY_ENV complete."
exit 0

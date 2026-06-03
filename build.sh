#!/bin/bash
# set -e 

retry_compose() {
  local max_attempts=3
  local wait_seconds=15
  local attempt=1

  while [ "$attempt" -le "$max_attempts" ]; do
    if docker compose "$@"; then
      return 0
    fi
    if [ "$attempt" -eq "$max_attempts" ]; then
      echo "docker compose $* failed after $max_attempts attempts"
      return 1
    fi
    echo "docker compose $* failed (attempt $attempt/$max_attempts), retrying in ${wait_seconds}s..."
    sleep "$wait_seconds"
    attempt=$((attempt + 1))
    wait_seconds=$((wait_seconds * 2))
  done
}

pull_check_web_base_images() {
  local images=("node:14.21.3-bullseye" "icalialabs/watchman:buster")
  local max_attempts=3
  local wait_seconds=15

  for image in "${images[@]}"; do
    local attempt=1
    while [ "$attempt" -le "$max_attempts" ]; do
      if docker pull "$image"; then
        break
      fi
      if [ "$attempt" -eq "$max_attempts" ]; then
        echo "docker pull $image failed after $max_attempts attempts"
        return 1
      fi
      echo "docker pull $image failed (attempt $attempt/$max_attempts), retrying in ${wait_seconds}s..."
      sleep "$wait_seconds"
      attempt=$((attempt + 1))
      wait_seconds=$((wait_seconds * 2))
    done
    wait_seconds=15
  done
}

# Running only unit tests
is_integration_job=false
if [[ $GITHUB_JOB_NAME == 'integration-and-unit-tests' || $GITHUB_JOB_NAME == 'media-similarity-tests' || $GITHUB_JOB_NAME == 'text-similarity-tests' ]]; then
  is_integration_job=true
fi
if [[ $GITHUB_BRANCH != 'develop' && $GITHUB_BRANCH != 'master' && ! $GITHUB_COMMIT_MESSAGE =~ \[full\ ci\] && ! $GITHUB_COMMIT_MESSAGE =~ \[smoke\ tests\] && ! $GITHUB_COMMIT_MESSAGE =~ \[text\ similarity\ tests\] && ! $GITHUB_COMMIT_MESSAGE =~ \[media\ similarity\ tests\] && "$is_integration_job" != true ]]
then
  echo "Running only unit tests"
  pull_check_web_base_images
  retry_compose build web
  retry_compose -f docker-compose.yml -f docker-test.yml up -d web
  until curl --silent -I -f --fail http://localhost:3333; do printf .; sleep 1; done
# Running all tests
else
  if [[ $GITHUB_JOB_NAME == 'integration-and-unit-tests' ]]
  then
    pull_check_web_base_images
    retry_compose build web api api-background pender pender-background postgres elasticsearch
    retry_compose -f docker-compose.yml -f docker-test.yml up -d elasticsearch postgres redis web api api-background pender pender-background chromedriver
    until curl --silent -f "http://localhost:9200/_cluster/health?wait_for_status=yellow&timeout=60s"; do printf .; sleep 2; done
  else
    if [[ $GITHUB_JOB_NAME == 'media-similarity-tests' ]]
    then
      i=0
      NGROK_URL=""
      ngrok config add-authtoken $NGROK_AUTH
      while [ -z "$NGROK_URL" -a $i -lt 5 ]; do
        i=$(($i + 1))
        ngrok http 9000 >/dev/null &
        until curl --silent -I -f --fail http://localhost:4040; do printf "."; sleep 10; done
        curl -I -v http://localhost:4040
        curl localhost:4040/api/tunnels > ngrok.json
        cat ngrok.json
        NGROK_URL=$(grep -Po '"public_url": *\K"[^"]*"' ngrok.json | tail -n1 | sed 's/.\(.*\)/\1/' | sed 's/\(.*\)./\1/')
        if [ -z $NGROK_URL ]
        then
          kill -9 $(pgrep ngrok)
        fi
        sleep 5
      done
      if [ -z $NGROK_URL ]
      then
        echo "Not able to connect a Ngrok Tunnel. Please try again!"
        exit 1
      fi
      echo "Ngrok tunnel: $NGROK_URL"
      sed -i "s~similarity_media_file_url_host: ''~similarity_media_file_url_host: '$NGROK_URL'~g" check-api/config/config.yml
      cat check-api/config/config.yml | grep similarity_media_file_url_host
      pull_check_web_base_images
      retry_compose build web api api-background pender pender-background chromedriver alegre presto-server presto-audio presto-image presto-video
      retry_compose -f docker-compose.yml -f docker-test.yml up -d web api api-background pender pender-background chromedriver alegre presto-server presto-audio presto-image presto-video
    else
      pull_check_web_base_images
      retry_compose build web api api-background pender pender-background chromedriver alegre presto-server presto-mean-tokens
      retry_compose -f docker-compose.yml -f docker-test.yml up -d web api api-background pender pender-background chromedriver alegre presto-server presto-mean-tokens
    fi
    until curl --silent -I -f --fail http://localhost:3100; do printf .; sleep 1; done
    until curl --silent -I -f --fail http://localhost:8000/ping; do printf .; sleep 1; done
  fi
  until curl --silent -I -f --fail http://localhost:3200; do printf .; sleep 1; done
  until curl --silent -I -f --fail http://localhost:3000; do printf .; sleep 1; done
  # Uncomment to debug Check API and Alegre. Warning: This can lead to Travis error "The job exceeded the maximum log length, and has been terminated.".
  # tail -f check-api/log/test.log &
  # docker-compose logs -f api &
  # docker-compose logs -f alegre &
  # docker-compose logs -f presto-server &
  # docker-compose logs -f presto-image &
  # docker-compose logs -f presto-audio &
  # docker-compose logs -f presto-video &
fi

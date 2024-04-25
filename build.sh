#!/bin/bash

echo "TRAVIS_BRANCH: $TRAVIS_BRANCH"
echo "TRAVIS_COMMIT_MESSAGE: $TRAVIS_COMMIT_MESSAGE"

# Running only unit tests
if [[ $TRAVIS_BRANCH != 'develop' && $TRAVIS_BRANCH != 'master' && ! $TRAVIS_COMMIT_MESSAGE =~ \[full\ ci\] && ! $TRAVIS_COMMIT_MESSAGE =~ \[smoke\ tests\] && ! $TRAVIS_COMMIT_MESSAGE =~ \[similarity\ tests\] ]]
then
  echo "Running only unit tests"
  docker-compose build web
  docker-compose -f docker-compose.yml -f docker-test.yml up -d web
  until curl --silent -I -f --fail http://localhost:3333; do printf .; sleep 1; done
# Running all tests
else
  echo "ELSEEEEE"
  if [[ $TRAVIS_JOB_NAME == 'integration-and-unit-tests' ]]
  then
    echo "UP DOCKER COMPOSE"
    echo "inside integration-and-unit-tests"
    docker-compose build web api api-background pender pender-background
    docker-compose -f docker-compose.yml -f docker-test.yml up -d web api api-background pender pender-background chromedriver
  else
  echo "inside similarity tests"
    i=0
    NGROK_URL=""
    ngrok config add-authtoken $NGROK_AUTH
    while [ -z "$NGROK_URL" -a $i -lt 5 ]; do
      i=$(($i + 1))
      ngrok_output=$(ngrok http 9000 2>&1 &)
      # ngrok http 9000 >/dev/null &
      until curl --silent -I -f --fail http://localhost:4040; do printf .; sleep 1; done
      curl -I -v http://localhost:4040
      curl localhost:4040/api/tunnels > ngrok.json
      cat ngrok.json
      NGROK_URL=$(grep -Po '"public_url": *\K"[^"]*"' ngrok.json | tail -n1 | sed 's/.\(.*\)/\1/' | sed 's/\(.*\)./\1/')
      if [ -z $NGROK_URL ]
      then
        kill -9 $(pgrep ngrok)
      fi
      sleep 5
      echo "while while... $i"
    done
    if [[ $ngrok_output == *"Your account is limited to 1 simultaneous ngrok agent sessions"* ]]; then
      # echo "Ngrok failed: $ngrok_output"
      echo "Your account is limited to 1 simultaneous ngrok agent session. Please wait for any other similarity builds to finish before trying again."
      exit 1
    fi
    if [ -z $NGROK_URL ]
    then
      echo "Not able to connect a Ngrok Tunnel. Please try again!"
      exit 1
    fi
    echo "Ngrok tunnel: $NGROK_URL"
    sed -i "s~similarity_media_file_url_host: ''~similarity_media_file_url_host: '$NGROK_URL'~g" check-api/config/config.yml
    cat check-api/config/config.yml | grep similarity_media_file_url_host
    docker-compose build
    docker-compose -f docker-compose.yml -f docker-test.yml up -d
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

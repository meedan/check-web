#!/bin/bash
if [[ $TRAVIS_JOB_NAME == 'integration-and-unit-tests' ]]
then
  docker-compose build web api api-background pender pender-background 
  docker-compose -f docker-compose.yml -f docker-test.yml up -d web api api-background pender pender-background chromedriver
else
  ./ngrok http 9000 >/dev/null &
  until curl --silent -I -f --fail http://localhost:4040; do printf .; sleep 1; done
  curl -I -v http://localhost:4040
  curl localhost:4040/api/tunnels > ngrok.json
  cat ngrok.json
  export NGROK_URL=$(grep -Po '"public_url": *\K"[^"]*"' ngrok.json | tail -n1 | sed 's/.\(.*\)/\1/' | sed 's/\(.*\)./\1/')
  sed -i '/storage_public_endpoint/ i \  \storage_asset_host:\ '"'$NGROK_URL/check-api-test'"'' check-api/config/config.yml
  sed -i '/storage_public_endpoint/ i \  \storage_endpoint:\ '"'$NGROK_URL'"'' check-api/config/config.yml
  echo "NGROK_URL"
  echo $NGROK_URL
  docker-compose build
  docker-compose -f docker-compose.yml -f docker-test.yml up -d
  docker-compose logs -t -f &
  echo "Alegre"
  until curl --silent -I -f --fail http://localhost:5000; do printf .; sleep 1; done
  echo "Alegre up"
fi

echo "Pender"
until curl --silent -I -f --fail http://localhost:3200; do printf .; sleep 1; done
echo "Pender up"
echo "Api"
until curl --silent -I -f --fail http://localhost:3000; do printf .; sleep 1; done
echo "API up"

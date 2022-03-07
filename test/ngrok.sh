#!/bin/bash
until curl --silent -I -f --fail http://localhost:4040; do printf .; sleep 1; done
curl localhost:4040/api/tunnels > ngrok.json
export NGROK_URL=$(grep -Po '"public_url": *\K"[^"]*"' ngrok.json | tail -n1 | sed 's/.\(.*\)/\1/' | sed 's/\(.*\)./\1/')
sed -i '/storage_public_endpoint/ i \  \storage_asset_host:\ '"'$NGROK_URL/check-api-test'"'' check-api/config/config.yml
sed -i '/storage_public_endpoint/ i \  \storage_endpoint:\ '"'$NGROK_URL'"'' check-api/config/config.yml
docker-compose restart api
until curl --silent -I -f --fail http://localhost:3000; do printf .; sleep 1; done
docker-compose exec -e IMGUR_CLIENT_ID=$IMGUR_CLIENT_ID web bash -c "cd test && rspec --example 'should extract text from a image' spec/integration_spec.rb"
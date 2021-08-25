curl localhost:4040/api/tunnels > ngrok.json
export NGROK_URL=$(grep -Po '"public_url": *\K"[^"]*"' ngrok.json | tail -n1 | sed 's/.\(.*\)/\1/' | sed 's/\(.*\)./\1/')
sed -i '/storage_public_endpoint/ i \  \storage_asset_host:\ '"'$NGROK_URL/check-api-test'"'' config/config.yml
sed -i '/storage_public_endpoint/ i \  \storage_endpoint:\ '"'$NGROK_URL'"'' config/config.yml
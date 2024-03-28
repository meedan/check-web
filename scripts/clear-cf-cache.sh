#!/bin/bash

echo "Clearing check-web cache at CloudFlare..."
curl -v --output "/dev/null" --show-error -X POST "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/purge_cache" \
        -H "Authorization: Bearer ${CF_CACHE_TOKEN}" -H "Content-Type: application/json" \
        --data '{"purge_everything":true}'

exit 0

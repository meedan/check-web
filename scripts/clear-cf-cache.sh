#!/bin/bash
if [ "$#" -ne 1 ] ; then
    echo "Missing required environment argument. Must be qa or live."
    exit 0
fi

if [[ "$1" == "qa" ]]; then
    echo "Clearing QA check-web cache at CloudFlare..."
    curl --fail --output "/dev/null" --silent --show-error -X POST "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/purge_cache" \
        -H "Authorization: Bearer ${CF_CACHE_TOKEN}" -H "Content-Type: application/json" \
        --data '{"files":["https://qa.checkmedia.org/","https://qa.checkmedia.org/js/config.js"]}'
elif [[ "$1" == "live" ]]; then
    echo "Clearing Live check-web cache at CloudFlare..."
    curl --fail --output "/dev/null" --silent --show-error -X POST "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/purge_cache" \
        -H "Authorization: Bearer ${CF_CACHE_TOKEN}" -H "Content-Type: application/json" \
        --data '{"files":["https://checkmedia.org/","https://checkmedia.org/js/config.js"]}'
else
    echo "Invalid environment given. Must be qa or live."
fi

exit 0

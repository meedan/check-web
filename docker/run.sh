#!/bin/bash

dir=$(pwd)
cd $(dirname "${BASH_SOURCE[0]}")
cd ..

# Build
docker kill keefer-checkdesk
docker rm keefer-checkdesk
docker build -t keefer/checkdesk .

# Run
mkdir build 2>/dev/null
docker run -d --privileged --name keefer-checkdesk -p 3333:3333 -p 5999:5999 -v "$dir/build":/app/build -v "$dir/releases":/app/releases "keefer/checkdesk" "/start/all.sh"
sleep 30
cat releases/web.log | grep ngrok
cd $dir
docker ps | grep keefer-checkdesk

#!/bin/bash
# Upload and publish the extension to Chrome Store
# You should fill in config.json a googleClientId from https://console.developers.google.com/apis/credentials?project=<project name>
# Check config.json.example for all needed fields
# Google API Reference: https://developer.chrome.com/webstore/using_webstore_api

# Helper function to parse a JSON

parse_json() {
  json=$1
  k=$(cat $json | grep '"' | sed 's/^[^"]*"\([^"]*\)"[ ]*:[ ]*"\([^"]*\)".*$/\1/g')
  keys=($k)
  v=$(cat $json | grep '"' | sed 's/^[^"]*"\([^"]*\)"[ ]*:[ ]*"\([^"]*\)".*$/\2/g' | sed 's/ //g')
  values=($v)
  map=" "
  for index in "${!keys[@]}"
  do
    k=$(echo "${keys[index]}")
    v=$(echo "${values[index]}")
    map=" [$k]=$v$map"
  done
  echo $map
}

# Function to get an access token, given a client id and code

get_access_token() {
  cid=$1
  code=$2
  red='urn:ietf:wg:oauth:2.0:oob'
  ret=$(curl "https://accounts.google.com/o/oauth2/token" -d "client_id=$cid&code=$code&grant_type=authorization_code&redirect_uri=$red" 2>/dev/null >/tmp/ret)
  
  declare -A response
  map=$(parse_json /tmp/ret)
  eval "response=($map)"
  
  if [ -n "${response[error]}" ]
  then
    echo ""
  else
    echo ${response[access_token]}
  fi
}

# Reads the configuration

declare -A config
map=$(parse_json config.json)
eval "config=($map)"

echo "Publishing..."

# If an access token does not exist, generate one

token=$(echo ${config[googleAccessToken]})
if [ -z "$token" ]
then
  cid=${config[googleClientId]}
  code=${config[googleCode]}
  token=$(get_access_token $cid $code)
  if [ -z "$token" ]
  then
    echo "Invalid code. Go to https://accounts.google.com/o/oauth2/auth?response_type=code&scope=https://www.googleapis.com/auth/chromewebstore&client_id=$cid&redirect_uri=urn:ietf:wg:oauth:2.0:oob&authuser=0 to generate a new code and add it as "googleCode" to config.json and try this script again"
    exit 0
  else
    echo "Add \"googleAccessToken\": \"$token\" to your config.json"
    exit 0
  fi
fi

# Upload the package

appid=${config[googleAppId]}

curl -H "Authorization: Bearer $token" -H "x-goog-api-version: 2" -X PUT -T "releases/extension.zip" https://www.googleapis.com/upload/chromewebstore/v1.1/items/$appid
echo

# Publish

public=${config[public]}

if [ "$public" == "false" ]
then
  public='trustedTesters'
else
  public='default'
fi

curl -H "Authorization: Bearer $token" -H "x-goog-api-version: 2" -H "Content-Length: 0" -X POST "https://www.googleapis.com/chromewebstore/v1.1/items/$appid/publish?publishTarget=$public"
echo

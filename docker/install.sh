#!/bin/bash
curl https://raw.githubusercontent.com/creationix/nvm/${NVM_VERSION}/install.sh | sh
source ~/.nvm/nvm.sh
nvm install $NODE_VERSION
nvm use --delete-prefix $NODE_VERSION
nvm alias default $NODE_VERSION
nvm current
npm install react-native react-native-css -g --unsafe-perm=true # For mobile support only
npm install
npm rebuild node-sass

# To expose the web app
curl -Lk 'https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-linux-amd64.zip' > ngrok.zip
unzip ngrok.zip -d /bin && rm -f ngrok.zip
echo 'inspect_addr: 0.0.0.0:4040' > /.ngrok

# Only for the tests
gem install bundler
mv /app/test/chromedriver-64 /app/test/chromedriver

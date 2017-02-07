FROM meedan/ruby
MAINTAINER Meedan <sysops@meedan.com>

# install dependencies
# TODO are these really dependecies for meedan/check-web?  these seem like vestiges of meedan/check-api

RUN apt-get update -qq && apt-get install -y imagemagick && rm -rf /var/lib/apt/lists/*

# node modules
COPY package.json /app/package.json
RUN cd /app && npm install

# TODO tempting to have a separate Dockerfile for testing
# this Dockerfile becomes FROM meedan/nodejs and leave the tests in a FROM meedan/ruby based image

# ruby gems
COPY test/Gemfile test/Gemfile.lock /app/test/
RUN cd /app/test && gem install bundler && bundle install --jobs 20 --retry 5

# Sauce Labs proxy
RUN mkdir -p /app/test/spec/sauce
RUN cd /app/test/spec/sauce && curl -O https://saucelabs.com/downloads/sc-4.4.2-linux.tar.gz
# TODO: throw error if `openssl sha1 sc-4.4.2-linux.tar.gz` != '57a07a14c5d95d72b6606ba34fceaf5bf76c2865'
RUN pwd
RUN cd /app/test/spec/sauce && tar -zxvf sc-4.4.2-linux.tar.gz

# install code
WORKDIR /app
COPY . /app
RUN npm run build

# startup
EXPOSE 3333
ENTRYPOINT ["tini", "--"]
# CMD ["npm", "run", "publish"]
CMD ["node", "./scripts/server.js"]

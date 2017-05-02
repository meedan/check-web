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

# install code
WORKDIR /app
COPY . /app

# startup
COPY ./docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh
EXPOSE 3333
ENTRYPOINT ["tini", "--"]
CMD ["/docker-entrypoint.sh"]

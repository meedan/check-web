FROM meedan/ruby
MAINTAINER Meedan <sysops@meedan.com>

# install dependencies
RUN apt-get update -qq && apt-get install -y imagemagick && rm -rf /var/lib/apt/lists/*

# node modules
ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /app && cp -a /tmp/node_modules /app/

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

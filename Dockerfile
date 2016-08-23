FROM meedan/ruby
MAINTAINER Meedan <sysops@meedan.com>

# install dependencies
RUN apt-get update -qq && apt-get install -y vim libpq-dev nodejs graphviz inkscape wget imagemagick --no-install-recommends && rm -rf /var/lib/apt/lists/*
RUN curl -o /usr/local/bin/gh-md-toc https://raw.githubusercontent.com/ekalinin/github-markdown-toc/master/gh-md-toc \
  && chmod +x /usr/local/bin/gh-md-toc
RUN gpg --keyserver ha.pool.sks-keyservers.net --recv-keys 6380DC428747F6C393FEACA59A84159D7001A4E5 \
  && curl -o /usr/local/bin/tini -fSL "https://github.com/krallin/tini/releases/download/v0.9.0/tini" \
  && curl -o /usr/local/bin/tini.asc -fSL "https://github.com/krallin/tini/releases/download/v0.9.0/tini.asc" \
  && gpg --verify /usr/local/bin/tini.asc \
  && rm /usr/local/bin/tini.asc \
  && chmod +x /usr/local/bin/tini

# install our app
RUN npm install -g node-static
ADD package.json /app/package.json
RUN cd /app && npm install
ADD test/Gemfile test/Gemfile.lock /app/test/
RUN cd /app/test && gem install bundler && bundle install --jobs 20 --retry 5
WORKDIR /app
ADD . /app
RUN npm run build

# startup
EXPOSE 3333
ENTRYPOINT ["tini", "--"]
CMD ["static", "-a", "0.0.0.0", "-p", "3333", "build/web"]
